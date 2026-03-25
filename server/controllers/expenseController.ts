import { Request, Response } from 'express';
import { simplifyDebts } from '../utils/simplifyDebts';
import { getDb } from '../db';

export const getExpenses = async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const groupId = req.params.groupId;
    
    const [expenses] = await db.query<any[]>('SELECT * FROM expenses WHERE group_id = ?', [groupId]);
    
    for (const expense of expenses) {
      const [splits] = await db.query<any[]>('SELECT user_id as userId, amount FROM expense_splits WHERE expense_id = ?', [expense.id]);
      expense.splits = splits;
    }
    
    res.json(expenses);
  } catch (error: any) {
    console.error('getExpenses error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
};

export const createExpense = async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const groupId = req.params.groupId;
    const { description, amount, paidBy, category, splits } = req.body;
    
    const newExpenseId = String(Date.now());
    
    await db.query(
      'INSERT INTO expenses (id, group_id, description, amount, paid_by, category) VALUES (?, ?, ?, ?, ?, ?)',
      [newExpenseId, groupId, description, amount, paidBy, category]
    );

    for (const split of splits) {
      await db.query(
        'INSERT INTO expense_splits (expense_id, user_id, amount) VALUES (?, ?, ?)',
        [newExpenseId, split.userId, split.amount]
      );
    }
    
    res.status(201).json({ id: newExpenseId, description, amount, paidBy, category, splits });
  } catch (error: any) {
    console.error('createExpense error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
};

export const createSettlement = async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const groupId = req.params.groupId;
    const { payerId, payeeId, amount } = req.body;
    
    const newSettlementId = String(Date.now());
    const date = new Date().toISOString().slice(0, 19).replace('T', ' '); // MySQL format
    
    await db.query(
      'INSERT INTO settlements (id, group_id, payer_id, payee_id, amount, date) VALUES (?, ?, ?, ?, ?, ?)',
      [newSettlementId, groupId, payerId, payeeId, amount, date]
    );
    
    res.status(201).json({ id: newSettlementId, payerId, payeeId, amount, date });
  } catch (error: any) {
    console.error('createSettlement error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
};

export const getBalances = async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const groupId = req.params.groupId;
    
    const [expenses] = await db.query<any[]>('SELECT * FROM expenses WHERE group_id = ?', [groupId]);
    const [settlements] = await db.query<any[]>('SELECT * FROM settlements WHERE group_id = ?', [groupId]);
    
    // Calculate net balances
    const balances: Record<string, number> = {};
    
    for (const exp of expenses) {
      // Person who paid gets positive balance
      balances[exp.paid_by] = (balances[exp.paid_by] || 0) + Number(exp.amount);
      
      const [splits] = await db.query<any[]>('SELECT user_id as userId, amount FROM expense_splits WHERE expense_id = ?', [exp.id]);
      
      // Everyone who owes gets negative balance
      for (const split of splits) {
        balances[split.userId] = (balances[split.userId] || 0) - Number(split.amount);
      }
    }
    
    for (const settlement of settlements) {
      balances[settlement.payer_id] = (balances[settlement.payer_id] || 0) + Number(settlement.amount);
      balances[settlement.payee_id] = (balances[settlement.payee_id] || 0) - Number(settlement.amount);
    }
    
    // Simplify debts
    const simplifiedDebts = simplifyDebts(balances);
    
    // Format settlements for frontend
    const formattedSettlements = settlements.map(s => ({
      id: s.id,
      payerId: s.payer_id,
      payeeId: s.payee_id,
      amount: Number(s.amount),
      date: s.date
    }));
    
    res.json({ balances, simplifiedDebts, settlements: formattedSettlements });
  } catch (error: any) {
    console.error('getBalances error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
};
