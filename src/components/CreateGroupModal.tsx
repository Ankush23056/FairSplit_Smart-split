import React, { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import api from '../services/api';

export default function CreateGroupModal({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [members, setMembers] = useState([{ name: '', email: '' }]);
  const [loading, setLoading] = useState(false);

  const handleAddMember = () => {
    setMembers([...members, { name: '', email: '' }]);
  };

  const handleRemoveMember = (index: number) => {
    setMembers(members.filter((_, i) => i !== index));
  };

  const handleMemberChange = (index: number, field: 'name' | 'email', value: string) => {
    const newMembers = [...members];
    newMembers[index][field] = value;
    setMembers(newMembers);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userStr = localStorage.getItem('user');
      let user = { id: 'demo-user-id', name: 'Ankush', email: 'demo@fairshare.com' };
      if (userStr && userStr !== 'undefined') {
        try {
          user = JSON.parse(userStr);
        } catch (e) {
          console.error("Failed to parse user from localStorage", e);
        }
      }
      
      // Filter out empty members
      const validMembers = members.filter(m => m.name.trim() !== '');
      
      // We will send members to the backend, but the backend needs to handle creating/finding users
      // For now, we'll just send the names and emails
      await api.post('/groups', { 
        name, 
        description,
        members: [user, ...validMembers.map((m, i) => ({ id: `temp-${Date.now()}-${i}`, name: m.name, email: m.email }))] // Add creator as first member
      });
      onSuccess();
    } catch (error) {
      console.error('Failed to create group', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900">Create New Group</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-1.5">Group Name</label>
            <input
              type="text"
              required
              placeholder="e.g., Goa Trip"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border-2 border-emerald-500 rounded-xl focus:ring-0 focus:outline-none"
              autoFocus
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-1.5">Description</label>
            <input
              type="text"
              placeholder="What's this group for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-sm font-medium text-slate-900">Members</label>
              <button
                type="button"
                onClick={handleAddMember}
                className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
              >
                <Plus className="h-4 w-4" /> Add Member
              </button>
            </div>
            <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
              {members.map((member, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      placeholder="Name"
                      value={member.name}
                      onChange={(e) => handleMemberChange(index, 'name', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-sm"
                    />
                    <input
                      type="email"
                      placeholder="Email (optional)"
                      value={member.email}
                      onChange={(e) => handleMemberChange(index, 'email', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-sm"
                    />
                  </div>
                  {members.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(index)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors mt-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 text-white py-3 rounded-xl hover:bg-emerald-600 transition-colors font-medium mt-2 disabled:opacity-70"
          >
            {loading ? 'Creating...' : 'Create Group'}
          </button>
        </form>
      </div>
    </div>
  );
}
