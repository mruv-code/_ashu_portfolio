import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Video, 
  Tags, 
  FileText, 
  MessageSquare, 
  LogOut, 
  Film,
  User,
  ChevronRight,
  Quote,
  Briefcase,
  Phone,
  Settings
} from 'lucide-react';
import { useApp } from '../AppContext';
import { cn } from '../lib/utils';

const AdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useApp();

  const menuItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Manage Work', path: '/admin/videos', icon: Video },
    { name: 'Categories', path: '/admin/categories', icon: Tags },
    { name: 'Services', path: '/admin/services', icon: Briefcase },
    { name: 'Testimonials', path: '/admin/testimonials', icon: Quote },
    { name: 'Blogs', path: '/admin/blogs', icon: FileText },
    { name: 'Contact Info', path: '/admin/contact-info', icon: Phone },
    { name: 'Page Content', path: '/admin/content', icon: FileText },
    { name: 'Site Settings', path: '/admin/site-settings', icon: Settings },
    { name: 'Account Settings', path: '/admin/account-settings', icon: User },
    { name: 'Inquiries', path: '/admin/inquiries', icon: MessageSquare },
  ];

  const handleLogout = () => {
    logout();
    navigate('/admin');
  };

  return (
    <aside className="w-64 bg-zinc-950 border-r border-white/10 h-full flex flex-col">
      <div className="p-6 border-b border-white/10 hidden lg:block">
        <Link to="/" className="flex items-center gap-2">
          <Film className="text-gold" size={24} />
          <span className="font-serif font-bold text-lg gold-text-gradient">ADMIN PANEL</span>
        </Link>
      </div>

      <div className="p-6 border-b border-white/10 lg:hidden">
        <div className="flex items-center gap-2">
          <Film className="text-gold" size={20} />
          <span className="font-serif font-bold text-sm gold-text-gradient">MENU</span>
        </div>
      </div>

      <nav className="flex-1 p-4 flex flex-col gap-2">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex items-center justify-between p-3 rounded-lg transition-all group",
              location.pathname === item.path 
                ? "bg-gold text-black font-bold" 
                : "text-white/60 hover:bg-white/5 hover:text-white"
            )}
          >
            <div className="flex items-center gap-3">
              <item.icon size={20} />
              <span className="text-sm">{item.name}</span>
            </div>
            {location.pathname === item.path && <ChevronRight size={16} />}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-white/10 mt-auto">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 p-3 w-full rounded-lg text-red-400 hover:bg-red-500/10 transition-all group"
        >
          <LogOut size={20} className="group-hover:scale-110 transition-transform" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
