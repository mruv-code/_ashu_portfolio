import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Phone, MapPin, Send, MessageCircle, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { useApp } from '../AppContext';

const Contact = () => {
  const { addInquiry, contactInfo } = useApp();
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    eventType: 'Wedding',
    date: '',
    budget: '',
    message: ''
  });

  // Calendar State
  const [availability, setAvailability] = useState<Record<string, 'available' | 'unavailable'>>({});
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());
  const calendarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchAvailability();
    
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setShowCalendar(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchAvailability = async () => {
    try {
      const response = await fetch('https://ashu-portfolio-backend-vgnp.onrender.com//api/calendar');
      const data = await response.json();
      setAvailability(data);
    } catch (error) {
      console.error('Failed to fetch availability:', error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addInquiry(formData);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
    setFormData({
      name: '',
      phone: '',
      email: '',
      eventType: 'Wedding',
      date: '',
      budget: '',
      message: ''
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Calendar Logic
  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const prevMonth = () => setCurrentCalendarDate(new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth() - 1));
  const nextMonth = () => setCurrentCalendarDate(new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth() + 1));

  const selectDate = (dateStr: string) => {
    setFormData({ ...formData, date: dateStr });
    setShowCalendar(false);
  };

  const renderCalendar = () => {
    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();
    const days = daysInMonth(year, month);
    const firstDay = firstDayOfMonth(year, month);
    const monthName = currentCalendarDate.toLocaleString('default', { month: 'long' });

    const calendarDays = [];
    for (let i = 0; i < firstDay; i++) {
      calendarDays.push(<div key={`empty-${i}`} className="h-10" />);
    }

    for (let d = 1; d <= days; d++) {
      const date = new Date(year, month, d);
      const dYear = date.getFullYear();
      const dMonth = String(date.getMonth() + 1).padStart(2, '0');
      const dDay = String(date.getDate()).padStart(2, '0');
      const dateStr = `${dYear}-${dMonth}-${dDay}`;
      const status = availability[dateStr];
      const isPast = date < new Date(new Date().setHours(0,0,0,0));
      const isUnavailable = status === 'unavailable';
      const isSelected = formData.date === dateStr;

      calendarDays.push(
        <button
          key={d}
          type="button"
          disabled={isPast || isUnavailable}
          onClick={() => selectDate(dateStr)}
          className={`h-10 border border-white/5 flex flex-col items-center justify-center relative transition-all text-xs
            ${isPast || isUnavailable ? 'opacity-20 cursor-not-allowed' : 'hover:bg-gold/10'}
            ${isSelected ? 'bg-gold/20 border-gold/50 text-gold' : ''}
          `}
        >
          <span>{d}</span>
          {status === 'available' && !isPast && (
            <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-green-500" />
          )}
          {status === 'unavailable' && !isPast && (
            <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-red-500" />
          )}
        </button>
      );
    }

    return (
      <div className="p-4 bg-zinc-950 border border-white/10 rounded-xl shadow-2xl w-72">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-serif font-bold text-sm">{monthName} {year}</h4>
          <div className="flex gap-1">
            <button type="button" onClick={prevMonth} className="p-1 hover:bg-white/10 rounded-full transition-all">
              <ChevronLeft size={16} />
            </button>
            <button type="button" onClick={nextMonth} className="p-1 hover:bg-white/10 rounded-full transition-all">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-px mb-2">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
            <div key={day} className="h-8 flex items-center justify-center text-[10px] uppercase tracking-widest text-white/40 font-bold">
              {day}
            </div>
          ))}
          {calendarDays}
        </div>
        <div className="flex gap-4 text-[8px] uppercase tracking-widest font-bold text-white/40 pt-2 border-t border-white/5">
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500" /> Available
          </div>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500" /> Booked
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-black text-white pt-40 pb-20">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          {/* Contact Info */}
          <div>
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-gold uppercase tracking-[0.5em] text-xs font-bold mb-6 block"
            >
              Get In Touch
            </motion.span>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl sm:text-5xl md:text-7xl font-serif font-bold mb-10 leading-tight"
            >
              Let's Create <br />
              <span className="gold-text-gradient">Something Iconic</span>
            </motion.h1>
            
            <p className="text-white/60 text-lg leading-relaxed mb-12 max-w-md">
              Whether it's your big day or a brand story, we're excited to hear about your vision. Reach out to us today.
            </p>

            <div className="space-y-8 mb-12">
              <div className="flex items-start gap-6">
                <div className="w-12 h-12 rounded-full border border-gold/30 flex items-center justify-center text-gold shrink-0">
                  <Phone size={20} />
                </div>
                <div>
                  <h4 className="text-xs uppercase tracking-widest text-white/40 mb-1">Call Us</h4>
                  <p className="text-xl font-serif">{contactInfo.phone}</p>
                </div>
              </div>
              <div className="flex items-start gap-6">
                <div className="w-12 h-12 rounded-full border border-gold/30 flex items-center justify-center text-gold shrink-0">
                  <Mail size={20} />
                </div>
                <div>
                  <h4 className="text-xs uppercase tracking-widest text-white/40 mb-1">Email Us</h4>
                  <p className="text-xl font-serif">{contactInfo.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-6">
                <div className="w-12 h-12 rounded-full border border-gold/30 flex items-center justify-center text-gold shrink-0">
                  <MapPin size={20} />
                </div>
                <div>
                  <h4 className="text-xs uppercase tracking-widest text-white/40 mb-1">Visit Us</h4>
                  <p className="text-xl font-serif">{contactInfo.address}</p>
                </div>
              </div>
            </div>

            <a 
              href={`https://wa.me/${contactInfo.whatsapp.replace(/\+/g, '').replace(/\s/g, '')}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-8 py-4 bg-[#25D366] text-white font-bold uppercase tracking-widest hover:opacity-90 transition-all rounded-full"
            >
              <MessageCircle size={20} />
              Chat on WhatsApp
            </a>
          </div>

          {/* Inquiry Form */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-zinc-950 border border-white/10 p-10 md:p-16 relative"
          >
            <div className="absolute top-0 left-0 w-1 h-full bg-gold" />
            
            <h3 className="text-3xl font-serif font-bold mb-8">Inquiry Form</h3>
            
            {submitted ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="h-full flex flex-col items-center justify-center text-center py-20"
              >
                <div className="w-20 h-20 rounded-full bg-gold/20 text-gold flex items-center justify-center mb-6">
                  <Send size={40} />
                </div>
                <h4 className="text-2xl font-serif font-bold mb-4">Message Sent!</h4>
                <p className="text-white/60">Thank you for reaching out. We'll get back to you within 24 hours.</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-white/40">Full Name</label>
                    <input 
                      required
                      type="text" 
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      className="w-full bg-white/5 border border-white/10 px-4 py-3 focus:border-gold outline-none transition-all text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-white/40">Phone Number</label>
                    <input 
                      required
                      type="tel" 
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+91 00000 00000"
                      className="w-full bg-white/5 border border-white/10 px-4 py-3 focus:border-gold outline-none transition-all text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-white/40">Email Address</label>
                  <input 
                    required
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                    className="w-full bg-white/5 border border-white/10 px-4 py-3 focus:border-gold outline-none transition-all text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-white/40">Event Type</label>
                    <select 
                      name="eventType"
                      value={formData.eventType}
                      onChange={handleChange}
                      className="w-full bg-zinc-900 border border-white/10 px-4 py-3 focus:border-gold outline-none transition-all text-sm appearance-none"
                    >
                      <option>Wedding</option>
                      <option>Commercial</option>
                      <option>Social Media</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div className="space-y-2 relative" ref={calendarRef}>
                    <label className="text-[10px] uppercase tracking-widest text-white/40">Event Date</label>
                    <button
                      type="button"
                      onClick={() => setShowCalendar(!showCalendar)}
                      className="w-full bg-white/5 border border-white/10 px-4 py-3 focus:border-gold outline-none transition-all text-sm flex items-center justify-between text-left"
                    >
                      <span className={formData.date ? 'text-white' : 'text-white/40'}>
                        {formData.date || 'Select Date'}
                      </span>
                      <CalendarIcon size={16} className="text-gold" />
                    </button>
                    
                    <AnimatePresence>
                      {showCalendar && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute bottom-full left-0 mb-2 z-50"
                        >
                          {renderCalendar()}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-white/40">Estimated Budget</label>
                  <input 
                    type="text" 
                    name="budget"
                    value={formData.budget}
                    onChange={handleChange}
                    placeholder="e.g. ₹2,00,000"
                    className="w-full bg-white/5 border border-white/10 px-4 py-3 focus:border-gold outline-none transition-all text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-white/40">Your Message</label>
                  <textarea 
                    rows={4}
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us about your project..."
                    className="w-full bg-white/5 border border-white/10 px-4 py-3 focus:border-gold outline-none transition-all text-sm resize-none"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full py-5 bg-gold text-black font-bold uppercase tracking-[0.3em] hover:bg-gold-light transition-all flex items-center justify-center gap-3"
                >
                  Send Inquiry
                  <Send size={18} />
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
