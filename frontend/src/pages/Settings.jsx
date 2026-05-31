import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Settings, Save, Lock } from 'lucide-react';
import { validatePassword, passwordStrength, PASSWORD_HINT } from '../utils/password';

const SettingsPage = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const navigate = useNavigate();

  const [age, setAge] = useState(user?.age ?? '');
  const [grade, setGrade] = useState(user?.grade ?? '');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdMessage, setPwdMessage] = useState('');
  const [pwdError, setPwdError] = useState('');

  const strength = passwordStrength(newPassword);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await updateProfile(age, grade);
      setMessage('Profile updated successfully!');
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile.');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPwdError('');
    setPwdMessage('');
    if (newPassword !== confirmPassword) {
      setPwdError('New passwords do not match.');
      return;
    }
    const check = validatePassword(newPassword);
    if (!check.ok) {
      setPwdError(check.error);
      return;
    }
    try {
      await changePassword(currentPassword, newPassword);
      setPwdMessage('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPwdError(err.response?.data?.error || 'Could not update password.');
    }
  };

  if (!user) return <div className="text-center p-10">Please log in first.</div>;

  return (
    <div className="min-h-screen py-12 px-4 flex justify-center items-start">
      <div className="max-w-md w-full space-y-8">
        <div className="glass-card p-8 border-kid-primary/20 border-2">
          <div className="flex justify-center mb-6">
            <div className="bg-kid-primary/10 p-4 rounded-full">
              <Settings size={32} className="text-kid-primary" />
            </div>
          </div>
          <h2 className="text-3xl font-extrabold text-center text-kid-blue mb-6">Your Profile</h2>

          {message && (
            <div className="p-3 rounded-lg text-sm font-bold text-center mb-6 bg-green-100 text-green-700">
              {message}
            </div>
          )}
          {error && (
            <div className="p-3 rounded-lg text-sm font-bold text-center mb-6 bg-red-100 text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleProfileSubmit} className="space-y-5">
            {user.role === 'admin' ? (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <p className="text-xs font-black uppercase text-slate-400 mb-2">Account Type</p>
                <p className="text-kid-blue font-bold">System Administrator</p>
                <p className="text-sm text-slate-500 mt-2">{user.email}</p>
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-bold text-kid-blue mb-1">Age</label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full px-4 py-3 bg-white/50 border border-kid-primary/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-kid-primary"
                    min="3"
                    max="100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-kid-blue mb-1">Grade</label>
                  <input
                    type="text"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="w-full px-4 py-3 bg-white/50 border border-kid-primary/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-kid-primary"
                  />
                </div>
              </>
            )}
            <button
              type="submit"
              className="w-full flex justify-center items-center bg-kid-primary text-white font-bold py-3 rounded-xl hover:bg-orange-500 shadow-md"
            >
              <Save size={18} className="mr-2" /> Save Profile
            </button>
          </form>
        </div>

        <div className="glass-card p-8 border-kid-secondary/20 border-2">
          <div className="flex items-center gap-2 mb-4">
            <Lock size={22} className="text-kid-secondary" />
            <h3 className="text-xl font-extrabold text-kid-blue">Password & Security</h3>
          </div>
          <p className="text-sm text-gray-500 mb-4">{PASSWORD_HINT}</p>

          {pwdMessage && (
            <div className="p-3 rounded-lg text-sm font-bold text-center mb-4 bg-green-100 text-green-700">
              {pwdMessage}
            </div>
          )}
          {pwdError && (
            <div className="p-3 rounded-lg text-sm font-bold text-center mb-4 bg-red-100 text-red-700">
              {pwdError}
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-kid-blue mb-1">Current password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/50 border border-kid-secondary/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-kid-secondary"
                required
                autoComplete="current-password"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-kid-blue mb-1">New password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/50 border border-kid-secondary/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-kid-secondary"
                required
                minLength={8}
                autoComplete="new-password"
              />
              {newPassword && (
                <p
                  className={`text-xs mt-1 font-bold ${
                    strength === 'strong'
                      ? 'text-green-600'
                      : strength === 'fair'
                        ? 'text-amber-600'
                        : 'text-red-500'
                  }`}
                >
                  Strength: {strength}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-bold text-kid-blue mb-1">Confirm new password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/50 border border-kid-secondary/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-kid-secondary"
                required
                autoComplete="new-password"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-kid-secondary text-white font-bold py-3 rounded-xl hover:bg-teal-500 shadow-md"
            >
              Update Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
