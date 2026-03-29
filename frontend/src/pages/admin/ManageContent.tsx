import React, { useState } from 'react';
import { Save, Check, FileText, User, Home, Info } from 'lucide-react';
import { useApp } from '../../AppContext';
import FileUpload from '../../components/admin/FileUpload';

const ManageContent = () => {
  const { pageContent, updatePageContent } = useApp();
  const [content, setContent] = useState(pageContent);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    updatePageContent(content);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-8 sm:space-y-10 max-w-5xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold">Page Content</h1>
          <p className="text-white/40 text-sm">Update the text and stories across your website.</p>
        </div>
        <button 
          onClick={handleSave}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 sm:px-8 py-3 bg-gold text-black font-bold uppercase tracking-widest hover:bg-gold-light transition-all rounded-lg"
        >
          {saved ? <Check size={20} /> : <Save size={20} />}
          {saved ? 'Saved' : 'Save Changes'}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8 sm:gap-12">
        {/* Home Page Content */}
        <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-6 sm:p-8">
          <h3 className="text-lg sm:text-xl font-serif font-bold mb-6 sm:mb-8 flex items-center gap-3">
            <Home size={24} className="text-gold" /> Homepage Settings
          </h3>
          
          <div className="space-y-6 sm:space-y-8">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-white/40">Hero Tagline</label>
              <input 
                type="text"
                value={content.home.tagline}
                onChange={(e) => setContent({
                  ...content,
                  home: { ...content.home, tagline: e.target.value }
                })}
                className="w-full bg-white/5 border border-white/10 px-4 py-4 rounded-lg outline-none focus:border-gold transition-all text-lg sm:text-xl font-serif"
              />
            </div>

            <div className="space-y-2">
              <FileUpload 
                label="Hero Background Video"
                value={content.home.heroVideo}
                onChange={(file) => setContent({
                  ...content,
                  home: { ...content.home, heroVideo: file }
                })}
                accept="video/*"
                type="video"
              />
            </div>
          </div>
        </div>

        {/* Info Page Content */}
        <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-6 sm:p-8">
          <h3 className="text-lg sm:text-xl font-serif font-bold mb-6 sm:mb-8 flex items-center gap-3">
            <Info size={24} className="text-gold" /> Info Page Settings
          </h3>
          
          <div className="space-y-8 sm:space-y-10">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-white/40">About Company</label>
              <textarea 
                rows={4}
                value={content.info.about}
                onChange={(e) => setContent({
                  ...content,
                  info: { ...content.info, about: e.target.value }
                })}
                className="w-full bg-white/5 border border-white/10 px-4 py-4 rounded-lg outline-none focus:border-gold transition-all leading-relaxed text-sm sm:text-base"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
              <div className="space-y-6">
                <h4 className="text-xs sm:text-sm uppercase tracking-widest text-gold font-bold flex items-center gap-2">
                  <User size={16} /> Founder Details
                </h4>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-white/20">Name</label>
                    <input 
                      type="text"
                      value={content.info.founder.name}
                      onChange={(e) => setContent({
                        ...content,
                        info: { ...content.info, founder: { ...content.info.founder, name: e.target.value } }
                      })}
                      className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-lg outline-none focus:border-gold text-sm sm:text-base"
                    />
                  </div>
                  
                  <FileUpload 
                    label="Founder Image"
                    value={content.info.founder.image}
                    onChange={(file) => setContent({
                      ...content,
                      info: { ...content.info, founder: { ...content.info.founder, image: file } }
                    })}
                    accept="image/*"
                    type="image"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-white/40">Founder's Story</label>
                <textarea 
                  rows={6}
                  value={content.info.founder.story}
                  onChange={(e) => setContent({
                    ...content,
                    info: { ...content.info, founder: { ...content.info.founder, story: e.target.value } }
                  })}
                  className="w-full bg-white/5 border border-white/10 px-4 py-4 rounded-lg outline-none focus:border-gold transition-all leading-relaxed text-sm sm:text-base"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-white/40">Company Vision</label>
              <textarea 
                rows={3}
                value={content.info.vision}
                onChange={(e) => setContent({
                  ...content,
                  info: { ...content.info, vision: e.target.value }
                })}
                className="w-full bg-white/5 border border-white/10 px-4 py-4 rounded-lg outline-none focus:border-gold transition-all text-sm sm:text-base"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageContent;
