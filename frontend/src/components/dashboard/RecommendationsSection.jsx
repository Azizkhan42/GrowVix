import { AlertTriangle, ArrowRight, CheckCircle2, Info, Lightbulb } from 'lucide-react';
import { Link } from 'react-router-dom';

const SEVERITY = {
  critical: {
    label: 'Critical',
    Icon: AlertTriangle,
    surface: 'bg-rose-50 border-rose-100',
    badge: 'bg-rose-100 text-rose-700',
    iconChip: 'bg-rose-100 text-rose-600',
  },
  high: {
    label: 'High',
    Icon: AlertTriangle,
    surface: 'bg-amber-50 border-amber-100',
    badge: 'bg-amber-100 text-amber-700',
    iconChip: 'bg-amber-100 text-amber-600',
  },
  medium: {
    label: 'Medium',
    Icon: Info,
    surface: 'bg-blue-50 border-blue-100',
    badge: 'bg-blue-100 text-blue-700',
    iconChip: 'bg-blue-100 text-blue-600',
  },
  low: {
    label: 'Suggestion',
    Icon: Lightbulb,
    surface: 'bg-violet-50 border-violet-100',
    badge: 'bg-violet-100 text-violet-700',
    iconChip: 'bg-violet-100 text-violet-600',
  },
};

export function RecommendationCard({ recommendation }) {
  const tone = SEVERITY[recommendation.type] || SEVERITY.low;
  const { Icon } = tone;

  return (
    <article
      className={`group flex items-start gap-3.5 rounded-2xl border p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-soft ${tone.surface}`}
    >
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tone.iconChip}`}>
        <Icon size={18} />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`rounded-md px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide ${tone.badge}`}>
            {tone.label}
          </span>
          <span className="text-[11px] font-medium capitalize text-slate-500">
            {recommendation.category}
          </span>
        </div>

        <h3 className="mt-1.5 text-sm font-semibold leading-snug text-slate-900">
          {recommendation.problem}
        </h3>
        <p className="mt-1 text-[13px] leading-relaxed text-slate-600">
          {recommendation.recommendation}
        </p>
      </div>

      <Link
        to="/recommendations"
        aria-label={`Open recommendation: ${recommendation.problem}`}
        className="mt-1 shrink-0 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-white/70 hover:text-violet-600"
      >
        <ArrowRight size={16} />
      </Link>
    </article>
  );
}

export default function RecommendationsSection({ recommendations }) {
  const hasRecs = Array.isArray(recommendations) && recommendations.length > 0;

  return (
    <section className="glass-card p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Key Recommendations</h2>
          <p className="mt-0.5 text-sm text-slate-500">
            AI prioritised actions to improve your digital presence
          </p>
        </div>
        <Link
          to="/recommendations"
          className="inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-violet-600 transition-colors hover:bg-violet-50"
        >
          View All <ArrowRight size={13} />
        </Link>
      </div>

      {hasRecs ? (
        <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-3">
          {recommendations.map((rec) => (
            <RecommendationCard key={rec._id} recommendation={rec} />
          ))}
        </div>
      ) : (
        <div className="mt-4 flex flex-col items-center rounded-2xl border border-dashed border-slate-200 px-6 py-10 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-500">
            <CheckCircle2 size={24} />
          </span>
          <p className="mt-4 text-sm font-medium text-slate-700">You're all caught up</p>
          <p className="mt-1 max-w-sm text-sm text-slate-500">
            Add competitors and generate content to receive personalised AI recommendations.
          </p>
          <Link
            to="/recommendations"
            className="mt-5 inline-flex items-center gap-1.5 rounded-xl border border-app-border bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Generate recommendations <ArrowRight size={15} />
          </Link>
        </div>
      )}
    </section>
  );
}
