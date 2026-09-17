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
  Target,
  Calendar,
  ListChecks,
  X
} from 'lucide-react';

export default function Sidebar({ open, onClose }) {
  const location = useLocation();

  useEffect(() => {
    onClose?.();
  }, [location.pathname]);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Competitors', path: '/competitors', icon: Users },
    { name: 'AI Insights', path: '/insights', icon: Lightbulb },
    { name: 'Content Gen', path: '/content-generator', icon: PenTool },
    { name: 'Content Calendar', path: '/content-calendar', icon: Calendar },
    { name: 'Scheduler', path: '/scheduler', icon: CalendarDays },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Recommendations', path: '/recommendations', icon: ListChecks },
    { name: 'Settings', path: '/settings', icon: SettingsIcon },
  ];

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 glass-card border-l-0 border-t-0 border-b-0 rounded-none flex flex-col transition-transform duration-300 md:static md:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-16 flex items-center px-6 border-b border-dark-border">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-primary-500 to-blue-600 flex items-center justify-center font-bold text-white text-lg shrink-0">G</div>
            <span className="text-xl font-heading font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-100 to-gray-400 truncate">GrowVix</span>
          </div>
          <button onClick={onClose} className="md:hidden p-1.5 text-gray-400 hover:text-white rounded-lg transition-colors" aria-label="Close menu">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm ${
                    isActive
                      ? 'bg-primary-600/20 text-white font-medium border border-primary-500/30'
                      : 'text-gray-400 hover:text-gray-100 hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <Icon size={18} className={isActive ? 'text-primary-500' : ''} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}