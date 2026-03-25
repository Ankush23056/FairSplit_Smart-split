import { Request, Response } from 'express';
import { getDb } from '../db';

export const getGroups = async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const userId = (req as any).user?.id;
    
    const [groups] = await db.query<any[]>(`
      SELECT g.*, 
             (SELECT SUM(amount) FROM expenses WHERE group_id = g.id) as totalAmount
      FROM groups_table g
      JOIN group_members gm ON g.id = gm.group_id
      WHERE gm.user_id = ?
    `, [userId]);

    for (const group of groups) {
      const [members] = await db.query<any[]>('SELECT user_id as id, name FROM group_members WHERE group_id = ?', [group.id]);
      group.members = members;
      group.totalAmount = group.totalAmount || 0;
    }

    res.json(groups);
  } catch (error: any) {
    console.error('getGroups error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
};

export const createGroup = async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const { name, description, members } = req.body;
    const newGroupId = String(Date.now());
    
    await db.query(
      'INSERT INTO groups_table (id, name, description, totalAmount) VALUES (?, ?, ?, ?)',
      [newGroupId, name, description, 0]
    );

    for (const member of members) {
      await db.query(
        'INSERT INTO group_members (group_id, user_id, name) VALUES (?, ?, ?)',
        [newGroupId, member.id, member.name]
      );
    }

    res.status(201).json({ id: newGroupId, name, description, totalAmount: 0, members });
  } catch (error: any) {
    console.error('createGroup error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
};

export const getGroupById = async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const userId = (req as any).user?.id;
    const groupId = req.params.id;
    
    const [groups] = await db.query<any[]>('SELECT * FROM groups_table WHERE id = ?', [groupId]);
    const group = groups[0];
    
    if (!group) return res.status(404).json({ error: 'Group not found' });
    
    const [members] = await db.query<any[]>('SELECT user_id as id, name FROM group_members WHERE group_id = ?', [groupId]);
    const isMember = members.some(m => m.id === userId);
    if (!isMember) return res.status(403).json({ error: 'Access denied' });
    
    const [expenses] = await db.query<any[]>('SELECT SUM(amount) as total FROM expenses WHERE group_id = ?', [groupId]);
    
    res.json({ ...group, members, totalAmount: expenses[0]?.total || 0 });
  } catch (error: any) {
    console.error('getGroupById error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
};

export const getGroupAnalytics = async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const groupId = req.params.id;
    
    // For now, we'll keep the mock analytics data, but in a real app
    // we would query the expenses table to calculate these metrics
    res.json({
      totalSpent: 15800,
      topSpender: { name: 'Ankush', amount: 8000 },
      mostExpensiveCategory: 'Travel',
      spendingByCategory: [
        { name: 'Food', value: 4000 },
        { name: 'Travel', value: 8000 },
        { name: 'Accommodation', value: 3800 }
      ],
      spendingTrends: [
        { date: '2023-10-01', amount: 2000 },
        { date: '2023-10-02', amount: 5000 },
        { date: '2023-10-03', amount: 8800 }
      ]
    });
  } catch (error: any) {
    console.error('getGroupAnalytics error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
};
