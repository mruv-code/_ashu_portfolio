import React, { useState, useEffect } from 'react';
import { useApp } from '../../AppContext';
import { Shield, Lock, Mail, Check, AlertCircle, RefreshCw, ArrowLeft, Key, Save } from 'lucide-react';

const AccountSettings = () => {
  const { adminSettings, updateAdminSettings } = useApp();
  const [formData, setFormData] = useState({
    oldEmail: adminSettings.email,
    oldPassword: '',
    newEmail: adminSettings.email,
    newPassword: '',
    confirmPassword: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      // Request OTP for admin changes
      const response = await fetch('https://ashu-portfolio-backend-vgnp.onrender.com/api/admin/request-change', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          oldEmail: formData.oldEmail,
          oldPassword: formData.oldPassword,
          newEmail: formData.newEmail,
          newPassword: formData.newPassword || undefined
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setShowOtpInput(true);
        setMessage({ type: 'success', text: 'Verification code sent to your current email to authorize changes.' });
      } else {
        let msg = data.message || 'Failed to request admin changes.';
        if (data.details && data.details.includes('535-5.7.8')) {
          msg = 'SMTP Authentication Error: If using Gmail, please use an "App Password" instead of your regular password. Ensure 2-Step Verification is enabled in your Google Account.';
        }
        setMessage({ 
          type: 'error', 
          text: msg,
          details: data.details
        } as any);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to connect to server.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setMessage(null);

    try {
      const response = await fetch('https://ashu-portfolio-backend-vgnp.onrender.com/api/admin/verify-change', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentEmail: formData.oldEmail,
          otp
        }),
      });

      const data = await response.json();

      if (response.ok) {
        updateAdminSettings({
          email: formData.newEmail,
          password: formData.newPassword || adminSettings.password
        });
        setMessage({ type: 'success', text: 'Admin credentials updated successfully!' });
        setShowOtpInput(false);
        setOtp('');
        setFormData({
          ...formData,
          oldEmail: formData.newEmail,
          oldPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        setMessage({ type: 'error', text: data.message || 'Invalid verification code.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Verification failed.' });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    
    setIsVerifying(true);
    setMessage(null);

    try {
      const response = await fetch('https://ashu-portfolio-backend-vgnp.onrender.com/api/admin/request-change', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          oldEmail: formData.oldEmail,
          oldPassword: formData.oldPassword,
          newEmail: formData.newEmail,
          newPassword: formData.newPassword || undefined
        }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'New verification code sent.' });
        setResendCooldown(30);
      } else {
        const data = await response.json();
        let msg = data.message || 'Failed to resend code.';
        if (data.details && data.details.includes('535-5.7.8')) {
          msg = 'SMTP Authentication Error: If using Gmail, please use an "App Password" instead of your regular password.';
        }
        setMessage({ type: 'error', text: msg });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Connection error.' });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-serif font-bold text-white">Account Settings</h2>
          <p className="text-white/60">Manage your admin login credentials</p>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-xl flex flex-col gap-2 animate-fade-in ${message.type === 'success' ? 'bg-green-500/10 border border-green-500/20 text-green-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}>
          <div className="flex items-center gap-3">
            {message.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
            <span className="text-sm font-medium">{message.text}</span>
          </div>
          {(message as any).details && (
            <p className="text-xs opacity-70 ml-7 font-mono">{(message as any).details}</p>
          )}
        </div>
      )}

      {!showOtpInput ? (
        <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">
          {/* Current Credentials */}
          <div className="bg-zinc-900/50 border border-white/10 p-8 rounded-2xl space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="text-gold" size={20} />
              <h3 className="text-xl font-serif font-bold text-white">Current Credentials</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-white/60 uppercase tracking-widest">Current Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                  <input
                    type="email"
                    value={formData.oldEmail}
                    onChange={(e) => setFormData({ ...formData, oldEmail: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-gold transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-white/60 uppercase tracking-widest">Current Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                  <input
                    type="password"
                    value={formData.oldPassword}
                    onChange={(e) => setFormData({ ...formData, oldPassword: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-gold transition-colors"
                    placeholder="Enter current password"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* New Credentials */}
          <div className="bg-zinc-900/50 border border-white/10 p-8 rounded-2xl space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <Key className="text-gold" size={20} />
              <h3 className="text-xl font-serif font-bold text-white">New Credentials</h3>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-white/60 uppercase tracking-widest">New Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                  <input
                    type="email"
                    value={formData.newEmail}
                    onChange={(e) => setFormData({ ...formData, newEmail: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-gold transition-colors"
                    placeholder="New admin email"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-white/60 uppercase tracking-widest">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                    <input
                      type="password"
                      value={formData.newPassword}
                      onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-gold transition-colors"
                      placeholder="New password"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-white/60 uppercase tracking-widest">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                    <input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-gold transition-colors"
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 space-y-4">
                <div className="flex items-center gap-2">
                  <Mail className="text-gold" size={18} />
                  <h4 className="text-sm font-bold text-white uppercase tracking-widest">Two-Step Verification</h4>
                </div>
                <p className="text-xs text-white/40">Changing email or password requires verification via OTP sent to your current email.</p>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full bg-gold text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-yellow-500 transition-colors disabled:opacity-50"
          >
            {isSaving ? <RefreshCw className="animate-spin" size={20} /> : <Save size={20} />}
            {isSaving ? 'Processing...' : 'Request Update'}
          </button>
        </form>
      ) : (
        <div className="max-w-md mx-auto bg-zinc-900/50 border border-white/10 p-8 rounded-2xl space-y-6 animate-fade-in">
          <button 
            onClick={() => setShowOtpInput(false)}
            className="flex items-center gap-2 text-white/40 hover:text-white transition-colors text-xs uppercase tracking-widest mb-4"
          >
            <ArrowLeft size={14} /> Back
          </button>
          
          <div className="bg-gold/10 border border-gold/20 p-4 rounded-xl">
            <p className="text-xs text-gold font-medium mb-1 uppercase tracking-widest text-center">Verification Required</p>
            <p className="text-sm text-white/80 text-center">A 6-digit code has been sent to <span className="text-gold font-bold">{formData.oldEmail}</span> to authorize these changes.</p>
          </div>

          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-white/60">Enter Code</label>
              <div className="relative">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                <input 
                  type="text" 
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-4 focus:border-gold outline-none transition-all text-white tracking-[0.5em] text-center font-bold text-xl"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isVerifying}
              className="w-full py-4 bg-gold text-black font-bold uppercase tracking-widest rounded-xl hover:bg-gold-light transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isVerifying ? <RefreshCw className="animate-spin" size={20} /> : 'Verify & Update Credentials'}
            </button>

            <button 
              type="button"
              onClick={handleResendOtp}
              disabled={resendCooldown > 0 || isVerifying}
              className="w-full text-center text-[10px] text-white/40 uppercase tracking-widest hover:text-gold transition-colors disabled:opacity-50"
            >
              {resendCooldown > 0 ? `Resend Code in ${resendCooldown}s` : "Didn't receive code? Resend OTP"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AccountSettings;
