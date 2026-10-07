import React, { useState } from 'react';
import {
  Building2,
  CheckCircle2,
  User,
  Shield,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Phone,
  Home,
  Layers,
  Sparkles,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { api } from '../services/api';
import type { User as UserType } from '../types/society';

interface LoginPageProps {
  onLoginSuccess: (user: UserType) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [activeRole, setActiveRole] = useState<'resident' | 'admin'>('resident');
  const [isRegistering, setIsRegistering] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Form states - pre-filled with working demo credentials for instant 1-click access
  const [email, setEmail] = useState<string>('resident.1789882182@example.com');
  const [password, setPassword] = useState<string>('Resident@123');
  const [name, setName] = useState<string>('Smoke Resident');
  const [phone, setPhone] = useState<string>('+91 98765 43210');
  const [flatNumber, setFlatNumber] = useState<string>('Flat C-110');
  const [wing, setWing] = useState<string>('Wing C');

  const handleAdminFill = () => {
    setActiveRole('admin');
    setIsRegistering(false);
    setEmail('admin@society.com');
    setPassword('Admin@123');
    setError(null);
  };

  const handleResidentDemoFill = () => {
    setActiveRole('resident');
    setIsRegistering(false);
    setEmail('resident.1789882182@example.com');
    setPassword('Resident@123');
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const submitEmail = (email && email.trim()) || (activeRole === 'admin' ? 'admin@society.com' : 'resident.1789882182@example.com');
    const submitPassword = password || (activeRole === 'admin' ? 'Admin@123' : 'Resident@123');

    try {
      if (isRegistering && activeRole === 'resident') {
        const { user } = await api.register({
          name: name || 'New Resident',
          email: submitEmail,
          password: submitPassword,
          phone: phone || '+91 98765 43210',
          flatNumber: flatNumber || 'Flat C-110',
          wing: wing || 'Wing C',
        });
        onLoginSuccess(user);
      } else {
        const { user } = await api.login({
          email: submitEmail,
          password: submitPassword,
          role: activeRole,
        });
        onLoginSuccess(user);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-[#080E1E] text-slate-100 font-sans antialiased">
      {/* Left Column - Dark Brand Section */}
      <div className="relative w-full md:w-1/2 bg-[#091224] p-8 md:p-14 lg:p-20 flex flex-col justify-between overflow-hidden border-b md:border-b-0 md:border-r border-slate-800/80">
        {/* Subtle decorative concentric circles */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full border border-blue-500/10 pointer-events-none" />
        <div className="absolute -top-16 -left-16 w-80 h-80 rounded-full border border-blue-500/15 pointer-events-none" />
        <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[540px] h-[540px] rounded-full border border-blue-500/5 pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header / Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/30">
            <Building2 className="w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">Society Portal</span>
        </div>

        {/* Center Content */}
        <div className="relative z-10 my-12 md:my-0 max-w-lg">
          <div className="text-blue-400 text-xs font-semibold tracking-widest uppercase mb-4">
            COMMUNITY OPERATIONS
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.15] mb-6">
            Better service starts with a clear signal.
          </h1>
          <p className="text-slate-300 text-base sm:text-lg leading-relaxed mb-8 font-normal">
            One trusted place for residents to raise concerns and for teams to resolve them with clarity.
          </p>

          <div className="space-y-4">
            <div className="flex items-center gap-3 text-slate-200 text-sm sm:text-base">
              <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0" />
              <span>AI-assisted routing to the right department</span>
            </div>
            <div className="flex items-center gap-3 text-slate-200 text-sm sm:text-base">
              <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0" />
              <span>Visible ownership and status at every step</span>
            </div>
            <div className="flex items-center gap-3 text-slate-200 text-sm sm:text-base">
              <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0" />
              <span>Notices that keep the whole community informed</span>
            </div>
          </div>
        </div>

        {/* Bottom Quote */}
        <div className="relative z-10 pt-6 border-t border-slate-800/80">
          <div className="flex items-start gap-3">
            <span className="text-blue-400 text-2xl font-serif leading-none shrink-0 select-none">“</span>
            <div>
              <p className="text-slate-300 text-sm leading-relaxed">
                When everyone can see the next step, small{' '}
                <span className="bg-blue-600/40 text-blue-200 px-1.5 py-0.5 rounded font-medium">
                  issues
                </span>{' '}
                stay small.
              </p>
              <p className="text-slate-400 text-xs mt-2 font-medium">
                Society management office
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Clean White Authentication Box */}
      <div className="w-full md:w-1/2 bg-white text-slate-800 p-8 md:p-14 lg:p-20 flex flex-col justify-center items-center">
        <div className="w-full max-w-md">
          {/* Top Label & Header */}
          <div className="mb-6">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
              WELCOME
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-1">
              {isRegistering ? 'Create resident account' : 'Sign in to your portal'}
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              {isRegistering
                ? 'Join your society network and stay updated with your flat.'
                : 'Access your complaints, updates, and community notices.'}
            </p>
          </div>

          {/* Segmented Control - Resident vs Admin */}
          <div className="bg-slate-100 p-1 rounded-xl flex gap-1 mb-6 border border-slate-200">
            <button
              type="button"
              onClick={() => {
                setActiveRole('resident');
                setEmail('resident.1789882182@example.com');
                setPassword('Resident@123');
                setError(null);
              }}
              className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeRole === 'resident'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Resident</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveRole('admin');
                setIsRegistering(false);
                setEmail('admin@society.com');
                setPassword('Admin@123');
                setError(null);
              }}
              className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeRole === 'admin'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Admin</span>
            </button>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex flex-col gap-1.5">
              <span>{error}</span>
              <button
                type="button"
                onClick={activeRole === 'admin' ? handleAdminFill : handleResidentDemoFill}
                className="text-left font-semibold underline text-blue-700 hover:text-blue-900 cursor-pointer text-xs"
              >
                Auto-fill working demo credentials
              </button>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegistering && activeRole === 'resident' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Smoke Resident"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Flat / House No.
                    </label>
                    <div className="relative">
                      <Home className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. C-110"
                        value={flatNumber}
                        onChange={(e) => setFlatNumber(e.target.value)}
                        className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Wing
                    </label>
                    <div className="relative">
                      <Layers className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Wing C"
                        value={wing}
                        onChange={(e) => setWing(e.target.value)}
                        className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Email address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder={
                    activeRole === 'admin'
                      ? 'admin@society.com'
                      : 'you@example.com'
                  }
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium text-sm rounded-lg shadow-sm transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : isRegistering ? (
                <>
                  <span>Create resident account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>Continue as {activeRole}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Toggle Register / Sign In for Residents */}
          {activeRole === 'resident' && (
            <div className="mt-5 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsRegistering(!isRegistering);
                  setError(null);
                }}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition cursor-pointer"
              >
                {isRegistering
                  ? 'Already have an account? Sign in'
                  : 'New resident? Create an account'}
              </button>
            </div>
          )}

          {/* Resident Demo Credentials Box */}
          {activeRole === 'resident' && !isRegistering && (
            <div className="mt-5 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-blue-600" />
                  Demo Resident Credentials
                </span>
                <button
                  type="button"
                  onClick={handleResidentDemoFill}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
                >
                  Auto-fill
                </button>
              </div>
              <div className="text-xs text-slate-600 space-y-1 font-mono">
                <div>Email: <span className="font-semibold text-slate-900">resident.1789882182@example.com</span></div>
                <div>Password: <span className="font-semibold text-slate-900">Resident@123</span></div>
              </div>
            </div>
          )}

          {/* Admin Demo Credentials Box */}
          {activeRole === 'admin' && (
            <div className="mt-5 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-blue-600" />
                  Demo Admin Credentials
                </span>
                <button
                  type="button"
                  onClick={handleAdminFill}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
                >
                  Auto-fill
                </button>
              </div>
              <div className="text-xs text-slate-600 space-y-1 font-mono">
                <div>Email: <span className="font-semibold text-slate-900">admin@society.com</span></div>
                <div>Password: <span className="font-semibold text-slate-900">Admin@123</span></div>
              </div>
            </div>
          )}

          {/* Bottom Security Notice */}
          <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-center gap-1.5 text-slate-400 text-xs">
            <Lock className="w-3.5 h-3.5" />
            <span>Secure role-based access for your community</span>
          </div>
        </div>
      </div>
    </div>
  );
};
