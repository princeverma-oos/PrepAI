import React, { useState, useRef, useEffect } from 'react';
import { User, LogOut, Sparkles, ChevronDown, Award, Briefcase, RefreshCw, Shield, ShieldCheck } from 'lucide-react';
import { getCurrentUser, logout, loginAsGuest, loginAsAdmin } from '../utils/authService';

export default function UserMenu({ onOpenAuth, onOpenReports, onOpenAdmin }) {
  const [currentUser, setCurrentUser] = useState(getCurrentUser());
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const checkUser = () => setCurrentUser(getCurrentUser());
    window.addEventListener('storage', checkUser);
    return () => window.removeEventListener('storage', checkUser);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleLogout = () => {
    logout();
    setCurrentUser(null);
    setIsOpen(false);
  };

  const handleSwitchToOtherDemo = async () => {
    const isAlex = currentUser?.email === 'demo@prepai.io';
    const user = await loginAsGuest(isAlex ? 1 : 0);
    setCurrentUser(user);
    setIsOpen(false);
  };

  const handleSwitchToAdmin = async () => {
    const adminUser = await loginAsAdmin();
    setCurrentUser(adminUser);
    setIsOpen(false);
  };

  if (!currentUser) {
    return (
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onOpenAuth && onOpenAuth('login')}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 hover:bg-primary hover:text-black text-xs font-semibold text-[#E1E0CC] transition-all cursor-pointer border border-white/10"
        >
          <User className="w-3.5 h-3.5" />
          <span>Sign In</span>
        </button>
        {onOpenAdmin && (
          <button
            onClick={() => onOpenAdmin()}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/15 hover:bg-amber-400 hover:text-black text-xs font-medium text-amber-300 transition-all cursor-pointer border border-amber-500/30"
            title="Open Admin Portal"
          >
            <Shield className="w-3 h-3 text-amber-400" />
            <span className="hidden sm:inline">Admin</span>
          </button>
        )}
      </div>
    );
  }

  const initials = currentUser.name
    ? currentUser.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2)
    : 'U';

  const isAdmin = currentUser.role === 'admin';

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-2.5 py-1 rounded-full bg-black/60 hover:bg-black/90 border ${
          isAdmin ? 'border-amber-400/50 shadow-[0_0_12px_rgba(251,191,36,0.2)]' : 'border-white/20'
        } text-xs text-white transition-all cursor-pointer`}
      >
        {currentUser.avatarUrl ? (
          <img
            src={currentUser.avatarUrl}
            alt={currentUser.name}
            className="w-5 h-5 rounded-full object-cover"
          />
        ) : (
          <span className={`w-5 h-5 rounded-full ${isAdmin ? 'bg-amber-400 text-black font-black' : 'bg-primary text-black font-bold'} text-[10px] flex items-center justify-center`}>
            {initials}
          </span>
        )}
        <span className="font-medium max-w-[90px] sm:max-w-[120px] truncate">{currentUser.name}</span>
        {isAdmin && (
          <span className="px-1.5 py-0.2 text-[9px] font-bold rounded bg-amber-400/20 text-amber-300 border border-amber-400/40 uppercase tracking-wider">
            Admin
          </span>
        )}
        <ChevronDown className="w-3 h-3 text-gray-400" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-[#161616] border border-white/15 rounded-2xl shadow-2xl p-2 z-50 text-xs text-[#E1E0CC] space-y-1">
          {/* User Info Header */}
          <div className="p-3 bg-[#1F1F1F] rounded-xl space-y-1 border border-white/5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white truncate">{currentUser.name}</span>
              {isAdmin ? (
                <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-amber-400/20 text-amber-300 border border-amber-400/40">
                  ADMIN
                </span>
              ) : (
                <span className="px-1.5 py-0.5 text-[9px] font-semibold rounded bg-white/10 text-gray-300">
                  CANDIDATE
                </span>
              )}
            </div>
            <div className="text-[11px] text-gray-400 truncate">{currentUser.email}</div>
            <div className="text-[10px] text-primary flex items-center gap-1 pt-1 font-mono">
              <Briefcase className="w-3 h-3" />
              <span className="truncate">{currentUser.targetRole}</span>
            </div>
          </div>

          {/* Admin Management Quick Action */}
          {onOpenAdmin && (
            <button
              onClick={() => {
                setIsOpen(false);
                onOpenAdmin();
              }}
              className="w-full p-2.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 rounded-lg flex items-center gap-2 text-left cursor-pointer transition-colors text-amber-300 font-medium"
            >
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span>Admin Console & User Progress</span>
            </button>
          )}

          {/* Quick Actions */}
          {onOpenReports && (
            <button
              onClick={() => {
                setIsOpen(false);
                onOpenReports();
              }}
              className="w-full p-2.5 hover:bg-white/5 rounded-lg flex items-center gap-2 text-left cursor-pointer transition-colors text-gray-200"
            >
              <Award className="w-3.5 h-3.5 text-primary" />
              <span>View Candidate Performance Report</span>
            </button>
          )}

          <button
            onClick={handleSwitchToOtherDemo}
            className="w-full p-2.5 hover:bg-white/5 rounded-lg flex items-center gap-2 text-left cursor-pointer transition-colors text-gray-200"
          >
            <RefreshCw className="w-3.5 h-3.5 text-primary" />
            <span>Switch Profile (Alex / Sarah)</span>
          </button>

          {!isAdmin && (
            <button
              onClick={handleSwitchToAdmin}
              className="w-full p-2.5 hover:bg-amber-400/10 rounded-lg flex items-center gap-2 text-left cursor-pointer transition-colors text-amber-300/90"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Switch to Master Admin (1-Click)</span>
            </button>
          )}

          <div className="border-t border-white/10 my-1" />

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full p-2.5 hover:bg-red-500/10 text-red-400 rounded-lg flex items-center gap-2 text-left cursor-pointer transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </div>
  );
}
