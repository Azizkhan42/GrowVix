import { useState } from 'react';
import { X, Check, Crown, Loader2, Sparkles } from 'lucide-react';
import { useAuth } from '../context/useAuth';
import { PLANS } from '../data/plans';

export default function PricingModal({ isOpen, onClose }) {
  const { user, updatePlan } = useAuth();
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const currentPlan = user?.plan || 'free';

  const handleSelectPlan = async (planKey) => {
    if (planKey === currentPlan) {
      alert(`You are already on the ${planKey.toUpperCase()} plan.`);
      return;
    }
    setLoadingPlan(planKey);
    setSuccessMsg('');
    try {
      await updatePlan(planKey);
      setSuccessMsg(`Successfully upgraded to ${planKey.toUpperCase()} plan!`);
      setTimeout(() => {
        setSuccessMsg('');
        onClose();
      }, 1500);
    } catch (err) {
      alert(err || 'Failed to update plan');
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-md z-[100] flex items-start sm:items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-app-border rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl animate-rise my-8">
        <div className="px-5 py-4 sm:px-6 sm:py-5 border-b border-app-border flex justify-between items-center gap-3 bg-slate-50">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-9 h-9 shrink-0 rounded-xl gradient-brand flex items-center justify-center text-white">
              <Crown size={20} />
            </span>
            <div className="min-w-0">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900">Upgrade Your Plan</h3>
              <p className="text-xs text-slate-500 truncate sm:whitespace-normal">Choose the perfect plan to accelerate your social media growth.</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close" className="shrink-0 text-slate-400 hover:text-slate-900 transition-colors p-2 rounded-xl hover:bg-slate-200/50">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 sm:p-6 md:p-8 space-y-6">
          {successMsg && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 font-medium text-center p-4 rounded-2xl flex items-center justify-center gap-2">
              <Sparkles size={18} /> {successMsg}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {PLANS.map((plan) => {
              const isCurrent = currentPlan === plan.id;
              const isPro = plan.popular;
              const priceLabel = plan.priceMonthly === 0 ? 'forever' : 'per month';

              return (
                <div
                  key={plan.id}
                  className={`rounded-2xl p-6 flex flex-col justify-between transition-all relative ${
                    isPro
                      ? 'border-2 border-violet-500 shadow-xl bg-gradient-to-b from-violet-50/50 to-white ring-4 ring-violet-500/10'
                      : 'border border-app-border bg-white hover:border-slate-300 shadow-sm'
                  }`}
                >
                  {isPro && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 gradient-brand text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                      Most Popular
                    </span>
                  )}

                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-bold text-slate-900 text-lg">{plan.name}</h4>
                      {isCurrent && (
                        <span className="bg-emerald-100 text-emerald-700 text-xs px-2.5 py-0.5 rounded-full font-semibold">
                          Current Plan
                        </span>
                      )}
                    </div>
                    <div className="mb-4">
                      <span className="text-3xl md:text-4xl font-extrabold text-slate-900">${plan.priceMonthly}</span>
                      <span className="text-xs text-slate-500 ml-1">/ {priceLabel}</span>
                    </div>
                    <p className="text-xs text-slate-500 mb-6 leading-relaxed">{plan.description}</p>

                    <div className="space-y-2.5 mb-6">
                      {plan.features.map((feat, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                          <Check size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => handleSelectPlan(plan.id)}
                    disabled={isCurrent || loadingPlan !== null}
                    className={`w-full py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                      isCurrent
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : isPro
                        ? 'gradient-brand text-white shadow-md hover:opacity-95'
                        : 'bg-slate-900 text-white hover:bg-slate-800'
                    }`}
                  >
                    {loadingPlan === plan.id ? (
                      <>
                        <Loader2 size={16} className="animate-spin" /> Upgrading...
                      </>
                    ) : isCurrent ? (
                      'Active Plan'
                    ) : (
                      `Upgrade to ${plan.name}`
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}