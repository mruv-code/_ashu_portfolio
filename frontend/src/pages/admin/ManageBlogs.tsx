import React, { useState } from 'react';
import { Plus, Trash2, Edit2, X, Check } from 'lucide-react';
import { useApp } from '../../AppContext';
import { Blog } from '../../types';
import { toMediaUrl } from '../../lib/utils';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import FileUpload from '../../components/admin/FileUpload';

const ManageBlogs = () => {
  const { blogs, addBlog, updateBlog, deleteBlog } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: '' as string | File
  });

  const handleOpenModal = (blog?: Blog) => {
    if (blog) {
      setEditingBlog(blog);
      setFormData({
        title: blog.title,
        description: blog.description,
        image: blog.image
      });
    } else {
      setEditingBlog(null);
      setFormData({ title: '', description: '', image: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      alert('Title and description are required.');
      return;
    }

    if (editingBlog) {
      updateBlog(editingBlog.id, {
        title: formData.title,
        description: formData.description,
        image: formData.image
      });
    } else {
      addBlog({
        title: formData.title,
        description: formData.description,
        image: formData.image,
      });
    }

    setIsModalOpen(false);
  };

  const handleDelete = () => {
    if (confirmDelete) {
      deleteBlog(confirmDelete);
      setConfirmDelete(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold">Manage Blogs</h1>
          <p className="text-white/40 text-sm">Create, update, and remove blog posts.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gold text-black font-bold uppercase tracking-widest hover:bg-gold-light transition-all rounded-lg"
        >
          <Plus size={20} /> Add Blog
        </button>
      </div>

      <div className="bg-zinc-900/50 border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[640px] lg:min-w-full">
            <thead>
              <tr className="bg-black/50 border-b border-white/10">
                <th className="p-4 text-xs uppercase tracking-widest text-white/40">Image</th>
                <th className="p-4 text-xs uppercase tracking-widest text-white/40">Title</th>
                <th className="p-4 text-xs uppercase tracking-widest text-white/40">Description</th>
                <th className="p-4 text-xs uppercase tracking-widest text-white/40">Created At</th>
                <th className="p-4 text-xs uppercase tracking-widest text-white/40">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {blogs.map((blog) => (
                <tr key={blog.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4">
                    <div className="w-20 h-14 rounded overflow-hidden bg-zinc-800">
                      {blog.image ? (
                        <img
                          src={toMediaUrl(blog.image) || ''}
                          alt={blog.title}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      ) : (
                        <div className="w-full h-full bg-white/5" />
                      )}
                    </div>
                  </td>
                  <td className="p-4 font-medium">{blog.title}</td>
                  <td className="p-4 text-white/60 hidden md:table-cell">{blog.description.length > 80 ? `${blog.description.slice(0, 80)}...` : blog.description}</td>
                  <td className="p-4 text-white/60">{new Date(blog.createdAt).toLocaleDateString()}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <button
                        onClick={() => handleOpenModal(blog)}
                        className="p-2 text-white/40 hover:text-gold transition-colors"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => setConfirmDelete(blog.id)}
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
        {blogs.length === 0 && (
          <div className="text-center py-20 text-white/20 italic">
            No blogs found. Add one to get started.
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-6 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-950 border border-white/10 w-full h-full sm:h-auto sm:max-w-2xl sm:rounded-2xl overflow-hidden shadow-2xl flex flex-col">
            <div className="p-6 border-b border-white/10 flex justify-between items-center shrink-0">
              <h2 className="text-xl font-serif font-bold">
                {editingBlog ? 'Edit Blog' : 'Add Blog'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-white/40 hover:text-white p-2">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6 overflow-y-auto no-scrollbar flex-1">
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-white/40">Title</label>
                  <input
                    required
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-lg outline-none focus:border-gold transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-white/40">Description</label>
                  <textarea
                    required
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-lg outline-none focus:border-gold transition-all resize-none"
                  />
                </div>

                <FileUpload
                  label="Featured Image"
                  value={formData.image}
                  onChange={(value) => setFormData({ ...formData, image: value })}
                  accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml,.jpg,.jpeg,.png,.gif,.webp,.svg"
                  type="image"
                  onUploadStart={() => setIsUploading(true)}
                  onUploadEnd={() => setIsUploading(false)}
                />
              </div>

              <div className="pt-6 flex gap-4">
                <button
                  type="submit"
                  className="flex-1 py-4 bg-gold text-black font-bold uppercase tracking-widest hover:bg-gold-light transition-all rounded-lg"
                >
                  {editingBlog ? 'Update Blog' : 'Add Blog'}
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
        title="Delete Blog"
        message="Are you sure you want to delete this blog post? This action cannot be undone."
        confirmText="Delete Blog"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
};

export default ManageBlogs;
