import React, { useState, useEffect, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Film } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { AppContext } from '../AppContext';

const Navbar = () => {
  const { siteSettings } = useContext(AppContext);
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Work', path: '/work' },
    { name: 'Info', path: '/info' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <nav className={cn(
      "fixed top-0 left-0 w-full z-50 transition-all duration-500 py-5 px-6 md:px-12 border-b border-transparent",
      scrolled ? "bg-black/40 backdrop-blur-xl border-white/10 shadow-2xl" : "bg-transparent"
    )}>
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 group">
          {siteSettings.logo ? (
            <img 
              src={typeof siteSettings.logo === 'string' ? siteSettings.logo : URL.createObjectURL(siteSettings.logo)} 
              alt={siteSettings.brandName} 
              className="h-8 w-auto object-contain"
              referrerPolicy="no-referrer"
            />
          ) : (
            <Film className="text-gold group-hover:rotate-12 transition-transform" size={28} />
          )}
          <span className="text-xl sm:text-2xl font-serif font-bold tracking-tighter gold-text-gradient">
            {siteSettings.brandName}
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                "text-sm uppercase tracking-widest hover:text-gold transition-colors relative group",
                location.pathname === link.path ? "text-gold" : "text-white/80"
              )}
            >
              {link.name}
              <span className={cn(
                "absolute -bottom-2 left-0 w-0 h-0.5 bg-gold transition-all duration-300 group-hover:w-full",
                location.pathname === link.path ? "w-full" : ""
              )} />
            </Link>
          ))}
          <Link 
            to="/contact" 
            className="px-6 py-2 border border-gold text-gold hover:bg-gold hover:text-black transition-all duration-300 text-xs uppercase tracking-widest font-bold"
          >
            Book Now
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden text-white" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 w-full bg-black/95 backdrop-blur-xl border-t border-white/10 py-8 px-6 flex flex-col gap-6 md:hidden"
          >
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "text-xl font-serif tracking-widest",
                  location.pathname === link.path ? "text-gold" : "text-white"
                )}
              >
                {link.name}
              </Link>
            ))}
            <Link 
              to="/contact" 
              onClick={() => setIsOpen(false)}
              className="w-full py-4 bg-gold text-black text-center font-bold uppercase tracking-widest"
            >
              Book Now
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
