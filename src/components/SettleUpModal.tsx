import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import api from '../services/api';

interface SettleUpModalProps {
  groupId: string;
  members: any[];
  defaultPayerId?: string;
  defaultPayeeId?: string;
  defaultAmount?: number;
  onClose: () => void;
  onSuccess: () => void;
}

export default function SettleUpModal({ 
  groupId, 
  members, 
  defaultPayerId, 
  defaultPayeeId, 
  defaultAmount,
  onClose, 
  onSuccess 
}: SettleUpModalProps) {
  const [payerId, setPayerId] = useState(defaultPayerId || '');
  const [payeeId, setPayeeId] = useState(defaultPayeeId || '');
  const [amount, setAmount] = useState(defaultAmount ? String(defaultAmount) : '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payerId || !payeeId || !amount || Number(amount) <= 0) return;
    if (payerId === payeeId) return;

    setLoading(true);
    try {
      await api.post(`/expenses/${groupId}/settlements`, {
        payerId,
        payeeId,
        amount: Number(amount)
      });
      onSuccess();
    } catch (error) {
      console.error('Failed to record settlement', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900">Settle Up</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex-1 w-full">
              <label className="block text-sm font-medium text-slate-900 mb-1.5">Who paid?</label>
              <select
                value={payerId}
                onChange={(e) => setPayerId(e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
              >
                <option value="">Select person</option>
                {members.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
            
            <div className="hidden sm:block mt-6 text-slate-400">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </div>
            
            <div className="block sm:hidden text-slate-400 rotate-90 my-2">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </div>

            <div className="flex-1 w-full">
              <label className="block text-sm font-medium text-slate-900 mb-1.5">Who received?</label>
              <select
                value={payeeId}
                onChange={(e) => setPayeeId(e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
              >
                <option value="">Select person</option>
                {members.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
          </div>
          
          {payerId === payeeId && payerId !== '' && (
            <p className="text-red-500 text-sm">Payer and payee cannot be the same person.</p>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-900 mb-1.5">Amount</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">₹</span>
              <input
                type="number"
                required
                min="0.01"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-8 pr-4 py-2.5 bg-white border-2 border-emerald-500 rounded-xl focus:ring-0 focus:outline-none text-lg font-medium"
                autoFocus
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !payerId || !payeeId || !amount || payerId === payeeId}
            className="w-full bg-emerald-500 text-white py-3 rounded-xl hover:bg-emerald-600 transition-colors font-medium mt-2 disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {loading ? 'Recording...' : (
              <>
                <Check className="h-5 w-5" />
                <span>Record Payment</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
