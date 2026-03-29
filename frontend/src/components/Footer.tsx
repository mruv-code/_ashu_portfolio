import React from 'react';
import { Link } from 'react-router-dom';
import { Film, Instagram, Youtube, Facebook, Mail, Phone } from 'lucide-react';
import { useApp } from '../AppContext';

const Footer = () => {
  const { contactInfo, siteSettings } = useApp();

  return (
    <footer className="bg-black border-t border-white/10 pt-20 pb-10 px-6 md:px-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
        <div className="col-span-1 sm:col-span-2">
          <Link to="/" className="flex items-center gap-2 mb-6">
            {siteSettings.logo ? (
              <img 
                src={typeof siteSettings.logo === 'string' ? siteSettings.logo : URL.createObjectURL(siteSettings.logo)} 
                alt={siteSettings.brandName} 
                className="h-10 w-auto object-contain"
                referrerPolicy="no-referrer"
              />
            ) : (
              <Film className="text-gold" size={32} />
            )}
            <span className="text-3xl font-serif font-bold tracking-tighter gold-text-gradient">
              {siteSettings.brandName}
            </span>
          </Link>
          <p className="text-white/60 max-w-md leading-relaxed mb-8">
            We don't just capture events; we craft cinematic legacies. Our passion for storytelling drives us to create visual masterpieces that last a lifetime.
          </p>
          <div className="flex gap-4">
            <a href={contactInfo.instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:border-gold hover:text-gold transition-all">
              <Instagram size={18} />
            </a>
            <a href={contactInfo.youtube} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:border-gold hover:text-gold transition-all">
              <Youtube size={18} />
            </a>
            <a href={contactInfo.facebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:border-gold hover:text-gold transition-all">
              <Facebook size={18} />
            </a>
          </div>
        </div>

        <div>
          <h4 className="text-gold font-serif text-lg mb-6">Quick Links</h4>
          <ul className="flex flex-col gap-4 text-white/70">
            <li><Link to="/" className="hover:text-gold transition-colors">Home</Link></li>
            <li><Link to="/work" className="hover:text-gold transition-colors">Our Work</Link></li>
            <li><Link to="/info" className="hover:text-gold transition-colors">About Us</Link></li>
            <li><Link to="/contact" className="hover:text-gold transition-colors">Contact</Link></li>
            <li><Link to="/admin" className="hover:text-gold transition-colors text-xs opacity-50">Admin Login</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-gold font-serif text-lg mb-6">Contact Us</h4>
          <ul className="flex flex-col gap-4 text-white/70">
            <li className="flex items-center gap-3">
              <Phone size={16} className="text-gold" />
              <span>{contactInfo.phone}</span>
            </li>
            <li className="flex items-center gap-3">
              <Mail size={16} className="text-gold" />
              <span>{contactInfo.email}</span>
            </li>
            <li className="text-sm leading-relaxed">
              {contactInfo.address}
            </li>
          </ul>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-white/40 text-xs uppercase tracking-widest">
        <p>© 2026 Bandhan Films. All Rights Reserved.</p>
        <p>Crafted with passion for cinematic excellence.</p>
      </div>
    </footer>
  );
};

export default Footer;
