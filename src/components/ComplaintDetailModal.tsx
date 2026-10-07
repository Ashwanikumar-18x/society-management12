import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Clock,
  MapPin,
  User,
  Wrench,
  CheckCircle,
  FileText,
  AlertTriangle,
  Send,
  Loader2,
  Calendar,
} from 'lucide-react';
import type { Complaint, ComplaintHandler } from '../types/society';

interface ComplaintDetailModalProps {
  complaint: Complaint | null;
  isOpen: boolean;
  onClose: () => void;
  isAdmin?: boolean;
  handlers?: ComplaintHandler[];
  onUpdateComplaint?: (
    id: string,
    updates: {
      status?: string;
      priority?: string;
      assignedHandlerId?: string | null;
      assignedHandlerName?: string | null;
      adminNotes?: string;
    }
  ) => Promise<void>;
}

export const ComplaintDetailModal: React.FC<ComplaintDetailModalProps> = ({
  complaint,
  isOpen,
  onClose,
  isAdmin = false,
  handlers = [],
  onUpdateComplaint,
}) => {
  if (!isOpen || !complaint) return null;

  const [status, setStatus] = useState(complaint.status);
  const [priority, setPriority] = useState(complaint.priority);
  const [assignedHandlerId, setAssignedHandlerId] = useState(complaint.assignedHandlerId || '');
  const [adminNotes, setAdminNotes] = useState(complaint.adminNotes || '');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = async () => {
    if (!onUpdateComplaint) return;
    setIsSaving(true);
    setSaveSuccess(false);

    const chosenHandler = handlers.find((h) => h._id === assignedHandlerId);
    try {
      await onUpdateComplaint(complaint._id, {
        status,
        priority,
        assignedHandlerId: assignedHandlerId || null,
        assignedHandlerName: chosenHandler ? chosenHandler.name : null,
        adminNotes,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const getPriorityStyle = (p: string) => {
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

  const getStatusStyle = (s: string) => {
    switch (s) {
      case 'Resolved':
      case 'Closed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'In Progress':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Assigned':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm font-bold text-slate-500">
              {complaint.ticketId}
            </span>
            <span
              className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${getPriorityStyle(
                priority
              )}`}
            >
              {priority} Priority
            </span>
            <span
              className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${getStatusStyle(
                status
              )}`}
            >
              {status}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          <div>
            <h3 className="text-xl font-bold text-slate-900">{complaint.title}</h3>
            <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500 mt-2">
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-400" />
                {complaint.userName} ({complaint.flatNumber}, {complaint.wing})
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {complaint.location}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {new Date(complaint.createdAt).toLocaleDateString('en-US', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Complaint Description
            </span>
            <p className="text-slate-800 text-sm leading-relaxed">{complaint.description}</p>
          </div>

          {/* AI Recommendation Card */}
          <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-100 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-blue-700 uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-blue-600" />
                AI recommendation
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                {complaint.aiAnalysis.confidence}% confidence
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
              {complaint.aiAnalysis.reason}
            </p>
          </div>

          {/* Timing & Handler Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl border border-slate-200">
              <span className="text-slate-400 font-medium block">Preferred Timing Slot</span>
              <span className="font-semibold text-slate-800 text-sm mt-1 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-slate-400" />
                {complaint.preferredTimingSlot}
              </span>
            </div>
            <div className="p-3.5 rounded-xl border border-slate-200">
              <span className="text-slate-400 font-medium block">Assigned Handler</span>
              <span className="font-semibold text-slate-800 text-sm mt-1 flex items-center gap-1.5">
                <Wrench className="w-4 h-4 text-slate-400" />
                {complaint.assignedHandlerName || 'Unassigned / In queue'}
              </span>
            </div>
          </div>

          {/* Admin Management Section */}
          {isAdmin && (
            <div className="pt-4 border-t border-slate-200 space-y-4">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Wrench className="w-4 h-4 text-blue-600" />
                Complaint Management Actions
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Status Selector */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Update Status
                  </label>
                  <select
                    value={status}
                    onChange={(e: any) => setStatus(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Submitted">Submitted</option>
                    <option value="Needs Triage">Needs Triage</option>
                    <option value="Assigned">Assigned</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>

                {/* Priority Override */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Override Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e: any) => setPriority(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>

                {/* Handler Selector */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Assign Staff Handler
                  </label>
                  <select
                    value={assignedHandlerId}
                    onChange={(e) => setAssignedHandlerId(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- None / Unassigned --</option>
                    {handlers.map((h) => (
                      <option key={h._id} value={h._id}>
                        {h.name} ({h.specialty} - {h.status})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Admin Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Internal Admin Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Notes on worker dispatch, repair status, or parts needed..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {/* Save Button */}
              <div className="flex items-center justify-between pt-2">
                {saveSuccess ? (
                  <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4" /> Changes updated successfully!
                  </span>
                ) : (
                  <span className="text-xs text-slate-400">
                    Changes will reflect instantly in resident view
                  </span>
                )}

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-lg shadow-sm transition flex items-center gap-1.5 cursor-pointer disabled:opacity-75"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
