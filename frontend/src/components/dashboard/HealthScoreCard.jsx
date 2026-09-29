import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const DIMENSION_LABELS = {
  socialMedia: 'Social Media',
  contentQuality: 'Content Quality',
  engagement: 'Engagement',
  consistency: 'Consistency',
  website: 'Website',
  seo: 'SEO',
  competitorPosition: 'Competitor Position',
  brandStrength: 'Brand Strength',
};

const DIMENSION_ORDER = [
  'socialMedia',
  'contentQuality',
  'engagement',
  'consistency',
  'website',
  'seo',
  'competitorPosition',
  'brandStrength',
];

function scoreTone(value) {
  if (value >= 70) return { text: 'text-emerald-600', bar: 'bg-emerald-500', ring: 'stroke-emerald-500' };
  if (value >= 40) return { text: 'text-amber-600', bar: 'bg-amber-500', ring: 'stroke-amber-500' };
  return { text: 'text-rose-600', bar: 'bg-rose-500', ring: 'stroke-rose-500' };
}

function ScoreRing({ value }) {
  const radius = 62;
  const circumference = 2 * Math.PI * radius;
  const safeValue = Math.max(0, Math.min(100, Number(value) || 0));
  const offset = circumference - (safeValue / 100) * circumference;
  const tone = scoreTone(safeValue);

  return (
    <div className="relative h-[164px] w-[164px] shrink-0">
      <svg viewBox="0 0 160 160" className="h-full w-full -rotate-90" role="img" aria-label={`Digital health score ${safeValue} out of 100`}>
        <defs>
          <linearGradient id="gvScoreRing" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="50%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        </defs>
        <circle cx="80" cy="80" r={radius} fill="none" stroke="#eef0f6" strokeWidth="13" />
        <circle
          cx="80"
          cy="80"
          r={radius}
          fill="none"
          stroke="url(#gvScoreRing)"
          strokeWidth="13"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="animate-grow-x"
          style={{ transformOrigin: 'center' }}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-4xl font-extrabold tracking-tight ${tone.text}`}>{safeValue}</span>
        <span className="mt-0.5 text-xs font-medium text-slate-400">out of 100</span>
      </div>
    </div>
  );
}

export default function HealthScoreCard({ score }) {
  const overall = score?.overall ?? 0;
  const dimensions = score?.dimensions || null;

  const entries = dimensions
    ? DIMENSION_ORDER.filter((key) => dimensions[key] !== undefined).map((key) => [key, dimensions[key]])
    : Object.entries(dimensions || {});

  return (
    <section className="glass-card flex h-full flex-col p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Digital Health Score</h2>
          <p className="mt-0.5 text-sm text-slate-500">
            Weighted across 8 growth dimensions
          </p>
        </div>
        <Link
          to="/analytics"
          className="inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-violet-600 transition-colors hover:bg-violet-50"
        >
          View Full Analysis <ArrowRight size={13} />
        </Link>
      </div>

      <div className="mt-6 flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:gap-7">
        <ScoreRing value={overall} />

        <ul className="w-full flex-1 space-y-3">
          {entries.map(([key, raw], i) => {
            const label = DIMENSION_LABELS[key] || key.replace(/([A-Z])/g, ' $1');
            const value = Math.round(Number(raw) || 0);
            const tone = scoreTone(value);

            return (
              <li key={key}>
                <div className="mb-1.5 flex items-center justify-between gap-3 text-xs">
                  <span className="truncate font-medium text-slate-600">{label}</span>
                  <span className={`shrink-0 font-bold tabular-nums ${tone.text}`}>{value}</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`animate-grow-x h-full rounded-full ${tone.bar}`}
                    style={{ width: `${value}%`, animationDelay: `${80 + i * 55}ms` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
