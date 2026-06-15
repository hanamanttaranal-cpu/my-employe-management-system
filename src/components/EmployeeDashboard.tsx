import { motion } from 'motion/react';
import { LogOut, DollarSign, Calendar, Mail, FileText, BadgeCheck, Clock, RefreshCw } from 'lucide-react';
import { EmployeeProfile, SalaryStatus } from '../types';

interface EmployeeDashboardProps {
  userProfile: EmployeeProfile;
  onLogout: () => void;
}

export default function EmployeeDashboard({ userProfile, onLogout }: EmployeeDashboardProps) {
  const formatMoney = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };

  const getStatusColor = (status: SalaryStatus) => {
    switch (status) {
      case SalaryStatus.PAID:
        return 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400';
      case SalaryStatus.PROCESSING:
        return 'bg-blue-500/15 border-blue-500/30 text-blue-400';
      case SalaryStatus.PENDING:
        return 'bg-amber-500/15 border-amber-500/30 text-amber-400';
      default:
        return 'bg-slate-500/15 border-slate-500/30 text-slate-400';
    }
  };

  const getStatusIcon = (status: SalaryStatus) => {
    switch (status) {
      case SalaryStatus.PAID:
        return <BadgeCheck className="w-5 h-5 text-emerald-400" />;
      case SalaryStatus.PROCESSING:
        return <RefreshCw className="w-5 h-5 text-blue-400 animate-spin" />;
      case SalaryStatus.PENDING:
        return <Clock className="w-5 h-5 text-amber-400" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-6 md:p-12 w-full" id="employee-dashboard-v8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Navigation Bar */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-5">
          <div>
            <span className="text-xs font-mono text-emerald-400 tracking-wider uppercase font-medium">Employee Portal</span>
            <h2 className="text-2xl font-bold tracking-tight mt-0.5">Welcome Back, {userProfile.name}</h2>
          </div>
          <button
            id="employee-logout-btn"
            onClick={onLogout}
            className="flex items-center gap-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:border-slate-700 text-slate-300 py-2 px-4 rounded-lg text-xs font-medium transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>

        {/* Overview Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Profile Summary */}
          <div className="col-span-1 md:col-span-2 bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 relative overflow-hidden backdrop-blur-sm">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-5">Profile Information</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 font-sans font-medium block">Corporate Email</span>
                  <span className="text-sm font-mono text-slate-200">{userProfile.email}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-400">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 font-sans font-medium block">Corporate Assignment</span>
                  <span className="text-sm font-semibold text-white">{userProfile.role}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-400">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 font-sans font-medium block">Joining Date</span>
                  <span className="text-sm text-slate-300">
                    {new Date(userProfile.joinedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Security & ID Detail */}
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 relative overflow-hidden backdrop-blur-sm flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Security ID</h3>
              <p className="text-xs text-slate-500 font-sans leading-relaxed mb-4">
                Your authentication index is synchronized with secure system firewalls.
              </p>
            </div>
            <div className="p-4 bg-slate-950 border border-slate-850 rounded-xl">
              <span className="text-[10px] text-slate-500 font-mono block mb-1">FIREBASE AUTHLINK UID</span>
              <span className="text-[11px] text-emerald-400 font-mono block break-all">{userProfile.uid}</span>
            </div>
          </div>

        </div>

        {/* Salary Status & Disbursement Module */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl" id="payroll-card-v2">
          
          {/* Header Banner */}
          <div className="px-6 py-5 bg-slate-900 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white">Payroll & Salary Receipt</h3>
              <p className="text-xs text-slate-400 mt-1">Current monthly salary ledger status</p>
            </div>
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 border rounded-lg text-xs font-semibold ${getStatusColor(userProfile.salaryStatus)}`}>
              {getStatusIcon(userProfile.salaryStatus)}
              <span>Disbursement: {userProfile.salaryStatus}</span>
            </div>
          </div>

          {/* Card Body */}
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-slate-950/30">
            
            {/* Salary display */}
            <div className="space-y-2">
              <span className="text-xs text-slate-500 uppercase tracking-widest block font-medium">Assigned Monthly Rate</span>
              <div className="flex items-baseline gap-1 text-4xl font-extrabold text-white">
                <span className="text-emerald-400 text-3xl font-bold font-mono">$</span>
                <span className="tracking-tight font-mono">{formatMoney(userProfile.salary).replace('$', '')}</span>
                <span className="text-slate-500 text-sm font-semibold ml-2">/ month</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed pt-2">
                This rate is based on your job assignment and standard contract arrangements negotiated upon onboarding.
              </p>
            </div>

            {/* Visual Progress Meter for Processing statuses */}
            <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-xl space-y-4">
              <h4 className="text-xs font-bold text-slate-300">Transaction Details</h4>
              
              {userProfile.salaryStatus === SalaryStatus.PAID && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Ledger Settlement</span>
                    <span className="text-emerald-400 font-semibold font-mono">100% Completed</span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-2">
                    <div className="bg-emerald-500 h-2 rounded-full w-full" />
                  </div>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    Current payperiod has been processed, approved, and funds credited to your registered bank routing setup.
                  </p>
                </div>
              )}

              {userProfile.salaryStatus === SalaryStatus.PROCESSING && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Clearing Dispatcher</span>
                    <span className="text-blue-400 font-semibold font-mono">Pending Bank Clearance (65%)</span>
                  </div>
                  <div className="w-full bg-slate-955 rounded-full h-2 overflow-hidden">
                    <motion.div 
                      className="bg-blue-500 h-2 rounded-full"
                      initial={{ width: "10%" }}
                      animate={{ width: "65%" }}
                      transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    The accounting division has cleared payroll. Funds are presently navigating network clearance with clearinghouses.
                  </p>
                </div>
              )}

              {userProfile.salaryStatus === SalaryStatus.PENDING && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Auditing Queue</span>
                    <span className="text-amber-400 font-semibold font-mono">Awaiting Review (10%)</span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-2">
                    <div className="bg-amber-500 h-2 rounded-full w-[10%]" />
                  </div>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    Awaiting authorization from the department head to trigger disbursement orders.
                  </p>
                </div>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
