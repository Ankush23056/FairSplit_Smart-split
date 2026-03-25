import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Plus, TrendingUp, TrendingDown, Wallet, ArrowRight } from 'lucide-react';
import api from '../services/api';
import CreateGroupModal from '../components/CreateGroupModal';

export default function Dashboard() {
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr && userStr !== 'undefined') {
      try {
        setUser(JSON.parse(userStr));
      } catch (e) {
        console.error("Failed to parse user from localStorage", e);
      }
    }
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const { data } = await api.get('/groups');
      setGroups(data);
    } catch (error) {
      console.error('Failed to fetch groups', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-12">Loading...</div>;

  const isDemoUser = user?.email === 'demo@fairshare.com';

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="bg-emerald-50 p-3 rounded-xl">
            <TrendingUp className="h-6 w-6 text-emerald-500" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">You are owed</p>
            <p className="text-2xl font-bold text-slate-900">₹{isDemoUser ? '5000' : '0'}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="bg-red-50 p-3 rounded-xl">
            <TrendingDown className="h-6 w-6 text-red-500" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">You owe</p>
            <p className="text-2xl font-bold text-slate-900">₹0</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="bg-slate-50 p-3 rounded-xl">
            <Wallet className="h-6 w-6 text-slate-600" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Total spent</p>
            <p className="text-2xl font-bold text-slate-900">₹{isDemoUser ? '15800' : '0'}</p>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Your Groups</h1>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-emerald-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-emerald-600 transition-colors font-medium"
        >
          <Plus className="h-5 w-5" />
          <span>New Group</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map((group, index) => (
          <Link
            key={group.id}
            to={`/group/${group.id}`}
            className={`bg-white p-6 rounded-2xl shadow-sm border ${index === 0 ? 'border-emerald-500 ring-1 ring-emerald-500' : 'border-slate-100'} hover:border-emerald-500 hover:shadow-md transition-all group flex flex-col h-full`}
          >
            <div className="mb-4">
              <h2 className="text-xl font-bold text-slate-900 mb-1">
                {group.name}
              </h2>
              <p className="text-sm text-slate-500">{group.description || 'Shared expenses'}</p>
            </div>
            
            <div className="flex items-center justify-between mb-6 text-sm text-slate-500">
              <div className="flex items-center gap-1.5">
                <Users className="h-4 w-4" />
                <span>{group.members.length} members</span>
              </div>
              <span className="font-bold text-slate-900">₹{group.totalAmount || 0}</span>
            </div>

            <div className="mt-auto flex items-center justify-between">
              <div className="flex -space-x-2">
                {group.members.slice(0, 4).map((member: any, i: number) => {
                  const char = member.name.charAt(0).toUpperCase();
                  let colorClass = 'bg-emerald-100 text-emerald-700';
                  if (char === 'A') colorClass = 'bg-blue-100 text-blue-700';
                  if (char === 'R') colorClass = 'bg-rose-100 text-rose-700';
                  if (char === 'P') colorClass = 'bg-purple-100 text-purple-700';
                  if (char === 'S') colorClass = 'bg-amber-100 text-amber-700';
                  
                  return (
                    <div key={i} className={`w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold ${colorClass}`}>
                      {char}
                    </div>
                  );
                })}
                {group.members.length > 4 && (
                  <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-xs font-bold text-slate-600">
                    +{group.members.length - 4}
                  </div>
                )}
              </div>
              <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-emerald-500 transition-colors" />
            </div>
          </Link>
        ))}
        {groups.length === 0 && (
          <div className="col-span-full text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300">
            <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-1">No groups yet</h3>
            <p className="text-slate-500">Create a group to start splitting expenses.</p>
          </div>
        )}
      </div>

      {isCreateModalOpen && (
        <CreateGroupModal 
          onClose={() => setIsCreateModalOpen(false)} 
          onSuccess={() => {
            setIsCreateModalOpen(false);
            fetchGroups();
          }} 
        />
      )}
    </div>
  );
}
