import React, { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { Users, Search, Shield, Star, Phone } from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [createForm, setCreateForm] = useState({
    username: '',
    email: '',
    password: '',
    role: 'student',
    is_premium: false,
  });
  const [createMsg, setCreateMsg] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

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

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setCreateMsg('');
    try {
      await api.post('/api/auth/admin/users', createForm);
      setCreateMsg('User created.');
      setCreateForm({ username: '', email: '', password: '', role: 'student', is_premium: false });
      fetchUsers();
    } catch (err) {
      setCreateMsg(err.response?.data?.error || 'Failed to create user.');
    }
  };

  const handleToggleStatus = async (userId, current) => {
    const next = current === 'suspended' ? 'active' : 'suspended';
    if (!window.confirm(`${next === 'suspended' ? 'Suspend' : 'Reactivate'} this account?`)) return;
    try {
      setUpdatingId(userId);
      await api.post('/api/auth/admin/set-account-status', { user_id: userId, status: next });
      setUsers(users.map((u) => (u.id === userId ? { ...u, account_status: next } : u)));
    } catch (err) {
      alert(err.response?.data?.error || 'Could not update account status.');
    } finally {
      setUpdatingId(null);
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

  return (
    <div className="min-h-screen bg-lem-dark p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 p-6 rounded-2xl border border-slate-800 bg-slate-900/60">
          <h2 className="text-lg font-black text-white mb-4">Create account</h2>
          {createMsg && <p className="text-sm text-lem-accent mb-3">{createMsg}</p>}
          <form onSubmit={handleCreateUser} className="grid md:grid-cols-2 gap-4">
            <input
              className="bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white"
              placeholder="Username"
              value={createForm.username}
              onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })}
              required
            />
            <input
              type="email"
              className="bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white"
              placeholder="Email"
              value={createForm.email}
              onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
              required
            />
            <input
              type="password"
              className="bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white"
              placeholder="Password (8+ chars, letter + number)"
              value={createForm.password}
              onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
              required
              minLength={8}
            />
            <select
              className="bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white"
              value={createForm.role}
              onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
            >
              <option value="student">Student</option>
              <option value="parent">Parent</option>
              <option value="admin">Admin</option>
            </select>
            <label className="flex items-center gap-2 text-slate-300 text-sm font-bold md:col-span-2">
              <input
                type="checkbox"
                checked={createForm.is_premium}
                onChange={(e) => setCreateForm({ ...createForm, is_premium: e.target.checked })}
              />
              Premium on signup
            </label>
            <button
              type="submit"
              className="md:col-span-2 bg-lem-accent text-lem-dark font-black py-3 rounded-xl hover:scale-[1.02] transition-transform"
            >
              Create user
            </button>
          </form>
        </div>

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
                  <th className="px-8 py-6 text-xs font-bold text-slate-500 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-6 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-8 py-20 text-center text-slate-500 font-bold">
                      <div className="animate-pulse flex flex-col items-center gap-4">
                        <Users size={48} className="opacity-20" />
                        Loading Users...
                      </div>
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-8 py-20 text-center text-slate-500 font-bold">
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
                      <td className="px-8 py-6">
                        <span
                          className={`text-xs font-black uppercase ${
                            u.account_status === 'suspended' ? 'text-red-400' : 'text-green-400'
                          }`}
                        >
                          {u.account_status || 'active'}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-center space-y-2">
                        <button
                          onClick={() => handleTogglePremium(u.id)}
                          disabled={updatingId === u.id}
                          className={`block w-full px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg ${
                            u.is_premium
                              ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
                              : 'bg-lem-accent text-lem-dark hover:scale-105 active:scale-95'
                          }`}
                        >
                          {updatingId === u.id
                            ? 'Processing...'
                            : u.is_premium
                              ? 'Revoke Premium'
                              : 'Grant Premium'}
                        </button>
                        {u.role !== 'admin' && (
                          <button
                            onClick={() => handleToggleStatus(u.id, u.account_status)}
                            disabled={updatingId === u.id}
                            className="block w-full px-6 py-2 rounded-xl font-bold text-sm bg-slate-800 text-slate-300 hover:bg-slate-700"
                          >
                            {u.account_status === 'suspended' ? 'Reactivate' : 'Suspend'}
                          </button>
                        )}
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
