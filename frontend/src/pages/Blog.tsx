import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../AppContext';
import { toMediaUrl } from '../lib/utils';

const Blog = () => {
  const { blogs, isLoading } = useApp();

  const sortedBlogs = [...blogs].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  if (isLoading) {
    return (
      <div className="bg-black min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/60">Loading blog posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen px-6 md:px-12 py-20">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 text-center">
          <span className="text-gold uppercase tracking-widest text-xs font-bold mb-4 block">Blog</span>
          <h1 className="text-4xl md:text-6xl font-serif font-bold">Latest Insights</h1>
          <p className="text-white/60 max-w-2xl mx-auto mt-4">
            Follow our latest work, stories, and expert tips on cinematic storytelling.
          </p>
        </div>

        {sortedBlogs.length === 0 ? (
          <div className="text-center text-white/30 py-20 border border-white/10 rounded-xl">
            No blog posts available yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sortedBlogs.map((blog) => (
              <article key={blog.id} className="bg-zinc-900/50 border border-white/10 rounded-2xl overflow-hidden group hover:border-gold/50 transition-all">
                <div className="aspect-[16/9] overflow-hidden relative">
                  <img
                    src={toMediaUrl(blog.image) || ''}
                    alt={blog.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                </div>
                <div className="p-6">
                  <p className="text-white/40 text-xs uppercase tracking-widest mb-2">{new Date(blog.createdAt).toLocaleDateString()}</p>
                  <h2 className="text-xl md:text-2xl font-serif font-bold mb-3">{blog.title}</h2>
                  <p className="text-white/60 leading-relaxed mb-5">{blog.description}</p>
                  <Link
                    to="/"
                    className="inline-flex items-center gap-2 text-gold uppercase tracking-widest text-xs font-bold hover:text-gold-light"
                  >
                    Read More
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Blog;
