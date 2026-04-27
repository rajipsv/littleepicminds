import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Settings, Save } from 'lucide-react';

const SettingsPage = () => {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  
  const [age, setAge] = useState(user?.age || '');
  const [grade, setGrade] = useState(user?.grade || '');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(age, grade);
      setMessage('Profile updated successfully!');
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      setMessage('Failed to update profile.');
    }
  };

  if (!user) return <div className="text-center p-10">Please login first.</div>;

  return (
    <div className="min-h-screen py-12 px-4 flex justify-center items-center">
      <div className="glass-card max-w-md w-full p-8 border-kid-primary/20 border-2">
        <div className="flex justify-center mb-6">
          <div className="bg-kid-primary/10 p-4 rounded-full">
            <Settings size={32} className="text-kid-primary" />
          </div>
        </div>
        <h2 className="text-3xl font-extrabold text-center text-kid-blue mb-6">Your Profile</h2>

        {message && (
          <div className={`p-3 rounded-lg text-sm font-bold text-center mb-6 ${message.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {user.role === 'admin' ? (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <p className="text-xs font-black uppercase text-slate-400 mb-2">Account Type</p>
              <p className="text-kid-blue font-bold flex items-center gap-2">
                <span className="w-2 h-2 bg-lem-accent rounded-full animate-pulse"></span>
                System Administrator
              </p>
              <div className="mt-4 pt-4 border-t border-slate-200">
                <p className="text-xs font-black uppercase text-slate-400 mb-1">Registered Email</p>
                <p className="text-kid-blue font-medium">{user.email}</p>
              </div>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-bold text-kid-blue mb-1">Update Age</label>
                <input 
                  type="number" 
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full px-4 py-3 bg-white/50 border border-kid-primary/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-kid-primary transition-all"
                  placeholder="e.g. 8"
                  min="3" max="100"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-kid-blue mb-1">Update Grade</label>
                <input 
                  type="text" 
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full px-4 py-3 bg-white/50 border border-kid-primary/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-kid-primary transition-all"
                  placeholder="e.g. 3rd Grade"
                />
              </div>
            </>
          )}

          <button 
            type="submit" 
            className="w-full flex justify-center items-center bg-kid-primary text-white font-bold py-3 rounded-xl hover:bg-orange-500 transition-colors shadow-md mt-4"
          >
            <Save size={18} className="mr-2" /> Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};

export default SettingsPage;
