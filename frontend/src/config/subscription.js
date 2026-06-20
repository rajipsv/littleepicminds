/** Premium list price in INR (backend billing may stay annual; UI label is configurable). */
export const PREMIUM_PRICE_INR = 1999;

/**
 * How the premium plan is shown on the subscribe page.
 * Use 'lifetime' for launch offer; switch to 'year' when moving to annual display.
 */
export const PREMIUM_BILLING_DISPLAY = 'lifetime';

export function formatPremiumPrice(locale = 'en-IN') {
  return `₹${PREMIUM_PRICE_INR.toLocaleString(locale)}`;
}

export function premiumBillingSuffix(lang = 'en') {
  if (PREMIUM_BILLING_DISPLAY === 'lifetime') {
    return lang === 'te' ? ' — లైఫ్‌టైమ్' : ' lifetime';
  }
  return lang === 'te' ? '/yr' : '/yr';
}

export function premiumBillingSubtext(lang = 'en') {
  if (PREMIUM_BILLING_DISPLAY === 'lifetime') {
    return lang === 'te'
      ? 'లాంచ్ ఆఫర్ — ఒక్కసారి చెల్లించండి, శాశ్వత ప్రాప్యత'
      : 'Launch offer — one payment, lifetime access';
  }
  return lang === 'te' ? 'వార్షిక ప్రాప్యత' : 'One-time annual access';
}

export function premiumOfferBadge(lang = 'en') {
  if (PREMIUM_BILLING_DISPLAY === 'lifetime') {
    return lang === 'te' ? 'లైఫ్‌టైమ్ ఆఫర్' : 'Lifetime Offer';
  }
  return lang === 'te' ? 'అత్యంత ప్రజాదరణ' : 'Most Popular';
}
