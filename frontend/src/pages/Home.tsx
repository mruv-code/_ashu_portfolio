import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Play, ArrowRight, Star, Quote } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp } from '../AppContext';
import { toMediaUrl } from '../lib/utils';

const MediaPreview = ({ src, className }: { src: string | File, className?: string }) => {
  const url = toMediaUrl(src);
  if (!url) return <div className={className} />;
  return <img src={url} alt="" className={className} referrerPolicy="no-referrer" onError={(e) => e.currentTarget.style.display = 'none'} />;
};

const VideoBackground = ({ src, className }: { src: string | File, className?: string }) => {
  const url = toMediaUrl(src);
  if (!url) return <div className={className} />;

  return (
    <video 
      key={url}
      autoPlay 
      muted 
      loop 
      playsInline
      className={className}
    >
      <source src={url} type="video/mp4" />
    </video>
  );
};

const Home = () => {
  const { videos, pageContent, blogs, isLoading } = useApp();
  const featuredVideos = videos.filter(v => v.isFeatured).slice(0, 3);
  const latestBlogs = blogs ? [...blogs].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 4) : [];
  
  // Safe defaults for home content
  const homeContent = pageContent?.home || {};
  const heroVideo = homeContent.heroVideo || 'https://assets.mixkit.co/videos/preview/mixkit-wedding-couple-walking-in-a-field-of-flowers-34404-large.mp4';
  const tagline = homeContent.tagline || "We Don't Shoot Weddings, We Craft Stories";
  const services = homeContent.services || [];
  const testimonialTag = homeContent.testimonialTag || 'TESTIMONIALS';
  const testimonialTitle = homeContent.testimonialTitle || 'What Our Clients Say';
  const testimonials = homeContent.testimonials || [];

  if (isLoading) {
    return (
      <div className="bg-black min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/60">Loading cinematic content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black">
      {/* Hero Section */}
      <section className="relative h-screen w-full overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <VideoBackground 
            src={heroVideo}
            className="w-full h-full object-cover opacity-60 scale-105"
          />
          <div className="absolute inset-0 cinematic-gradient" />
        </div>

        <div className="relative z-10 text-center px-6 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            <h1 className="text-4xl sm:text-6xl md:text-8xl font-serif font-bold mb-8 leading-tight tracking-tighter">
              {tagline}
            </h1>
            <div className="flex flex-col md:flex-row items-center justify-center gap-6">
              <Link 
                to="/work" 
                className="px-10 py-4 bg-gold text-black font-bold uppercase tracking-widest hover:bg-gold-light transition-all flex items-center gap-3 group"
              >
                View Our Work
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                to="/contact" 
                className="px-10 py-4 border border-white/30 text-white font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all"
              >
                Book Your Shoot
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Work */}
      <section className="py-32 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <div>
            <span className="text-gold uppercase tracking-widest text-xs font-bold mb-4 block">Portfolio</span>
            <h2 className="text-4xl md:text-6xl font-serif font-bold">Featured Masterpieces</h2>
          </div>
          <Link to="/work" className="text-gold hover:text-gold-light transition-colors flex items-center gap-2 uppercase tracking-widest text-sm font-bold">
            View All Projects <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredVideos.map((video, idx) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.2 }}
              viewport={{ once: true }}
              className="group relative aspect-[16/9] overflow-hidden bg-zinc-900"
            >
              <MediaPreview 
                src={video.thumbnail} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-70 group-hover:opacity-100"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all flex items-center justify-center">
                <div className="w-16 h-16 rounded-full border border-white/50 flex items-center justify-center group-hover:scale-110 group-hover:border-gold group-hover:bg-gold/20 transition-all">
                  <Play className="text-white group-hover:text-gold fill-current" size={24} />
                </div>
              </div>
              <div className="absolute bottom-0 left-0 w-full p-6 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                <span className="text-gold text-[10px] uppercase tracking-widest mb-2 block">{video.category}</span>
                <h3 className="text-xl font-serif font-bold">{video.title}</h3>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Services Section */}
      <section className="py-32 bg-zinc-950 border-y border-white/5 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <span className="text-gold uppercase tracking-widest text-xs font-bold mb-4 block">Our Expertise</span>
            <h2 className="text-4xl md:text-6xl font-serif font-bold mb-6">Cinematic Services</h2>
            <p className="text-white/60 max-w-2xl mx-auto leading-relaxed">
              From intimate weddings to large-scale commercial productions, we bring a cinematic eye to every frame we capture.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {services && services.length > 0 ? services.map((service, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -10 }}
                className="group relative overflow-hidden bg-black/50 border border-white/10 hover:border-gold/50 transition-all flex flex-col"
              >
                {service?.image && (
                  <div className="w-full aspect-[4/5] overflow-hidden relative">
                    <img 
                      src={toMediaUrl(service.image) || ''} 
                      alt={service.title} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-60 group-hover:opacity-100"
                      referrerPolicy="no-referrer"
                      onError={(e) => e.currentTarget.style.display = 'none'}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                  </div>
                )}
                <div className="p-8 relative z-10 flex-1 flex flex-col">
                  <div className="w-10 h-10 border border-gold flex items-center justify-center mb-6 group-hover:bg-gold group-hover:text-black transition-all">
                    <span className="font-serif text-lg font-bold">0{idx + 1}</span>
                  </div>
                  <h3 className="text-2xl font-serif font-bold mb-4">{service?.title || 'Service'}</h3>
                  <p className="text-white/60 leading-relaxed text-sm">{service?.description || ''}</p>
                </div>
              </motion.div>
            )) : (
              <div className="col-span-full text-center text-white/40">Loading services...</div>
            )}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-32 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <span className="text-gold uppercase tracking-widest text-xs font-bold mb-4 block">
            {testimonialTag}
          </span>
          <h2 className="text-4xl md:text-6xl font-serif font-bold mb-6">
            {testimonialTitle}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials && testimonials.length > 0 ? testimonials.map((t, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="p-10 bg-zinc-950 border border-white/5 relative group hover:border-gold/30 transition-all flex flex-col justify-between"
            >
              <Quote className="absolute top-6 right-6 text-gold/10 group-hover:text-gold/20 transition-colors" size={40} />
              
              <div>
                <div className="flex gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      size={14} 
                      className={i < (t?.rating || 5) ? "text-gold fill-current" : "text-white/10"} 
                    />
                  ))}
                </div>
                
                <p className="text-white/80 mb-10 leading-relaxed italic text-lg">
                  "{t?.text || ''}"
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full overflow-hidden bg-zinc-800 border border-white/10">
                  {t?.image ? (
                    <MediaPreview src={t.image} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/10">
                      <Quote size={20} />
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-bold text-white">{t?.name || 'Client'}</p>
                  <p className="text-white/40 text-[10px] uppercase tracking-widest mt-1">
                    {t?.role || 'Valued Client'}
                  </p>
                </div>
              </div>
            </motion.div>
          )) : (
            <div className="col-span-full text-center text-white/40">Loading testimonials...</div>
          )}
        </div>
      </section>

      {/* Latest Blogs Section */}
      <section className="py-32 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <div>
            <span className="text-gold uppercase tracking-widest text-xs font-bold mb-4 block">Latest Blogs</span>
            <h2 className="text-4xl md:text-6xl font-serif font-bold">Latest Blog Posts</h2>
          </div>
          <Link to="/blog" className="text-gold hover:text-gold-light transition-colors flex items-center gap-2 uppercase tracking-widest text-sm font-bold">
            View All Blogs <ArrowRight size={16} />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {latestBlogs.length > 0 ? latestBlogs.map((blog, idx) => (
            <motion.div
              key={blog.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="group relative overflow-hidden bg-zinc-900 border border-white/10 rounded-2xl"
            >
              <div className="w-full aspect-[16/9] overflow-hidden">
                <img
                  src={toMediaUrl(blog.image) || ''}
                  alt={blog.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              </div>
              <div className="p-6">
                <p className="text-white/40 text-xs uppercase tracking-widest mb-2">{new Date(blog.createdAt).toLocaleDateString()}</p>
                <h3 className="text-xl font-serif font-bold mb-2">{blog.title}</h3>
                <p className="text-white/60 text-sm leading-relaxed mb-4">
                  {blog.description.length > 80 ? `${blog.description.slice(0, 80)}...` : blog.description}
                </p>
                <Link to="/blog" className="text-gold uppercase tracking-widest text-xs font-bold hover:text-gold-light">
                  Read More
                </Link>
              </div>
            </motion.div>
          )) : (
            <div className="col-span-full text-center text-white/40">No blogs yet. Add a blog from admin.</div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 md:py-40 px-6 md:px-12">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="max-w-4xl mx-auto bg-zinc-950 border border-white/10 p-10 md:p-24 text-center relative overflow-hidden group"
        >
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-gold to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-gold/5 rounded-full blur-3xl" />
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-gold/5 rounded-full blur-3xl" />
          
          <h2 className="text-4xl md:text-6xl font-serif font-bold mb-8 leading-tight">
            Ready to tell <br className="hidden md:block" /> your <span className="gold-text-gradient italic">story?</span>
          </h2>
          <p className="text-white/50 mb-12 max-w-lg mx-auto text-lg leading-relaxed font-light">
            Let's collaborate to create something truly extraordinary. Our team is ready to bring your cinematic vision to life.
          </p>
          <Link 
            to="/contact" 
            className="inline-flex items-center justify-center px-12 py-5 bg-gold text-black font-bold uppercase tracking-[0.3em] hover:bg-gold-light transition-all duration-500 shadow-[0_0_30px_rgba(212,175,55,0.15)] hover:shadow-[0_0_40px_rgba(212,175,55,0.3)]"
          >
            Check Availability
          </Link>
        </motion.div>
      </section>
    </div>
  );
};

export default Home;
