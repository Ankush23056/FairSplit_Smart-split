import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Receipt, Users, ArrowRight, Wallet, Crown, Tag, Sparkles, HandCoins, CheckCircle2 } from 'lucide-react';
import api from '../services/api';
import AddExpenseModal from '../components/AddExpenseModal';
import SettleUpModal from '../components/SettleUpModal';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function GroupPage() {
  const { id } = useParams();
  const [group, setGroup] = useState<any>(null);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [balances, setBalances] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);
  const [isSettleUpModalOpen, setIsSettleUpModalOpen] = useState(false);
  const [settleData, setSettleData] = useState<{payerId?: string, payeeId?: string, amount?: number}>({});
  const [activeTab, setActiveTab] = useState<'expenses' | 'balances' | 'analytics'>('expenses');

  const fetchData = async () => {
    try {
      const [groupRes, expRes, balRes] = await Promise.all([
        api.get(`/groups/${id}`),
        api.get(`/expenses/${id}`),
        api.get(`/expenses/${id}/balances`)
      ]);
      setGroup(groupRes.data);
      setExpenses(expRes.data);
      setBalances(balRes.data);
    } catch (error) {
      console.error('Failed to fetch group data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  if (loading) return <div className="text-center py-12">Loading...</div>;
  if (!group) return <div className="text-center py-12">Group not found</div>;

  const getUserName = (userId: string) => {
    return group.members.find((m: any) => m.id === userId)?.name || 'Unknown';
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'food': return '🍕';
      case 'utilities': return '💡';
      case 'travel': return '🚗';
      case 'accommodation': return '🏠';
      default: return '🧾';
    }
  };

  const getDynamicAnalytics = () => {
    if (!expenses || expenses.length === 0) {
      return {
        totalSpent: 0,
        topSpender: { name: '-' },
        mostExpensiveCategory: '-',
        spendingByCategory: []
      };
    }

    const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);

    const spendingByPerson: Record<string, number> = {};
    const spendingByCat: Record<string, number> = {};

    expenses.forEach(e => {
      spendingByPerson[e.paidBy] = (spendingByPerson[e.paidBy] || 0) + e.amount;
      spendingByCat[e.category] = (spendingByCat[e.category] || 0) + e.amount;
    });

    let topSpenderId = '';
    let maxSpent = 0;
    Object.entries(spendingByPerson).forEach(([id, amount]) => {
      if (amount > maxSpent) {
        maxSpent = amount;
        topSpenderId = id;
      }
    });

    let topCat = '';
    let maxCat = 0;
    const spendingByCategory = Object.entries(spendingByCat).map(([name, value]) => {
      if (value > maxCat) {
        maxCat = value;
        topCat = name;
      }
      return { name, value };
    });

    return {
      totalSpent,
      topSpender: { name: getUserName(topSpenderId), amount: maxSpent },
      mostExpensiveCategory: topCat,
      spendingByCategory
    };
  };

  const dynamicAnalytics = getDynamicAnalytics();

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-2">
        <button 
          onClick={() => window.history.back()}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors"
        >
          <ArrowRight className="h-6 w-6 text-slate-600 rotate-180" />
        </button>
        <h1 className="text-3xl font-bold text-slate-900">{group.name}</h1>
      </div>
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="text-slate-500">
          {group.description}
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button 
            onClick={() => {
              setSettleData({});
              setIsSettleUpModalOpen(true);
            }}
            className="flex-1 sm:flex-none bg-white text-slate-700 border border-slate-200 px-4 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors font-medium shadow-sm"
          >
            <HandCoins className="h-5 w-5 text-emerald-500" />
            <span>Settle Up</span>
          </button>
          <button 
            onClick={() => setIsAddExpenseModalOpen(true)}
            className="flex-1 sm:flex-none bg-emerald-500 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-emerald-600 transition-colors font-medium shadow-sm"
          >
            <Receipt className="h-5 w-5" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* Top Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
          <Wallet className="h-6 w-6 text-emerald-500 mb-2" />
          <p className="text-sm text-slate-500 mb-1">Total</p>
          <p className="text-2xl font-bold text-slate-900">₹{dynamicAnalytics.totalSpent || 0}</p>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
          <Users className="h-6 w-6 text-blue-500 mb-2" />
          <p className="text-sm text-slate-500 mb-1">Members</p>
          <p className="text-2xl font-bold text-slate-900">{group.members.length}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
          <Crown className="h-6 w-6 text-amber-500 mb-2" />
          <p className="text-sm text-slate-500 mb-1">Top Spender</p>
          <p className="text-2xl font-bold text-slate-900">{dynamicAnalytics.topSpender.name}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
          <Tag className="h-6 w-6 text-purple-500 mb-2" />
          <p className="text-sm text-slate-500 mb-1">Top Category</p>
          <p className="text-2xl font-bold text-slate-900">{dynamicAnalytics.mostExpensiveCategory}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-slate-100 p-1 rounded-xl flex">
        <button
          onClick={() => setActiveTab('expenses')}
          className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
            activeTab === 'expenses' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Expenses
        </button>
        <button
          onClick={() => setActiveTab('balances')}
          className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
            activeTab === 'balances' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Balances
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
            activeTab === 'analytics' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Analytics
        </button>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'expenses' && (
          <div className="space-y-4">
            {expenses.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300">
                <p className="text-slate-500">No expenses yet. Add one to get started!</p>
              </div>
            ) : (
              expenses.map((expense) => (
                <div key={expense.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-2xl shrink-0">
                      {getCategoryIcon(expense.category)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg">{expense.description}</h3>
                      <p className="text-sm text-slate-500">
                        Paid by <span className="font-medium text-slate-700">{getUserName(expense.paidBy)}</span> · Split {expense.splits.length} ways
                      </p>
                    </div>
                  </div>
                  <div className="text-left sm:text-right w-full sm:w-auto pl-16 sm:pl-0">
                    <p className="font-bold text-slate-900 text-xl">₹{expense.amount}</p>
                    <p className="text-sm text-slate-400">{expense.category}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'balances' && (
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-emerald-100">
              <div className="mb-6">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-amber-500" />
                  Simplified Debts
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Minimized from potential transactions to just {balances?.simplifiedDebts?.length || 0}
                </p>
              </div>
              
              {balances?.simplifiedDebts?.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <p>Everyone is settled up!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {balances?.simplifiedDebts?.map((debt: any, i: number) => (
                    <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-emerald-50/50 rounded-xl border border-emerald-100">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                        <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-sm shrink-0">
                          {getUserName(debt.from).charAt(0)}
                        </div>
                        <span className="font-medium text-slate-900">{getUserName(debt.from)}</span>
                        <ArrowRight className="h-4 w-4 text-slate-400 shrink-0" />
                        <span className="font-medium text-slate-900">{getUserName(debt.to)}</span>
                        <span className="ml-1 sm:ml-2 px-2.5 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full uppercase tracking-wider">
                          Pending
                        </span>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto pl-10 sm:pl-0">
                        <span className="font-bold text-slate-900 text-lg">₹{debt.amount}</span>
                        <button 
                          onClick={() => {
                            setSettleData({ payerId: debt.from, payeeId: debt.to, amount: debt.amount });
                            setIsSettleUpModalOpen(true);
                          }}
                          className="px-3 py-1.5 bg-emerald-500 text-white text-sm font-medium rounded-lg hover:bg-emerald-600 transition-colors"
                        >
                          Settle
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {balances?.settlements && balances.settlements.length > 0 && (
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                <div className="mb-6">
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    Recent Settlements
                  </h2>
                </div>
                <div className="space-y-4">
                  {balances.settlements.map((settlement: any) => (
                    <div key={settlement.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-sm shrink-0">
                          {getUserName(settlement.payerId).charAt(0)}
                        </div>
                        <span className="font-medium text-slate-900">{getUserName(settlement.payerId)}</span>
                        <span className="text-slate-500 text-sm">paid</span>
                        <span className="font-medium text-slate-900">{getUserName(settlement.payeeId)}</span>
                        <span className="ml-1 sm:ml-2 px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full uppercase tracking-wider">
                          Settled
                        </span>
                      </div>
                      <span className="font-bold text-slate-900 text-lg pl-10 sm:pl-0">₹{settlement.amount}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center">
              <p className="text-sm text-slate-500 mb-2">Total Group Spending</p>
              <p className="text-4xl font-bold text-slate-900">₹{dynamicAnalytics.totalSpent.toLocaleString()}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="font-bold text-slate-900 mb-6">Spending per Person</h3>
                <div className="h-64">
                  {expenses.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={
                        group.members.map((m: any) => {
                          const spent = expenses.filter(e => e.paidBy === m.id).reduce((sum, e) => sum + e.amount, 0);
                          return { name: m.name, amount: spent };
                        }).filter((d: any) => d.amount > 0)
                      }>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                        <RechartsTooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                        <Bar dataKey="amount" fill="#10b981" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-400">No data available</div>
                  )}
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="font-bold text-slate-900 mb-6">Spending by Category</h3>
                <div className="h-64 relative">
                  {dynamicAnalytics.spendingByCategory.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={dynamicAnalytics.spendingByCategory}
                          cx="50%"
                          cy="50%"
                          innerRadius={0}
                          outerRadius={80}
                          dataKey="value"
                          labelLine={false}
                          label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }) => {
                            const radius = outerRadius * 1.2;
                            const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
                            const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
                            return (
                              <text x={x} y={y} fill={COLORS[index % COLORS.length]} textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="text-sm font-medium">
                                {`${name} ${(percent * 100).toFixed(0)}%`}
                              </text>
                            );
                          }}
                        >
                          {dynamicAnalytics.spendingByCategory.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-400">No data available</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {isAddExpenseModalOpen && (
        <AddExpenseModal 
          groupId={id!}
          members={group.members}
          onClose={() => setIsAddExpenseModalOpen(false)}
          onSuccess={() => {
            setIsAddExpenseModalOpen(false);
            fetchData();
          }}
        />
      )}

      {isSettleUpModalOpen && (
        <SettleUpModal
          groupId={id!}
          members={group.members}
          defaultPayerId={settleData.payerId}
          defaultPayeeId={settleData.payeeId}
          defaultAmount={settleData.amount}
          onClose={() => setIsSettleUpModalOpen(false)}
          onSuccess={() => {
            setIsSettleUpModalOpen(false);
            fetchData();
          }}
        />
      )}
    </div>
  );
}
