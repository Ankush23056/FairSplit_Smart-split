import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDb } from '../db';

export const signup = async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const { name, email, password } = req.body;
    
    const [existingUsers] = await db.query<any[]>('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUserId = `user-${Date.now()}`;
    
    await db.query(
      'INSERT INTO users (id, name, email, password) VALUES (?, ?, ?, ?)',
      [newUserId, name, email, hashedPassword]
    );

    const token = jwt.sign({ id: newUserId, email }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
    
    res.status(201).json({ user: { id: newUserId, name, email }, token });
  } catch (error: any) {
    console.error('Signup error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const { email, password } = req.body;
    
    const [users] = await db.query<any[]>('SELECT * FROM users WHERE email = ?', [email]);
    const user = users[0];
    
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
    
    res.json({ user: { id: user.id, name: user.name, email: user.email }, token });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
};
