import React, { useState } from 'react';
import { Plus, Trash2, Edit2, X, Check, Quote, MessageSquare, Star, Save } from 'lucide-react';
import { useApp } from '../../AppContext';
import { toMediaUrl } from '../../lib/utils';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import FileUpload from '../../components/admin/FileUpload';

const ManageTestimonials = () => {
  const { pageContent, updatePageContent } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isSavingHeader, setIsSavingHeader] = useState(false);
  
  const [headerData, setHeaderData] = useState({
    testimonialTag: pageContent.home.testimonialTag || 'TESTIMONIALS',
    testimonialTitle: pageContent.home.testimonialTitle || 'What Our Clients Say'
  });

  const [formData, setFormData] = useState({ 
    name: '', 
    text: '',
    role: '',
    rating: 5,
    image: '' as string | File
  });

  const testimonials = pageContent.home.testimonials || [];

  const handleSaveHeader = () => {
    setIsSavingHeader(true);
    updatePageContent({
      ...pageContent,
      home: {
        ...pageContent.home,
        ...headerData
      }
    });
    setTimeout(() => setIsSavingHeader(false), 1000);
  };

  const handleOpenModal = (index: number | null = null) => {
    if (index !== null) {
      setEditingIndex(index);
      setFormData({
        name: testimonials[index].name,
        text: testimonials[index].text,
        role: testimonials[index].role || '',
        rating: testimonials[index].rating || 5,
        image: testimonials[index].image || ''
      });
    } else {
      setEditingIndex(null);
      setFormData({ 
        name: '', 
        text: '',
        role: '',
        rating: 5,
        image: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTestimonials = [...testimonials];
    
    if (editingIndex !== null) {
      newTestimonials[editingIndex] = formData;
    } else {
      newTestimonials.push(formData);
    }

    updatePageContent({
      ...pageContent,
      home: {
        ...pageContent.home,
        testimonials: newTestimonials
      }
    });
    
    setIsModalOpen(false);
  };

  const deleteTestimonial = () => {
    if (confirmDelete !== null) {
      const newTestimonials = testimonials.filter((_, i) => i !== confirmDelete);
      updatePageContent({
        ...pageContent,
        home: {
          ...pageContent.home,
          testimonials: newTestimonials
        }
      });
      setConfirmDelete(null);
    }
  };

  return (
    <div className="space-y-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold">Manage Testimonials</h1>
          <p className="text-white/40 text-sm">Add or edit reviews from your clients.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gold text-black font-bold uppercase tracking-widest hover:bg-gold-light transition-all rounded-lg"
        >
          <Plus size={20} /> Add Testimonial
        </button>
      </div>

      {/* Header Section Management */}
      <div className="bg-zinc-900/50 border border-white/10 p-6 sm:p-8 rounded-2xl space-y-6">
        <h2 className="text-lg font-serif font-bold flex items-center gap-2">
          <Quote size={20} className="text-gold" />
          Section Header Content
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-white/40">Section Tag</label>
            <input 
              type="text"
              value={headerData.testimonialTag}
              onChange={(e) => setHeaderData({ ...headerData, testimonialTag: e.target.value })}
              className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-lg outline-none focus:border-gold transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-white/40">Section Title</label>
            <input 
              type="text"
              value={headerData.testimonialTitle}
              onChange={(e) => setHeaderData({ ...headerData, testimonialTitle: e.target.value })}
              className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-lg outline-none focus:border-gold transition-all"
            />
          </div>
        </div>
        <div className="flex justify-end">
          <button 
            onClick={handleSaveHeader}
            disabled={isSavingHeader}
            className="flex items-center gap-2 px-6 py-3 bg-white/10 text-white font-bold uppercase tracking-widest hover:bg-white/20 transition-all rounded-lg text-xs"
          >
            {isSavingHeader ? <Check size={16} /> : <Save size={16} />}
            {isSavingHeader ? 'Saved' : 'Save Header'}
          </button>
        </div>
      </div>

      {/* Testimonials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {testimonials.map((t, idx) => (
          <div 
            key={idx} 
            className="bg-zinc-900/50 border border-white/10 p-6 rounded-xl relative group hover:border-gold/30 transition-all"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-zinc-800 border border-white/10">
                  {t.image ? (
                    <img 
                      src={toMediaUrl(t.image) || ''} 
                      alt="" 
                      className="w-full h-full object-cover"
                      onError={(e) => e.currentTarget.style.display = 'none'}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/20">
                      <MessageSquare size={20} />
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="font-serif font-bold text-gold">{t.name}</h4>
                  <p className="text-[10px] uppercase tracking-widest text-white/40">{t.role}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    size={12} 
                    className={i < (t.rating || 0) ? "text-gold fill-current" : "text-white/10"} 
                  />
                ))}
              </div>
            </div>

            <p className="text-white/80 italic leading-relaxed mb-6">"{t.text}"</p>

            <div className="flex justify-end gap-2">
              <button 
                onClick={() => handleOpenModal(idx)}
                className="p-2 text-white/40 hover:text-gold transition-colors"
              >
                <Edit2 size={18} />
              </button>
              <button 
                onClick={() => setConfirmDelete(idx)}
                className="p-2 text-white/40 hover:text-red-400 transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}

        {testimonials.length === 0 && (
          <div className="col-span-full text-center py-20 bg-zinc-900/20 rounded-2xl border border-dashed border-white/10">
            <MessageSquare size={48} className="mx-auto text-white/10 mb-4" />
            <p className="text-white/20 italic">No testimonials added yet.</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-6 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-950 border border-white/10 w-full h-full sm:h-auto sm:max-w-xl sm:rounded-2xl overflow-hidden shadow-2xl flex flex-col">
            <div className="p-6 border-b border-white/10 flex justify-between items-center shrink-0">
              <h2 className="text-xl font-serif font-bold">
                {editingIndex !== null ? 'Edit Testimonial' : 'Add Testimonial'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-white/40 hover:text-white p-2">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6 overflow-y-auto no-scrollbar flex-1">
              <div className="space-y-6">
                <FileUpload 
                  label="Client Avatar"
                  value={formData.image}
                  onChange={(file) => setFormData({ ...formData, image: file })}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-white/40">Client Name</label>
                    <input 
                      required
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Rahul & Priya"
                      className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-lg outline-none focus:border-gold transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-white/40">Role / Company</label>
                    <input 
                      required
                      type="text"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      placeholder="e.g. Wedding Couple"
                      className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-lg outline-none focus:border-gold transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-white/40">Rating (1-5)</label>
                  <div className="flex gap-4">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setFormData({ ...formData, rating: num })}
                        className={`w-10 h-10 rounded-lg border flex items-center justify-center transition-all ${
                          formData.rating >= num ? 'bg-gold/10 border-gold text-gold' : 'border-white/10 text-white/20'
                        }`}
                      >
                        <Star size={18} fill={formData.rating >= num ? "currentColor" : "none"} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-white/40">Review Text</label>
                  <textarea 
                    required
                    rows={4}
                    value={formData.text}
                    onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                    placeholder="Enter the client's review..."
                    className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-lg outline-none focus:border-gold transition-all resize-none"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 border border-white/10 text-white font-bold uppercase tracking-widest hover:bg-white/5 transition-all rounded-lg"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-4 bg-gold text-black font-bold uppercase tracking-widest hover:bg-gold-light transition-all rounded-lg"
                >
                  {editingIndex !== null ? 'Update' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog 
        isOpen={confirmDelete !== null}
        title="Delete Testimonial"
        message="Are you sure you want to delete this testimonial? This action cannot be undone."
        confirmText="Delete Testimonial"
        onConfirm={deleteTestimonial}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
};

export default ManageTestimonials;
