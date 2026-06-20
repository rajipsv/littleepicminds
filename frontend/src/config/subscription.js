/** Premium list price in INR */
export const PREMIUM_PRICE_INR = 1999;

/** Future / regular yearly price shown struck-through during lifetime launch offer */
export const PREMIUM_YEARLY_REFERENCE_INR = 1999;

/**
 * How the premium plan is shown on the subscribe page.
 * Use 'lifetime' for launch discount offer; switch to 'year' when annual plan goes live.
 */
export const PREMIUM_BILLING_DISPLAY = 'lifetime';

export function formatPremiumPrice(amount = PREMIUM_PRICE_INR, locale = 'en-IN') {
  return `₹${amount.toLocaleString(locale)}`;
}

export function premiumBillingSuffix(lang = 'en') {
  if (PREMIUM_BILLING_DISPLAY === 'lifetime') {
    return lang === 'te' ? ' — ఒక్కసారి' : ' one-time';
  }
  return lang === 'te' ? '/yr' : '/yr';
}

export function premiumOfferBadge(lang = 'en') {
  if (PREMIUM_BILLING_DISPLAY === 'lifetime') {
    return lang === 'te' ? 'పరిమిత ఆఫర్' : 'Limited Offer';
  }
  return lang === 'te' ? 'అత్యంత ప్రజాదరణ' : 'Most Popular';
}

export function premiumStrikethroughYearly(lang = 'en') {
  if (PREMIUM_BILLING_DISPLAY !== 'lifetime') return null;
  const price = formatPremiumPrice(PREMIUM_YEARLY_REFERENCE_INR);
  return lang === 'te' ? `${price}/yr` : `${price}/year`;
}

export function premiumRegularPriceLabel(lang = 'en') {
  if (PREMIUM_BILLING_DISPLAY !== 'lifetime') return null;
  return lang === 'te' ? 'సాధారణ ధర (వార్షికం)' : 'Regular price (yearly)';
}

export function premiumOfferPriceLabel(lang = 'en') {
  if (PREMIUM_BILLING_DISPLAY !== 'lifetime') return null;
  return lang === 'te' ? 'ఆఫర్ ధర' : 'Offer price';
}

export function premiumDiscountHeadline(lang = 'en') {
  if (PREMIUM_BILLING_DISPLAY !== 'lifetime') return null;
  return lang === 'te'
    ? '1 సంవత్సరం ధర — లైఫ్‌టైమ్ ప్రాప్యత'
    : 'Pay for 1 year — get lifetime access';
}

export function premiumBillingSubtext(lang = 'en') {
  if (PREMIUM_BILLING_DISPLAY === 'lifetime') {
    return lang === 'te'
      ? 'ప్రస్తుత డిస్కౌంట్ ఆఫర్. తర్వాత వార్షిక ప్లాన్‌కు మారవచ్చు.'
      : 'Launch discount offer for now — not a yearly subscription. Pricing may move to per year later.';
  }
  return lang === 'te' ? 'వార్షిక ప్రాప్యత' : 'One-time annual access';
}
