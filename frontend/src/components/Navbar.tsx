import React from 'react';
import { Search, Bell, Zap, Plus, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { useProject } from '../context/ProjectContext';

interface NavbarProps {
  onOpenNewTaskModal?: () => void;
  onOpenNewProjectModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenNewTaskModal, onOpenNewProjectModal }) => {
  const {
    project,
    searchQuery,
    setSearchQuery,
    currentUser,
    alerts,
    setActiveView,
    backendOnline,
    resetToDemoData,
  } = useProject();

  const criticalCount = alerts.filter((a) => a.severity === 'Critical').length;

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-20 shadow-xs">
      {/* Search Bar */}
      <div className="flex items-center gap-3 w-96">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search tasks, contractors, trades..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Backend & WebSocket Status */}
        <div
          title={backendOnline ? 'FastAPI Backend & WebSocket Connected' : 'Running in Local Browser Mode (Fast & Offline-Ready)'}
          className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${
            backendOnline
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-slate-100 text-slate-600 border-slate-200'
          }`}
        >
          {backendOnline ? (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Live Sync Active</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3 h-3 text-slate-400" />
              <span>Local Engine</span>
            </>
          )}
        </div>

        {/* Quick Reset Demo */}
        <button
          onClick={resetToDemoData}
          title="Reset to Skyline Commercial Complex default data"
          className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors text-xs flex items-center gap-1"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span className="hidden lg:inline text-[11px]">Reset Demo</span>
        </button>

        {/* Delay Simulation Shortcut */}
        <button
          onClick={() => setActiveView('simulation')}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300/80 rounded-lg text-xs font-semibold transition-all shadow-xs"
        >
          <Zap className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
          <span>Simulate Delay</span>
        </button>

        {/* Add Task Button */}
        {onOpenNewTaskModal && (
          <button
            onClick={onOpenNewTaskModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-all shadow-sm shadow-blue-500/20"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Task</span>
          </button>
        )}

        {/* Notifications Bell */}
        <button
          onClick={() => setActiveView('alerts')}
          className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          title="View Alerts"
        >
          <Bell className="w-4 h-4" />
          {criticalCount > 0 && (
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full animate-pulse" />
          )}
        </button>

        {/* User Profile Pill */}
        <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
          <div className={`w-8 h-8 rounded-full text-white text-xs font-bold flex items-center justify-center shadow-xs ${
            currentUser.role === 'Site Contractor'
              ? 'bg-gradient-to-tr from-emerald-600 to-teal-500'
              : 'bg-gradient-to-tr from-blue-700 to-indigo-500'
          }`}>
            {currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
          </div>
          <div className="hidden lg:block text-left">
            <div className="text-xs font-bold text-slate-800 leading-tight">{currentUser.name}</div>
            <div className={`text-[10px] leading-tight font-semibold ${
              currentUser.role === 'Site Contractor' ? 'text-emerald-600' : 'text-blue-600'
            }`}>{currentUser.role}</div>
          </div>
        </div>
      </div>
    </header>
  );
};
