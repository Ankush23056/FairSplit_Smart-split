import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import api from '../services/api';

type SplitType = 'equal' | 'exact' | 'percentage';

export default function AddExpenseModal({ 
  groupId, 
  members, 
  onClose, 
  onSuccess 
}: { 
  groupId: string, 
  members: any[], 
  onClose: () => void, 
  onSuccess: () => void 
}) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState(members[0]?.id || '');
  const [category, setCategory] = useState('Food');
  const [splitType, setSplitType] = useState<SplitType>('equal');
  
  // State for equal split
  const [selectedMembers, setSelectedMembers] = useState<string[]>(members.map(m => m.id));
  
  // State for exact amounts and percentages
  const [exactAmounts, setExactAmounts] = useState<Record<string, string>>({});
  const [percentages, setPercentages] = useState<Record<string, string>>({});
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const categories = ['Food', 'Travel', 'Accommodation', 'Entertainment', 'Utilities', 'Other'];

  const toggleMember = (id: string) => {
    setSelectedMembers(prev => 
      prev.includes(id) ? prev.filter(mId => mId !== id) : [...prev, id]
    );
  };

  const handleExactAmountChange = (id: string, value: string) => {
    setExactAmounts(prev => ({ ...prev, [id]: value }));
  };

  const handlePercentageChange = (id: string, value: string) => {
    setPercentages(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return setError('Please enter a valid amount');
    }

    let splits: { userId: string, amount: number }[] = [];

    if (splitType === 'equal') {
      if (selectedMembers.length === 0) return setError('Select at least one member to split with');
      const splitAmount = numAmount / selectedMembers.length;
      splits = selectedMembers.map(userId => ({
        userId,
        amount: splitAmount
      }));
    } else if (splitType === 'exact') {
      let totalExact = 0;
      splits = members.map(m => {
        const val = parseFloat(exactAmounts[m.id]) || 0;
        totalExact += val;
        return { userId: m.id, amount: val };
      }).filter(s => s.amount > 0);

      if (Math.abs(totalExact - numAmount) > 0.01) {
        return setError(`Total split amounts (₹${totalExact.toFixed(2)}) must equal the total expense amount (₹${numAmount})`);
      }
    } else if (splitType === 'percentage') {
      let totalPercentage = 0;
      splits = members.map(m => {
        const pct = parseFloat(percentages[m.id]) || 0;
        totalPercentage += pct;
        return { userId: m.id, amount: (numAmount * pct) / 100 };
      }).filter(s => s.amount > 0);

      if (Math.abs(totalPercentage - 100) > 0.01) {
        return setError(`Total percentages (${totalPercentage}%) must equal 100%`);
      }
    }

    if (splits.length === 0) {
      return setError('No valid splits provided');
    }

    setLoading(true);
    try {
      await api.post(`/expenses/${groupId}`, {
        description,
        amount: numAmount,
        paidBy,
        category,
        splits
      });
      onSuccess();
    } catch (error) {
      console.error('Failed to add expense', error);
      setError('Failed to add expense. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-slate-100 shrink-0">
          <h2 className="text-xl font-bold text-slate-900">Add Expense</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="overflow-y-auto p-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}
          <form id="expense-form" onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-1.5">Description</label>
              <input
                type="text"
                required
                placeholder="e.g., Dinner at Beach Shack"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border-2 border-emerald-500 rounded-xl focus:ring-0 focus:outline-none"
                autoFocus
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-1.5">Amount (₹)</label>
              <input
                type="number"
                required
                min="1"
                step="0.01"
                placeholder="1200"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1.5">Paid by</label>
                <select
                  value={paidBy}
                  onChange={(e) => setPaidBy(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all appearance-none"
                >
                  {members.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1.5">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all appearance-none"
                >
                  {categories.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-2">
              <div className="flex justify-between items-center mb-3">
                <label className="block text-sm font-medium text-slate-900">Split Options</label>
              </div>
              
              <div className="flex p-1 bg-slate-100 rounded-xl mb-4">
                <button
                  type="button"
                  onClick={() => setSplitType('equal')}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${
                    splitType === 'equal' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Equal
                </button>
                <button
                  type="button"
                  onClick={() => setSplitType('exact')}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${
                    splitType === 'exact' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Exact Amount
                </button>
                <button
                  type="button"
                  onClick={() => setSplitType('percentage')}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${
                    splitType === 'percentage' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Percentage
                </button>
              </div>

              <div className="space-y-3">
                {splitType === 'equal' && members.map(m => {
                  const isSelected = selectedMembers.includes(m.id);
                  const splitVal = (parseFloat(amount) || 0) / (selectedMembers.length || 1);
                  return (
                    <label key={m.id} className="flex items-center justify-between cursor-pointer group" onClick={(e) => { e.preventDefault(); toggleMember(m.id); }}>
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                          isSelected ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 group-hover:border-emerald-400'
                        }`}>
                          {isSelected && <Check className="h-3 w-3 text-white" />}
                        </div>
                        <span className="text-slate-700">{m.name}</span>
                      </div>
                      {isSelected && amount && (
                        <span className="text-sm text-slate-500">₹{splitVal.toFixed(2)}</span>
                      )}
                    </label>
                  );
                })}

                {splitType === 'exact' && members.map(m => (
                  <div key={m.id} className="flex items-center justify-between">
                    <span className="text-slate-700">{m.name}</span>
                    <div className="relative w-32">
                      <span className="absolute left-3 top-2 text-slate-500">₹</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        value={exactAmounts[m.id] || ''}
                        onChange={(e) => handleExactAmountChange(m.id, e.target.value)}
                        className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-right"
                      />
                    </div>
                  </div>
                ))}

                {splitType === 'percentage' && members.map(m => {
                  const pct = parseFloat(percentages[m.id]) || 0;
                  const calculatedAmt = ((parseFloat(amount) || 0) * pct) / 100;
                  return (
                    <div key={m.id} className="flex items-center justify-between">
                      <span className="text-slate-700">{m.name}</span>
                      <div className="flex items-center gap-3">
                        {amount && pct > 0 && (
                          <span className="text-xs text-slate-400">₹{calculatedAmt.toFixed(2)}</span>
                        )}
                        <div className="relative w-24">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            placeholder="0"
                            value={percentages[m.id] || ''}
                            onChange={(e) => handlePercentageChange(m.id, e.target.value)}
                            className="w-full pl-3 pr-7 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-right"
                          />
                          <span className="absolute right-3 top-2 text-slate-500">%</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-slate-100 shrink-0">
          <button
            type="submit"
            form="expense-form"
            disabled={loading}
            className="w-full bg-emerald-500 text-white py-3 rounded-xl hover:bg-emerald-600 transition-colors font-medium disabled:opacity-70"
          >
            {loading ? 'Adding...' : 'Add Expense'}
          </button>
        </div>
      </div>
    </div>
  );
}
