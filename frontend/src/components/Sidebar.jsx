import { Link, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  Lightbulb,
  PenTool,
  CalendarDays,
  BarChart3,
  Settings as SettingsIcon,
  ListChecks,
  Crown,
  Send,
  X,
} from 'lucide-react';
import Logo from './Logo';

const NAV_ITEMS = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Competitors', path: '/competitors', icon: Users },
  { name: 'AI Insights', path: '/insights', icon: Lightbulb },
  { name: 'Content Gen', path: '/content-generator', icon: PenTool },
  { name: 'Content Calendar', path: '/content-calendar', icon: CalendarDays },
  { name: 'Scheduler', path: '/scheduler', icon: Send },
  { name: 'Analytics', path: '/analytics', icon: BarChart3 },
  { name: 'Recommendations', path: '/recommendations', icon: ListChecks },
  { name: 'Settings', path: '/settings', icon: SettingsIcon },
];

function isItemActive(pathname, path) {
  if (pathname === path) return true;
  if (path === '/dashboard') return false;
  return pathname.startsWith(`${path}/`);
}

export function UpgradeCard() {
  return (
    <div className="gradient-brand rounded-2xl p-4 text-white shadow-lift">
      <div className="mb-2 flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
          <Crown size={16} />
        </span>
        <p className="text-sm font-bold">Upgrade to Pro</p>
      </div>
      <p className="mb-3 text-[11px] leading-relaxed text-white/80">
        Unlock advanced AI insights, competitor tracking and more.
      </p>
      <Link
        to="/settings"
        className="block w-full rounded-lg bg-white py-2 text-center text-xs font-semibold text-violet-700 transition hover:bg-violet-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
      >
        Upgrade Now
      </Link>
    </div>
  );
}

export default function Sidebar({ open, onClose }) {
  const location = useLocation();

  useEffect(() => {
    onClose?.();
  }, [location.pathname, onClose]);

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-[2px] lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[264px] shrink-0 flex-col border-r border-app-border bg-white transition-transform duration-300 lg:static lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-app-border px-5">
          <Link
            to="/dashboard"
            className="min-w-0 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
          >
            <Logo size={32} />
          </Link>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 lg:hidden"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-5">
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Menu
          </p>
          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const active = isItemActive(location.pathname, item.path);
              const Icon = item.icon;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  aria-current={active ? 'page' : undefined}
                  className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                    active
                      ? 'bg-violet-50 text-violet-700'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon
                    size={18}
                    className={`shrink-0 transition-colors ${
                      active ? 'text-violet-600' : 'text-slate-400 group-hover:text-slate-600'
                    }`}
                  />
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="shrink-0 border-t border-app-border p-3">
          <UpgradeCard />
        </div>
      </aside>
    </>
  );
}
