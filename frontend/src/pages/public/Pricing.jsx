import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

export default function Pricing() {
  const [billingCycle, setBillingCycle] = useState('monthly');

  const plans = [
    {
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
      name: 'Professional',
      priceMonthly: 49,
      priceAnnual: 39,
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
      name: 'Business',
      priceMonthly: 129,
      priceAnnual: 99,
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

  return (
    <div className="flex flex-col">
      {/* Header */}
      <section className="bg-gradient-to-b from-white via-violet-50/30 to-slate-50 py-16 lg:py-24 text-center">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-100 border border-violet-200 text-violet-700 text-xs font-semibold uppercase tracking-wider">
            <Sparkles size={14} /> Simple Pricing
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Invest in Growth, Not Complexity
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Choose the ideal plan for your business with clear pricing and no hidden fees.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center rounded-full bg-slate-200/70 p-1 mt-4">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`rounded-full px-5 py-2 text-xs font-semibold transition ${
                billingCycle === 'monthly'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`rounded-full px-5 py-2 text-xs font-semibold transition flex items-center gap-1.5 ${
                billingCycle === 'annual'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Annual Billing</span>
              <span className="rounded bg-violet-100 px-1.5 py-0.5 text-[10px] font-bold text-violet-700">Save 20%</span>
            </button>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {plans.map((plan, idx) => {
              const price = billingCycle === 'annual' ? plan.priceAnnual : plan.priceMonthly;
              return (
                <div
                  key={idx}
                  className={`rounded-2xl bg-white p-8 shadow-soft flex flex-col justify-between relative transition-all duration-300 hover:shadow-lift ${
                    plan.popular ? 'border-2 border-violet-600 shadow-lift' : 'border border-app-border'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full gradient-brand px-3 py-1 text-xs font-bold text-white uppercase tracking-wider">
                      Most Popular
                    </div>
                  )}

                  <div>
                    <p className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-2">{plan.name}</p>
                    <div className="flex items-baseline gap-1 mb-4">
                      <span className="text-4xl font-extrabold text-slate-900">${price}</span>
                      <span className="text-sm text-slate-500">/ {billingCycle === 'annual' ? 'month, billed annually' : 'month'}</span>
                    </div>
                    <p className="text-sm text-slate-600 mb-6">{plan.description}</p>
                    <ul className="space-y-3 text-sm text-slate-600 mb-8">
                      {plan.features.map((feat, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <CheckCircle2 size={16} className="text-violet-600 shrink-0" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Link
                    to="/signup"
                    className={`w-full rounded-xl py-3 text-center text-sm font-semibold transition ${
                      plan.popular
                        ? 'gradient-brand text-white shadow-soft hover:opacity-95'
                        : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Comparison & FAQ notice */}
      <section className="py-20 bg-white text-center border-t border-app-border">
        <div className="mx-auto max-w-3xl px-4 space-y-6">
          <h3 className="text-3xl font-bold text-slate-900">Need a custom enterprise solution?</h3>
          <p className="text-slate-600">Contact our sales team for custom API limits, SSO, and dedicated infrastructure.</p>
          <div className="pt-2">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-8 py-3.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition"
            >
              <span>Contact Sales</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
