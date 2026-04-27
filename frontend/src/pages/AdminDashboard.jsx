import React, { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { Users, Search, Shield, Star, CheckCircle, XCircle, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    // Only allow admin access
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchUsers();
  }, [user, navigate]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/auth/admin/users');
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to fetch users', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePremium = async (userId) => {
    try {
      setUpdatingId(userId);
      await api.post('/api/auth/admin/toggle-subscription', { user_id: userId });
      
      // Update local state
      setUsers(users.map(u => 
        u.id === userId ? { ...u, is_premium: !u.is_premium } : u
      ));
    } catch (err) {
      console.error('Failed to toggle premium', err);
      alert('Error updating user status');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredUsers = users.filter(u => 
    (u.mobile && u.mobile.includes(search)) || 
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="min-h-screen bg-lem-dark p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Shield className="text-lem-accent" size={32} />
              <h1 className="text-3xl font-black text-white">Admin <span className="text-lem-accent">Control</span></h1>
            </div>
            <p className="text-slate-400 font-medium">Manage user subscriptions and verify payments.</p>
          </div>
          
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
            <input 
              type="text"
              placeholder="Search by Mobile, Email, or Name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-lem-accent transition-all"
            />
          </div>
        </header>

        <div className="bg-slate-900/50 rounded-[2.5rem] border border-slate-800 overflow-hidden backdrop-blur-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="px-8 py-6 text-xs font-bold text-slate-500 uppercase tracking-widest">User</th>
                  <th className="px-8 py-6 text-xs font-bold text-slate-500 uppercase tracking-widest">Mobile</th>
                  <th className="px-8 py-6 text-xs font-bold text-slate-500 uppercase tracking-widest">Plan</th>
                  <th className="px-8 py-6 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {loading ? (
                  <tr>
                    <td colSpan="4" className="px-8 py-20 text-center text-slate-500 font-bold">
                      <div className="animate-pulse flex flex-col items-center gap-4">
                        <Users size={48} className="opacity-20" />
                        Loading Users...
                      </div>
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-8 py-20 text-center text-slate-500 font-bold">
                      No users found matching your search.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-white/5 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="font-bold text-white mb-1">{u.name || u.username}</div>
                        <div className="text-xs text-slate-500">{u.email}</div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2 text-slate-300 font-medium">
                          <Phone size={14} className="text-slate-500" />
                          {u.mobile || 'Not Provided'}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        {u.is_premium ? (
                          <span className="inline-flex items-center gap-1.5 bg-lem-accent/10 text-lem-accent px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider">
                            <Star size={12} fill="currentColor" />
                            Scholar Premium
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 bg-slate-800 text-slate-500 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider">
                            Free Explorer
                          </span>
                        )}
                      </td>
                      <td className="px-8 py-6 text-center">
                        <button
                          onClick={() => handleTogglePremium(u.id)}
                          disabled={updatingId === u.id}
                          className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg ${
                            u.is_premium 
                              ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20' 
                              : 'bg-lem-accent text-lem-dark hover:scale-105 active:scale-95'
                          }`}
                        >
                          {updatingId === u.id 
                            ? 'Processing...' 
                            : u.is_premium ? 'Revoke Access' : 'Give Premium Access'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        <footer className="mt-8 text-center">
           <p className="text-slate-600 text-xs font-medium">
             Signed in as: <span className="text-slate-400">{user.email}</span> (Administrator)
           </p>
        </footer>
      </div>
    </div>
  );
};

export default AdminDashboard;
