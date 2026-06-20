import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Star, CheckCircle, Crown, ChevronLeft, Tag } from 'lucide-react';
import {
  formatPremiumPrice,
  premiumBillingSubtext,
  premiumBillingSuffix,
  premiumDiscountHeadline,
  premiumOfferBadge,
  premiumOfferPriceLabel,
  premiumRegularPriceLabel,
  premiumStrikethroughYearly,
  PREMIUM_BILLING_DISPLAY,
  PREMIUM_PRICE_INR,
} from '../config/subscription';

const Subscription = () => {
  const { user, upgrade } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const priceLabel = formatPremiumPrice();
  const isLifetimeOffer = PREMIUM_BILLING_DISPLAY === 'lifetime';

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
      }, 1000);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const whatsappPlanLabel = isLifetimeOffer
    ? 'Scholar Premium Lifetime Launch Offer'
    : 'Scholar Premium Plan';

  return (
    <div className="min-h-screen py-12 px-4 flex flex-col items-center text-white relative">
      <Link
        to="/"
        className="absolute top-6 left-4 md:left-8 flex items-center gap-2 text-gray-400 hover:text-lem-accent transition-colors text-sm font-bold"
      >
        <ChevronLeft size={20} />
        Back to Home
      </Link>

      <div className="text-center mb-12 mt-8 md:mt-0">
        <Crown size={64} className="mx-auto text-kid-yellow mb-4" />
        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">Unlock Full Wisdom</h1>
        <p className="text-xl text-gray-300 font-medium max-w-2xl mx-auto">
          Get access to all 18 chapters of the Bhagavad Gita and complete verses of the Ramayana and Hanuman Chalisa!
        </p>
      </div>

      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* Free Plan */}
        <div className="bg-white rounded-3xl p-8 border-2 border-gray-100 shadow-sm text-slate-800">
          <h2 className="text-2xl font-bold text-kid-blue mb-2">Explorer (Free)</h2>
          <p className="text-4xl font-extrabold text-slate-900 mb-1">
            <span className="text-kid-blue">₹0</span>
            <span className="text-xl text-slate-500 font-semibold"> forever</span>
          </p>
          <p className="text-sm text-slate-500 mb-6">No payment required</p>

          <ul className="space-y-4 mb-8">
            <li className="flex items-center text-slate-700">
              <CheckCircle className="text-green-500 mr-2 shrink-0" size={20} /> Chapter 1 only
            </li>
            <li className="flex items-center text-slate-700">
              <CheckCircle className="text-green-500 mr-2 shrink-0" size={20} /> Meaning Table
            </li>
          </ul>

          <button className="w-full py-3 rounded-xl font-bold border-2 border-gray-200 text-gray-500 cursor-not-allowed">
            Current Plan
          </button>
        </div>

        {/* Premium Plan */}
        <div className="bg-gradient-to-br from-kid-primary to-orange-400 rounded-3xl p-8 shadow-xl text-white transform md:-translate-y-4 relative">
          <div className="absolute top-0 right-0 bg-kid-yellow text-kid-blue text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-3xl uppercase tracking-widest">
            {premiumOfferBadge()}
          </div>
          <h2 className="text-2xl font-bold mb-2">Scholar (Premium)</h2>

          {isLifetimeOffer && (
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 border border-white/25 px-3 py-1.5 text-xs font-bold uppercase tracking-wide">
              <Tag size={14} className="text-kid-yellow" />
              {premiumDiscountHeadline()}
            </div>
          )}

          {isLifetimeOffer && premiumStrikethroughYearly() && (
            <div className="mb-2">
              <p className="text-[11px] font-bold uppercase tracking-widest text-white/70 mb-0.5">
                {premiumRegularPriceLabel()}
              </p>
              <p className="text-lg font-semibold text-white/55 line-through">
                {premiumStrikethroughYearly()}
              </p>
            </div>
          )}

          <div className="mb-1">
            {isLifetimeOffer && (
              <p className="text-[11px] font-bold uppercase tracking-widest text-kid-yellow mb-0.5">
                {premiumOfferPriceLabel()}
              </p>
            )}
            <p className="text-4xl font-extrabold text-white">
              {priceLabel}
              <span className="text-lg font-semibold opacity-90">{premiumBillingSuffix()}</span>
            </p>
          </div>

          {isLifetimeOffer && (
            <p className="text-xl font-black text-kid-yellow mb-2">Lifetime access</p>
          )}

          <p className="text-sm text-white/85 mb-6">{premiumBillingSubtext()}</p>

          <ul className="space-y-4 mb-8">
            <li className="flex items-center">
              <Star className="text-kid-yellow mr-2 shrink-0" size={20} fill="currentColor" /> All 18 Chapters Unlocked
            </li>
            <li className="flex items-center">
              <Star className="text-kid-yellow mr-2 shrink-0" size={20} fill="currentColor" /> Progress Tracking
            </li>
            {isLifetimeOffer && (
              <li className="flex items-center">
                <Star className="text-kid-yellow mr-2 shrink-0" size={20} fill="currentColor" /> Lifetime premium — launch discount
              </li>
            )}
          </ul>

          <div className="bg-white/10 rounded-2xl p-6 mt-6 border border-white/20">
            <h3 className="text-sm font-bold uppercase tracking-widest mb-3 opacity-90">How to Subscribe</h3>
            <p className="text-sm mb-4 leading-relaxed">
              {isLifetimeOffer ? (
                <>
                  Claim this <strong>limited launch offer</strong>: pay <strong>{priceLabel}</strong> once for{' '}
                  <strong>lifetime access</strong> (not yearly). Use <strong>GPay, PhonePe, or Paytm</strong> to pay:
                </>
              ) : (
                <>
                  Make a payment of <strong>{priceLabel}</strong> for <strong>one year of access</strong> using{' '}
                  <strong>GPay, PhonePe, or Paytm</strong>:
                </>
              )}
            </p>
            <div className="bg-white text-slate-900 rounded-xl p-3 text-center font-bold text-xl mb-4 shadow-inner border border-white/20">
              admin
            </div>
            <p className="text-xs opacity-80 mb-4 italic text-center">
              *After payment, please send a screenshot of the transaction along with your registered email to our admin.
            </p>

            <a
              href={`https://wa.me/911234567890?text=Hi! I've made the payment of ${PREMIUM_PRICE_INR} for the ${whatsappPlanLabel} for my account: ${user?.email || 'my account'}. Please enable access.`}
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
