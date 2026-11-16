// Single source of truth for pricing across the whole app.
// Update prices/features here and they will reflect everywhere:
// the public Pricing page, the Home pricing preview, and the in-app
// Upgrade Plan modal.
//
// `id` values must stay in sync with the backend (free | pro | agency).
export const PLANS = [
  {
    id: 'free',
    name: 'Free',
    priceMonthly: 0,
    priceAnnual: 0,
    description: 'Essential tools to get started with AI marketing and business profiles.',
    features: [
      'Basic business profile',
      'Limited AI content generation',
      'Basic competitor analysis',
      'Basic marketing calendar',
      'Community support',
    ],
    cta: 'Get Started Free',
    popular: false,
  },
  {
    id: 'pro',
    name: 'Professional',
    priceMonthly: 15,
    priceAnnual: 12,
    description: 'Advanced AI capabilities and social publishing for growing businesses.',
    features: [
      'Increased AI content generation',
      'Advanced competitor analysis',
      'AI marketing recommendations',
      'Social media scheduling & publishing',
      'Marketing analytics & insights',
      'Priority email support',
    ],
    cta: 'Start Professional Trial',
    popular: true,
  },
  {
    id: 'agency',
    name: 'Business',
    priceMonthly: 20,
    priceAnnual: 15,
    description: 'Multi-business profiles and team collaboration for agencies and enterprises.',
    features: [
      'Multiple business profiles',
      'Advanced marketing insights',
      'Team collaboration tools',
      'Higher usage limits & priority API',
      'Advanced reporting & exports',
      'Dedicated account manager',
    ],
    cta: 'Choose Business',
    popular: false,
  },
];

export function getPlanPrice(plan, cycle = 'monthly') {
  return cycle === 'annual' ? plan.priceAnnual : plan.priceMonthly;
}