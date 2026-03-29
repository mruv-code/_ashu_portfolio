import React, { useState } from 'react';
import { Trash2, Mail, Phone, Calendar, DollarSign, MessageSquare, X, Clock } from 'lucide-react';
import { useApp } from '../../AppContext';
import { Inquiry } from '../../types';
import ConfirmDialog from '../../components/admin/ConfirmDialog';

const Inquiries = () => {
  const { inquiries, deleteInquiry } = useApp();
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const handleDelete = () => {
    if (confirmDelete) {
      deleteInquiry(confirmDelete);
      setConfirmDelete(null);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif font-bold">Inquiries</h1>
        <p className="text-white/40 text-sm">Manage leads and messages from potential clients.</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {inquiries.map((inquiry) => (
          <div 
            key={inquiry.id}
            className="bg-zinc-900/50 border border-white/10 p-4 sm:p-6 rounded-xl hover:border-gold/30 transition-all group flex flex-col lg:flex-row justify-between gap-4 sm:gap-6"
          >
            <div className="flex gap-4 sm:gap-6">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gold/10 text-gold flex items-center justify-center font-serif text-xl sm:text-2xl font-bold shrink-0">
                {inquiry.name[0]}
              </div>
              <div className="space-y-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <h3 className="text-lg sm:text-xl font-serif font-bold truncate">{inquiry.name}</h3>
                  <span className="px-2 py-0.5 bg-gold/10 text-gold text-[9px] sm:text-[10px] uppercase tracking-widest rounded border border-gold/20 whitespace-nowrap">
                    {inquiry.eventType}
                  </span>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs sm:text-sm text-white/40">
                  <span className="flex items-center gap-1 truncate"><Mail size={12} className="shrink-0" /> {inquiry.email}</span>
                  <span className="flex items-center gap-1 whitespace-nowrap"><Phone size={12} className="shrink-0" /> {inquiry.phone}</span>
                  {inquiry.date && <span className="flex items-center gap-1 whitespace-nowrap text-gold/60"><Calendar size={12} className="shrink-0" /> {inquiry.date}</span>}
                  <span className="flex items-center gap-1 whitespace-nowrap"><Clock size={12} className="shrink-0" /> {new Date(inquiry.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between lg:justify-end gap-4 mt-2 lg:mt-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-white/5">
              <button 
                onClick={() => setSelectedInquiry(inquiry)}
                className="flex-1 lg:flex-none px-4 sm:px-6 py-2 bg-white/5 border border-white/10 rounded-lg text-[10px] sm:text-xs uppercase tracking-widest font-bold hover:bg-white/10 transition-all"
              >
                View Details
              </button>
              <button 
                onClick={() => setConfirmDelete(inquiry.id)}
                className="p-2 sm:p-3 text-white/20 hover:text-red-400 transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}

        {inquiries.length === 0 && (
          <div className="text-center py-20 sm:py-32 bg-zinc-900/20 rounded-2xl border border-dashed border-white/10">
            <MessageSquare size={40} sm:size={48} className="mx-auto text-white/10 mb-4" />
            <p className="text-white/20 italic text-sm">No inquiries received yet.</p>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-6 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-950 border border-white/10 w-full h-full sm:h-auto sm:max-w-2xl sm:rounded-2xl overflow-hidden shadow-2xl flex flex-col">
            <div className="p-6 border-b border-white/10 flex justify-between items-center shrink-0">
              <h2 className="text-xl font-serif font-bold">Inquiry Details</h2>
              <button onClick={() => setSelectedInquiry(null)} className="text-white/40 hover:text-white p-2">
                <X size={24} />
              </button>
            </div>
            <div className="p-6 sm:p-10 space-y-6 sm:space-y-8 overflow-y-auto no-scrollbar flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-widest text-white/40">Client Name</p>
                  <p className="text-base sm:text-lg font-serif">{selectedInquiry.name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-widest text-white/40">Event Type</p>
                  <p className="text-base sm:text-lg font-serif text-gold">{selectedInquiry.eventType}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-widest text-white/40">Event Date</p>
                  <p className="text-base sm:text-lg font-serif text-gold">{selectedInquiry.date || 'Not specified'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-widest text-white/40">Email</p>
                  <p className="text-base sm:text-lg break-all">{selectedInquiry.email}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-widest text-white/40">Phone</p>
                  <p className="text-base sm:text-lg">{selectedInquiry.phone}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-widest text-white/40">Estimated Budget</p>
                  <p className="text-base sm:text-lg font-bold text-green-400">{selectedInquiry.budget || 'Not specified'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-widest text-white/40">Received On</p>
                  <p className="text-base sm:text-lg">{new Date(selectedInquiry.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="space-y-2 pt-6 border-t border-white/10">
                <p className="text-[10px] uppercase tracking-widest text-white/40">Message</p>
                <p className="text-sm sm:text-base text-white/80 leading-relaxed bg-white/5 p-4 sm:p-6 rounded-xl italic">
                  "{selectedInquiry.message}"
                </p>
              </div>

              <div className="pt-6">
                <button 
                  onClick={() => setSelectedInquiry(null)}
                  className="w-full py-4 bg-white/5 text-white font-bold uppercase tracking-widest hover:bg-white/10 transition-all rounded-lg"
                >
                  Close Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog 
        isOpen={confirmDelete !== null}
        title="Delete Inquiry"
        message="Are you sure you want to delete this inquiry? This action cannot be undone."
        confirmText="Delete Inquiry"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
};

export default Inquiries;
