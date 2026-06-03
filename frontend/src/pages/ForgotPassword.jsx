import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import api from '../api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [devResetUrl, setDevResetUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setDevResetUrl('');
    setLoading(true);
    try {
      const res = await api.post('/api/auth/forgot-password', { email: email.trim() });
      setMessage(res.data?.message || 'Check your email for reset instructions.');
      if (res.data?.devResetUrl) {
        setDevResetUrl(res.data.devResetUrl);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Could not send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-10 px-4">
      <div className="glass-card max-w-md w-full p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-kid-primary/20 rounded-full blur-3xl"></div>

        <h2 className="text-3xl font-extrabold text-center text-kid-blue mb-2">Forgot Password</h2>
        <p className="text-center text-gray-500 font-medium mb-8">
          Enter your account email and we will send you a link to reset your password.
        </p>

        {error && <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm font-medium mb-4 text-center">{error}</div>}
        {message && <div className="bg-emerald-50 text-emerald-700 p-3 rounded-lg text-sm font-medium mb-4 text-center">{message}</div>}

        {devResetUrl && (
          <div className="bg-amber-50 text-amber-900 p-3 rounded-lg text-sm mb-4 break-all">
            <p className="font-bold mb-1">Dev reset link (email not configured):</p>
            <a href={devResetUrl} className="text-kid-primary hover:underline">{devResetUrl}</a>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
          <div>
            <label className="block text-sm font-bold text-kid-blue mb-1">Email address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Mail size={18} />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/50 border border-kid-secondary/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-kid-primary transition-all"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-kid-primary text-white font-bold py-3 rounded-xl hover:bg-orange-500 transition-colors shadow-md hover:shadow-lg mt-4 disabled:opacity-60"
          >
            {loading ? 'Sending…' : 'Send reset link'}
          </button>
        </form>

        <p className="text-center mt-6 text-sm font-medium text-gray-600">
          Remember your password? <Link to="/login" className="text-kid-primary hover:underline">Log in</Link>
        </p>

        <Link
          to="/"
          className="block text-center mt-4 text-sm font-medium text-gray-400 hover:text-white transition-colors"
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  );
};

export default ForgotPassword;
