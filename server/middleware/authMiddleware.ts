import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    // For demo purposes, we'll bypass auth if no token is provided
    // In production, uncomment the next line:
    // return res.status(401).json({ error: 'Authentication required' });
    (req as any).user = { id: 'demo-user-id', email: 'demo@fairshare.com' };
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    (req as any).user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};
