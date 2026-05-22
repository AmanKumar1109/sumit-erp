import React, { useState } from 'react';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase.js';
import { GraduationCap, LogIn, Lock, Mail, AlertCircle, ArrowLeft, Send, CheckCircle2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // App.jsx auth listener will handle the redirect
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Invalid email or password.');
      } else {
        setError('Failed to log in. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address first.');
      return;
    }
    
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccessMsg('Password reset link has been sent to your email. Please check your inbox.');
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/user-not-found') {
        setError('No account found with this email address.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else {
        setError('Failed to send reset email. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] flex items-center justify-center p-4 selection:bg-indigo-600/40 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md z-10 animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex bg-indigo-600/20 p-4 rounded-3xl border border-indigo-500/30 mb-4 shadow-[0_0_40px_rgba(79,70,229,0.15)]">
            <GraduationCap className="h-12 w-12 text-indigo-400" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            SUMIT ERP
          </h1>
          <p className="text-slate-400 font-medium mt-2 tracking-wide text-sm uppercase">Tuition Hub Portal</p>
        </div>

        <div className="glass-panel p-8 rounded-3xl border border-slate-800 shadow-2xl backdrop-blur-2xl bg-[#090d16]/80 relative overflow-hidden transition-all duration-500">
          
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            {isForgotPassword ? 'Reset Password' : 'Welcome Back'}
          </h2>

          {error && (
            <div className="mb-6 bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-3 rounded-xl text-sm flex items-center gap-2 font-medium animate-fade-in">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {successMsg && (
            <div className="mb-6 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-xl text-sm flex items-center gap-2 font-medium animate-fade-in">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              {successMsg}
            </div>
          )}

          {!isForgotPassword ? (
            // --- LOGIN FORM ---
            <form onSubmit={handleLogin} className="space-y-5 animate-fade-in">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 h-5 w-5 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full bg-slate-900/60 border border-slate-800 focus:border-indigo-500 text-slate-200 text-sm pl-11 pr-4 py-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/15 transition-all duration-300 placeholder:text-slate-600"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-xs font-semibold text-slate-300">Password</label>
                  <button 
                    type="button" 
                    onClick={() => { setIsForgotPassword(true); setError(''); setSuccessMsg(''); }}
                    className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 h-5 w-5 text-slate-500" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full bg-slate-900/60 border border-slate-800 focus:border-indigo-500 text-slate-200 text-sm pl-11 pr-4 py-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/15 transition-all duration-300 placeholder:text-slate-600"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-5 py-4 mt-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-lg shadow-indigo-900/40 disabled:opacity-50 transition-all duration-300 hover:scale-[1.02] active:scale-95 cursor-pointer"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <LogIn className="h-5 w-5" />
                    Sign In to Dashboard
                  </>
                )}
              </button>
            </form>
          ) : (
            // --- FORGOT PASSWORD FORM ---
            <form onSubmit={handleResetPassword} className="space-y-5 animate-fade-in">
              <p className="text-sm text-slate-400 text-center mb-6">
                Enter your registered email address and we'll send you a link to reset your password.
              </p>
              
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 h-5 w-5 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full bg-slate-900/60 border border-slate-800 focus:border-indigo-500 text-slate-200 text-sm pl-11 pr-4 py-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/15 transition-all duration-300 placeholder:text-slate-600"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-5 py-4 mt-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-lg shadow-indigo-900/40 disabled:opacity-50 transition-all duration-300 hover:scale-[1.02] active:scale-95 cursor-pointer"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Send Reset Link
                  </>
                )}
              </button>

              <button 
                type="button" 
                onClick={() => { setIsForgotPassword(false); setError(''); setSuccessMsg(''); }}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 mt-2 rounded-xl bg-slate-800/50 hover:bg-slate-800 text-slate-300 font-bold text-sm transition-all duration-300"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Login
              </button>
            </form>
          )}

        </div>
        
        <p className="text-center text-xs text-slate-500 mt-8 font-medium">
          Secure Access Portal &bull; Admins & Students
        </p>
      </div>
    </div>
  );
}
