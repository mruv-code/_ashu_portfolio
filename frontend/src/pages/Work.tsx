import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, X } from 'lucide-react';
import { useApp } from '../AppContext';
import { cn, toMediaUrl } from '../lib/utils';

const MediaPreview = ({ src, className }: { src: string | File, className?: string }) => {
  const url = toMediaUrl(src);
  if (!url) return <div className={cn("bg-zinc-800", className)} />;
  return <img src={url} alt="" className={className} referrerPolicy="no-referrer" onError={(e) => e.currentTarget.style.display = 'none'} />;
};

const Work = () => {
  const { videos, categories } = useApp();
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedVideoUrl, setSelectedVideoUrl] = useState<string | null>(null);

  const filteredVideos = activeCategory === 'All' 
    ? videos 
    : videos.filter(v => v.category === activeCategory);

  const handleOpenVideo = (videoUrl: string | File) => {
    const url = toMediaUrl(videoUrl);
    if (url) {
      setSelectedVideoUrl(url);
    }
  };

  const handleCloseVideo = () => {
    setSelectedVideoUrl(null);
  };
      URL.revokeObjectURL(objectUrl);
      setObjectUrl(null);
    }
    setSelectedVideoUrl(null);
  };

  return (
    <div className="pt-32 pb-20 px-6 md:px-12 bg-black min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <motion.span 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-gold uppercase tracking-[0.5em] text-xs font-bold mb-4 block"
          >
            Our Portfolio
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-5xl md:text-7xl font-serif font-bold mb-12"
          >
            Cinematic Gallery
          </motion.h1>

          {/* Filters */}
          <div className="flex flex-wrap justify-center gap-4 mb-16">
            <button
              onClick={() => setActiveCategory('All')}
              className={cn(
                "px-8 py-3 text-xs uppercase tracking-widest font-bold transition-all border",
                activeCategory === 'All' 
                  ? "bg-gold border-gold text-black" 
                  : "border-white/10 text-white/60 hover:border-white/30"
              )}
            >
              All Work
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.name)}
                className={cn(
                  "px-8 py-3 text-xs uppercase tracking-widest font-bold transition-all border",
                  activeCategory === cat.name 
                    ? "bg-gold border-gold text-black" 
                    : "border-white/10 text-white/60 hover:border-white/30"
                )}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Video Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredVideos.map((video) => (
              <motion.div
                layout
                key={video.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4 }}
                className="group relative aspect-[16/9] bg-zinc-900 overflow-hidden cursor-pointer"
                onClick={() => handleOpenVideo(video.url)}
              >
                <MediaPreview 
                  src={video.thumbnail} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-60 group-hover:opacity-100"
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-16 h-16 rounded-full bg-gold text-black flex items-center justify-center scale-75 group-hover:scale-100 transition-transform duration-300">
                    <Play fill="currentColor" size={24} />
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black/80 to-transparent">
                  <span className="text-gold text-[10px] uppercase tracking-widest mb-1 block">{video.category}</span>
                  <h3 className="text-lg font-serif font-bold text-white">{video.title}</h3>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredVideos.length === 0 && (
          <div className="text-center py-20 text-white/40 italic">
            No videos found in this category.
          </div>
        )}
      </div>

      {/* Video Modal */}
      <AnimatePresence>
        {selectedVideoUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 md:p-10"
          >
            <button 
              onClick={handleCloseVideo}
              className="absolute top-6 right-6 text-white/60 hover:text-white transition-colors"
            >
              <X size={32} />
            </button>
            <div className="w-full max-w-6xl aspect-video bg-black shadow-2xl">
              {selectedVideoUrl.startsWith('blob:') || selectedVideoUrl.startsWith('data:video/') ? (
                <video 
                  src={selectedVideoUrl} 
                  controls 
                  autoPlay 
                  className="w-full h-full"
                />
              ) : (
                <iframe
                  src={selectedVideoUrl}
                  className="w-full h-full"
                  allow="autoplay; fullscreen"
                  allowFullScreen
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Work;
