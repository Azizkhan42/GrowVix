import { Bell, User, LogOut } from 'lucide-react';
import { useAuth } from '../context/useAuth';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-16 px-6 flex items-center justify-between border-b border-dark-border z-10 glass-card rounded-none">
      <div className="flex items-center">
        <h2 className="text-xl font-semibold text-gray-100 hidden md:block">
          Welcome, <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">{user?.name || 'User'}</span>
        </h2>
      </div>
      
      <div className="flex items-center gap-4">
        <button className="relative p-2 rounded-full hover:bg-white/10 transition-colors text-gray-400 hover:text-white">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-purple-500 rounded-full"></span>
        </button>
        
        <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-purple-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm cursor-pointer hover:shadow-[0_0_15px_rgba(170,59,255,0.5)] transition-shadow uppercase">
          {user?.name?.charAt(0) || 'U'}
        </div>
        
        <button
          onClick={handleLogout}
          className="hidden md:flex p-2 items-center gap-2 text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
}
