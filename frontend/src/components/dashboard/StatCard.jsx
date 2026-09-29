const ACCENTS = {
  violet: { chip: 'bg-violet-50 text-violet-600', bar: 'bg-violet-500' },
  blue: { chip: 'bg-blue-50 text-blue-600', bar: 'bg-blue-500' },
  green: { chip: 'bg-emerald-50 text-emerald-600', bar: 'bg-emerald-500' },
  orange: { chip: 'bg-orange-50 text-orange-600', bar: 'bg-orange-500' },
};

export default function StatCard({
  label,
  value,
  icon: Icon,
  accent = 'violet',
  hint,
  trend,
  delay = 0,
}) {
  const tone = ACCENTS[accent] || ACCENTS.violet;
  const showTrend = typeof trend === 'string' && trend.trim().length > 0;

  return (
    <article
      className="animate-rise glass-card p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">{value}</p>
        </div>

        {Icon && (
          <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tone.chip}`}>
            <Icon size={20} />
          </span>
        )}
      </div>

      <div className="mt-3 flex items-center gap-2">
        {showTrend ? (
          <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-600">
            {trend}
          </span>
        ) : (
          <span className="h-6" aria-hidden="true" />
        )}
        {hint && <span className="truncate text-xs text-slate-400">{hint}</span>}
      </div>

      <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-slate-100" aria-hidden="true">
        <div
          className={`animate-grow-x h-full rounded-full ${tone.bar} opacity-80`}
          style={{ animationDelay: `${delay + 120}ms` }}
        />
      </div>
    </article>
  );
}
