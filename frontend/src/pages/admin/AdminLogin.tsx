import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Lock, Film, AlertCircle, Mail, Key, CheckCircle2, ArrowLeft, RefreshCw } from 'lucide-react';
import { useApp } from '../../AppContext';

type LoginStep = 'LOGIN' | 'VERIFY_OTP' | 'FORGOT_PASSWORD_EMAIL' | 'FORGOT_PASSWORD_RESET';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');
  const [step, setStep] = useState<LoginStep>('LOGIN');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [loginCountdown, setLoginCountdown] = useState(0);
  const [otpCountdown, setOtpCountdown] = useState(0);
  
  const { isAdmin, setIsAdmin } = useApp();
  const navigate = useNavigate();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (loginCountdown > 0) {
      timer = setInterval(() => {
        setLoginCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [loginCountdown]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (otpCountdown > 0) {
      timer = setInterval(() => {
        setOtpCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [otpCountdown]);

  if (isAdmin) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('https://ashu-portfolio-backend-vgnp.onrender.com//api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setStep('VERIFY_OTP');
        setSuccess('OTP sent to your email. Please check your inbox.');
        setOtpCountdown(300); // 5 minutes
      } else if (response.status === 429) {
        const retryAfter = parseInt(response.headers.get('Retry-After') || '900');
        setLoginCountdown(retryAfter);
        setError(`Too many attempts. Try again in ${formatTime(retryAfter)}`);
      } else {
        let msg = data.message || 'Invalid email or password';
        if (data.details && data.details.includes('535-5.7.8')) {
          msg = 'SMTP Authentication Error: If using Gmail, please use an "App Password" instead of your regular password. Ensure 2-Step Verification is enabled in your Google Account.';
        }
        setError(msg);
      }
    } catch (err) {
      setError('Failed to connect to server. Please ensure the backend is running.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('https://ashu-portfolio-backend-vgnp.onrender.com//api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsAdmin(true);
        localStorage.setItem('bandhan_isAdmin', 'true');
        navigate('/admin/dashboard');
      } else {
        setError(data.message || 'Invalid OTP');
      }
    } catch (err) {
      setError('Failed to verify OTP');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    const endpoint = (step === 'VERIFY_OTP') ? '/api/auth/resend-otp' : '/api/auth/forgot-password';
    const payload = (step === 'VERIFY_OTP') ? { email } : { email: forgotEmail };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('New OTP sent successfully');
        setResendCooldown(30);
        setOtpCountdown(300); // Reset countdown to 5 minutes
      } else {
        let msg = data.message || 'Failed to resend OTP';
        if (data.details && data.details.includes('535-5.7.8')) {
          msg = 'SMTP Authentication Error: If using Gmail, please use an "App Password" instead of your regular password. Ensure 2-Step Verification is enabled in your Google Account.';
        }
        setError(msg);
      }
    } catch (err) {
      setError('Failed to resend OTP');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('https://ashu-portfolio-backend-vgnp.onrender.com//api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      });

      const data = await response.json();

      if (response.ok) {
        setStep('FORGOT_PASSWORD_RESET');
        setSuccess('Verification code sent to your email.');
        setOtpCountdown(300); // 5 minutes
      } else {
        let msg = data.message || 'Failed to send verification code';
        if (data.details && data.details.includes('535-5.7.8')) {
          msg = 'SMTP Authentication Error: If using Gmail, please use an "App Password" instead of your regular password. Ensure 2-Step Verification is enabled in your Google Account.';
        }
        setError(msg);
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('https://ashu-portfolio-backend-vgnp.onrender.com//api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail, otp, newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        setStep('LOGIN');
        setSuccess('Password reset successfully. Please login with your new password.');
        setOtp('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setError(data.message || 'Failed to reset password');
      }
    } catch (err) {
      setError('Failed to reset password');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-12 animate-fade-in">
          <Film className="text-gold mx-auto mb-4" size={48} />
          <h1 className="text-3xl font-serif font-bold gold-text-gradient">BANDHAN FILMS</h1>
          <p className="text-white/40 text-sm uppercase tracking-widest mt-2">Admin Portal</p>
        </div>

        <div className="bg-zinc-950 border border-white/10 p-10 shadow-2xl relative overflow-hidden rounded-2xl">
          <div className="absolute top-0 left-0 w-full h-1 bg-gold" />
          
          {step === 'LOGIN' && (
            <form onSubmit={handleLogin} className="space-y-6 animate-fade-in">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-white/60">Admin Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                    <input 
                      type="email" 
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter admin email"
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-4 focus:border-gold outline-none transition-all text-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs uppercase tracking-widest text-white/60">Password</label>
                    <button 
                      type="button"
                      onClick={() => {
                        setStep('FORGOT_PASSWORD_EMAIL');
                        setError(null);
                        setSuccess(null);
                      }}
                      className="text-[10px] uppercase tracking-widest text-gold hover:text-gold-light transition-colors"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                    <input 
                      type="password" 
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-4 focus:border-gold outline-none transition-all text-white"
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-400 text-sm bg-red-400/10 p-4 border border-red-400/20 rounded-xl animate-shake">
                  <AlertCircle size={16} />
                  <span>{loginCountdown > 0 ? `Too many attempts. Try again in ${formatTime(loginCountdown)}` : error}</span>
                </div>
              )}

              <button 
                type="submit"
                disabled={isSubmitting || loginCountdown > 0}
                className="w-full py-4 bg-gold text-black font-bold uppercase tracking-widest rounded-xl hover:bg-gold-light transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? <RefreshCw className="animate-spin" size={20} /> : 'Login to Dashboard'}
              </button>
            </form>
          )}

          {step === 'FORGOT_PASSWORD_EMAIL' && (
            <form onSubmit={handleForgotPassword} className="space-y-6 animate-fade-in">
              <div className="space-y-4">
                <button 
                  type="button"
                  onClick={() => setStep('LOGIN')}
                  className="flex items-center gap-2 text-white/40 hover:text-white transition-colors text-xs uppercase tracking-widest mb-4"
                >
                  <ArrowLeft size={14} /> Back to Login
                </button>
                <h2 className="text-xl font-serif font-bold text-white">Forgot Password</h2>
                <p className="text-white/40 text-sm">Enter your registered admin email to receive a password reset code.</p>
                
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-white/60">Admin Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                    <input 
                      type="email" 
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="Enter registered email"
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-4 focus:border-gold outline-none transition-all text-white"
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-400 text-sm bg-red-400/10 p-4 border border-red-400/20 rounded-xl animate-shake">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-gold text-black font-bold uppercase tracking-widest rounded-xl hover:bg-gold-light transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? <RefreshCw className="animate-spin" size={20} /> : 'Send Reset Code'}
              </button>
            </form>
          )}

          {step === 'FORGOT_PASSWORD_RESET' && (
            <form onSubmit={handleResetPassword} className="space-y-6 animate-fade-in">
              <div className="space-y-4">
                <button 
                  type="button"
                  onClick={() => setStep('FORGOT_PASSWORD_EMAIL')}
                  className="flex items-center gap-2 text-white/40 hover:text-white transition-colors text-xs uppercase tracking-widest mb-4"
                >
                  <ArrowLeft size={14} /> Back
                </button>
                <h2 className="text-xl font-serif font-bold text-white">Reset Password</h2>
                <p className="text-white/40 text-sm">Enter the code sent to <span className="text-white">{forgotEmail}</span> and set your new password.</p>
                
                {otpCountdown > 0 ? (
                  <p className="text-gold text-[10px] uppercase tracking-widest">OTP expires in {formatTime(otpCountdown)}</p>
                ) : (
                  <p className="text-red-400 text-[10px] uppercase tracking-widest">OTP expired. Please request a new one.</p>
                )}
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-white/60">Verification Code</label>
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

                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-white/60">New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                      <input 
                        type="password" 
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-4 focus:border-gold outline-none transition-all text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-white/60">Confirm New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                      <input 
                        type="password" 
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-4 focus:border-gold outline-none transition-all text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-400 text-sm bg-red-400/10 p-4 border border-red-400/20 rounded-xl animate-shake">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="flex items-center gap-2 text-green-400 text-sm bg-green-400/10 p-4 border border-green-400/20 rounded-xl">
                  <CheckCircle2 size={16} />
                  <span>{success}</span>
                </div>
              )}

              <button 
                type="submit"
                disabled={isSubmitting || otpCountdown === 0}
                className="w-full py-4 bg-gold text-black font-bold uppercase tracking-widest rounded-xl hover:bg-gold-light transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? <RefreshCw className="animate-spin" size={20} /> : 'Reset Password'}
              </button>

              <button 
                type="button"
                onClick={handleResendOtp}
                disabled={resendCooldown > 0 || isSubmitting}
                className="w-full text-center text-[10px] text-white/40 uppercase tracking-widest hover:text-gold transition-colors disabled:opacity-50"
              >
                {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : "Didn't receive code? Resend OTP"}
              </button>
            </form>
          )}
          {step === 'VERIFY_OTP' && (
            <form onSubmit={handleVerifyOtp} className="space-y-6 animate-fade-in">
              <div className="space-y-4">
                <button 
                  type="button"
                  onClick={() => setStep('LOGIN')}
                  className="flex items-center gap-2 text-white/40 hover:text-white transition-colors text-xs uppercase tracking-widest mb-4"
                >
                  <ArrowLeft size={14} /> Back to Login
                </button>
                <h2 className="text-xl font-serif font-bold text-white">Verify OTP</h2>
                <p className="text-white/40 text-sm">We've sent a 6-digit code to <span className="text-white">{email}</span>.</p>
                
                {otpCountdown > 0 ? (
                  <p className="text-gold text-[10px] uppercase tracking-widest">OTP expires in {formatTime(otpCountdown)}</p>
                ) : (
                  <p className="text-red-400 text-[10px] uppercase tracking-widest">OTP expired. Please request a new one.</p>
                )}
                
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-white/60">Verification Code</label>
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
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-400 text-sm bg-red-400/10 p-4 border border-red-400/20 rounded-xl animate-shake">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="flex items-center gap-2 text-green-400 text-sm bg-green-400/10 p-4 border border-green-400/20 rounded-xl">
                  <CheckCircle2 size={16} />
                  <span>{success}</span>
                </div>
              )}

              <button 
                type="submit"
                disabled={isSubmitting || otpCountdown === 0}
                className="w-full py-4 bg-gold text-black font-bold uppercase tracking-widest rounded-xl hover:bg-gold-light transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? <RefreshCw className="animate-spin" size={20} /> : 'Verify & Access'}
              </button>

              <button 
                type="button"
                onClick={handleResendOtp}
                disabled={resendCooldown > 0 || isSubmitting}
                className="w-full text-center text-[10px] text-white/40 uppercase tracking-widest hover:text-gold transition-colors disabled:opacity-50"
              >
                {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : "Didn't receive code? Resend OTP"}
              </button>
            </form>
          )}
          
          <p className="text-center text-[10px] text-white/20 mt-8 uppercase tracking-widest">
            Cinematic Security Powered by Bandhan Films
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
