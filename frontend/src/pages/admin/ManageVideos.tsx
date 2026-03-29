import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Star, ExternalLink, X, Check } from 'lucide-react';
import { useApp } from '../../AppContext';
import { Video } from '../../types';
import { cn, toMediaUrl } from '../../lib/utils';
import FileUpload from '../../components/admin/FileUpload';
import ConfirmDialog from '../../components/admin/ConfirmDialog';

const MediaPreview = ({ src, className }: { src: string | File, className?: string }) => {
  const url = toMediaUrl(src);
  if (!url) return <div className={cn("bg-zinc-800", className)} />;
  return <img src={url} alt="" className={className} referrerPolicy="no-referrer" onError={(e) => e.currentTarget.style.display = 'none'} />;
};

const ManageVideos = () => {
  const { videos, categories, addVideo, updateVideo, deleteVideo } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [formData, setFormData] = useState<{
    title: string;
    category: string;
    url: string | File;
    thumbnail: string | File;
    isFeatured: boolean;
  }>({
    title: '',
    category: 'Wedding',
    url: '',
    thumbnail: '',
    isFeatured: false
  });

  const handleOpenModal = (video?: Video) => {
    if (video) {
      setEditingVideo(video);
      setFormData({
        title: video.title,
        category: video.category,
        url: video.url,
        thumbnail: video.thumbnail,
        isFeatured: video.isFeatured
      });
    } else {
      setEditingVideo(null);
      setFormData({
        title: '',
        category: categories[0]?.name || 'Wedding',
        url: '',
        thumbnail: '',
        isFeatured: false
      });
    }
    setIsModalOpen(true);
  };

  const handleDelete = () => {
    if (confirmDelete) {
      deleteVideo(confirmDelete);
      setConfirmDelete(null);
    }
  };

  // Convert File to data URL
  const fileToDataUrl = (file: File | string): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (typeof file === 'string') {
        resolve(file);
        return;
      }
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Convert all File objects to data URLs before saving
      const finalData = { ...formData };
      
      if (formData.url instanceof File) {
        console.log('Converting video URL File to data URL...');
        finalData.url = await fileToDataUrl(formData.url);
      }
      
      if (formData.thumbnail instanceof File) {
        console.log('Converting thumbnail File to data URL...');
        finalData.thumbnail = await fileToDataUrl(formData.thumbnail);
      }
      
      if (editingVideo) {
        updateVideo(editingVideo.id, finalData);
      } else {
        addVideo(finalData);
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error processing files:', error);
      alert('Error processing files. Please try again.');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold">Manage Work</h1>
          <p className="text-white/40 text-sm">Add, edit, or remove videos from your cinematic portfolio.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gold text-black font-bold uppercase tracking-widest hover:bg-gold-light transition-all rounded-lg"
        >
          <Plus size={20} /> Add Video
        </button>
      </div>

      {/* Videos Table */}
      <div className="bg-zinc-900/50 border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[600px] lg:min-w-full">
            <thead>
              <tr className="bg-black/50 border-b border-white/10">
                <th className="p-4 text-xs uppercase tracking-widest text-white/40">Preview</th>
                <th className="p-4 text-xs uppercase tracking-widest text-white/40">Title</th>
                <th className="p-4 text-xs uppercase tracking-widest text-white/40 hidden md:table-cell">Category</th>
                <th className="p-4 text-xs uppercase tracking-widest text-white/40 hidden sm:table-cell">Featured</th>
                <th className="p-4 text-xs uppercase tracking-widest text-white/40">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {videos.map((video) => (
                <tr key={video.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4">
                    <div className="w-20 sm:w-24 aspect-video rounded overflow-hidden bg-zinc-800">
                      <MediaPreview src={video.thumbnail} className="w-full h-full object-cover" />
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="font-medium">{video.title}</div>
                    <div className="md:hidden text-[10px] uppercase tracking-widest text-gold mt-1">
                      {video.category}
                    </div>
                  </td>
                  <td className="p-4 hidden md:table-cell">
                    <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] uppercase tracking-widest">
                      {video.category}
                    </span>
                  </td>
                  <td className="p-4 hidden sm:table-cell">
                    {video.isFeatured ? (
                      <Star size={18} className="text-gold fill-current" />
                    ) : (
                      <Star size={18} className="text-white/10" />
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <button 
                        onClick={() => handleOpenModal(video)}
                        className="p-2 text-white/40 hover:text-gold transition-colors"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => setConfirmDelete(video.id)}
                        className="p-2 text-white/40 hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {videos.length === 0 && (
          <div className="text-center py-20 text-white/20 italic">
            No videos found. Start by adding one.
          </div>
        )}
      </div>

      <ConfirmDialog 
        isOpen={confirmDelete !== null}
        title="Delete Video"
        message="Are you sure you want to delete this video? This action cannot be undone."
        confirmText="Delete Video"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
      />

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-6 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-950 border border-white/10 w-full h-full sm:h-auto sm:max-w-2xl sm:rounded-2xl overflow-hidden shadow-2xl flex flex-col">
            <div className="p-6 border-b border-white/10 flex justify-between items-center shrink-0">
              <h2 className="text-xl font-serif font-bold">
                {editingVideo ? 'Edit Video' : 'Add New Video'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-white/40 hover:text-white p-2">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6 overflow-y-auto no-scrollbar flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-white/40">Video Title</label>
                  <input 
                    required
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-lg outline-none focus:border-gold transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-white/40">Category</label>
                  <select 
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-zinc-900 border border-white/10 px-4 py-3 rounded-lg outline-none focus:border-gold transition-all appearance-none"
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <FileUpload 
                label="Video File"
                value={formData.url}
                onChange={(file) => setFormData({ ...formData, url: file })}
                accept="video/*"
                type="video"
              />

              <FileUpload 
                label="Thumbnail Image"
                value={formData.thumbnail}
                onChange={(file) => setFormData({ ...formData, thumbnail: file })}
                accept="image/*"
                type="image"
              />

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, isFeatured: !formData.isFeatured })}
                  className={cn(
                    "w-6 h-6 rounded border flex items-center justify-center transition-all",
                    formData.isFeatured ? "bg-gold border-gold text-black" : "border-white/20"
                  )}
                >
                  {formData.isFeatured && <Check size={14} strokeWidth={4} />}
                </button>
                <span className="text-sm text-white/60">Mark as Featured (Show on Homepage)</span>
              </div>

              <div className="pt-6 flex gap-4">
                <button 
                  type="submit"
                  className="flex-1 py-4 bg-gold text-black font-bold uppercase tracking-widest hover:bg-gold-light transition-all rounded-lg"
                >
                  {editingVideo ? 'Save Changes' : 'Add Video'}
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
    </div>
  );
};

export default ManageVideos;
