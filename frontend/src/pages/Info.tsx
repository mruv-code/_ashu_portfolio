import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useApp } from '../AppContext';

const MediaPreview = ({ src, className }: { src: string | File, className?: string }) => {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!src) {
      setUrl(null);
      return;
    }
    if (src instanceof File) {
      const objectUrl = URL.createObjectURL(src);
      setUrl(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } else if (typeof src === 'string') {
      setUrl(src || null);
    }
  }, [src]);

  if (!url) return <div className={className} />;

  return <img src={url} alt="" className={className} referrerPolicy="no-referrer" />;
};

const Info = () => {
  const { pageContent } = useApp();

  return (
    <div className="bg-black text-white">
      {/* Header */}
      <section className="pt-40 pb-20 px-6 md:px-12 border-b border-white/5">
        <div className="max-w-7xl mx-auto">
          <motion.span 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-gold uppercase tracking-[0.5em] text-xs font-bold mb-6 block"
          >
            Our Story
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-8xl font-serif font-bold leading-tight"
          >
            Crafting Cinematic <br />
            <span className="gold-text-gradient">Legacies</span>
          </motion.h1>
        </div>
      </section>

      {/* About Company */}
      <section className="py-32 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
          <div className="relative aspect-[4/5] overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=1000&auto=format&fit=crop" 
              alt="Cinematography"
              className="w-full h-full object-cover opacity-80"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 border-[20px] border-black/20" />
          </div>
          <div>
            <h2 className="text-3xl md:text-5xl font-serif font-bold mb-8">About Bandhan Films</h2>
            <p className="text-white/60 text-lg leading-relaxed mb-8">
              {pageContent.info.about}
            </p>
            <div className="grid grid-cols-2 gap-8 pt-8 border-t border-white/10">
              <div>
                <p className="text-4xl font-serif font-bold text-gold mb-2">10+</p>
                <p className="text-xs uppercase tracking-widest text-white/40">Years Experience</p>
              </div>
              <div>
                <p className="text-4xl font-serif font-bold text-gold mb-2">500+</p>
                <p className="text-xs uppercase tracking-widest text-white/40">Films Produced</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Founder Section */}
      <section className="py-32 bg-zinc-950 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
            <div className="order-2 md:order-1">
              <span className="text-gold uppercase tracking-widest text-xs font-bold mb-4 block">The Visionary</span>
              <h2 className="text-4xl md:text-6xl font-serif font-bold mb-8">{pageContent.info.founder.name}</h2>
              <p className="text-white/60 text-lg leading-relaxed mb-10 italic">
                "{pageContent.info.founder.story}"
              </p>
              <div className="p-8 border-l-2 border-gold bg-zinc-900/50">
                <h4 className="font-serif text-xl font-bold mb-4 text-gold">Our Vision</h4>
                <p className="text-white/70 leading-relaxed">
                  {pageContent.info.vision}
                </p>
              </div>
            </div>
            <div className="order-1 md:order-2 relative">
              <div className="absolute -top-10 -right-10 w-40 h-40 border-t-2 border-r-2 border-gold/30 hidden md:block" />
              <div className="relative aspect-[3/4] overflow-hidden grayscale hover:grayscale-0 transition-all duration-700">
                <MediaPreview 
                  src={pageContent.info.founder.image} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-10 -left-10 w-40 h-40 border-b-2 border-l-2 border-gold/30 hidden md:block" />
            </div>
          </div>
        </div>
      </section>

      {/* Experience Stats */}
      <section className="py-32 px-6 md:px-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
          {[
            { label: "Awards Won", value: "24" },
            { label: "Global Clients", value: "150+" },
            { label: "Team Members", value: "15" },
            { label: "Coffee Consumed", value: "∞" }
          ].map((stat, idx) => (
            <div key={idx}>
              <h3 className="text-5xl font-serif font-bold text-gold mb-4">{stat.value}</h3>
              <p className="text-xs uppercase tracking-[0.3em] text-white/40">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Info;
