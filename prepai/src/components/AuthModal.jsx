import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Briefcase,
  Building2,
  RefreshCw,
} from 'lucide-react';
import { login, register, loginAsGuest, socialLogin, requestPasswordReset, resetPassword } from '../utils/authService';

export default function AuthModal({ isOpen, onClose, initialMode = 'login', onAuthSuccess }) {
  const [mode, setMode] = useState(initialMode); // 'login' | 'register' | 'forgot'
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [targetRole, setTargetRole] = useState('Senior Full Stack Engineer');
  const [targetCompany, setTargetCompany] = useState('Google / Meta');
  const [rememberMe, setRememberMe] = useState(true);

  // Forgot Password Flow
  const [resetStep, setResetStep] = useState(1); // 1: Request Code | 2: Enter Code & New Pass
  const [simulationCode, setSimulationCode] = useState('');
  const [enteredCode, setEnteredCode] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // UI Feedback States
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Password Strength Meter
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: '', color: 'bg-transparent' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[A-Z]/.test(pass) && /[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score === 1) return { score: 25, label: 'Weak', color: 'bg-red-500' };
    if (score === 2) return { score: 50, label: 'Fair', color: 'bg-yellow-500' };
    if (score === 3) return { score: 75, label: 'Good', color: 'bg-blue-400' };
    return { score: 100, label: 'Strong', color: 'bg-green-400' };
  };

  const strength = getPasswordStrength(password);

  const resetForm = () => {
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const switchMode = (newMode) => {
    resetForm();
    setMode(newMode);
  };

  // Handle Login Submit
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const user = await login({ email, password, rememberMe });
      setSuccessMsg(`Welcome back, ${user.name}!`);
      setTimeout(() => {
        setIsLoading(false);
        if (onAuthSuccess) onAuthSuccess(user);
        onClose();
      }, 500);
    } catch (err) {
      setIsLoading(false);
      setErrorMsg(err.message);
    }
  };

  // Handle Registration Submit
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const user = await register({
        name,
        email,
        password,
        confirmPassword,
        targetRole,
        targetCompany,
        rememberMe,
      });
      setSuccessMsg(`Account created successfully! Welcome, ${user.name}.`);
      setTimeout(() => {
        setIsLoading(false);
        if (onAuthSuccess) onAuthSuccess(user);
        onClose();
      }, 600);
    } catch (err) {
      setIsLoading(false);
      setErrorMsg(err.message);
    }
  };

  // 1-Click Demo Login
  const handleDemoLogin = async (presetIdx = 0) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const user = await loginAsGuest(presetIdx);
      setSuccessMsg(`Logged in as Demo Engineer: ${user.name}`);
      setTimeout(() => {
        setIsLoading(false);
        if (onAuthSuccess) onAuthSuccess(user);
        onClose();
      }, 500);
    } catch (err) {
      setIsLoading(false);
      setErrorMsg(err.message);
    }
  };

  // Social Login
  const handleSocialLogin = async (provider) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const user = await socialLogin(provider);
      setSuccessMsg(`Authenticated via ${provider === 'google' ? 'Google' : 'GitHub'}!`);
      setTimeout(() => {
        setIsLoading(false);
        if (onAuthSuccess) onAuthSuccess(user);
        onClose();
      }, 500);
    } catch (err) {
      setIsLoading(false);
      setErrorMsg(err.message);
    }
  };

  // Forgot Password Step 1
  const handleRequestCode = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await requestPasswordReset(email);
      setSimulationCode(res.simulationCode);
      setSuccessMsg(`Security verification code generated: ${res.simulationCode}`);
      setResetStep(2);
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      setErrorMsg(err.message);
    }
  };

  // Forgot Password Step 2
  const handleConfirmReset = async (e) => {
    e.preventDefault();
    if (enteredCode.trim() !== simulationCode) {
      setErrorMsg('Invalid verification code. Please check the code above.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    try {
      await resetPassword(email, newPassword);
      setSuccessMsg('Password reset successful! You can now log in.');
      setTimeout(() => {
        setIsLoading(false);
        switchMode('login');
      }, 1000);
    } catch (err) {
      setIsLoading(false);
      setErrorMsg(err.message);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-md bg-[#121212] border border-white/10 rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden text-[#E1E0CC]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-white/10 bg-[#161616]">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                ⚡
              </span>
              <h3 className="text-sm font-semibold text-white">
                {mode === 'login' && 'Sign In to PrepAI'}
                {mode === 'register' && 'Create Candidate Account'}
                {mode === 'forgot' && 'Reset Secure Password'}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Feedback Banners */}
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-5 mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start gap-2"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </motion.div>
          )}

          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-5 mt-4 p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-300 text-xs flex items-start gap-2"
            >
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </motion.div>
          )}

          {/* Mode 1: Sign In */}
          {mode === 'login' && (
            <div className="p-6 space-y-4">
              {/* Quick Demo Login Pill */}
              <div className="p-3 bg-gradient-to-r from-primary/10 via-[#181818] to-[#141414] border border-primary/20 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-white block">1-Click Demo Profile</span>
                  <span className="text-[10px] text-gray-400">Alex Chen (Senior L5 @ Google candidate)</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleDemoLogin(0)}
                  disabled={isLoading}
                  className="px-3 py-1.5 bg-primary text-black font-semibold text-xs rounded-lg hover:bg-[#E1E0CC] transition-colors cursor-pointer disabled:opacity-50"
                >
                  Demo Login
                </button>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                <div>
                  <label className="text-[11px] text-gray-300 block mb-1 font-medium">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. demo@prepai.io"
                      required
                      className="w-full bg-[#181818] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] text-gray-300 font-medium">Password</label>
                    <button
                      type="button"
                      onClick={() => switchMode('forgot')}
                      className="text-[10px] text-primary hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                      className="w-full bg-[#181818] border border-white/10 rounded-xl pl-9 pr-10 py-2 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 text-gray-400 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded bg-[#181818] border-white/20 text-primary focus:ring-0 cursor-pointer"
                    />
                    <span>Remember me on this device</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 bg-primary hover:bg-[#E1E0CC] text-black font-semibold rounded-xl text-xs sm:text-sm transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>

              {/* Social Login Options */}
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase">
                  <span className="bg-[#121212] px-2 text-gray-500">Or continue with</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleSocialLogin('google')}
                  disabled={isLoading}
                  className="py-2 bg-[#181818] hover:bg-[#202020] border border-white/10 rounded-xl text-xs text-gray-200 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <span>Google</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSocialLogin('github')}
                  disabled={isLoading}
                  className="py-2 bg-[#181818] hover:bg-[#202020] border border-white/10 rounded-xl text-xs text-gray-200 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <span>GitHub</span>
                </button>
              </div>

              {/* Switch to Register */}
              <div className="text-center pt-2 text-xs text-gray-400">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('register')}
                  className="text-primary font-semibold hover:underline cursor-pointer"
                >
                  Sign Up Free
                </button>
              </div>
            </div>
          )}

          {/* Mode 2: Sign Up */}
          {mode === 'register' && (
            <div className="p-6 space-y-3.5 max-h-[75vh] overflow-y-auto">
              <form onSubmit={handleRegisterSubmit} className="space-y-3">
                <div>
                  <label className="text-[11px] text-gray-300 block mb-1 font-medium">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Jordan Miller"
                      required
                      className="w-full bg-[#181818] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-gray-300 block mb-1 font-medium">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. jordan@engineer.dev"
                      required
                      className="w-full bg-[#181818] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] text-gray-300 block mb-1 font-medium">Target Role</label>
                    <input
                      type="text"
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      placeholder="e.g. Senior Fullstack"
                      className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-gray-300 block mb-1 font-medium">Target Company</label>
                    <input
                      type="text"
                      value={targetCompany}
                      onChange={(e) => setTargetCompany(e.target.value)}
                      placeholder="e.g. Google / Meta"
                      className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-gray-300 block mb-1 font-medium">Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      required
                      className="w-full bg-[#181818] border border-white/10 rounded-xl pl-9 pr-10 py-2 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {/* Password Strength Indicator */}
                  {password && (
                    <div className="mt-1.5 space-y-1">
                      <div className="flex justify-between text-[10px] text-gray-400">
                        <span>Strength:</span>
                        <span className="font-semibold text-white">{strength.label}</span>
                      </div>
                      <div className="h-1 w-full bg-black rounded-full overflow-hidden">
                        <div
                          className={`h-full ${strength.color} transition-all duration-300`}
                          style={{ width: `${strength.score}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-[11px] text-gray-300 block mb-1 font-medium">Confirm Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      required
                      className="w-full bg-[#181818] border border-white/10 rounded-xl pl-9 pr-10 py-2 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 bg-primary hover:bg-[#E1E0CC] text-black font-semibold rounded-xl text-xs sm:text-sm transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 mt-2"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <span>Create Free Account</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>

              {/* Switch to Login */}
              <div className="text-center pt-2 text-xs text-gray-400">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="text-primary font-semibold hover:underline cursor-pointer"
                >
                  Sign In
                </button>
              </div>
            </div>
          )}

          {/* Mode 3: Forgot Password */}
          {mode === 'forgot' && (
            <div className="p-6 space-y-4">
              <p className="text-xs text-gray-400 leading-relaxed">
                Enter your registered account email. PrepAI will simulate verification and allow you to set a new password.
              </p>

              {resetStep === 1 ? (
                <form onSubmit={handleRequestCode} className="space-y-3.5">
                  <div>
                    <label className="text-[11px] text-gray-300 block mb-1 font-medium">Registered Email</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. demo@prepai.io"
                        required
                        className="w-full bg-[#181818] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 bg-primary hover:bg-[#E1E0CC] text-black font-semibold rounded-xl text-xs sm:text-sm transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                  >
                    {isLoading ? 'Generating Code...' : 'Send Verification Code'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleConfirmReset} className="space-y-3.5">
                  <div className="p-3 bg-primary/10 border border-primary/20 rounded-xl text-xs text-primary font-mono text-center">
                    Security Code: <strong>{simulationCode}</strong>
                  </div>

                  <div>
                    <label className="text-[11px] text-gray-300 block mb-1 font-medium">Enter 6-Digit Code</label>
                    <input
                      type="text"
                      value={enteredCode}
                      onChange={(e) => setEnteredCode(e.target.value)}
                      placeholder="e.g. 123456"
                      required
                      className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-xs sm:text-sm text-white font-mono text-center tracking-widest focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-gray-300 block mb-1 font-medium">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password (min 6 chars)"
                      required
                      className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-primary"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 bg-primary hover:bg-[#E1E0CC] text-black font-semibold rounded-xl text-xs sm:text-sm transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                  >
                    {isLoading ? 'Updating Password...' : 'Reset & Save Password'}
                  </button>
                </form>
              )}

              <div className="text-center pt-2 text-xs text-gray-400">
                Remember your credentials?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="text-primary font-semibold hover:underline cursor-pointer"
                >
                  Back to Sign In
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
