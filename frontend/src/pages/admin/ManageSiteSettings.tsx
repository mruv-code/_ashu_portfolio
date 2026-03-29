import React, { useState, useEffect } from 'react';
import { useApp } from '../../AppContext';
import { Save, Globe, Image as ImageIcon, User, Lock, Mail, Shield, Check, AlertCircle, RefreshCw, ArrowLeft, Key } from 'lucide-react';
import FileUpload from '../../components/admin/FileUpload';

const ManageSiteSettings = () => {
  const { siteSettings, updateSiteSettings } = useApp();
  const [settings, setSettings] = useState(siteSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      updateSiteSettings(settings);
      setMessage({ type: 'success', text: 'Settings updated successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update settings.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-serif font-bold text-white">Site Settings</h2>
          <p className="text-white/60">Manage your brand identity</p>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-xl flex items-center gap-3 animate-fade-in ${message.type === 'success' ? 'bg-green-500/10 border border-green-500/20 text-green-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}>
          {message.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
          <span className="text-sm font-medium">{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">
        {/* Branding Section */}
        <div className="bg-zinc-900/50 border border-white/10 p-8 rounded-2xl space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <Globe className="text-gold" size={20} />
            <h3 className="text-xl font-serif font-bold text-white">Branding</h3>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-white/60 uppercase tracking-widest">Brand Name</label>
            <input
              type="text"
              value={settings.brandName}
              onChange={(e) => setSettings({ ...settings, brandName: e.target.value })}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold transition-colors"
              placeholder="e.g. BANDHAN FILMS"
              required
            />
          </div>

          <div className="space-y-4">
            <FileUpload
              label="Site Logo"
              value={settings.logo as string}
              onChange={(file) => setSettings({ ...settings, logo: file })}
              accept="image/*"
              type="image"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="w-full bg-gold text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-yellow-500 transition-colors disabled:opacity-50"
        >
          {isSaving ? <RefreshCw className="animate-spin" size={20} /> : <Save size={20} />}
          {isSaving ? 'Processing...' : 'Save All Settings'}
        </button>
      </form>
    </div>
  );
};

export default ManageSiteSettings;
