import React, { useState, useEffect } from 'react';
import {
  FileText,
  Sparkles,
  AlertCircle,
  Wrench,
  Clock,
  Search,
  Filter,
  Plus,
  ArrowUpRight,
  User,
  CheckCircle2,
  Calendar,
  Building2,
  Phone,
  Home,
  Shield,
  Layers,
  Send,
  Loader2,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import type {
  Complaint,
  ComplaintHandler,
  House,
  Notice,
  AdminStats,
  User as UserType,
} from '../types/society';
import { api } from '../services/api';
import { PublishNoticeModal } from './PublishNoticeModal';

interface AdminDashboardProps {
  currentUser: UserType;
  onSignOut: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  onSignOut,
}) => {
  const [activeTab, setActiveTab] = useState<'queue' | 'houses' | 'handlers' | 'notices'>('queue');
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [handlers, setHandlers] = useState<ComplaintHandler[]>([]);
  const [houses, setHouses] = useState<House[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [stats, setStats] = useState<AdminStats>({
    allComplaints: 0,
    needsTriage: 0,
    urgentPriority: 0,
    assigned: 0,
    activeQueue: 0,
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('All priority');
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

  // Management controls for selected complaint
  const [editStatus, setEditStatus] = useState<string>('');
  const [editPriority, setEditPriority] = useState<string>('');
  const [editHandlerId, setEditHandlerId] = useState<string>('');
  const [editAdminNotes, setEditAdminNotes] = useState<string>('');
  const [isSavingComplaint, setIsSavingComplaint] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);

  const [isPublishNoticeOpen, setIsPublishNoticeOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // New House modal state
  const [isAddHouseOpen, setIsAddHouseOpen] = useState(false);
  const [newFlat, setNewFlat] = useState('');
  const [newWing, setNewWing] = useState('Wing A');
  const [newOwner, setNewOwner] = useState('');
  const [newPhone, setNewPhone] = useState('');

  const loadAllData = async () => {
    try {
      setIsLoading(true);
      const [complaintsRes, handlersRes, housesRes, noticesRes, statsRes] = await Promise.all([
        api.getComplaints({
          search: searchQuery || undefined,
          priority: priorityFilter === 'All priority' ? undefined : priorityFilter,
        }),
        api.getHandlers(),
        api.getHouses(),
        api.getNotices(),
        api.getAdminStats(),
      ]);

      setComplaints(complaintsRes.complaints);
      setHandlers(handlersRes.handlers);
      setHouses(housesRes.houses);
      setNotices(noticesRes.notices);
      setStats(statsRes);

      // Auto-select first complaint if none selected or if previous selected is gone
      if (complaintsRes.complaints.length > 0) {
        const found = selectedComplaint
          ? complaintsRes.complaints.find((c) => c._id === selectedComplaint._id)
          : null;
        const toSelect = found || complaintsRes.complaints[0];
        setSelectedComplaint(toSelect);
        setEditStatus(toSelect.status);
        setEditPriority(toSelect.priority);
        setEditHandlerId(toSelect.assignedHandlerId || '');
        setEditAdminNotes(toSelect.adminNotes || '');
      } else {
        setSelectedComplaint(null);
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [priorityFilter]);

  // Handle live search
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadAllData();
  };

  const handleSelectComplaint = (c: Complaint) => {
    setSelectedComplaint(c);
    setEditStatus(c.status);
    setEditPriority(c.priority);
    setEditHandlerId(c.assignedHandlerId || '');
    setEditAdminNotes(c.adminNotes || '');
    setSaveSuccessMsg(false);
  };

  const handleSaveSelectedComplaint = async () => {
    if (!selectedComplaint) return;
    setIsSavingComplaint(true);
    setSaveSuccessMsg(false);

    const chosenHandler = handlers.find((h) => h._id === editHandlerId);

    try {
      const { complaint: updated } = await api.updateComplaint(selectedComplaint._id, {
        status: editStatus,
        priority: editPriority,
        assignedHandlerId: editHandlerId || null,
        assignedHandlerName: chosenHandler ? chosenHandler.name : null,
        adminNotes: editAdminNotes,
      });

      // Update state in list
      setComplaints((prev) =>
        prev.map((item) => (item._id === updated._id ? updated : item))
      );
      setSelectedComplaint(updated);
      setSaveSuccessMsg(true);

      // Refresh stats
      const statsRes = await api.getAdminStats();
      setStats(statsRes);

      setTimeout(() => setSaveSuccessMsg(false), 2500);
    } catch (err) {
      console.error('Failed to update complaint:', err);
    } finally {
      setIsSavingComplaint(false);
    }
  };

  const handleDeleteNotice = async (id: string) => {
    if (!confirm('Are you sure you want to delete this notice?')) return;
    try {
      await api.deleteNotice(id);
      setNotices((prev) => prev.filter((n) => n._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddHouse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFlat || !newOwner) return;
    try {
      const { house } = await api.createHouse({
        flatNumber: newFlat,
        wing: newWing,
        floor: parseInt(newFlat.replace(/\D/g, '')[0] || '1', 10),
        ownerName: newOwner,
        ownerContact: newPhone,
        occupiedBy: newOwner,
        status: 'Occupied',
      });
      setHouses((prev) => [...prev, house]);
      setIsAddHouseOpen(false);
      setNewFlat('');
      setNewOwner('');
      setNewPhone('');
    } catch (err) {
      console.error(err);
    }
  };

  const getPriorityBadgeClass = (p: string) => {
    switch (p) {
      case 'Urgent':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'High':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Medium':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getLeftAccentBorder = (p: string) => {
    if (p === 'Urgent') return 'border-l-rose-500';
    if (p === 'High') return 'border-l-amber-500';
    if (p === 'Medium') return 'border-l-blue-400';
    return 'border-l-slate-300';
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase() || 'AD';
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans antialiased selection:bg-blue-100">
      {/* Top Header Navigation */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20">
                <Building2 className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">
                Society
              </span>
            </div>

            {/* Navigation Tabs */}
            <nav className="hidden md:flex items-center gap-1 ml-6 border-l border-slate-200 pl-6">
              <button
                type="button"
                onClick={() => setActiveTab('queue')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
                  activeTab === 'queue'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Complaint Queue
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('houses')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
                  activeTab === 'houses'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Houses & Owners
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('handlers')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
                  activeTab === 'handlers'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Complaint Handlers
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('notices')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
                  activeTab === 'notices'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Community Notices
              </button>
            </nav>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold border border-blue-100">
              <Shield className="w-3.5 h-3.5 text-blue-600" />
              <span>Admin Center</span>
            </div>

            <div className="flex items-center gap-2 text-slate-800 font-medium">
              <div className="w-8 h-8 rounded-full bg-slate-800 text-white font-bold text-xs flex items-center justify-center">
                SA
              </div>
              <span className="hidden sm:inline font-semibold text-slate-900 text-sm">
                Admin
              </span>
            </div>

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
        {/* Civic Operations Center Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold tracking-widest uppercase text-slate-400 block mb-1">
              CIVIC OPERATIONS CENTER
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Admin.
            </h1>
            <p className="text-slate-500 text-sm sm:text-base mt-1">
              Review the signal. Assign the next action. Keep residents informed.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsPublishNoticeOpen(true)}
            className="self-start sm:self-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium text-sm rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Publish notice</span>
          </button>
        </div>

        {/* 5 Stat Cards Matching Screenshot 2 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {/* Card 1: All complaints */}
          <div className="bg-white rounded-2xl p-4.5 border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-500 block">All complaints</span>
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 block leading-tight">
                {stats.allComplaints}
              </span>
              <span className="text-[11px] font-medium text-slate-400 block">Across the society</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
              <FileText className="w-5 h-5" />
            </div>
          </div>

          {/* Card 2: Needs triage */}
          <div className="bg-white rounded-2xl p-4.5 border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-500 block">Needs triage</span>
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 block leading-tight">
                {stats.needsTriage}
              </span>
              <span className="text-[11px] font-medium text-slate-400 block">AI reviewed</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>

          {/* Card 3: Urgent priority */}
          <div className="bg-white rounded-2xl p-4.5 border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-500 block">Urgent priority</span>
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 block leading-tight">
                {stats.urgentPriority}
              </span>
              <span className="text-[11px] font-medium text-slate-400 block">Review first</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>

          {/* Card 4: Assigned */}
          <div className="bg-white rounded-2xl p-4.5 border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-500 block">Assigned</span>
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 block leading-tight">
                {stats.assigned}
              </span>
              <span className="text-[11px] font-medium text-slate-400 block">With a worker</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
              <Wrench className="w-5 h-5" />
            </div>
          </div>

          {/* Card 5: Active queue */}
          <div className="bg-white rounded-2xl p-4.5 border border-slate-200/80 shadow-xs flex items-center justify-between col-span-2 sm:col-span-1">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-500 block">Active queue</span>
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 block leading-tight">
                {stats.activeQueue}
              </span>
              <span className="text-[11px] font-medium text-slate-400 block">Open requests</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
              <Clock className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Tab 1: AI-PRIORITIZED WORK QUEUE Matching Screenshot 2 */}
        {activeTab === 'queue' && (
          <div className="space-y-4">
            <div>
              <span className="text-[11px] font-bold tracking-widest uppercase text-slate-400 block mb-1">
                AI-PRIORITIZED WORK QUEUE
              </span>
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-900">Complaint queue</h2>
                <span className="text-xs text-slate-400 font-medium">
                  {complaints.length} visible
                </span>
              </div>
            </div>

            {/* Search & Filter Bar */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search complaints or residents"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onBlur={loadAllData}
                  className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition shadow-2xs"
                />
              </form>

              <div className="relative w-full sm:w-auto">
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="w-full sm:w-auto appearance-none bg-white border border-slate-200 rounded-xl pl-8 pr-8 py-2.5 text-xs font-semibold text-slate-700 shadow-2xs hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="All priority">All priority</option>
                  <option value="Urgent">Urgent</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
                <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <span className="text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-xs">
                  ⌄
                </span>
              </div>
            </div>

            {/* Two-Pane Work Queue View */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Pane: Queue List (7 Cols) */}
              <div className="lg:col-span-7 space-y-3">
                {isLoading ? (
                  <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
                    <RefreshCw className="w-6 h-6 animate-spin text-blue-600 mx-auto mb-2" />
                    <p className="text-xs text-slate-400">Loading complaint queue...</p>
                  </div>
                ) : complaints.length === 0 ? (
                  <div className="bg-white rounded-2xl p-10 border border-slate-200 text-center">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                    <h4 className="text-base font-bold text-slate-900">Queue is all clear!</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      No complaints match the search or filter criteria.
                    </p>
                  </div>
                ) : (
                  complaints.map((c) => {
                    const isSelected = selectedComplaint?._id === c._id;
                    return (
                      <div
                        key={c._id}
                        onClick={() => handleSelectComplaint(c)}
                        className={`bg-white rounded-xl border p-4.5 shadow-2xs hover:border-slate-300 transition cursor-pointer border-l-4 ${getLeftAccentBorder(
                          c.priority
                        )} ${
                          isSelected
                            ? 'ring-2 ring-blue-500 border-blue-500 bg-blue-50/20'
                            : 'border-slate-200/80'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="font-mono text-xs text-slate-400 font-medium">
                            {c.ticketId} ·{' '}
                            {new Date(c.createdAt).toLocaleDateString('en-US', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>

                          <span
                            className={`text-xs font-bold px-2 py-0.5 rounded-full border ${getPriorityBadgeClass(
                              c.priority
                            )}`}
                          >
                            {c.priority}
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-slate-900 mb-1">{c.title}</h3>
                        <p className="text-xs text-slate-500 mb-3">
                          {c.userName} · {c.flatNumber}, {c.wing} · {c.category}
                        </p>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                                c.status === 'Assigned'
                                  ? 'bg-blue-100/80 text-blue-800'
                                  : c.status === 'In Progress'
                                  ? 'bg-amber-100/80 text-amber-800'
                                  : c.status === 'Resolved'
                                  ? 'bg-emerald-100/80 text-emerald-800'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {c.status}
                            </span>

                            {c.assignedHandlerName && (
                              <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                                Assigned to {c.assignedHandlerName}
                              </span>
                            )}
                          </div>

                          <ArrowUpRight className="w-4 h-4 text-slate-400" />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Right Pane: Selected Request Details (5 Cols) Matching Screenshot 2 */}
              <div className="lg:col-span-5">
                {selectedComplaint ? (
                  <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-5 sticky top-20">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                        SELECTED REQUEST
                      </span>
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${getPriorityBadgeClass(
                          selectedComplaint.priority
                        )}`}
                      >
                        {selectedComplaint.priority}
                      </span>
                    </div>

                    {/* Complaint Title */}
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">
                        {selectedComplaint.title}
                      </h3>
                    </div>

                    {/* Resident Info Block */}
                    <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50/80 border border-slate-100">
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0 border border-blue-200">
                        {getInitials(selectedComplaint.userName)}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 leading-tight">
                          {selectedComplaint.userName}
                        </h4>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {selectedComplaint.userEmail}
                        </p>
                        <p className="text-[11px] text-slate-600 font-medium mt-1">
                          {selectedComplaint.flatNumber}, {selectedComplaint.wing}
                        </p>
                      </div>
                    </div>

                    {/* Description & Timing */}
                    <div className="space-y-1.5">
                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                        {selectedComplaint.description}
                      </p>
                      <div className="text-[11px] text-slate-400 pt-1 font-medium">
                        {new Date(selectedComplaint.createdAt).toLocaleDateString('en-US', {
                          day: 'numeric',
                          month: 'short',
                        })}
                        ,{' '}
                        {new Date(selectedComplaint.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}{' '}
                        · {selectedComplaint.category}
                      </div>
                    </div>

                    {/* AI Recommendation Box Matching Screenshot 2 */}
                    <div className="p-4 rounded-xl bg-blue-50/80 border border-blue-100 space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-blue-700 uppercase tracking-wider">
                        <Sparkles className="w-4 h-4 text-blue-600" />
                        AI recommendation
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed">
                        {selectedComplaint.aiAnalysis.reason}{' '}
                        <span className="font-semibold text-blue-700">
                          {selectedComplaint.aiAnalysis.confidence}% confidence
                        </span>
                      </p>
                    </div>

                    {/* Management & Assignment Controls */}
                    <div className="space-y-3 pt-3 border-t border-slate-100">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1 uppercase tracking-wider">
                            Status
                          </label>
                          <select
                            value={editStatus}
                            onChange={(e) => setEditStatus(e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="Submitted">Submitted</option>
                            <option value="Needs Triage">Needs Triage</option>
                            <option value="Assigned">Assigned</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Resolved">Resolved</option>
                            <option value="Closed">Closed</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1 uppercase tracking-wider">
                            Priority
                          </label>
                          <select
                            value={editPriority}
                            onChange={(e) => setEditPriority(e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                            <option value="Urgent">Urgent</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1 uppercase tracking-wider">
                          Assign Handler
                        </label>
                        <select
                          value={editHandlerId}
                          onChange={(e) => setEditHandlerId(e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">-- Unassigned --</option>
                          {handlers.map((h) => (
                            <option key={h._id} value={h._id}>
                              {h.name} ({h.specialty} · {h.status})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1 uppercase tracking-wider">
                          Admin Notes
                        </label>
                        <textarea
                          rows={2}
                          value={editAdminNotes}
                          onChange={(e) => setEditAdminNotes(e.target.value)}
                          placeholder="Action taken or follow-up note..."
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        />
                      </div>

                      <div className="pt-2 flex items-center justify-between">
                        {saveSuccessMsg ? (
                          <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Updated!
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400">
                            Ticket {selectedComplaint.ticketId}
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={handleSaveSelectedComplaint}
                          disabled={isSavingComplaint}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-lg shadow-sm transition flex items-center gap-1.5 cursor-pointer disabled:opacity-75"
                        >
                          {isSavingComplaint ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Send className="w-3.5 h-3.5" />
                              Update Complaint
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400 text-xs">
                    Select a complaint from the queue to view details and assign actions.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Houses and Owner Details (Explicit requirement) */}
        {activeTab === 'houses' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold tracking-widest uppercase text-slate-400 block mb-1">
                  PROPERTY REGISTRY
                </span>
                <h2 className="text-2xl font-bold text-slate-900">Houses and owner details</h2>
              </div>

              <button
                type="button"
                onClick={() => setIsAddHouseOpen(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Add Flat Entry
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Flat No.</th>
                      <th className="py-3 px-4">Wing</th>
                      <th className="py-3 px-4">Floor</th>
                      <th className="py-3 px-4">Owner Name</th>
                      <th className="py-3 px-4">Owner Contact</th>
                      <th className="py-3 px-4">Occupied By</th>
                      <th className="py-3 px-4">Occupancy</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800">
                    {houses.map((h) => (
                      <tr key={h._id} className="hover:bg-slate-50/50 transition">
                        <td className="py-3.5 px-4 font-bold text-slate-900">{h.flatNumber}</td>
                        <td className="py-3.5 px-4">{h.wing}</td>
                        <td className="py-3.5 px-4">{h.floor}</td>
                        <td className="py-3.5 px-4 font-medium">{h.ownerName}</td>
                        <td className="py-3.5 px-4 text-slate-500">{h.ownerContact || '—'}</td>
                        <td className="py-3.5 px-4">{h.occupiedBy || h.ownerName}</td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full font-semibold text-[10px] ${
                              h.status === 'Occupied'
                                ? 'bg-emerald-100 text-emerald-800'
                                : h.status === 'Rented'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {h.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Complaint Handlers List */}
        {activeTab === 'handlers' && (
          <div className="space-y-4">
            <div>
              <span className="text-[11px] font-bold tracking-widest uppercase text-slate-400 block mb-1">
                OPERATIONS STAFF
              </span>
              <h2 className="text-2xl font-bold text-slate-900">Complaint handlers</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {handlers.map((h) => (
                <div
                  key={h._id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm border border-blue-100">
                      <Wrench className="w-5 h-5" />
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        h.status === 'Available'
                          ? 'bg-emerald-100 text-emerald-800'
                          : h.status === 'Busy'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {h.status}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900">{h.name}</h3>
                    <p className="text-xs text-blue-600 font-semibold">{h.specialty} Specialist</p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 text-xs space-y-1.5 text-slate-600">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Phone</span>
                      <span className="font-mono">{h.phone}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Active Tasks</span>
                      <span className="font-semibold text-slate-800">{h.activeTasks} assigned</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Community Notices Manager */}
        {activeTab === 'notices' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold tracking-widest uppercase text-slate-400 block mb-1">
                  COMMUNICATION
                </span>
                <h2 className="text-2xl font-bold text-slate-900">Community notices manager</h2>
              </div>

              <button
                type="button"
                onClick={() => setIsPublishNoticeOpen(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Publish New Notice
              </button>
            </div>

            <div className="space-y-3">
              {notices.map((n) => (
                <div
                  key={n._id}
                  className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1 max-w-3xl">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800">
                        {n.category}
                      </span>
                      <span className="text-xs text-slate-400">
                        {new Date(n.createdAt).toLocaleDateString('en-US', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900">{n.title}</h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                      {n.content}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteNotice(n._id)}
                    className="self-end sm:self-center p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                    title="Delete Notice"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Publish Notice Modal */}
      <PublishNoticeModal
        isOpen={isPublishNoticeOpen}
        onClose={() => setIsPublishNoticeOpen(false)}
        onNoticePublished={(newNotice) => setNotices((prev) => [newNotice, ...prev])}
      />

      {/* Add House Modal */}
      {isAddHouseOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Add Flat Record</h3>
            <form onSubmit={handleAddHouse} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Flat Number
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. B-204"
                  value={newFlat}
                  onChange={(e) => setNewFlat(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Wing</label>
                <select
                  value={newWing}
                  onChange={(e) => setNewWing(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg text-slate-900"
                >
                  <option value="Wing A">Wing A</option>
                  <option value="Wing B">Wing B</option>
                  <option value="Wing C">Wing C</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Owner Name</label>
                <input
                  type="text"
                  required
                  placeholder="Owner Full Name"
                  value={newOwner}
                  onChange={(e) => setNewOwner(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Contact Phone
                </label>
                <input
                  type="text"
                  placeholder="+91 98xxx xxxxx"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddHouseOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Save Flat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
