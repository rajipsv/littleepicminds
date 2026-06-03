import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock } from 'lucide-react';
import api from '../api';
import { validatePassword, passwordStrength, PASSWORD_HINT } from '../utils/password';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const strength = passwordStrength(newPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Invalid reset link. Please request a new password reset.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    const check = validatePassword(newPassword);
    if (!check.ok) {
      setError(check.error);
      return;
    }

    setLoading(true);
    try {
      await api.post('/api/auth/reset-password', { token, newPassword });
      navigate('/login', { state: { resetSuccess: true } });
    } catch (err) {
      setError(err.response?.data?.error || 'Could not reset password. Please request a new link.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center py-10 px-4">
        <div className="glass-card max-w-md w-full p-8 text-center">
          <h2 className="text-2xl font-extrabold text-kid-blue mb-4">Invalid reset link</h2>
          <p className="text-gray-500 mb-6">This password reset link is missing or invalid.</p>
          <Link to="/forgot-password" className="text-kid-primary font-bold hover:underline">
            Request a new reset link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-10 px-4">
      <div className="glass-card max-w-md w-full p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-kid-secondary/20 rounded-full blur-3xl"></div>

        <h2 className="text-3xl font-extrabold text-center text-kid-blue mb-2">Set new password</h2>
        <p className="text-center text-gray-500 font-medium mb-8">Choose a strong password for your account.</p>

        {error && <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm font-medium mb-4 text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
          <div>
            <label className="block text-sm font-bold text-kid-blue mb-1">New password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Lock size={18} />
              </div>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/50 border border-kid-secondary/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-kid-primary transition-all"
                placeholder="At least 8 characters"
                required
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">{PASSWORD_HINT}</p>
            {newPassword && (
              <p className={`text-xs mt-1 font-bold capitalize ${
                strength === 'weak' ? 'text-red-500' : strength === 'fair' ? 'text-amber-500' : 'text-emerald-600'
              }`}>
                Strength: {strength}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-kid-blue mb-1">Confirm new password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Lock size={18} />
              </div>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/50 border border-kid-secondary/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-kid-primary transition-all"
                placeholder="Re-enter password"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-kid-primary text-white font-bold py-3 rounded-xl hover:bg-orange-500 transition-colors shadow-md hover:shadow-lg mt-4 disabled:opacity-60"
          >
            {loading ? 'Saving…' : 'Reset password'}
          </button>
        </form>

        <p className="text-center mt-6 text-sm font-medium text-gray-600">
          <Link to="/forgot-password" className="text-kid-secondary hover:underline">Request a new link</Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;
