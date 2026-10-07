import React, { useState } from 'react';
import {
  X,
  Sparkles,
  AlertCircle,
  Clock,
  MapPin,
  CheckCircle,
  Loader2,
  Tag,
  ShieldCheck,
} from 'lucide-react';
import { api } from '../services/api';
import type { Complaint, User } from '../types/society';

interface RegisterComplaintModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onComplaintCreated: (complaint: Complaint) => void;
}

export const RegisterComplaintModal: React.FC<RegisterComplaintModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onComplaintCreated,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Auto-detect');
  const [location, setLocation] = useState(`${currentUser.flatNumber}, ${currentUser.wing}`);
  const [preferredTimingSlot, setPreferredTimingSlot] = useState('Morning (09:00 AM - 12:00 PM)');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analyzedComplaint, setAnalyzedComplaint] = useState<Complaint | null>(null);

  if (!isOpen) return null;

  const categories = [
    'Auto-detect',
    'Elevator',
    'Plumbing',
    'Electrical',
    'Sanitation',
    'Carpentry',
    'Security',
    'General Maintenance',
  ];

  const timingSlots = [
    'Immediate / Urgent',
    'Morning (09:00 AM - 12:00 PM)',
    'Afternoon (01:00 PM - 04:00 PM)',
    'Evening (05:00 PM - 08:00 PM)',
    'Any time / Flexible',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError('Please provide both complaint title and description.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const { complaint } = await api.createComplaint({
        title,
        description,
        category: category === 'Auto-detect' ? undefined : category,
        location,
        preferredTimingSlot,
        userId: currentUser._id,
      });

      setAnalyzedComplaint(complaint);
      onComplaintCreated(complaint);
    } catch (err: any) {
      setError(err.message || 'Failed to submit complaint.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDone = () => {
    setTitle('');
    setDescription('');
    setCategory('Auto-detect');
    setAnalyzedComplaint(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <div className="text-xs font-bold text-blue-600 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              AI-Powered Triage
            </div>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5">Register a complaint</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {analyzedComplaint ? (
            /* AI Results Review Screen */
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-emerald-900">
                    Complaint Registered & Triaged
                  </h4>
                  <p className="text-xs text-emerald-700 mt-0.5">
                    Ticket <span className="font-mono font-bold">{analyzedComplaint.ticketId}</span> has been logged and assigned for society maintenance.
                  </p>
                </div>
              </div>

              {/* AI Recommendation Box */}
              <div className="p-4 rounded-xl bg-blue-50/80 border border-blue-100">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-blue-700 font-bold text-xs uppercase tracking-wider">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    AI recommendation
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                    {analyzedComplaint.aiAnalysis.confidence}% confidence
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                  {analyzedComplaint.aiAnalysis.reason}
                </p>
              </div>

              {/* Triage Summary Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 font-medium block">Category Assigned</span>
                  <span className="font-semibold text-slate-800 text-sm mt-0.5 block">
                    {analyzedComplaint.category}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 font-medium block">AI Urgency Level</span>
                  <span
                    className={`inline-block mt-0.5 px-2 py-0.5 rounded font-bold text-xs ${
                      analyzedComplaint.priority === 'Urgent'
                        ? 'bg-rose-100 text-rose-700'
                        : analyzedComplaint.priority === 'High'
                        ? 'bg-amber-100 text-amber-800'
                        : analyzedComplaint.priority === 'Medium'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {analyzedComplaint.priority} Priority
                  </span>
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="button"
                  onClick={handleDone}
                  className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg shadow-sm transition cursor-pointer"
                >
                  View in Complaint History
                </button>
              </div>
            </div>
          ) : (
            /* Registration Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Complaint Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Elevator stopping between floors or Water leak near lobby"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Detailed Description
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe the issue in detail. Society AI will analyze the impact, urgency level, and route to the proper handler..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Category Preference
                  </label>
                  <div className="relative">
                    <Tag className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    >
                      {categories.map((c) => (
                        <option key={c} value={c}>
                          {c === 'Auto-detect' ? '✨ Auto-detect by AI' : c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Location / Area
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Flat C-110, Wing C or Lobby entrance"
                      className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Preferred Timing Slot
                </label>
                <div className="relative">
                  <Clock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <select
                    value={preferredTimingSlot}
                    onChange={(e) => setPreferredTimingSlot(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  >
                    {timingSlots.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* AI Notice pill */}
              <div className="p-3 rounded-lg bg-blue-50/60 border border-blue-100 flex items-center gap-2.5 text-xs text-blue-900">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                <span>
                  Society AI will evaluate this complaint for safety risks, assign a priority tag, and notify society handlers.
                </span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium text-sm rounded-lg shadow-sm transition flex items-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Analyzing with AI...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Submit Complaint</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
