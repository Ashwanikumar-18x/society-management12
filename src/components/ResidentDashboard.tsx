import React, { useState, useEffect } from 'react';
import {
  FileText,
  Clock,
  CheckCircle2,
  Bell,
  Plus,
  ArrowRight,
  Filter,
  User as UserIcon,
  Megaphone,
  Calendar,
  Sparkles,
  RefreshCw,
  Building2,
} from 'lucide-react';
import type { User, Complaint, Notice, ResidentStats } from '../types/society';
import { api } from '../services/api';
import { RegisterComplaintModal } from './RegisterComplaintModal';
import { ComplaintDetailModal } from './ComplaintDetailModal';
import { EditProfileModal } from './EditProfileModal';

interface ResidentDashboardProps {
  currentUser: User;
  onSignOut: () => void;
  onSwitchToAdminDemo?: () => void;
}

export const ResidentDashboard: React.FC<ResidentDashboardProps> = ({
  currentUser,
  onSignOut,
}) => {
  const [user, setUser] = useState<User>(currentUser);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [stats, setStats] = useState<ResidentStats>({
    totalComplaints: 0,
    inProgress: 0,
    resolved: 0,
    newNotices: 0,
  });
  const [statusFilter, setStatusFilter] = useState<string>('All statuses');
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Sync prop user
  useEffect(() => {
    setUser(currentUser);
  }, [currentUser]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [complaintsRes, noticesRes, statsRes] = await Promise.all([
        api.getComplaints({
          userId: user._id,
          status: statusFilter === 'All statuses' ? undefined : statusFilter,
        }),
        api.getNotices(),
        api.getResidentStats(user._id),
      ]);

      setComplaints(complaintsRes.complaints);
      setNotices(noticesRes.notices);
      setStats(statsRes);
    } catch (err) {
      console.error('Failed to load resident data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user._id, statusFilter]);

  const handleComplaintCreated = (newComplaint: Complaint) => {
    setComplaints((prev) => [newComplaint, ...prev]);
    setStats((prev) => ({
      ...prev,
      totalComplaints: prev.totalComplaints + 1,
      inProgress: prev.inProgress + 1,
    }));
  };

  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case 'Urgent':
        return 'bg-rose-50 text-rose-700 border-rose-200/80';
      case 'High':
        return 'bg-amber-50 text-amber-700 border-amber-200/80';
      case 'Medium':
        return 'bg-blue-50 text-blue-700 border-blue-200/80';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getLeftAccentBorder = (priority: string, status: string) => {
    if (priority === 'Urgent') return 'border-l-rose-500';
    if (priority === 'High') return 'border-l-amber-500';
    if (status === 'Resolved') return 'border-l-emerald-500';
    return 'border-l-blue-400';
  };

  // Avatar initials helper
  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase() || 'RY';
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans antialiased selection:bg-blue-100">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20">
              <Megaphone className="w-5 h-5 -rotate-12" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              Resident
            </span>
          </div>

          <div className="flex items-center gap-4 text-sm">
            {/* Resident view badge */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Resident view</span>
            </div>

            {/* Profile pill */}
            <div className="flex items-center gap-2 text-slate-800 font-medium">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center border border-blue-200">
                {getInitials(user.name)}
              </div>
              <span className="hidden sm:inline font-semibold text-slate-900 text-sm">
                {user.name}
              </span>
            </div>

            {/* Sign out */}
            <button
              type="button"
              onClick={onSignOut}
              className="text-slate-500 hover:text-slate-800 text-xs sm:text-sm font-medium transition cursor-pointer"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
        {/* Header Hero */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold tracking-widest uppercase text-slate-400 block mb-1">
              RESIDENT DASHBOARD
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Resident
            </h1>
            <p className="text-slate-500 text-sm sm:text-base mt-1">
              Stay close to what matters in your community.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsRegisterModalOpen(true)}
            className="self-start sm:self-auto px-5 py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium text-sm rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Register a complaint</span>
          </button>
        </div>

        {/* 4 Stat Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total complaints */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-500 block">Total complaints</span>
              <span className="text-3xl font-extrabold text-slate-900 block leading-tight">
                {stats.totalComplaints}
              </span>
              <span className="text-[11px] font-medium text-slate-400 block">All time</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
              <FileText className="w-6 h-6" />
            </div>
          </div>

          {/* Card 2: In progress */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-500 block">In progress</span>
              <span className="text-3xl font-extrabold text-slate-900 block leading-tight">
                {stats.inProgress}
              </span>
              <span className="text-[11px] font-medium text-slate-400 block">Being followed up</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          {/* Card 3: Resolved */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-500 block">Resolved</span>
              <span className="text-3xl font-extrabold text-slate-900 block leading-tight">
                {stats.resolved}
              </span>
              <span className="text-[11px] font-medium text-slate-400 block">Closed successfully</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>

          {/* Card 4: New notices */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-500 block">New notices</span>
              <span className="text-3xl font-extrabold text-slate-900 block leading-tight">
                {stats.newNotices}
              </span>
              <span className="text-[11px] font-medium text-slate-400 block">Community updates</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
              <Bell className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Main 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Complaint History (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            <div>
              <span className="text-[11px] font-bold tracking-widest uppercase text-slate-400 block mb-1">
                YOUR ACTIVITY
              </span>
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-2xl font-bold text-slate-900">Complaint history</h2>

                {/* Filter Dropdown */}
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="appearance-none bg-white border border-slate-200 rounded-lg pl-8 pr-8 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="All statuses">All statuses</option>
                    <option value="Submitted">Submitted</option>
                    <option value="Needs Triage">Needs Triage</option>
                    <option value="Assigned">Assigned</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                  <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <span className="text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-xs">
                    ⌄
                  </span>
                </div>
              </div>
            </div>

            {/* Complaint List Cards */}
            {isLoading ? (
              <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
                <RefreshCw className="w-6 h-6 animate-spin text-blue-600 mx-auto mb-2" />
                <p className="text-xs text-slate-400">Loading complaints...</p>
              </div>
            ) : complaints.length === 0 ? (
              <div className="bg-white rounded-2xl p-10 border border-slate-200/80 text-center space-y-3">
                <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto text-blue-600">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900">No complaints registered</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  When you have any maintenance or society concerns, register a complaint and Society AI will triage it immediately.
                </p>
                <button
                  type="button"
                  onClick={() => setIsRegisterModalOpen(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition cursor-pointer"
                >
                  Register Complaint
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {complaints.map((c) => (
                  <div
                    key={c._id}
                    onClick={() => setSelectedComplaint(c)}
                    className={`bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs hover:shadow-sm hover:border-slate-300 transition cursor-pointer border-l-4 ${getLeftAccentBorder(
                      c.priority,
                      c.status
                    )}`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                        <span className="font-mono text-slate-500 font-bold">{c.ticketId}</span>
                        <span>·</span>
                        <span>
                          {new Date(c.createdAt).toLocaleDateString('en-US', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>

                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${getPriorityBadgeClass(
                          c.priority
                        )}`}
                      >
                        {c.priority}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 mb-1">{c.title}</h3>
                    <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed mb-4 font-normal">
                      {c.description}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Category badge with blue bullet */}
                        <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                          <span>{c.category}</span>
                        </div>

                        {/* Status badge */}
                        <span
                          className={`text-xs font-semibold px-2.5 py-0.5 rounded-md ${
                            c.status === 'Resolved' || c.status === 'Closed'
                              ? 'bg-emerald-100/70 text-emerald-800'
                              : c.status === 'In Progress'
                              ? 'bg-blue-100/70 text-blue-800'
                              : c.status === 'Assigned'
                              ? 'bg-indigo-100/70 text-indigo-800'
                              : 'bg-amber-100/70 text-amber-800'
                          }`}
                        >
                          {c.status}
                        </span>

                        {c.assignedHandlerName && (
                          <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">
                            Handler: {c.assignedHandlerName}
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        className="text-slate-400 hover:text-blue-600 transition p-1"
                        title="View details"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Profile & Community Notices (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* My Profile Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-slate-900">My profile</h3>
                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(true)}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
                >
                  Edit
                </button>
              </div>

              <div className="flex items-center gap-3.5 mb-5">
                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 font-bold text-sm flex items-center justify-center border border-blue-200">
                  {getInitials(user.name)}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 leading-tight">{user.name}</h4>
                  <p className="text-xs text-slate-400 mt-0.5 break-all">{user.email}</p>
                </div>
              </div>

              <div className="space-y-3 pt-3 border-t border-slate-100 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-medium">Home</span>
                  <span className="font-semibold text-slate-800">
                    {user.flatNumber}, {user.wing}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-medium">Phone</span>
                  <span className="font-semibold text-slate-800">
                    {user.phone || 'Add a phone number'}
                  </span>
                </div>
              </div>
            </div>

            {/* Community Notices Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-slate-900">Community notices</h3>
                <Bell className="w-4 h-4 text-slate-400" />
              </div>

              {notices.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400">
                  No notices published yet
                </div>
              ) : (
                <div className="space-y-3">
                  {notices.map((n, i) => (
                    <div
                      key={n._id}
                      className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-100 space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                            i === 0
                              ? 'bg-emerald-100/70 text-emerald-800'
                              : 'bg-blue-100/70 text-blue-800'
                          }`}
                        >
                          {i === 0 ? 'Complaint registered and triaged' : n.category}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(n.createdAt).toLocaleDateString('en-US', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 leading-snug">{n.title}</h4>
                      <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                        {n.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      <RegisterComplaintModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        currentUser={user}
        onComplaintCreated={handleComplaintCreated}
      />

      <ComplaintDetailModal
        complaint={selectedComplaint}
        isOpen={!!selectedComplaint}
        onClose={() => setSelectedComplaint(null)}
      />

      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        currentUser={user}
        onProfileUpdated={(updated) => setUser(updated)}
      />
    </div>
  );
};
