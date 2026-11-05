import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Shield,
  Users,
  UserCheck,
  UserX,
  UserPlus,
  Search,
  Edit2,
  Trash2,
  Key,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  RefreshCw,
  Award,
  TrendingUp,
  Layers,
  Clock,
  Briefcase,
  Eye,
  Check,
  Lock,
  Mail,
  Building,
  User,
  ShieldCheck,
} from 'lucide-react';
import {
  getAllUsersWithProgress,
  createAdminUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
  toggleUserRole,
  adminResetPassword,
  getPlatformOverviewStats,
  getCurrentUser,
  verifyAdminCredentials,
} from '../utils/authService';

export default function AdminModal({ isOpen, onClose, onLaunchMock }) {
  const [currentAdmin, setCurrentAdmin] = useState(getCurrentUser());
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const isAuthorized = currentAdmin && currentAdmin.role === 'admin';

  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'progress'
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all'); // 'all' | 'candidate' | 'admin'
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'suspended'
  const [selectedUser, setSelectedUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Form Modals State
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [resettingUser, setResettingUser] = useState(null);
  const [newPasswordInput, setNewPasswordInput] = useState('password123');

  // New / Edit User Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: 'password123',
    role: 'candidate',
    status: 'active',
    targetRole: 'Senior Full Stack Engineer',
    targetCompany: 'Google (L5)',
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const allUsers = await getAllUsersWithProgress();
      const overviewStats = await getPlatformOverviewStats();
      setUsers(allUsers);
      setStats(overviewStats);

      // Default select the first candidate for progress tab if none selected
      if (!selectedUser && allUsers.length > 0) {
        const firstCandidate = allUsers.find((u) => u.role === 'candidate') || allUsers[0];
        setSelectedUser(firstCandidate);
      } else if (selectedUser) {
        // Refresh selected user reference
        const updatedSelected = allUsers.find((u) => u.id === selectedUser.id);
        if (updatedSelected) setSelectedUser(updatedSelected);
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      const user = getCurrentUser();
      setCurrentAdmin(user);
      if (user && user.role === 'admin') {
        loadData();
      }
    }
  }, [isOpen]);

  const handleAdminLogin = async (e) => {
    if (e) e.preventDefault();
    setLoginError('');
    setIsAuthenticating(true);

    try {
      const session = await verifyAdminCredentials(adminUsername, adminPassword);
      setCurrentAdmin(session);
      showFeedback(`Administrator access granted. Welcome, ${session.name}!`);
      await loadData();
    } catch (err) {
      setLoginError(err.message || 'Invalid administrator credentials.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleLockAdmin = () => {
    setCurrentAdmin(null);
    setAdminUsername('');
    setAdminPassword('');
    setLoginError('');
    showFeedback('Administrator console locked.', 'info');
  };

  const showFeedback = (text, type = 'success') => {
    setFeedback({ text, type });
    setTimeout(() => setFeedback(null), 4000);
  };

  // Filter users
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.targetRole && u.targetRole.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (u.targetCompany && u.targetCompany.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Handle Create User
  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await createAdminUser(formData);
      setIsAddUserOpen(false);
      setFormData({
        name: '',
        email: '',
        password: 'password123',
        role: 'candidate',
        status: 'active',
        targetRole: 'Senior Full Stack Engineer',
        targetCompany: 'Google (L5)',
      });
      await loadData();
      showFeedback('User successfully created and initialized.');
    } catch (err) {
      alert('Error creating user: ' + err.message);
    }
  };

  // Handle Edit User
  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      await updateUser(editingUser.id, {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        status: formData.status,
        targetRole: formData.targetRole,
        targetCompany: formData.targetCompany,
      });
      setEditingUser(null);
      await loadData();
      showFeedback('User details updated successfully.');
    } catch (err) {
      alert('Error updating user: ' + err.message);
    }
  };

  // Handle Delete User
  const handleDeleteUser = async (user) => {
    if (window.confirm(`Are you sure you want to delete user "${user.name}" (${user.email})?`)) {
      try {
        await deleteUser(user.id);
        if (selectedUser?.id === user.id) setSelectedUser(null);
        await loadData();
        showFeedback(`User ${user.name} removed from platform.`);
      } catch (err) {
        alert('Error deleting user: ' + err.message);
      }
    }
  };

  // Handle Status Toggle
  const handleToggleStatus = async (user) => {
    try {
      const updated = await toggleUserStatus(user.id);
      await loadData();
      showFeedback(
        `User ${user.name} status set to ${updated.status.toUpperCase()}.`,
        updated.status === 'active' ? 'success' : 'warning'
      );
    } catch (err) {
      alert('Error updating status: ' + err.message);
    }
  };

  // Handle Role Toggle
  const handleToggleRole = async (user) => {
    try {
      const updated = await toggleUserRole(user.id);
      await loadData();
      showFeedback(`User ${user.name} role changed to ${updated.role.toUpperCase()}.`);
    } catch (err) {
      alert('Error updating role: ' + err.message);
    }
  };

  // Handle Reset Password
  const handleAdminResetPassword = async () => {
    if (!resettingUser) return;
    try {
      await adminResetPassword(resettingUser.id, newPasswordInput);
      setResettingUser(null);
      showFeedback(`Password updated for ${resettingUser.email}.`);
    } catch (err) {
      alert('Error resetting password: ' + err.message);
    }
  };

  const openEditModal = (u) => {
    setEditingUser(u);
    setFormData({
      name: u.name,
      email: u.email,
      password: '',
      role: u.role || 'candidate',
      status: u.status || 'active',
      targetRole: u.targetRole || 'Software Engineer',
      targetCompany: u.targetCompany || 'Tier-1 Tech',
    });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-7xl h-[94vh] bg-[#101010] border border-white/10 rounded-2xl md:rounded-3xl shadow-2xl flex flex-col overflow-hidden text-[#E1E0CC]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-white/10 bg-[#141414]">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                PrepAI Enterprise Administration
              </span>

              {isAuthorized ? (
                /* View Switcher Tabs */
                <div className="flex items-center bg-black/40 border border-white/10 rounded-lg p-0.5">
                  <button
                    onClick={() => setActiveTab('users')}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeTab === 'users'
                        ? 'bg-primary text-black font-semibold shadow-sm'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>User Directory & Access ({users.length})</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('progress')}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeTab === 'progress'
                        ? 'bg-primary text-black font-semibold shadow-sm'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>Candidate Progress & Telemetry</span>
                  </button>
                </div>
              ) : (
                <span className="text-xs text-gray-400 hidden sm:inline">
                  Restricted Access • Security Protocol v3.2
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {isAuthorized && (
                <>
                  <span className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] font-medium">
                    <ShieldCheck className="w-3 h-3 text-amber-400" />
                    <span>Admin: {currentAdmin?.name || 'Master Admin'}</span>
                  </span>
                  <button
                    onClick={handleLockAdmin}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs text-gray-400 hover:text-amber-300 hover:bg-white/5 rounded-lg border border-white/10 transition-colors cursor-pointer"
                    title="Lock Admin Console & require credentials"
                  >
                    <Lock className="w-3 h-3" />
                    <span className="hidden sm:inline">Lock Console</span>
                  </button>
                  <button
                    onClick={loadData}
                    disabled={isLoading}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
                    title="Refresh Platform Data"
                  >
                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-primary' : ''}`} />
                  </button>
                </>
              )}
              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
                aria-label="Close admin modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Feedback Toast Banner */}
          {feedback && (
            <div
              className={`px-6 py-2 text-xs font-medium flex items-center justify-between border-b ${
                feedback.type === 'success'
                  ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/20'
                  : 'bg-amber-950/40 text-amber-300 border-amber-500/20'
              }`}
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{feedback.text}</span>
              </div>
              <button onClick={() => setFeedback(null)} className="text-gray-400 hover:text-white">
                ✕
              </button>
            </div>
          )}

          {!isAuthorized ? (
            /* Admin Access Gate Screen */
            <div className="flex-1 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-gradient-to-b from-[#101010] to-[#0a0a0a]">
              <div className="max-w-md w-full bg-[#151515] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl relative">
                <div className="text-center mb-6">
                  <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mb-3 shadow-[0_0_25px_rgba(251,191,36,0.15)]">
                    <Shield className="w-8 h-8" />
                    <span className="absolute -bottom-1 -right-1 p-1 bg-amber-400 text-black rounded-full">
                      <Lock className="w-3.5 h-3.5" />
                    </span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                    Administrator Authorization
                  </h2>
                  <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
                    Access restricted to system administrators. Enter credentials to unlock candidate management and progress oversight.
                  </p>
                </div>

                {loginError && (
                  <div className="mb-4 p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <span>{loginError}</span>
                  </div>
                )}

                <form onSubmit={handleAdminLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1.5">
                      Admin Username or Email
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={adminUsername}
                        onChange={(e) => {
                          setAdminUsername(e.target.value);
                          setLoginError('');
                        }}
                        placeholder="Enter admin username or email"
                        className="w-full bg-[#1F1F1F] border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400/50 transition-colors font-mono"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1.5">
                      Admin Password
                    </label>
                    <div className="relative">
                      <Key className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        value={adminPassword}
                        onChange={(e) => {
                          setAdminPassword(e.target.value);
                          setLoginError('');
                        }}
                        placeholder="Enter admin password"
                        className="w-full bg-[#1F1F1F] border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400/50 transition-colors font-mono"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isAuthenticating}
                    className="w-full py-2.5 px-4 bg-amber-400 hover:bg-amber-300 text-black font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-amber-400/20 disabled:opacity-50"
                  >
                    {isAuthenticating ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <ShieldCheck className="w-4 h-4" />
                    )}
                    <span>Unlock Admin Console</span>
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <>
              {/* Executive Platform KPI Summary Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 px-6 py-3 bg-[#121212] border-b border-white/5">
                <div className="bg-[#181818] p-3 rounded-xl border border-white/5 flex items-center justify-between">
                  <div>
                <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Total Users</span>
                <span className="text-lg font-bold text-white">{stats?.totalUsers || users.length}</span>
                <span className="text-[10px] text-gray-500 block">
                  {stats?.candidateCount || 0} Candidates · {stats?.adminCount || 0} Admins
                </span>
              </div>
              <Users className="w-6 h-6 text-primary opacity-60" />
            </div>

            <div className="bg-[#181818] p-3 rounded-xl border border-white/5 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Active Roadmaps</span>
                <span className="text-lg font-bold text-emerald-400">{stats?.avgRoadmapCompletion || 68}%</span>
                <span className="text-[10px] text-gray-500 block">Avg. Curriculum Progress</span>
              </div>
              <Layers className="w-6 h-6 text-emerald-400 opacity-60" />
            </div>

            <div className="bg-[#181818] p-3 rounded-xl border border-white/5 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Mock Tests Evaluated</span>
                <span className="text-lg font-bold text-cyan-400">{stats?.totalTestsTaken || 15}</span>
                <span className="text-[10px] text-gray-500 block">Code Sandbox Submissions</span>
              </div>
              <BarChart3 className="w-6 h-6 text-cyan-400 opacity-60" />
            </div>

            <div className="bg-[#181818] p-3 rounded-xl border border-white/5 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Readiness Benchmark</span>
                <span className="text-lg font-bold text-primary">{stats?.platformAvgScore || 88}/100</span>
                <span className="text-[10px] text-emerald-400 block">{stats?.strongHireRate || 65}% Strong Hire Rate</span>
              </div>
              <Award className="w-6 h-6 text-primary opacity-60" />
            </div>
          </div>

          {/* TAB 1: User Directory & Access Management */}
          {activeTab === 'users' ? (
            <div className="flex-1 flex flex-col overflow-hidden p-6 space-y-4">
              {/* Controls Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#141414] p-3 rounded-2xl border border-white/5">
                <div className="flex items-center gap-3 flex-1 flex-wrap">
                  {/* Search */}
                  <div className="relative min-w-[240px] flex-1">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search users by name, email, role, or company..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-[#181818] border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                    />
                  </div>

                  {/* Role Filter */}
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="bg-[#181818] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-primary cursor-pointer"
                  >
                    <option value="all">All Roles</option>
                    <option value="candidate">Candidates</option>
                    <option value="admin">Administrators</option>
                  </select>

                  {/* Status Filter */}
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-[#181818] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-primary cursor-pointer"
                  >
                    <option value="all">All Statuses</option>
                    <option value="active">Active Only</option>
                    <option value="suspended">Suspended Only</option>
                  </select>
                </div>

                {/* Add User Button */}
                <button
                  onClick={() => setIsAddUserOpen(true)}
                  className="px-4 py-2 bg-primary hover:bg-[#E1E0CC] text-black text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-md flex-shrink-0"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>+ Create User</span>
                </button>
              </div>

              {/* Users Table */}
              <div className="flex-1 overflow-y-auto bg-[#141414] border border-white/10 rounded-2xl overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#181818] border-b border-white/10 text-gray-400 font-medium uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-4">User Details</th>
                      <th className="py-3 px-4">Target Track</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Curriculum Progress</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-gray-300">
                    {filteredUsers.map((u) => {
                      const isCurrentSession = getCurrentUser()?.id === u.id;
                      const progress = u.progress?.roadmap;
                      const assessments = u.progress?.assessments;

                      return (
                        <tr key={u.id} className="hover:bg-white/5 transition-colors">
                          {/* User Identity */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              {u.avatarUrl ? (
                                <img
                                  src={u.avatarUrl}
                                  alt={u.name}
                                  className="w-8 h-8 rounded-full object-cover border border-white/10 flex-shrink-0"
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-primary/20 text-primary border border-primary/30 flex items-center justify-center font-bold text-xs flex-shrink-0">
                                  {u.name.substring(0, 2).toUpperCase()}
                                </div>
                              )}
                              <div className="min-w-0">
                                <div className="font-semibold text-white truncate flex items-center gap-1.5">
                                  <span>{u.name}</span>
                                  {isCurrentSession && (
                                    <span className="text-[9px] px-1.5 py-0.2 bg-primary/20 text-primary rounded font-mono">
                                      You
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-gray-400 truncate">{u.email}</div>
                              </div>
                            </div>
                          </td>

                          {/* Target Track */}
                          <td className="py-3 px-4">
                            <div className="font-medium text-white truncate max-w-[200px]">{u.targetRole}</div>
                            <div className="text-[11px] text-gray-400 truncate max-w-[180px]">
                              {u.targetCompany}
                            </div>
                          </td>

                          {/* Role */}
                          <td className="py-3 px-4">
                            <button
                              onClick={() => handleToggleRole(u)}
                              title="Click to toggle Role"
                              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border cursor-pointer transition-all ${
                                u.role === 'admin'
                                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/30 hover:bg-purple-500/30'
                                  : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20 hover:bg-cyan-500/20'
                              }`}
                            >
                              {u.role === 'admin' ? '🛡️ Administrator' : 'Candidate'}
                            </button>
                          </td>

                          {/* Status */}
                          <td className="py-3 px-4">
                            <button
                              onClick={() => handleToggleStatus(u)}
                              title="Click to toggle Status"
                              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border cursor-pointer transition-all ${
                                u.status === 'active'
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                                  : 'bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20'
                              }`}
                            >
                              {u.status === 'active' ? '● Active' : '✕ Suspended'}
                            </button>
                          </td>

                          {/* Progress */}
                          <td className="py-3 px-4">
                            {u.role === 'candidate' ? (
                              <div className="space-y-1 max-w-[180px]">
                                <div className="flex items-center justify-between text-[11px]">
                                  <span className="text-gray-400">
                                    {progress?.completedTasks || 0}/{progress?.totalTasks || 0} Tasks
                                  </span>
                                  <span className="font-mono text-primary font-bold">
                                    {progress?.progressPercent || 0}%
                                  </span>
                                </div>
                                <div className="w-full h-1.5 bg-black rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-primary rounded-full"
                                    style={{ width: `${progress?.progressPercent || 0}%` }}
                                  />
                                </div>
                                <div className="text-[10px] text-gray-500">
                                  {assessments?.testsTaken || 0} Tests · Avg {assessments?.avgScore || 0}%
                                </div>
                              </div>
                            ) : (
                              <span className="text-[11px] text-gray-500 italic">Full Platform Access</span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {u.role === 'candidate' && (
                                <button
                                  onClick={() => {
                                    setSelectedUser(u);
                                    setActiveTab('progress');
                                  }}
                                  className="p-1.5 hover:bg-white/10 rounded-lg text-primary hover:text-white transition-colors cursor-pointer"
                                  title="Inspect Candidate Progress Dossier"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                              )}

                              <button
                                onClick={() => openEditModal(u)}
                                className="p-1.5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors cursor-pointer"
                                title="Edit Profile Details"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => {
                                  setResettingUser(u);
                                  setNewPasswordInput('password123');
                                }}
                                className="p-1.5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-amber-400 transition-colors cursor-pointer"
                                title="Reset User Password"
                              >
                                <Key className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => handleDeleteUser(u)}
                                className="p-1.5 hover:bg-red-500/10 rounded-lg text-gray-400 hover:text-red-400 transition-colors cursor-pointer"
                                title="Delete User"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}

                    {filteredUsers.length === 0 && (
                      <tr>
                        <td colSpan="6" className="text-center py-10 text-gray-500 text-xs">
                          No users found matching your search or filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* TAB 2: Candidate Progress & Telemetry Dossier */
            <div className="flex-1 grid grid-cols-12 overflow-hidden">
              {/* Left Candidate Selector Sidebar */}
              <div className="col-span-12 md:col-span-4 border-r border-white/10 bg-[#121212] overflow-y-auto divide-y divide-white/5">
                <div className="p-3 bg-[#161616] border-b border-white/10">
                  <span className="text-xs font-semibold text-white uppercase tracking-wider block">
                    Candidate Roster ({users.filter((u) => u.role === 'candidate').length})
                  </span>
                  <span className="text-[10px] text-gray-400">
                    Select a candidate to review detailed telemetry, code scores, and milestones
                  </span>
                </div>

                {users
                  .filter((u) => u.role === 'candidate')
                  .map((candidate) => {
                    const isSelected = selectedUser?.id === candidate.id;
                    const prog = candidate.progress?.roadmap;
                    const tests = candidate.progress?.assessments;

                    return (
                      <div
                        key={candidate.id}
                        onClick={() => setSelectedUser(candidate)}
                        className={`p-3.5 cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-primary/10 border-l-4 border-primary'
                            : 'hover:bg-white/5'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-xs font-semibold text-white truncate max-w-[180px]">
                            {candidate.name}
                          </h4>
                          <span
                            className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
                              candidate.status === 'active'
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'bg-red-500/20 text-red-300'
                            }`}
                          >
                            {candidate.status.toUpperCase()}
                          </span>
                        </div>

                        <div className="text-[11px] text-gray-400 truncate mb-2">
                          {candidate.targetRole}
                        </div>

                        {/* Progress bar */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[10px] text-gray-400">
                            <span>Curriculum Progress</span>
                            <span className="font-mono text-primary font-bold">
                              {prog?.progressPercent || 0}%
                            </span>
                          </div>
                          <div className="w-full h-1 bg-black rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full"
                              style={{ width: `${prog?.progressPercent || 0}%` }}
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-2 text-[10px] text-gray-500">
                          <span>{tests?.testsTaken || 0} Rounds Evaluated</span>
                          <span className="text-emerald-400 font-semibold">
                            {tests?.latestRecommendation || 'Hire'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>

              {/* Right Detailed Dossier */}
              {selectedUser ? (
                <div className="col-span-12 md:col-span-8 bg-[#101010] p-6 overflow-y-auto space-y-6">
                  {/* Candidate Dossier Header Card */}
                  <div className="p-5 bg-[#141414] border border-white/10 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      {selectedUser.avatarUrl ? (
                        <img
                          src={selectedUser.avatarUrl}
                          alt={selectedUser.name}
                          className="w-14 h-14 rounded-2xl object-cover border border-white/10"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-2xl bg-primary/20 text-primary border border-primary/30 flex items-center justify-center font-bold text-xl">
                          {selectedUser.name.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-bold text-white">{selectedUser.name}</h3>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                              selectedUser.status === 'active'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-red-500/20 text-red-300 border border-red-500/30'
                            }`}
                          >
                            {selectedUser.status === 'active' ? 'Active Candidate' : 'Suspended'}
                          </span>
                        </div>
                        <div className="text-xs text-gray-400">{selectedUser.email}</div>
                        <div className="text-xs text-primary font-mono mt-1 flex items-center gap-1.5">
                          <Briefcase className="w-3.5 h-3.5" />
                          <span>{selectedUser.targetRole} @ {selectedUser.targetCompany}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleStatus(selectedUser)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors border ${
                          selectedUser.status === 'active'
                            ? 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                        }`}
                      >
                        {selectedUser.status === 'active' ? 'Suspend Access' : 'Reactivate'}
                      </button>
                    </div>
                  </div>

                  {/* Roadmap Milestones & Phase Progress */}
                  <div className="p-5 bg-[#141414] border border-white/10 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-primary" />
                        <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
                          Curriculum Roadmap & Milestone Tracking
                        </h4>
                      </div>
                      <span className="text-xs px-2.5 py-0.5 rounded bg-primary/10 text-primary font-mono font-bold">
                        {selectedUser.progress?.roadmap?.status || 'Active'}
                      </span>
                    </div>

                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-300">
                          Current Focus: <strong>{selectedUser.progress?.roadmap?.lastPhase}</strong>
                        </span>
                        <span className="font-mono text-primary font-bold text-sm">
                          {selectedUser.progress?.roadmap?.progressPercent}% Complete
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-black rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary to-[#E1E0CC] rounded-full transition-all duration-500"
                          style={{ width: `${selectedUser.progress?.roadmap?.progressPercent}%` }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 pt-2 text-center text-xs">
                      <div className="bg-[#1A1A1A] p-2.5 rounded-xl border border-white/5">
                        <span className="text-[10px] text-gray-500 block">Duration</span>
                        <span className="font-bold text-white">
                          {selectedUser.progress?.roadmap?.daysAvailable} Days Total
                        </span>
                      </div>
                      <div className="bg-[#1A1A1A] p-2.5 rounded-xl border border-white/5">
                        <span className="text-[10px] text-gray-500 block">Milestones Done</span>
                        <span className="font-bold text-primary">
                          {selectedUser.progress?.roadmap?.completedTasks} / {selectedUser.progress?.roadmap?.totalTasks}
                        </span>
                      </div>
                      <div className="bg-[#1A1A1A] p-2.5 rounded-xl border border-white/5">
                        <span className="text-[10px] text-gray-500 block">Readiness</span>
                        <span className="font-bold text-emerald-400">
                          {selectedUser.progress?.assessments?.latestRecommendation}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 5-Pillar Competency Radar & Assessment Performance */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* 5 Pillars */}
                    <div className="p-5 bg-[#141414] border border-white/10 rounded-2xl space-y-3">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-cyan-400" />
                        <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
                          5-Pillar Technical Assessment
                        </h4>
                      </div>

                      <div className="space-y-2.5 pt-1">
                        {[
                          { name: 'Code Quality & Clean Architecture', score: selectedUser.progress?.radarScores?.codeQuality || 85 },
                          { name: 'Distributed Systems & Scalability', score: selectedUser.progress?.radarScores?.systemDesign || 80 },
                          { name: 'Algorithmic Problem Solving', score: selectedUser.progress?.radarScores?.problemSolving || 88 },
                          { name: 'Executive Behavioral & STAR', score: selectedUser.progress?.radarScores?.communication || 84 },
                          { name: 'Space-Time Complexity Tuning', score: selectedUser.progress?.radarScores?.complexityOptimization || 86 },
                        ].map((pillar, idx) => (
                          <div key={idx} className="space-y-1">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-gray-300">{pillar.name}</span>
                              <span className="font-mono text-white font-bold">{pillar.score}/100</span>
                            </div>
                            <div className="w-full h-1.5 bg-black rounded-full overflow-hidden">
                              <div
                                className="h-full bg-cyan-400 rounded-full"
                                style={{ width: `${pillar.score}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Evaluated Coding Rounds */}
                    <div className="p-5 bg-[#141414] border border-white/10 rounded-2xl space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Award className="w-4 h-4 text-primary" />
                          <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
                            Evaluated Test Rounds ({selectedUser.progress?.assessments?.testsTaken})
                          </h4>
                        </div>
                        <span className="text-[11px] text-emerald-400 font-mono font-bold">
                          Avg: {selectedUser.progress?.assessments?.avgScore}%
                        </span>
                      </div>

                      <div className="space-y-2 max-h-[190px] overflow-y-auto divide-y divide-white/5">
                        {selectedUser.progress?.assessments?.recentTests?.map((test, idx) => (
                          <div key={idx} className="pt-2 first:pt-0 flex items-center justify-between text-xs">
                            <div>
                              <div className="font-medium text-white truncate max-w-[170px]">{test.title}</div>
                              <div className="text-[10px] text-gray-500">{test.date}</div>
                            </div>
                            <div className="text-right">
                              <span className="font-mono font-bold text-primary">{test.score}%</span>
                              <div className="text-[10px] text-emerald-400">{test.recommendation}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Candidate Audit Timeline Log */}
                  <div className="p-5 bg-[#141414] border border-white/10 rounded-2xl space-y-3">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
                        Candidate Activity Stream
                      </h4>
                    </div>

                    <div className="space-y-2 text-xs">
                      {selectedUser.progress?.activityLog?.map((act, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2.5 bg-[#181818] rounded-xl border border-white/5">
                          <span className="text-gray-300">{act.text}</span>
                          <span className="text-[10px] text-gray-500 font-mono flex-shrink-0">{act.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="col-span-12 md:col-span-8 flex items-center justify-center p-10 text-gray-500 text-sm">
                  Select a candidate from the left roster to view their preparation dossier.
                </div>
              )}
            </div>
          )}

          {/* Modal: Create User */}
          {isAddUserOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
              <div className="bg-[#161616] border border-white/15 rounded-2xl p-6 max-w-md w-full space-y-4 text-xs">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <h3 className="text-base font-semibold text-white flex items-center gap-2">
                    <UserPlus className="w-4 h-4 text-primary" />
                    Create New User Profile
                  </h3>
                  <button onClick={() => setIsAddUserOpen(false)} className="text-gray-400 hover:text-white">
                    ✕
                  </button>
                </div>

                <form onSubmit={handleCreateUser} className="space-y-3">
                  <div>
                    <label className="text-gray-400 block mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. David Kumar"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-[#101010] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="text-gray-400 block mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="david@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-[#101010] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-gray-400 block mb-1">Role</label>
                      <select
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        className="w-full bg-[#101010] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-primary"
                      >
                        <option value="candidate">Candidate</option>
                        <option value="admin">Administrator</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-gray-400 block mb-1">Initial Status</label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full bg-[#101010] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-primary"
                      >
                        <option value="active">Active</option>
                        <option value="suspended">Suspended</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-gray-400 block mb-1">Target Role</label>
                    <input
                      type="text"
                      placeholder="e.g. Senior Backend Engineer"
                      value={formData.targetRole}
                      onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })}
                      className="w-full bg-[#101010] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="text-gray-400 block mb-1">Target Company</label>
                    <input
                      type="text"
                      placeholder="e.g. Meta / Tier-1 Tech"
                      value={formData.targetCompany}
                      onChange={(e) => setFormData({ ...formData, targetCompany: e.target.value })}
                      className="w-full bg-[#101010] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="text-gray-400 block mb-1">Password</label>
                    <input
                      type="password"
                      required
                      placeholder="Initial Password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full bg-[#101010] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAddUserOpen(false)}
                      className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-gray-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-primary hover:bg-[#E1E0CC] text-black font-semibold rounded-xl"
                    >
                      Create User
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Modal: Edit User */}
          {editingUser && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
              <div className="bg-[#161616] border border-white/15 rounded-2xl p-6 max-w-md w-full space-y-4 text-xs">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <h3 className="text-base font-semibold text-white flex items-center gap-2">
                    <Edit2 className="w-4 h-4 text-primary" />
                    Edit User Profile: {editingUser.name}
                  </h3>
                  <button onClick={() => setEditingUser(null)} className="text-gray-400 hover:text-white">
                    ✕
                  </button>
                </div>

                <form onSubmit={handleUpdateUser} className="space-y-3">
                  <div>
                    <label className="text-gray-400 block mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-[#101010] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="text-gray-400 block mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-[#101010] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-gray-400 block mb-1">Role</label>
                      <select
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        className="w-full bg-[#101010] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-primary"
                      >
                        <option value="candidate">Candidate</option>
                        <option value="admin">Administrator</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-gray-400 block mb-1">Status</label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full bg-[#101010] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-primary"
                      >
                        <option value="active">Active</option>
                        <option value="suspended">Suspended</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-gray-400 block mb-1">Target Role</label>
                    <input
                      type="text"
                      value={formData.targetRole}
                      onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })}
                      className="w-full bg-[#101010] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="text-gray-400 block mb-1">Target Company</label>
                    <input
                      type="text"
                      value={formData.targetCompany}
                      onChange={(e) => setFormData({ ...formData, targetCompany: e.target.value })}
                      className="w-full bg-[#101010] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingUser(null)}
                      className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-gray-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-primary hover:bg-[#E1E0CC] text-black font-semibold rounded-xl"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Modal: Reset Password */}
          {resettingUser && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
              <div className="bg-[#161616] border border-white/15 rounded-2xl p-6 max-w-sm w-full space-y-4 text-xs">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <h3 className="text-base font-semibold text-white flex items-center gap-2">
                    <Key className="w-4 h-4 text-amber-400" />
                    Reset Password
                  </h3>
                  <button onClick={() => setResettingUser(null)} className="text-gray-400 hover:text-white">
                    ✕
                  </button>
                </div>

                <p className="text-gray-400 text-xs">
                  Set a new password for candidate <strong>{resettingUser.name}</strong> ({resettingUser.email}).
                </p>

                <div>
                  <label className="text-gray-400 block mb-1">New Password</label>
                  <input
                    type="text"
                    value={newPasswordInput}
                    onChange={(e) => setNewPasswordInput(e.target.value)}
                    className="w-full bg-[#101010] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-primary font-mono text-xs"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setResettingUser(null)}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAdminResetPassword}
                    className="px-5 py-2 bg-amber-400 hover:bg-amber-300 text-black font-semibold rounded-xl"
                  >
                    Confirm Reset
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </motion.div>
  </div>
</AnimatePresence>
);
}
