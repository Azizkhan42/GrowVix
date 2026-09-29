const TONES = {
  violet: 'bg-violet-50 text-violet-600',
  blue: 'bg-blue-50 text-blue-600',
  green: 'bg-emerald-50 text-emerald-600',
  orange: 'bg-orange-50 text-orange-600',
  pink: 'bg-pink-50 text-pink-600',
  cyan: 'bg-cyan-50 text-cyan-600',
};

function ActionCard({ action }) {
  const { label, icon: Icon, onClick, tone = 'violet' } = action;

  return (
    <button
      onClick={onClick}
      className="group flex w-full items-center gap-3.5 rounded-2xl border border-app-border bg-white p-4 text-left shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-lift focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
    >
      <span
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 ${
          TONES[tone] || TONES.violet
        }`}
      >
        <Icon size={20} />
      </span>

      <span className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-800 transition-colors group-hover:text-violet-700">
        {label}
      </span>
    </button>
  );
}

export default function QuickActions({ actions }) {
  return (
    <section className="glass-card p-5 sm:p-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Quick Actions</h2>
        <p className="mt-0.5 text-sm text-slate-500">Jump straight into your most used tools</p>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {actions.map((action) => (
          <ActionCard key={action.label} action={action} />
        ))}
      </div>
    </section>
  );
}
