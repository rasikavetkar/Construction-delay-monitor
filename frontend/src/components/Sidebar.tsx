import React from 'react';
import {
  LayoutDashboard,
  FolderGit2,
  ListTodo,
  CalendarDays,
  Network,
  Zap,
  CheckSquare,
  Bell,
  BarChart3,
  Users2,
  Settings,
  HardHat,
  LogOut,
  Truck,
  MessageSquare,
} from 'lucide-react';
import { useProject } from '../context/ProjectContext';

export const Sidebar: React.FC = () => {
  const { activeView, setActiveView, alerts, project, setIsLoggedIn, deliveries, currentUser } = useProject();

  const criticalAlertsCount = alerts.filter((a) => a.severity === 'Critical').length;
  const delayedDeliveriesCount = deliveries.filter((d) => d.status === 'Delayed').length;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tasks', label: 'Task Management', icon: ListTodo },
    { id: 'gantt', label: 'Gantt Timeline', icon: CalendarDays },
    { id: 'graph', label: 'Dependency Graph', icon: Network },
    { id: 'simulation', label: 'Delay Simulation', icon: Zap, badge: 'What-If' },
    { id: 'progress', label: 'Progress Updates', icon: CheckSquare },
    { id: 'deliveries', label: 'Material Deliveries', icon: Truck, count: delayedDeliveriesCount },
    { id: 'collaboration', label: 'Field Collaboration', icon: MessageSquare },
    { id: 'alerts', label: 'Alerts & Float Risks', icon: Bell, count: criticalAlertsCount },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
    { id: 'contractors', label: 'Contractors & Labor', icon: Users2 },
    { id: 'projects', label: 'Project Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#0a1324] text-slate-300 flex flex-col shrink-0 select-none border-r border-slate-800 z-30 transition-all duration-300">
      {/* Brand Header */}
      <div className="h-16 flex items-center gap-3 px-5 border-b border-slate-800/80 bg-[#0d182d]">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 flex items-center justify-center shadow-md shadow-amber-500/20">
          <HardHat className="w-5 h-5 text-slate-950 stroke-[2.2]" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-white text-lg tracking-tight font-sans">
            Build<span className="text-amber-400">Track</span>
          </span>
          <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">
            Delay Risk Monitor
          </span>
        </div>
      </div>

      {/* Active Project Ribbon */}
      <div className="px-4 py-3 bg-[#0d1c36] border-b border-slate-800/60">
        <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Active Site</div>
        <div className="text-xs font-semibold text-white truncate mt-0.5 flex items-center justify-between">
          <span>{project.name}</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>

              <div className="flex items-center gap-1.5">
                {item.badge && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {item.badge}
                  </span>
                )}

                {item.count !== undefined && item.count > 0 && (
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-red-500 text-white">
                    {item.count}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </nav>

      {/* Footer / User Profile card */}
      <div className="p-3 border-t border-slate-800/80 bg-[#0d182d]">
        <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`w-8 h-8 rounded-full text-white font-bold flex items-center justify-center text-xs shadow-sm ${
              currentUser.role === 'Site Contractor' ? 'bg-emerald-600' : 'bg-blue-600'
            }`}>
              {currentUser.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-white truncate">{currentUser.name}</div>
              <div className={`text-[10px] truncate font-semibold ${
                currentUser.role === 'Site Contractor' ? 'text-emerald-400' : 'text-blue-400'
              }`}>{currentUser.role}</div>
            </div>
          </div>
          <button
            onClick={() => setIsLoggedIn(false)}
            title="Log Out"
            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
