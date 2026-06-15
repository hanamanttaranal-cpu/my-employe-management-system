import React, { useState } from 'react';
import { motion } from 'motion/react';
import { LogIn, UserPlus, ShieldAlert, BadgeCheck, Sparkles } from 'lucide-react';
import { CustomRole } from '../types';

interface LoginScreenProps {
  onLogin: (email: string, pass: string) => Promise<boolean>;
  onRegister: (name: string, email: string, roleName: string, expectedSalary: number) => Promise<boolean>;
  availableRoles: CustomRole[];
}

export default function LoginScreen({ onLogin, onRegister, availableRoles }: LoginScreenProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [salaryRequested, setSalaryRequested] = useState('75000');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide email and password.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const match = await onLogin(email, password);
      if (!match) {
        setError('Invalid credentials. Hint: Admin is myname@1.com / 12345');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !selectedRole) {
      setError('Please fill in all employee registration fields.');
      return;
    }
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const ok = await onRegister(name, email, selectedRole, Number(salaryRequested));
      if (ok) {
        setSuccess('Registration requested successfully! You can now log in.');
        setName('');
        setEmail('');
        setSelectedRole('');
        setSalaryRequested('75000');
        setIsSignUp(false);
      } else {
        setError('Email is already registered under this company.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleAutoFillAdmin = () => {
    setEmail('myname@1.com');
    setPassword('12345');
    setError('');
  };

  return (
    <div className="flex min-height-screen items-center justify-center p-6 bg-slate-950 w-full" id="login-screen-v7">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-8 relative">
        
        {/* Glow effect */}
        <div className="absolute top-0 left-1/4 w-1/2 h-1 bg-gradient-to-r from-emerald-500 via-blue-500 to-indigo-500 rounded-full" />
        
        {/* Header Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-slate-950 border border-slate-800 rounded-xl mb-3 shadow-inner">
            <Sparkles className="w-6 h-6 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-sans">
            Employee Workspace
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Enterprise Portal & Payroll Directory
          </p>
        </div>

        {/* Toggle Mode */}
        <div className="grid grid-cols-2 p-1 bg-slate-950 border border-slate-800 rounded-lg mb-6">
          <button
            id="toggle-siginin-btn"
            onClick={() => { setIsSignUp(false); setError(''); setSuccess(''); }}
            className={`py-2 text-xs font-medium rounded-md transition-all duration-200 ${
              !isSignUp ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Employee / Admin Sign In
          </button>
          <button
            id="toggle-signup-btn"
            onClick={() => { setIsSignUp(true); setError(''); setSuccess(''); }}
            className={`py-2 text-xs font-medium rounded-md transition-all duration-200 ${
              isSignUp ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            New Employee SignUp
          </button>
        </div>

        {/* Display Banner Reports */}
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="flex items-start gap-2.5 p-3.5 bg-red-950/50 border border-red-900/60 rounded-lg text-red-400 text-xs mb-4"
          >
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </motion.div>
        )}

        {success && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="flex items-start gap-2.5 p-3.5 bg-emerald-950/50 border border-emerald-900/60 rounded-lg text-emerald-400 text-xs mb-4"
          >
            <BadgeCheck className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{success}</span>
          </motion.div>
        )}

        {/* Dynamic Forms Container */}
        {!isSignUp ? (
          <form id="signin-form" onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 font-sans">
                Corporate Email Address
              </label>
              <input
                id="login-email-input"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="myname@1.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 px-3.5 text-slate-200 placeholder:text-slate-600 text-sm focus:outline-none focus:border-slate-600 focus:ring-1 focus:ring-slate-600 transition-all font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 font-sans">
                Account Password
              </label>
              <input
                id="login-password-input"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="•••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 px-3.5 text-slate-200 placeholder:text-slate-600 text-sm focus:outline-none focus:border-slate-600 focus:ring-1 focus:ring-slate-600 transition-all font-mono"
              />
            </div>

            <button
              id="login-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white font-medium py-2.5 px-4 rounded-lg text-sm border border-slate-700 shadow-lg cursor-pointer transform active:scale-[0.98] transition-all duration-150 mt-2 hover:border-slate-600 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-slate-400 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-4 h-4 text-emerald-400" />
                  Sign In to Workspace
                </>
              )}
            </button>

            {/* Admin autofill helper */}
            <div className="mt-6 pt-5 border-t border-slate-800 text-center">
              <span className="text-xs text-slate-500 font-sans block mb-2">
                Need to test the Admin Console immediately?
              </span>
              <button
                id="autofill-admin-btn"
                type="button"
                onClick={handleAutoFillAdmin}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-950 border border-slate-800 hover:bg-slate-800 hover:border-slate-700 font-sans font-medium text-[11px] text-emerald-400 rounded-md transition-all cursor-pointer"
              >
                Auto-fill Admin Credentials
              </button>
            </div>
          </form>
        ) : (
          <form id="signup-form" onSubmit={handleRegisterSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Full Employee Name
              </label>
              <input
                id="register-name-input"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Sarah Jenkins"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 px-3.5 text-slate-200 placeholder:text-slate-600 text-sm focus:outline-none focus:border-slate-600 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Corporate Email Address
              </label>
              <input
                id="register-email-input"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sarah@corp-domain.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 px-3.5 text-slate-200 placeholder:text-slate-600 text-sm focus:outline-none focus:border-slate-600 transition-all font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Operational Job Role
              </label>
              <select
                id="register-role-select"
                required
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 px-3.5 text-slate-200 text-sm focus:outline-none focus:border-slate-600 transition-all"
              >
                <option value="">-- Choose Role --</option>
                {availableRoles.map((role) => (
                  <option id={`role-opt-${role.id}`} key={role.id} value={role.roleName}>
                    {role.roleName}
                  </option>
                ))}
              </select>
              <span className="text-[10px] text-slate-500 block mt-1 font-sans">
                Admins can dynamically create additional custom roles.
              </span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Requested Annual Salary (USD)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2 text-slate-500 text-sm font-mono">$</span>
                <input
                  id="register-salary-input"
                  type="number"
                  required
                  min="0"
                  step="1000"
                  value={salaryRequested}
                  onChange={(e) => setSalaryRequested(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 pl-7 pr-3.5 text-slate-200 text-sm font-mono focus:outline-none focus:border-slate-600 transition-all"
                />
              </div>
            </div>

            <button
              id="register-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white font-medium py-2.5 px-4 rounded-lg text-sm border border-slate-700 shadow-lg cursor-pointer transform active:scale-[0.98] transition-all duration-150 mt-2 hover:border-slate-600 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-slate-400 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <UserPlus className="w-4 h-4 text-emerald-400" />
                  Request Registration
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
