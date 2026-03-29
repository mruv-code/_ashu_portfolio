import React, { useState } from 'react';
import { Plus, Trash2, Tags, X } from 'lucide-react';
import { useApp } from '../../AppContext';
import ConfirmDialog from '../../components/admin/ConfirmDialog';

const ManageCategories = () => {
  const { categories, addCategory, deleteCategory } = useApp();
  const [newCategory, setNewCategory] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const handleDelete = () => {
    if (confirmDelete) {
      deleteCategory(confirmDelete);
      setConfirmDelete(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCategory.trim()) {
      addCategory(newCategory.trim());
      setNewCategory('');
    }
  };

  return (
    <div className="space-y-10 max-w-4xl">
      <div>
        <h1 className="text-3xl font-serif font-bold mb-2">Manage Categories</h1>
        <p className="text-white/40 text-sm">Organize your work by adding or removing categories.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Add Category */}
        <div className="bg-zinc-900/50 border border-white/10 p-6 sm:p-8 rounded-2xl h-fit">
          <h3 className="text-lg sm:text-xl font-serif font-bold mb-6 flex items-center gap-2">
            <Plus size={20} className="text-gold" /> Add New Category
          </h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-white/40">Category Name</label>
              <input 
                required
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="e.g. Music Videos"
                className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-lg outline-none focus:border-gold transition-all"
              />
            </div>
            <button 
              type="submit"
              className="w-full py-4 bg-gold text-black font-bold uppercase tracking-widest hover:bg-gold-light transition-all rounded-lg"
            >
              Create Category
            </button>
          </form>
        </div>

        {/* Categories List */}
        <div className="space-y-4">
          <h3 className="text-lg sm:text-xl font-serif font-bold mb-6 flex items-center gap-2">
            <Tags size={20} className="text-gold" /> Existing Categories
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
            {categories.map((cat) => (
              <div 
                key={cat.id} 
                className="flex items-center justify-between p-4 bg-zinc-900/30 border border-white/5 rounded-xl group hover:border-gold/30 transition-all"
              >
                <span className="font-medium text-white/80">{cat.name}</span>
                <button 
                  onClick={() => setConfirmDelete(cat.id)}
                  className="p-2 text-white/20 hover:text-red-400 transition-colors lg:opacity-0 lg:group-hover:opacity-100"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
          {categories.length === 0 && (
            <div className="text-center py-10 text-white/20 italic bg-zinc-900/20 rounded-xl border border-dashed border-white/10">
              No categories defined.
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog 
        isOpen={confirmDelete !== null}
        title="Delete Category"
        message="Are you sure you want to delete this category? This might affect videos assigned to it."
        confirmText="Delete Category"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
};

export default ManageCategories;
