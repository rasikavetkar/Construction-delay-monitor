import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  ChevronRight,
  TrendingUp,
  Activity,
  Zap,
  Building,
  Truck,
  ShieldAlert,
  ArrowUpRight,
  Users2,
  Package,
} from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { formatDisplayDate } from '../utils/cpm';

export const DashboardView: React.FC = () => {
  const {
    project,
    tasks,
    alerts,
    activities,
    recoveryActions,
    criticalPath,
    deliveries,
    taskThreatRankings,
    setActiveView,
    applyRecoveryAction,
  } = useProject();

  const [dashView, setDashView] = useState<'graph' | 'gantt'>('graph');

  const activeAlerts = alerts.slice(0, 4);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner / Welcome Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600 mb-1">
            <Building className="w-3.5 h-3.5" />
            Project Command Center • Requirement 6
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Good Morning, Zainab! Centralized risk monitor for{' '}
            <span className="font-semibold text-slate-800">{project.name}</span>.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-right">
            <div className="text-[10px] uppercase font-semibold text-slate-400">Site Location</div>
            <div className="text-xs font-bold text-slate-800">{project.location} ({project.projectType})</div>
          </div>
          <button
            onClick={() => setActiveView('simulation')}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-500/20 transition-all hover:scale-[1.02]"
          >
            <Zap className="w-4 h-4 fill-white" />
            <span>Simulate Delays (What-If)</span>
          </button>
        </div>
      </div>

      {/* 4 Primary KPI Cards (Requirement 6) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Target Finish */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs relative overflow-hidden group hover:border-blue-300 transition-all">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Calendar className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Contractual</span>
          </div>
          <div className="mt-4">
            <div className="text-xs text-slate-500 font-medium">Target Finish Date</div>
            <div className="text-2xl font-extrabold text-slate-900 mt-0.5">
              {formatDisplayDate(project.targetFinishDate)}
            </div>
          </div>
          <div className="mt-3 text-[11px] text-slate-400 flex items-center gap-1">
            <span>Agreed client baseline</span>
          </div>
        </div>

        {/* 2. Projected Finish */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs relative overflow-hidden group hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
            {project.scheduleVarianceDays > 0 ? (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                +{project.scheduleVarianceDays} days slip
              </span>
            ) : (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                On Schedule
              </span>
            )}
          </div>
          <div className="mt-4">
            <div className="text-xs text-slate-500 font-medium">Projected Finish Date</div>
            <div className="text-2xl font-extrabold text-slate-900 mt-0.5">
              {formatDisplayDate(project.projectedFinishDate)}
            </div>
          </div>
          <div className="mt-3 text-[11px] text-slate-400 flex items-center gap-1">
            <span>Dynamically computed via CPM DAG</span>
          </div>
        </div>

        {/* 3. Overall Progress */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs relative overflow-hidden group hover:border-cyan-300 transition-all">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center font-bold">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-full">
              {tasks.filter((t) => t.status === 'Completed').length} of {tasks.length} tasks complete
            </span>
          </div>
          <div className="mt-4">
            <div className="text-xs text-slate-500 font-medium">Overall Progress</div>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-extrabold text-slate-900">{project.overallProgress}%</span>
              <span className="text-xs text-slate-400">weighted execution</span>
            </div>
          </div>
          <div className="mt-3 w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-cyan-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${project.overallProgress}%` }}
            />
          </div>
        </div>

        {/* 4. Schedule Variance */}
        <div className="bg-white rounded-2xl p-5 border border-red-200/80 bg-gradient-to-b from-white to-red-50/20 shadow-xs relative overflow-hidden group hover:border-red-400 transition-all">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center font-bold">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-500 text-white flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> AI Risk Alert
            </span>
          </div>
          <div className="mt-4">
            <div className="text-xs text-slate-500 font-medium">Schedule Variance</div>
            <div className="text-2xl font-extrabold text-red-600 mt-0.5">
              +{project.scheduleVarianceDays} days
            </div>
          </div>
          <div className="mt-3 text-[11px] text-red-700 font-medium truncate">
            Critical Path Foundation delayed by 3d
          </div>
        </div>
      </div>

      {/* View Switcher: Inline Network / Gantt Preview */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-900">Schedule View</h3>
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setDashView('graph')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                dashView === 'graph' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              🕸 Dependency Graph
            </button>
            <button
              onClick={() => setDashView('gantt')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                dashView === 'gantt' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              📅 Gantt Timeline
            </button>
          </div>
        </div>

        {dashView === 'graph' ? (
          /* Mini network preview showing critical path as nodes */
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 overflow-x-auto">
            <div className="flex items-center gap-2 min-w-max">
              {criticalPath.map((node, index) => (
                <React.Fragment key={node.id}>
                  <div
                    onClick={() => setActiveView('graph')}
                    className="cursor-pointer px-4 py-3 rounded-xl border-2 border-red-400 bg-red-50 hover:bg-red-100 transition-colors text-center min-w-[100px]"
                  >
                    <div className="text-xs font-bold text-red-900">{node.name}</div>
                    <div className="text-[10px] text-red-600 mt-0.5">{node.duration}d • 0 float</div>
                  </div>
                  {index < criticalPath.length - 1 && (
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-0.5 bg-red-400" />
                      <div className="w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-red-400 -mt-0.5" />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
            <p className="text-[10px] text-slate-400 mt-3">Click any node to open full interactive graph →</p>
          </div>
        ) : (
          /* Mini Gantt preview showing task bars */
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 overflow-x-auto">
            <div className="space-y-2 min-w-[600px]">
              {tasks.slice(0, 5).map((t) => {
                const totalDays = 36;
                const leftPct = ((t.earlyStart ?? 0) / totalDays) * 100;
                const widthPct = Math.max(2, (t.duration / totalDays) * 100);
                return (
                  <div key={t.id} className="flex items-center gap-3">
                    <div className="w-24 text-[11px] font-semibold text-slate-700 text-right truncate shrink-0">{t.name}</div>
                    <div className="flex-1 relative h-6 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`absolute top-0 h-full rounded-full flex items-center px-2 text-[10px] font-bold text-white ${
                          t.isCritical ? 'bg-red-500' : (t.totalFloat ?? 99) <= 2 ? 'bg-yellow-400' : 'bg-blue-500'
                        }`}
                        style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                      >
                        {t.duration}d
                      </div>
                    </div>
                    <div className="text-[10px] text-slate-400 w-12 text-right shrink-0">{t.progress}%</div>
                  </div>
                );
              })}
            </div>
            <button onClick={() => setActiveView('gantt')} className="mt-3 text-[10px] text-blue-600 font-semibold hover:underline">Open full Gantt →</button>
          </div>
        )}
      </div>

      {/* Middle Row: Top Delay Risks + Critical Path Flow */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top Delay Risks Table (5 Cols on large) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-bold text-slate-900">Top Delay Risks (Threat Ranking)</h3>
              </div>
              <button
                onClick={() => setActiveView('simulation')}
                className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-0.5"
              >
                Simulation Sandbox <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase text-[10px]">
                    <th className="pb-2">#</th>
                    <th className="pb-2">Task</th>
                    <th className="pb-2 text-center">Threat Level</th>
                    <th className="pb-2 text-right">Threat Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {taskThreatRankings.slice(0, 5).map((t, idx) => (
                    <tr key={t.taskId} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-2.5 text-slate-400 font-mono text-[11px]">#{idx + 1}</td>
                      <td className="py-2.5 font-semibold text-slate-800">
                        <div className="flex flex-col">
                          <span>{t.taskName}</span>
                          <span className="text-[10px] font-normal text-slate-400">
                            {t.trade} • {t.totalFloat === 0 ? 'Zero Float' : `${t.totalFloat}d float`}
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            t.threatLevel === 'Critical'
                              ? 'bg-red-100 text-red-700'
                              : t.threatLevel === 'High'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {t.threatLevel}
                        </span>
                      </td>
                      <td className="py-2.5 text-right font-black text-slate-900 font-mono">
                        {t.threatScore}/100
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Evaluated via dynamic topological sort</span>
            <button
              onClick={() => setActiveView('tasks')}
              className="text-blue-600 font-semibold hover:underline"
            >
              View All Tasks &rarr;
            </button>
          </div>
        </div>

        {/* Critical Path Flowchart Preview (7 Cols on large) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-red-500" />
                <h3 className="text-sm font-bold text-slate-900">Tasks on Critical Path (Zero Slack)</h3>
              </div>
              <button
                onClick={() => setActiveView('graph')}
                className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-0.5"
              >
                Interactive Graph <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              These tasks directly govern delivery date. Any slip here causes an equal delay in final project completion.
            </p>

            {/* Visual Critical Path Sequence */}
            <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/80 overflow-x-auto">
              <div className="flex items-center gap-2 min-w-max py-2">
                {criticalPath.map((node, index) => (
                  <React.Fragment key={node.id}>
                    <div
                      className={`px-3 py-2.5 rounded-xl border text-center transition-all shadow-xs ${
                        node.status === 'Delayed'
                          ? 'bg-red-50 border-red-300 text-red-900 ring-2 ring-red-400/20'
                          : node.status === 'In Progress'
                          ? 'bg-amber-50 border-amber-300 text-amber-900'
                          : 'bg-white border-slate-200 text-slate-800'
                      }`}
                    >
                      <div className="text-xs font-bold whitespace-nowrap">{node.name}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{node.duration} days</div>
                      {node.status === 'Delayed' && (
                        <div className="text-[9px] font-bold text-red-600 mt-1">Delayed!</div>
                      )}
                    </div>

                    {index < criticalPath.length - 1 && (
                      <ArrowRight className="w-4 h-4 text-red-400 shrink-0" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              Zero-slack critical tasks: <strong>{criticalPath.length}</strong>
            </span>
            <button
              onClick={() => setActiveView('gantt')}
              className="text-xs text-blue-600 font-semibold hover:underline"
            >
              Open Gantt Timeline &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Active Alerts, Recent Activity, Suggested Recovery Actions (Requirement 6) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Active Alerts */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                <h3 className="text-sm font-bold text-slate-900">Active Alerts</h3>
              </div>
              <button
                onClick={() => setActiveView('alerts')}
                className="text-xs text-blue-600 font-semibold hover:underline"
              >
                View All ({alerts.length})
              </button>
            </div>

            <div className="space-y-3">
              {activeAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-3 rounded-xl border text-xs flex items-start justify-between gap-3 ${
                    alert.severity === 'Critical'
                      ? 'bg-red-50/50 border-red-200/80 text-red-900'
                      : alert.severity === 'Warning'
                      ? 'bg-amber-50/50 border-amber-200/80 text-amber-900'
                      : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span
                      className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                        alert.severity === 'Critical'
                          ? 'bg-red-500'
                          : alert.severity === 'Warning'
                          ? 'bg-amber-500'
                          : 'bg-blue-500'
                      }`}
                    />
                    <div>
                      <div className="font-semibold">{alert.title}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{alert.timeAgo}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setActiveView('alerts')}
            className="mt-4 w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl text-xs font-semibold border border-slate-200 transition-colors"
          >
            Review All Risk Alerts
          </button>
        </div>

        {/* Material Deliveries Quick Tracker */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-slate-600" />
                <h3 className="text-sm font-bold text-slate-900">Material Deliveries</h3>
              </div>
              <button
                onClick={() => setActiveView('deliveries')}
                className="text-xs text-blue-600 font-semibold hover:underline"
              >
                All Shipments &rarr;
              </button>
            </div>

            <div className="space-y-3">
              {deliveries.slice(0, 3).map((del) => (
                <div
                  key={del.id}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-slate-800">{del.materialName}</div>
                    <div className="text-[10px] text-slate-400">
                      {del.supplier} • {formatDisplayDate(del.expectedDate)}
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      del.status === 'Delayed'
                        ? 'bg-red-100 text-red-700'
                        : del.status === 'In Transit'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {del.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setActiveView('deliveries')}
            className="mt-4 w-full py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-semibold border border-blue-200 transition-colors"
          >
            Manage Supply Chain
          </button>
        </div>

        {/* Suggested Recovery Actions (Requirement 6 Exact Match: Crashing, Fast-Tracking, Expediting) */}
        <div className="bg-gradient-to-br from-amber-500/10 via-white to-blue-500/5 rounded-2xl p-5 border border-amber-300/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-xs">
                <Sparkles className="w-4 h-4 fill-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Suggested Recovery Actions</h3>
                <span className="text-[10px] font-semibold text-amber-700">Requirement 6: Schedule Compressor</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 mb-3">
              Autonomous options to recover schedule variance and pull delivery back on target:
            </p>

            <div className="space-y-2.5">
              {recoveryActions.map((action) => (
                <div
                  key={action.id}
                  className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-xs hover:border-amber-400 transition-all text-xs"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-800">{action.title}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                      {action.impactBadge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-tight mb-2">
                    {action.description}
                  </p>
                  <button
                    onClick={() => applyRecoveryAction(action.id)}
                    disabled={action.applied}
                    className={`w-full py-1.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                      action.applied
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : 'bg-amber-500 hover:bg-amber-600 text-white shadow-xs'
                    }`}
                  >
                    {action.applied ? 'Action Applied (Schedule Compressed) ✓' : 'Apply Recovery Action'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setActiveView('simulation')}
            className="mt-4 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
          >
            Open Delay Sandbox
          </button>
        </div>
      </div>
    </div>
  );
};
