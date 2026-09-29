import { useEffect, useRef, useState } from 'react';
import { Bell, LogOut, Menu, Search, Settings as SettingsIcon, ChevronDown, User } from 'lucide-react';
import { useAuth } from '../context/useAuth';
import { useNavigate, Link } from 'react-router-dom';

function planLabel(plan) {
  if (!plan) return 'Free Plan';
  return `${plan.charAt(0).toUpperCase()}${plan.slice(1)} Plan`;
}

export default function Navbar({ onOpenSidebar }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return undefined;

    const onKeyDown = (e) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    const onPointerDown = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('mousedown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('mousedown', onPointerDown);
    };
  }, [menuOpen]);

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
    navigate('/login');
  };

  const initials = (user?.name || 'U')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  return (
    <header className="z-30 flex h-16 shrink-0 items-center justify-between gap-3 border-b border-app-border bg-white px-4 sm:px-6">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 lg:hidden"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>

        <div className="relative hidden w-full max-w-md md:block">
          <Search
            size={16}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="search"
            aria-label="Search"
            placeholder="Search competitors, posts, or insights..."
            className="h-10 w-full rounded-xl border border-app-border bg-slate-50/70 pl-10 pr-4 text-sm text-slate-700 placeholder:text-slate-400 transition-colors focus:border-violet-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-100"
          />
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
        <button
          className="relative rounded-xl p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
          aria-label="Notifications"
        >
          <Bell size={20} />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-violet-500 ring-2 ring-white" />
        </button>

        <Link
          to="/settings"
          className="hidden rounded-xl p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 sm:block"
          aria-label="Settings"
        >
          <SettingsIcon size={20} />
        </Link>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            className="flex items-center gap-2.5 rounded-xl py-1.5 pl-1.5 pr-2 transition-colors hover:bg-slate-50"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full gradient-brand text-sm font-bold text-white">
              {initials || 'U'}
            </span>
            <span className="hidden min-w-0 text-left sm:block">
              <span className="block max-w-[160px] truncate text-sm font-semibold text-slate-900">
                {user?.name || 'User'}
              </span>
              <span className="block text-xs text-slate-500">{planLabel(user?.plan)}</span>
            </span>
            <ChevronDown
              size={16}
              className={`hidden shrink-0 text-slate-400 transition-transform sm:block ${
                menuOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {menuOpen && (
            <div
              role="menu"
              className="animate-rise absolute right-0 top-full z-40 mt-2 w-60 overflow-hidden rounded-2xl border border-app-border bg-white p-1.5 shadow-lift"
            >
              <div className="flex items-center gap-3 rounded-xl px-3 py-2.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full gradient-brand text-sm font-bold text-white">
                  {initials || 'U'}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {user?.name || 'User'}
                  </p>
                  <p className="truncate text-xs text-slate-500">{user?.email || ''}</p>
                </div>
              </div>

              <div className="my-1 h-px bg-app-border" />

              <Link
                to="/settings"
                onClick={() => setMenuOpen(false)}
                role="menuitem"
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
              >
                <User size={16} /> Profile
              </Link>
              <Link
                to="/settings"
                onClick={() => setMenuOpen(false)}
                role="menuitem"
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
              >
                <SettingsIcon size={16} /> Settings
              </Link>

              <div className="my-1 h-px bg-app-border" />

              <button
                onClick={handleLogout}
                role="menuitem"
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50"
              >
                <LogOut size={16} /> Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
