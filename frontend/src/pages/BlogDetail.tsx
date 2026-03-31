import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../AppContext';
import { toMediaUrl } from '../lib/utils';
import { ArrowLeft, Share2 } from 'lucide-react';

const BlogDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { blogs } = useApp();

  const blog = blogs.find(b => b.id === id);

  if (!blog) {
    return (
      <div className="bg-black min-h-screen flex items-center justify-center px-6">
        <div className="text-center">
          <h1 className="text-4xl font-serif font-bold text-white mb-4">Blog Post Not Found</h1>
          <p className="text-white/60 mb-8">The blog post you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/blog')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gold text-black font-bold uppercase tracking-widest hover:bg-gold-light transition-all rounded-lg"
          >
            <ArrowLeft size={20} /> Back to Blog
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen">
      {/* Header with Back Button */}
      <div className="border-b border-white/10">
        <div className="max-w-4xl mx-auto px-6 md:px-12 py-8">
          <button
            onClick={() => navigate('/blog')}
            className="flex items-center gap-2 text-gold hover:text-gold-light transition-colors mb-6 uppercase tracking-widest text-xs font-bold"
          >
            <ArrowLeft size={18} /> Back to Blog
          </button>
          <div className="space-y-4">
            <p className="text-white/40 text-xs uppercase tracking-widest font-bold">
              {new Date(blog.createdAt).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-white">{blog.title}</h1>
          </div>
        </div>
      </div>

      {/* Featured Image */}
      <div className="max-w-4xl mx-auto px-6 md:px-12 py-12">
        <div className="aspect-[16/9] overflow-hidden rounded-2xl mb-12">
          <img
            src={toMediaUrl(blog.image) || ''}
            alt={blog.title}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        </div>

        {/* Content */}
        <div className="prose prose-invert max-w-none space-y-6 mb-12">
          <p className="text-lg text-white/80 leading-relaxed">{blog.description}</p>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-white/10 pt-8 flex items-center justify-between">
          <button
            onClick={() => navigate('/blog')}
            className="flex items-center gap-2 text-gold hover:text-gold-light transition-colors uppercase tracking-widest text-xs font-bold"
          >
            <ArrowLeft size={18} /> Read More Blogs
          </button>
          <button
            onClick={() => {
              const text = `Check out this blog post: ${blog.title}`;
              if (navigator.share) {
                navigator.share({
                  title: blog.title,
                  text: blog.description,
                  url: window.location.href
                });
              } else {
                alert('Share feature not supported on this device');
              }
            }}
            className="flex items-center gap-2 text-gold hover:text-gold-light transition-colors uppercase tracking-widest text-xs font-bold"
          >
            <Share2 size={18} /> Share
          </button>
        </div>
      </div>
    </div>
  );
};

export default BlogDetail;
