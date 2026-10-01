import React, { useState } from 'react';
import { HardHat, Building2, ShieldCheck, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { useProject } from '../context/ProjectContext';

export const LandingLoginPage: React.FC = () => {
  const { setIsLoggedIn, setActiveView } = useProject();
  const [email, setEmail] = useState('zainab.s@buildtrack.com');
  const [password, setPassword] = useState('••••••••');
  const [isSignUp, setIsSignUp] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'Project Manager' | 'Site Contractor'>('Project Manager');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('buildtrack_user_role', selectedRole);
    setIsLoggedIn(true);
    setActiveView('dashboard');
  };

  const handleQuickDemo = () => {
    localStorage.setItem('buildtrack_user_role', selectedRole);
    setIsLoggedIn(true);
    setActiveView('dashboard');
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-slate-950 overflow-hidden">
      {/* Background construction hero image with subtle overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-luminosity scale-105 transition-all duration-1000"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1541888946425-d0fbb18615f3?auto=format&fit=crop&w=2000&q=80')`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-tr from-navy-950 via-slate-900/90 to-amber-950/30" />

      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#ffffff 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }}
      />

      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 py-12 flex flex-col lg:flex-row items-center justify-between gap-12">
        {/* Left Hero Branding (Matches Screen 1) */}
        <div className="flex-1 text-white space-y-6">
          <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            AI-Driven CPM Delay Analytics
          </div>

          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/30 ring-2 ring-amber-300/30">
              <Building2 className="w-8 h-8 text-slate-950 stroke-[2.2]" />
            </div>
            <div>
              <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight font-sans text-white">
                Build<span className="text-amber-400">Track</span>
              </h1>
              <p className="text-amber-200/80 text-sm font-medium tracking-wide">
                Construction Project Delay Risk Monitor
              </p>
            </div>
          </div>

          <p className="text-2xl font-light text-slate-200">
            Plan <span className="text-amber-400 font-semibold">•</span> Track <span className="text-amber-400 font-semibold">•</span> Prevent <span className="text-amber-400 font-semibold">•</span> Deliver
          </p>

          <p className="text-slate-400 text-sm max-w-lg leading-relaxed">
            Real-time Critical Path Method (CPM) calculation, interactive Gantt timelines, React Flow dependency graphs, and what-if delay impact simulation built for high-stakes construction engineering.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-2 max-w-md">
            <div className="flex items-center gap-2.5 text-xs text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Sub-second CPM Topological Sort</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Interactive React Flow DAG</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Predictive Cascade Delay Simulator</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Live Multi-Trade Collaboration</span>
            </div>
          </div>
        </div>

        {/* Right Login Card (Screen 1 Exact Match) */}
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 border border-slate-100">
          <div className="mb-6">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-600 mb-1">
              <HardHat className="w-4 h-4" />
              BuildTrack Workspace Access
            </div>
            <h2 className="text-2xl font-bold text-slate-900">
              {isSignUp ? 'Create your Account' : 'Welcome Back!'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {isSignUp
                ? 'Join site managers, contractors and PMs today'
                : 'Sign in to continue to your projects'}
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Email or Username
              </label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="project.manager@buildtrack.com"
                required
                className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all bg-slate-50/50"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                {!isSignUp && (
                  <a href="#forgot" className="text-xs text-amber-600 hover:underline">
                    Forgot?
                  </a>
                )}
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all bg-slate-50/50"
              />
            </div>

            {/* Role Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Select Your Role
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['Project Manager', 'Site Contractor'] as const).map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setSelectedRole(role)}
                    className={`py-2.5 px-3 rounded-lg border text-xs font-bold transition-all ${
                      selectedRole === role
                        ? 'bg-amber-500 border-amber-500 text-white shadow-md shadow-amber-200'
                        : 'border-slate-300 text-slate-600 hover:border-amber-400 hover:bg-amber-50'
                    }`}
                  >
                    {role === 'Project Manager' ? '👷 Project Manager' : '🔧 Site Contractor'}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 group"
            >
              <span>{isSignUp ? 'Create Account' : 'Login'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </form>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-xs text-slate-500 bg-white px-2">
              or
            </div>
          </div>

          {/* Continue with Google button */}
          <button
            type="button"
            onClick={handleQuickDemo}
            className="w-full py-2.5 px-4 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-medium text-sm transition-all flex items-center justify-center gap-2.5 shadow-sm"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Quick Demo Access Bar */}
          <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-200/60">
            <div className="text-xs font-bold text-amber-900 mb-2">⚡ Quick Demo Access</div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => { localStorage.setItem('buildtrack_user_role', 'Project Manager'); handleQuickDemo(); }}
                className="py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors"
              >
                👷 Demo as PM
              </button>
              <button
                onClick={() => { localStorage.setItem('buildtrack_user_role', 'Site Contractor'); handleQuickDemo(); }}
                className="py-2 px-3 rounded-lg bg-slate-700 hover:bg-slate-800 text-white text-xs font-bold transition-colors"
              >
                🔧 Demo as Contractor
              </button>
            </div>
          </div>

          <div className="mt-5 text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-xs text-slate-500 hover:text-slate-800"
            >
              {isSignUp ? (
                <>Already have an account? <span className="font-semibold text-blue-600">Sign In</span></>
              ) : (
                <>Don't have an account? <span className="font-semibold text-blue-600">Sign Up</span></>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Footer bar */}
      <div className="absolute bottom-4 left-0 right-0 text-center text-xs text-slate-500 z-10 flex items-center justify-center gap-4">
        <span>© 2026 BuildTrack Inc.</span>
        <span>•</span>
        <span className="inline-flex items-center gap-1 text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          Enterprise Construction Security Ready
        </span>
      </div>
    </div>
  );
};
