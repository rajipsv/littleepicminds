import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Lock } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to login');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-10 px-4">
      <div className="glass-card max-w-md w-full p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-kid-primary/20 rounded-full blur-3xl"></div>
        
        <h2 className="text-3xl font-extrabold text-center text-kid-blue mb-2">Welcome Back!</h2>
        <p className="text-center text-gray-500 font-medium mb-8">Log in to continue your learning journey.</p>
        
        {error && <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm font-medium mb-4 text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
          <div>
            <label className="block text-sm font-bold text-kid-blue mb-1">Username</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <User size={18} />
              </div>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/50 border border-kid-secondary/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-kid-primary transition-all"
                placeholder="Enter your username"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-kid-blue mb-1">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Lock size={18} />
              </div>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/50 border border-kid-secondary/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-kid-primary transition-all"
                placeholder="Enter your password"
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full bg-kid-primary text-white font-bold py-3 rounded-xl hover:bg-orange-500 transition-colors shadow-md hover:shadow-lg mt-4"
          >
            Login
          </button>
        </form>

        <p className="text-center mt-6 text-sm font-medium text-gray-600">
          Don't have an account? <Link to="/register" className="text-kid-primary hover:underline">Sign Up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
