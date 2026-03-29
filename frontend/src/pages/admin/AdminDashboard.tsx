import React from 'react';
import { 
  Video, 
  MessageSquare, 
  Tags, 
  TrendingUp,
  ArrowUpRight,
  Clock,
  FileText
} from 'lucide-react';
import { useApp } from '../../AppContext';

const AdminDashboard = () => {
  const { videos, inquiries, categories } = useApp();

  const stats = [
    { label: 'Total Videos', value: videos.length, icon: Video, color: 'text-blue-400' },
    { label: 'Total Inquiries', value: inquiries.length, icon: MessageSquare, color: 'text-green-400' },
    { label: 'Categories', value: categories.length, icon: Tags, color: 'text-purple-400' },
    { label: 'Featured Work', value: videos.filter(v => v.isFeatured).length, icon: TrendingUp, color: 'text-gold' },
  ];

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-serif font-bold mb-2">Dashboard Overview</h1>
        <p className="text-white/40 text-sm">Welcome back, Admin. Here's what's happening with Bandhan Films.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-zinc-900/50 border border-white/10 p-6 rounded-xl hover:border-gold/30 transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-lg bg-black/50 ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <ArrowUpRight size={16} className="text-white/20 group-hover:text-gold transition-colors" />
            </div>
            <h3 className="text-white/40 text-xs uppercase tracking-widest mb-1">{stat.label}</h3>
            <p className="text-3xl font-serif font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Inquiries */}
        <div className="bg-zinc-900/50 border border-white/10 rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-serif font-bold">Recent Inquiries</h2>
            <button className="text-gold text-xs uppercase tracking-widest hover:underline">View All</button>
          </div>
          <div className="space-y-4">
            {inquiries.slice(0, 5).map((inquiry) => (
              <div key={inquiry.id} className="flex items-center justify-between p-4 bg-black/30 rounded-lg border border-white/5">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gold/10 text-gold flex items-center justify-center font-bold">
                    {inquiry.name[0]}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">{inquiry.name}</h4>
                    <p className="text-xs text-white/40">{inquiry.eventType}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-white/40 flex items-center gap-1 justify-end">
                    <Clock size={10} /> {new Date(inquiry.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-xs font-bold text-gold">{inquiry.budget}</p>
                </div>
              </div>
            ))}
            {inquiries.length === 0 && (
              <div className="text-center py-10 text-white/20 italic text-sm">
                No inquiries yet.
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-zinc-900/50 border border-white/10 rounded-xl p-6">
          <h2 className="text-xl font-serif font-bold mb-6">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <button className="p-6 bg-gold/10 border border-gold/20 rounded-xl hover:bg-gold/20 transition-all text-left group">
              <Video className="text-gold mb-3" size={24} />
              <h4 className="font-bold text-sm mb-1 group-hover:text-gold transition-colors">Add New Video</h4>
              <p className="text-[10px] text-white/40 uppercase tracking-widest">Update Portfolio</p>
            </button>
            <button className="p-6 bg-purple-500/10 border border-purple-500/20 rounded-xl hover:bg-purple-500/20 transition-all text-left group">
              <Tags className="text-purple-400 mb-3" size={24} />
              <h4 className="font-bold text-sm mb-1 group-hover:text-purple-400 transition-colors">Manage Categories</h4>
              <p className="text-[10px] text-white/40 uppercase tracking-widest">Organize Work</p>
            </button>
            <button className="p-6 bg-blue-500/10 border border-blue-500/20 rounded-xl hover:bg-blue-500/20 transition-all text-left group">
              <FileText className="text-blue-400 mb-3" size={24} />
              <h4 className="font-bold text-sm mb-1 group-hover:text-blue-400 transition-colors">Edit Content</h4>
              <p className="text-[10px] text-white/40 uppercase tracking-widest">Update Pages</p>
            </button>
            <button className="p-6 bg-green-500/10 border border-green-500/20 rounded-xl hover:bg-green-500/20 transition-all text-left group">
              <MessageSquare className="text-green-400 mb-3" size={24} />
              <h4 className="font-bold text-sm mb-1 group-hover:text-green-400 transition-colors">Check Inquiries</h4>
              <p className="text-[10px] text-white/40 uppercase tracking-widest">New Leads</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
