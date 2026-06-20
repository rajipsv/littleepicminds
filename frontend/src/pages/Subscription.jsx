import React from 'react';
import { Link } from 'react-router-dom';
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
  const { user } = useAuth();
  const priceLabel = formatPremiumPrice();
  const isLifetimeOffer = PREMIUM_BILLING_DISPLAY === 'lifetime';

  const whatsappPlanLabel = isLifetimeOffer
    ? 'Scholar Premium Lifetime Launch Offer'
    : 'Scholar Premium Plan';

  return (
    <div className="min-h-screen py-10 px-4 bg-lem-dark text-white relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-lem-accent/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[120px]" />

      <div className="max-w-5xl mx-auto relative z-10">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-lem-accent transition-colors text-sm font-bold mb-10"
        >
          <ChevronLeft size={20} />
          Back to Home
        </Link>

        <div className="text-center mb-12">
          <div className="w-20 h-20 mx-auto mb-6 bg-lem-accent/20 rounded-3xl flex items-center justify-center border border-lem-accent/30 shadow-[0_0_30px_rgba(253,160,133,0.2)]">
            <Crown size={40} className="text-lem-accent" />
          </div>
          <span className="bg-white/10 text-lem-accent text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full mb-4 inline-block border border-lem-accent/20">
            Scholar Premium
          </span>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-4">
            Unlock Full <span className="text-gradient">Wisdom</span>
          </h1>
          <p className="text-lg text-gray-400 font-medium max-w-2xl mx-auto leading-relaxed">
            Get access to all 18 chapters of the Bhagavad Gita and complete verses of the Ramayana and Hanuman Chalisa.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Free Plan */}
          <div className="glass-card p-8 md:p-10 border border-lem-glass-border rounded-3xl">
            <h2 className="text-2xl font-black text-white mb-2">Explorer (Free)</h2>
            <p className="text-sm text-gray-400 font-medium mb-6">Start your journey at no cost</p>
            <p className="text-4xl font-black text-white mb-1">
              <span className="text-lem-accent">₹0</span>
              <span className="text-xl text-gray-400 font-semibold"> forever</span>
            </p>
            <p className="text-sm text-gray-500 mb-8">No payment required</p>

            <ul className="space-y-4 mb-8">
              <li className="flex items-center text-gray-300">
                <CheckCircle className="text-lem-accent mr-3 shrink-0" size={20} />
                Chapter 1 only
              </li>
              <li className="flex items-center text-gray-300">
                <CheckCircle className="text-lem-accent mr-3 shrink-0" size={20} />
                Meaning Table
              </li>
            </ul>

            <button
              type="button"
              className="w-full py-3 rounded-xl font-bold border border-lem-glass-border text-gray-500 bg-white/5 cursor-not-allowed"
            >
              Current Plan
            </button>
          </div>

          {/* Premium Plan */}
          <div className="glass-card p-8 md:p-10 border border-lem-accent/40 rounded-3xl relative md:-translate-y-2 shadow-[0_0_40px_rgba(253,160,133,0.12)] overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-lem-accent/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

            <div className="absolute top-0 right-0 bg-gradient-accent text-lem-dark text-xs font-black px-4 py-1.5 rounded-bl-2xl rounded-tr-3xl uppercase tracking-widest shadow-[0_0_15px_rgba(253,160,133,0.4)]">
              {premiumOfferBadge()}
            </div>

            <div className="relative z-10">
              <h2 className="text-2xl font-black text-white mb-2 pr-24">Scholar (Premium)</h2>

              {isLifetimeOffer && (
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 border border-lem-accent/30 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-lem-accent">
                  <Tag size={14} />
                  {premiumDiscountHeadline()}
                </div>
              )}

              {isLifetimeOffer && premiumStrikethroughYearly() && (
                <div className="mb-2">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-0.5">
                    {premiumRegularPriceLabel()}
                  </p>
                  <p className="text-lg font-semibold text-gray-500 line-through">
                    {premiumStrikethroughYearly()}
                  </p>
                </div>
              )}

              <div className="mb-1">
                {isLifetimeOffer && (
                  <p className="text-[11px] font-bold uppercase tracking-widest text-lem-accent mb-0.5">
                    {premiumOfferPriceLabel()}
                  </p>
                )}
                <p className="text-4xl font-black text-white">
                  {priceLabel}
                  <span className="text-lg font-semibold text-gray-300">{premiumBillingSuffix()}</span>
                </p>
              </div>

              {isLifetimeOffer && (
                <p className="text-xl font-black text-gradient mb-2">Lifetime access</p>
              )}

              <p className="text-sm text-gray-400 mb-8 leading-relaxed">{premiumBillingSubtext()}</p>

              <ul className="space-y-4 mb-8">
                <li className="flex items-center text-gray-200">
                  <Star className="text-lem-accent mr-3 shrink-0" size={20} fill="currentColor" />
                  All 18 Chapters Unlocked
                </li>
                <li className="flex items-center text-gray-200">
                  <Star className="text-lem-accent mr-3 shrink-0" size={20} fill="currentColor" />
                  Progress Tracking
                </li>
                {isLifetimeOffer && (
                  <li className="flex items-center text-gray-200">
                    <Star className="text-lem-accent mr-3 shrink-0" size={20} fill="currentColor" />
                    Lifetime premium — launch discount
                  </li>
                )}
              </ul>

              <div className="bg-white/5 rounded-2xl p-6 border border-lem-glass-border backdrop-blur-sm">
                <h3 className="text-sm font-black uppercase tracking-widest text-lem-accent mb-3">
                  How to Subscribe
                </h3>
                <p className="text-sm mb-4 leading-relaxed text-gray-300">
                  {isLifetimeOffer ? (
                    <>
                      Claim this <strong className="text-white">limited launch offer</strong>: pay{' '}
                      <strong className="text-lem-accent">{priceLabel}</strong> once for{' '}
                      <strong className="text-white">lifetime access</strong> (not yearly). Use{' '}
                      <strong className="text-white">GPay, PhonePe, or Paytm</strong> to pay:
                    </>
                  ) : (
                    <>
                      Make a payment of <strong className="text-lem-accent">{priceLabel}</strong> for{' '}
                      <strong className="text-white">one year of access</strong> using{' '}
                      <strong className="text-white">GPay, PhonePe, or Paytm</strong>:
                    </>
                  )}
                </p>
                <div className="bg-lem-sidebar text-white rounded-xl p-3 text-center font-bold text-xl mb-4 border border-lem-glass-border">
                  admin
                </div>
                <p className="text-xs text-gray-500 mb-4 italic text-center">
                  *After payment, send a screenshot of the transaction with your registered email to our admin.
                </p>

                <a
                  href={`https://wa.me/911234567890?text=Hi! I've made the payment of ${PREMIUM_PRICE_INR} for the ${whatsappPlanLabel} for my account: ${user?.email || 'my account'}. Please enable access.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 bg-gradient-accent text-lem-dark rounded-xl font-black flex items-center justify-center transition-all shadow-[0_0_20px_rgba(253,160,133,0.3)] hover:scale-[1.02] active:scale-[0.98]"
                >
                  Contact Admin on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subscription;
