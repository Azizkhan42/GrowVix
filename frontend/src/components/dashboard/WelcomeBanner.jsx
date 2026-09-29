import { Plus, Play, Sparkles, TrendingUp } from 'lucide-react';

export default function WelcomeBanner({ name, onAddCompetitor, onWatchDemo }) {
  return (
    <section className="animate-rise gradient-brand relative overflow-hidden rounded-2xl p-6 shadow-lift sm:p-8 lg:p-9">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -right-16 -top-24 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-28 left-1/3 h-64 w-64 rounded-full bg-indigo-400/20 blur-2xl" />
        <div className="absolute right-[18%] top-1/2 h-40 w-40 -translate-y-1/2 rounded-full border border-white/10" />
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-8 top-1/2 hidden -translate-y-1/2 lg:block"
      >
        <div className="relative flex h-28 w-28 items-center justify-center rounded-3xl bg-white/10 ring-1 ring-white/20 backdrop-blur-sm">
          <Sparkles size={44} className="text-white/90" />
          <span className="absolute -right-3 -top-3 h-7 w-7 rounded-xl bg-white/15 ring-1 ring-white/20" />
          <span className="absolute -bottom-2 -left-4 h-5 w-5 rounded-lg bg-white/20" />
        </div>
      </div>

      <div className="relative max-w-2xl">
        <p className="text-sm font-medium text-white/80">Welcome back,</p>
        <h1 className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-3xl font-extrabold leading-tight text-white sm:text-4xl">
          {name || 'User'}
          <span aria-hidden="true">&#128075;</span>
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/80 sm:text-base">
          Turn data into growth with AI-powered insights.
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            onClick={onAddCompetitor}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-violet-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-violet-50 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
          >
            <Plus size={17} /> Add Competitor
          </button>

          <button
            onClick={onWatchDemo}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:-translate-y-0.5 hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
          >
            <Play size={16} /> Watch Demo
          </button>
        </div>

        <p className="mt-5 inline-flex items-center gap-1.5 text-xs font-medium text-white/70">
          <TrendingUp size={13} />
          AI scoring updated from your latest activity
        </p>
      </div>
    </section>
  );
}
