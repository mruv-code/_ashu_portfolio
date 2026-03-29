import React, { useState } from 'react';
import { Plus, Trash2, Edit2, X, Briefcase, Image as ImageIcon } from 'lucide-react';
import { useApp } from '../../AppContext';
import { cn, toMediaUrl } from '../../lib/utils';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import FileUpload from '../../components/admin/FileUpload';

const ManageServices = () => {
  const { pageContent, updatePageContent } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: '' as string | File
  });

  const handleOpenModal = (index?: number) => {
    if (index !== undefined) {
      setEditingIndex(index);
      setFormData({
        title: pageContent.home.services[index].title,
        description: pageContent.home.services[index].description,
        image: pageContent.home.services[index].image || ''
      });
    } else {
      setEditingIndex(null);
      setFormData({ title: '', description: '', image: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Convert File objects to data URLs
      let finalData = { ...formData };
      
      if (formData.image instanceof File) {
        console.log('Converting service image File to data URL...');
        const reader = new FileReader();
        const imageUrl = await new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(formData.image as File);
        });
        finalData = { ...finalData, image: imageUrl };
      }

      const newServices = [...pageContent.home.services];
      if (editingIndex !== null) {
        newServices[editingIndex] = finalData;
      } else {
        newServices.push(finalData);
      }
      updatePageContent({
        ...pageContent,
        home: { ...pageContent.home, services: newServices }
      });
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error processing image:', error);
      alert('Error processing image. Please try again.');
    }
  };

  const handleDelete = () => {
    if (confirmDelete !== null) {
      const newServices = pageContent.home.services.filter((_, i) => i !== confirmDelete);
      updatePageContent({
        ...pageContent,
        home: { ...pageContent.home, services: newServices }
      });
      setConfirmDelete(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold">Manage Services</h1>
          <p className="text-white/40 text-sm">Add, edit, or remove services offered by Bandhan Films.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gold text-black font-bold uppercase tracking-widest hover:bg-gold-light transition-all rounded-lg"
        >
          <Plus size={20} /> Add Service
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pageContent.home.services.map((service, idx) => (
          <div key={idx} className="bg-zinc-900/50 border border-white/10 rounded-2xl group hover:border-gold/50 transition-all overflow-hidden">
            {service.image && (
              <div className="w-full aspect-video relative overflow-hidden">
                <img 
                  src={toMediaUrl(service.image) || ''} 
                  alt={service.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                  onError={(e) => e.currentTarget.style.display = 'none'}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              </div>
            )}
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center text-gold">
                  {service.image ? <ImageIcon size={24} /> : <Briefcase size={24} />}
                </div>
                <div className="flex items-center gap-2">
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
            <h3 className="text-xl font-serif font-bold mb-2">{service.title}</h3>
            <p className="text-white/60 text-sm leading-relaxed">{service.description}</p>
          </div>
        </div>
      ))}
    </div>

      {pageContent.home.services.length === 0 && (
        <div className="text-center py-20 text-white/20 italic">
          No services found. Start by adding one.
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-950 border border-white/10 w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <h2 className="text-xl font-serif font-bold">
                {editingIndex !== null ? 'Edit Service' : 'Add New Service'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-white/40 hover:text-white">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-white/40">Service Title</label>
                <input 
                  required
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-lg outline-none focus:border-gold transition-all"
                  placeholder="e.g. Wedding Films"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-white/40">Description</label>
                <textarea 
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-lg outline-none focus:border-gold transition-all resize-none"
                  placeholder="Describe the service..."
                />
              </div>
              <div className="space-y-2">
                <FileUpload 
                  label="Service Image (Optional)"
                  value={formData.image}
                  onChange={(file) => setFormData({ ...formData, image: file })}
                  accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml,.jpg,.jpeg,.png,.gif,.webp,.svg"
                  type="image"
                />
              </div>
              <div className="pt-4 flex gap-4">
                <button 
                  type="submit"
                  className="flex-1 py-4 bg-gold text-black font-bold uppercase tracking-widest hover:bg-gold-light transition-all rounded-lg"
                >
                  {editingIndex !== null ? 'Save Changes' : 'Add Service'}
                </button>
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-8 py-4 bg-white/5 text-white font-bold uppercase tracking-widest hover:bg-white/10 transition-all rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog 
        isOpen={confirmDelete !== null}
        title="Delete Service"
        message="Are you sure you want to delete this service? This action cannot be undone."
        confirmText="Delete Service"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
};

export default ManageServices;
