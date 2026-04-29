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
          <div className="text-4xl font-extrabold mb-6">₹0<span className="text-lg text-gray-400 font-medium">/yr</span></div>

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
          <div className="text-4xl font-extrabold mb-6">₹1999<span className="text-lg font-medium opacity-80">/yr</span></div>

          <ul className="space-y-4 mb-8">
            <li className="flex items-center"><Star className="text-kid-yellow mr-2" size={20} fill="currentColor" /> All 18 Chapters Unlocked</li>
            <li className="flex items-center"><Star className="text-kid-yellow mr-2" size={20} fill="currentColor" /> Advanced Voice Options</li>
            <li className="flex items-center"><Star className="text-kid-yellow mr-2" size={20} fill="currentColor" /> Progress Tracking (Coming Soon)</li>
          </ul>

          <div className="bg-white/10 rounded-2xl p-6 mt-6 border border-white/20">
            <h3 className="text-sm font-bold uppercase tracking-widest mb-3 opacity-90">How to Subscribe</h3>
            <p className="text-sm mb-4 leading-relaxed">
              Make a payment of <strong>₹1999</strong> to the number below using <strong>GPay, PhonePe, or Paytm</strong>:
            </p>
            <div className="bg-white text-slate-900 rounded-xl p-3 text-center font-bold text-xl mb-4 shadow-inner border border-white/20">
              admin
            </div>
            <p className="text-xs opacity-80 mb-4 italic text-center">
              *After payment, please send a screenshot of the transaction along with your registered email to our admin.
            </p>

            <a
              href={`https://wa.me/911234567890?text=Hi! I've made the payment for the Scholar Premium Plan for my account: ${user?.email || 'my account'}. Please enable access.`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold flex items-center justify-center transition-all shadow-lg"
            >
              Contact Admin on WhatsApp
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Subscription;
