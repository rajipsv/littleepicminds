import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Lock } from 'lucide-react';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [age, setAge] = useState('');
  const [grade, setGrade] = useState('');
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(username, email, password, age, grade);
      navigate('/');
    } catch (err) {
      const errMsg = err.response?.data?.error || err.response?.data?.message || err.message;
      setError(errMsg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-10 px-4">
      <div className="glass-card max-w-md w-full p-8 relative overflow-hidden border-kid-secondary/20 border-2">
        <div className="absolute top-0 right-0 w-32 h-32 bg-kid-secondary/20 rounded-full blur-3xl"></div>
        
        <h2 className="text-3xl font-extrabold text-center text-kid-blue mb-2">Join Us!</h2>
        <p className="text-center text-gray-500 font-medium mb-8">Create an account to track your progress.</p>
        
        {error && (
        <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 text-sm font-bold flex items-center gap-3">
          <span className="text-xl">⚠️</span>
          <span>{typeof error === 'string' ? error : 'A server error occurred. Please check the logs.'}</span>
        </div>
      )}

        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
          <div>
            <label className="block text-sm font-bold text-kid-blue mb-1">Choose a Username</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <User size={18} />
              </div>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/50 border border-kid-secondary/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-kid-secondary transition-all"
                placeholder="E.g., Arjun123"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-kid-blue mb-1">Email (Gmail)</label>
            <div className="relative">
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white/50 border border-kid-secondary/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-kid-secondary transition-all"
                placeholder="parent@gmail.com"
                required
              />
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-bold text-kid-blue mb-1">Age</label>
              <input 
                type="number" 
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full px-4 py-3 bg-white/50 border border-kid-secondary/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-kid-secondary transition-all"
                placeholder="E.g., 8"
                min="3"
                max="18"
                required
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-bold text-kid-blue mb-1">Grade</label>
              <input 
                type="text" 
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full px-4 py-3 bg-white/50 border border-kid-secondary/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-kid-secondary transition-all"
                placeholder="E.g., 3rd Grade"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-kid-blue mb-1">Create a Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Lock size={18} />
              </div>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/50 border border-kid-secondary/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-kid-secondary transition-all"
                placeholder="Make it strong!"
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full bg-kid-secondary text-white font-bold py-3 rounded-xl hover:bg-teal-500 transition-colors shadow-md hover:shadow-lg mt-4"
          >
            Sign Up
          </button>
        </form>

        <p className="text-center mt-6 text-sm font-medium text-gray-600">
          Already have an account? <Link to="/login" className="text-kid-secondary hover:underline">Log In</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
