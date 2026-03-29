import React, { useState } from 'react';
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import { useApp } from '../AppContext';
import { Menu, X, Film } from 'lucide-react';
import { cn } from '../lib/utils';

const AdminLayout = () => {
  const { isAdmin } = useApp();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  if (!isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  // Close sidebar on route change (mobile)
  React.useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen bg-black text-white relative">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-zinc-950 border-b border-white/10 flex items-center justify-between px-6 z-[60]">
        <Link to="/" className="flex items-center gap-2">
          <Film className="text-gold" size={20} />
          <span className="font-serif font-bold text-sm gold-text-gradient">ADMIN PANEL</span>
        </Link>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 text-white/60 hover:text-gold transition-colors"
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-[50]"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed lg:sticky top-0 left-0 h-screen z-[55] transition-transform duration-300 lg:translate-x-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <AdminSidebar />
      </div>

      <main className="flex-1 p-6 lg:p-10 pt-24 lg:pt-10 overflow-x-hidden">
        <div className="max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
