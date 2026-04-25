import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Star, CheckCircle, Crown } from 'lucide-react';

const Subscription = () => {
  const { user, upgrade } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    setLoading(true);
    try {
      await upgrade();
      setTimeout(() => {
        setLoading(false);
        navigate('/');
      }, 1000); // Simulate network delay for effect
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 flex flex-col items-center">
      <div className="text-center mb-12">
        <Crown size={64} className="mx-auto text-kid-yellow mb-4" />
        <h1 className="text-4xl md:text-5xl font-extrabold text-kid-blue mb-4">Unlock Full Wisdom</h1>
        <p className="text-xl text-gray-500 font-medium max-w-2xl mx-auto">
          Get access to all 18 chapters of the Bhagavad Gita and complete verses of the Ramayana and Hanuman Chalisa!
        </p>
      </div>

      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Free Plan */}
        <div className="bg-white rounded-3xl p-8 border-2 border-gray-100 shadow-sm opacity-80">
          <h2 className="text-2xl font-bold text-kid-blue mb-2">Explorer (Free)</h2>
          <div className="text-4xl font-extrabold mb-6">$0<span className="text-lg text-gray-400 font-medium">/mo</span></div>
          
          <ul className="space-y-4 mb-8">
            <li className="flex items-center text-gray-600"><CheckCircle className="text-green-500 mr-2" size={20} /> Chapters 1 & 2</li>
            <li className="flex items-center text-gray-600"><CheckCircle className="text-green-500 mr-2" size={20} /> Voice Player (Standard)</li>
            <li className="flex items-center text-gray-600"><CheckCircle className="text-green-500 mr-2" size={20} /> Meaning Table</li>
          </ul>
          
          <button className="w-full py-3 rounded-xl font-bold border-2 border-gray-200 text-gray-500 cursor-not-allowed">
            Current Plan
          </button>
        </div>

        {/* Premium Plan */}
        <div className="bg-gradient-to-br from-kid-primary to-orange-400 rounded-3xl p-8 shadow-xl text-white transform md:-translate-y-4 relative">
          <div className="absolute top-0 right-0 bg-kid-yellow text-kid-blue text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-3xl uppercase tracking-widest">
            Most Popular
          </div>
          <h2 className="text-2xl font-bold mb-2">Scholar (Premium)</h2>
          <div className="text-4xl font-extrabold mb-6">$5<span className="text-lg font-medium opacity-80">/mo</span></div>
          
          <ul className="space-y-4 mb-8">
            <li className="flex items-center"><Star className="text-kid-yellow mr-2" size={20} fill="currentColor" /> All 18 Chapters Unlocked</li>
            <li className="flex items-center"><Star className="text-kid-yellow mr-2" size={20} fill="currentColor" /> Advanced Voice Options</li>
            <li className="flex items-center"><Star className="text-kid-yellow mr-2" size={20} fill="currentColor" /> Progress Tracking (Coming Soon)</li>
          </ul>
          
          <button 
            onClick={handleUpgrade}
            disabled={loading || user?.is_premium}
            className={`w-full py-3 rounded-xl font-bold shadow-md transition-all ${
              user?.is_premium 
                ? 'bg-white/20 text-white cursor-not-allowed' 
                : 'bg-white text-kid-primary hover:scale-105 hover:shadow-lg'
            }`}
          >
            {loading ? 'Upgrading...' : user?.is_premium ? 'Already Premium!' : 'Simulate Purchase'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default Subscription;
