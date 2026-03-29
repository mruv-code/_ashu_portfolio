import React, { useState, useEffect } from 'react';
import { Save, Mail, Phone, MapPin, Instagram, Youtube, Facebook, MessageCircle, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Check, X } from 'lucide-react';
import { useApp } from '../../AppContext';
import { ContactInfo } from '../../types';

const ManageContact = () => {
  const { contactInfo, updateContactInfo } = useApp();
  const [formData, setFormData] = useState<ContactInfo>(contactInfo);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Calendar State
  const [availability, setAvailability] = useState<Record<string, 'available' | 'unavailable'>>({});
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isCalendarSaving, setIsCalendarSaving] = useState(false);

  useEffect(() => {
    fetchAvailability();
  }, []);

  const fetchAvailability = async () => {
    try {
      const response = await fetch(`${API_URL}/api/calendar`);
      const data = await response.json();
      setAvailability(data);
    } catch (error) {
      console.error('Failed to fetch availability:', error);
    }
  };

  const handleSaveCalendar = async () => {
    setIsCalendarSaving(true);
    try {
      const response = await fetch(`${API_URL}/api/calendar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ availability }),
      });
      if (response.ok) {
        setMessage({ type: 'success', text: 'Calendar availability updated successfully!' });
        setTimeout(() => setMessage(null), 3000);
      } else {
        throw new Error('Failed to save');
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update calendar availability.' });
    } finally {
      setIsCalendarSaving(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      updateContactInfo(formData);
      setMessage({ type: 'success', text: 'Contact information updated successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update contact information.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Calendar Logic
  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));

  const toggleDate = (dateStr: string) => {
    setAvailability(prev => {
      const current = prev[dateStr];
      const next = { ...prev };
      if (!current) next[dateStr] = 'available';
      else if (current === 'available') next[dateStr] = 'unavailable';
      else delete next[dateStr];
      return next;
    });
  };

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const days = daysInMonth(year, month);
    const firstDay = firstDayOfMonth(year, month);
    const monthName = currentDate.toLocaleString('default', { month: 'long' });

    const calendarDays = [];
    for (let i = 0; i < firstDay; i++) {
      calendarDays.push(<div key={`empty-${i}`} className="h-12 sm:h-16" />);
    }

    for (let d = 1; d <= days; d++) {
      const date = new Date(year, month, d);
      const dYear = date.getFullYear();
      const dMonth = String(date.getMonth() + 1).padStart(2, '0');
      const dDay = String(date.getDate()).padStart(2, '0');
      const dateStr = `${dYear}-${dMonth}-${dDay}`;
      const status = availability[dateStr];
      const isPast = date < new Date(new Date().setHours(0,0,0,0));

      calendarDays.push(
        <button
          key={d}
          type="button"
          disabled={isPast}
          onClick={() => toggleDate(dateStr)}
          className={`h-12 sm:h-16 border border-white/5 flex flex-col items-center justify-center relative transition-all hover:bg-white/5 group ${isPast ? 'opacity-20 cursor-not-allowed' : ''}`}
        >
          <span className="text-sm font-medium">{d}</span>
          {status === 'available' && (
            <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
          )}
          {status === 'unavailable' && (
            <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
          )}
          
          {/* Tooltip on hover */}
          {!isPast && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-zinc-800 text-[10px] rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-10 border border-white/10">
              {status === 'available' ? 'Available' : status === 'unavailable' ? 'Booked' : 'Neutral'}
            </div>
          )}
        </button>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-serif font-bold text-lg">{monthName} {year}</h3>
          <div className="flex gap-2">
            <button type="button" onClick={prevMonth} className="p-2 hover:bg-white/10 rounded-full transition-all">
              <ChevronLeft size={20} />
            </button>
            <button type="button" onClick={nextMonth} className="p-2 hover:bg-white/10 rounded-full transition-all">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-px bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="h-10 flex items-center justify-center text-[10px] uppercase tracking-widest text-white/40 font-bold bg-zinc-900/80">
              {day}
            </div>
          ))}
          {calendarDays}
        </div>
        <div className="flex flex-wrap gap-6 text-[10px] uppercase tracking-widest font-bold text-white/40 pt-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500" /> Available
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500" /> Unavailable / Booked
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-white/10" /> Neutral
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold">Contact Information</h1>
        <p className="text-white/40 text-sm">Manage your public contact details and social media links.</p>
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Core Contact Details */}
        <div className="bg-zinc-900/50 border border-white/10 p-6 sm:p-8 rounded-2xl space-y-6">
          <h2 className="text-lg font-serif font-bold flex items-center gap-2">
            <Phone size={20} className="text-gold" />
            Core Contact Details
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-white/40">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                <input 
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 pl-12 pr-4 py-3 rounded-lg outline-none focus:border-gold transition-all"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-white/40">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                <input 
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 pl-12 pr-4 py-3 rounded-lg outline-none focus:border-gold transition-all"
                />
              </div>
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs uppercase tracking-widest text-white/40">Office Address</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                <input 
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 pl-12 pr-4 py-3 rounded-lg outline-none focus:border-gold transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Social Media Links */}
        <div className="bg-zinc-900/50 border border-white/10 p-6 sm:p-8 rounded-2xl space-y-6">
          <h2 className="text-lg font-serif font-bold flex items-center gap-2">
            <Instagram size={20} className="text-gold" />
            Social Media & Messaging
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-white/40">Instagram URL</label>
              <div className="relative">
                <Instagram className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                <input 
                  type="url"
                  name="instagram"
                  value={formData.instagram}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 pl-12 pr-4 py-3 rounded-lg outline-none focus:border-gold transition-all"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-white/40">YouTube URL</label>
              <div className="relative">
                <Youtube className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                <input 
                  type="url"
                  name="youtube"
                  value={formData.youtube}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 pl-12 pr-4 py-3 rounded-lg outline-none focus:border-gold transition-all"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-white/40">Facebook URL</label>
              <div className="relative">
                <Facebook className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                <input 
                  type="url"
                  name="facebook"
                  value={formData.facebook}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 pl-12 pr-4 py-3 rounded-lg outline-none focus:border-gold transition-all"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-white/40">WhatsApp Number (with country code, no spaces)</label>
              <div className="relative">
                <MessageCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                <input 
                  type="text"
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={handleChange}
                  placeholder="e.g. 919876543210"
                  className="w-full bg-white/5 border border-white/10 pl-12 pr-4 py-3 rounded-lg outline-none focus:border-gold transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button 
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-3 px-10 py-4 bg-gold text-black font-bold uppercase tracking-widest hover:bg-gold-light transition-all rounded-lg disabled:opacity-50"
          >
            {isSaving ? (
              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save size={20} />
            )}
            Save Contact Info
          </button>
        </div>
      </form>

      {/* Availability Calendar Section */}
      <div className="bg-zinc-900/50 border border-white/10 p-6 sm:p-8 rounded-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-lg font-serif font-bold flex items-center gap-2">
            <CalendarIcon size={20} className="text-gold" />
            Availability Calendar
          </h2>
          <button 
            type="button"
            onClick={handleSaveCalendar}
            disabled={isCalendarSaving}
            className="flex items-center justify-center gap-2 px-6 py-2 bg-gold text-black text-xs font-bold uppercase tracking-widest hover:bg-gold-light transition-all rounded-lg disabled:opacity-50"
          >
            {isCalendarSaving ? (
              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save size={16} />
            )}
            Save Availability
          </button>
        </div>
        
        <p className="text-white/40 text-sm">Click on a date to toggle its availability status for bookings.</p>
        
        <div className="max-w-md">
          {renderCalendar()}
        </div>
      </div>
    </div>
  );
};

export default ManageContact;
