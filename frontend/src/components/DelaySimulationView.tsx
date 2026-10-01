import React, { useState, useEffect } from 'react';
import {
  Zap,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Clock,
  Calendar,
  Layers,
  CheckCircle,
  HelpCircle,
  TrendingDown,
  Activity,
  Sparkles,
  ShieldAlert,
  ArrowUpRight,
} from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { formatDisplayDate } from '../utils/cpm';
import { SimulationResult } from '../types';

export const DelaySimulationView: React.FC = () => {
  const {
    tasks,
    project,
    runDelaySimulation,
    applySimulationToSchedule,
    setActiveView,
    taskThreatRankings,
    criticalPath,
  } = useProject();

  const [selectedTaskId, setSelectedTaskId] = useState<string>(() => {
    // Pre-select from Dependency Graph click-to-simulate
    const preselect = localStorage.getItem('buildtrack_sim_preselect');
    if (preselect) {
      localStorage.removeItem('buildtrack_sim_preselect');
      return preselect;
    }
    return tasks[1]?.id || 't1';
  });
  const [delayDuration, setDelayDuration] = useState<number>(3);
  const [reason, setReason] = useState<string>('Bad Weather');
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [hasApplied, setHasApplied] = useState(false);

  // Run initial simulation on mount
  useEffect(() => {
    if (selectedTaskId) {
      const res = runDelaySimulation({
        taskId: selectedTaskId,
        delayDays: delayDuration,
        reason,
      });
      setSimulationResult(res);
      setHasApplied(false);
    }
  }, [selectedTaskId, delayDuration, reason]);

  const handleRunSimulation = (e: React.FormEvent) => {
    e.preventDefault();
    const res = runDelaySimulation({
      taskId: selectedTaskId,
      delayDays: delayDuration,
      reason,
    });
    setSimulationResult(res);
    setHasApplied(false);
  };

  const handleApplyToLiveSchedule = () => {
    if (simulationResult) {
      applySimulationToSchedule(simulationResult);
      setHasApplied(true);
    }
  };

  const selectedTask = tasks.find((t) => t.id === selectedTaskId);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-700 text-[11px] font-semibold mb-1 border border-amber-300">
            <Zap className="w-3.5 h-3.5 fill-amber-500" />
            Core Challenge: Dynamic CPM Ripple & Critical Path Shift Simulator
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Delay Simulation & Threat Analysis</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Test how delays ripple through dependent tasks, detect dynamic critical path shifts, and rank deadline threats.
          </p>
        </div>

        <button
          onClick={() => setActiveView('dashboard')}
          className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1"
        >
          &larr; Back to Dashboard
        </button>
      </div>

      {/* Main 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Delay Configuration Controls (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 flex flex-col justify-between space-y-5">
          <form onSubmit={handleRunSimulation} className="space-y-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 mb-1">Scenario Parameters</h2>
              <p className="text-xs text-slate-500">
                Choose a task and duration to evaluate CPM topological cascade.
              </p>
            </div>

            {/* Select Task */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Target Task *
              </label>
              <select
                value={selectedTaskId}
                onChange={(e) => setSelectedTaskId(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 font-medium text-slate-800"
              >
                {tasks.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.duration}d) - {t.trade} [{t.isCritical ? 'Zero Float / Critical' : `${t.totalFloat}d float`}]
                  </option>
                ))}
              </select>
            </div>

            {/* Delay Duration */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Delay Slip (Days)
                </label>
                <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  +{delayDuration} {delayDuration === 1 ? 'day' : 'days'}
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={15}
                value={delayDuration}
                onChange={(e) => setDelayDuration(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
                <span>1 day</span>
                <span>5 days</span>
                <span>10 days</span>
                <span>15 days</span>
              </div>
            </div>

            {/* Reason */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Root Cause Category *
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 font-medium text-slate-800"
              >
                <option value="Bad Weather">Bad Weather (Torrential Monsoons / Wind)</option>
                <option value="Late Material Delivery">Late Material Delivery (Supply Chain Delay)</option>
                <option value="Subcontractor Labor Shortage">Subcontractor Labor Shortage / Absenteeism</option>
                <option value="Engineering Design Change">Engineering / Architectural Revision</option>
                <option value="Municipal Inspection Hold">Regulatory / Safety Inspection Hold</option>
                <option value="Equipment Breakdown">Tower Crane / Excavator Breakdown</option>
              </select>
            </div>

            {/* Run Simulation Button */}
            <button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 group"
            >
              <Zap className="w-4 h-4 fill-white" />
              <span>Compute Ripple & Recalculate CPM</span>
            </button>
          </form>

          {/* Dynamic Critical Path Shift Explanation */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-slate-900">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Dynamic Critical Path Shifting:</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              When a non-critical task experiences a delay greater than its float, its float collapses to 0. It instantly becomes part of the new Critical Path, shifting the project deadline!
            </p>
          </div>
        </div>

        {/* Right Column: Impact Analysis & Dynamic Path Shift (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Impact Analysis & Ripple Results</h2>
                <p className="text-xs text-slate-500">Recalculated via full topological forward/backward pass</p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                Simulated: {simulationResult?.taskName} (+{delayDuration}d)
              </span>
            </div>

            {/* Schedule Comparison Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Original Schedule
                </div>
                <div className="text-xl font-extrabold text-slate-900 mt-1">
                  {formatDisplayDate(project.targetFinishDate)}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">Baseline Milestone</div>
              </div>

              <div className="p-4 rounded-xl border border-red-200 bg-red-50/40">
                <div className="text-[11px] font-semibold text-red-600 uppercase tracking-wider flex items-center justify-between">
                  <span>New Projected Finish</span>
                  <span className="font-bold text-red-700 bg-red-100 px-1.5 py-0.5 rounded">
                    +{simulationResult?.netProjectDelayDays ?? delayDuration} days
                  </span>
                </div>
                <div className="text-xl font-extrabold text-red-600 mt-1">
                  {simulationResult
                    ? formatDisplayDate(simulationResult.newProjectFinish)
                    : formatDisplayDate(project.projectedFinishDate)}
                </div>
                <div className="text-[11px] text-red-700 mt-1">Direct Deadline Slippage</div>
              </div>
            </div>

            {/* Critical Path Shift Alert Banner (Requirement 2 Highlight!) */}
            {simulationResult?.criticalPathShift.isShifted && (
              <div className="mt-4 p-3.5 bg-gradient-to-r from-red-500/10 via-amber-500/10 to-transparent border border-red-300 rounded-xl flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <div className="font-bold text-red-900">
                    Dynamic Critical Path Shift Detected!
                  </div>
                  <div className="text-slate-700 mt-0.5">
                    Because delay exceeded available slack, the following tasks exhausted their float and joined the Critical Path:
                    <strong className="text-red-700 ml-1">
                      {simulationResult.criticalPathShift.newlyCriticalTasks.join(', ')}
                    </strong>
                  </div>
                </div>
              </div>
            )}

            {/* Affected Downstream Tasks */}
            <div className="mt-5">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5">
                Downstream Ripple Cascade ({simulationResult?.affectedTasks.length || 0} Tasks Impacted)
              </h3>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {simulationResult && simulationResult.affectedTasks.length > 0 ? (
                  simulationResult.affectedTasks.map((aff) => (
                    <div
                      key={aff.taskId}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={`w-2 h-2 rounded-full ${aff.isCritical ? 'bg-red-500' : 'bg-amber-500'}`} />
                        <div>
                          <span className="font-bold text-slate-800">{aff.taskName}</span>
                          {aff.isCritical && (
                            <span className="ml-2 px-1.5 py-0.2 rounded text-[9px] font-bold bg-red-100 text-red-700">
                              Critical
                            </span>
                          )}
                          <div className="text-[10px] text-slate-400">
                            {formatDisplayDate(aff.originalEnd)} &rarr; {formatDisplayDate(aff.simulatedEnd)}
                          </div>
                        </div>
                      </div>
                      <span className="font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-200 font-mono">
                        +{aff.delayDays} {aff.delayDays === 1 ? 'day' : 'days'}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>This delay was completely absorbed by float buffer! Final deadline remains unaffected.</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleApplyToLiveSchedule}
                disabled={hasApplied}
                className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 ${
                  hasApplied
                    ? 'bg-emerald-600 text-white cursor-default'
                    : 'bg-red-600 hover:bg-red-700 text-white shadow-red-500/20'
                }`}
              >
                {hasApplied ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Applied to Live Project Schedule ✓</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4" />
                    <span>Apply Simulated Shift to Live Schedule</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setDelayDuration(3);
                  setReason('Bad Weather');
                  setSelectedTaskId(tasks[1]?.id || 't1');
                  setHasApplied(false);
                }}
                className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
                title="Reset simulation parameters"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Task Threat Rankings Table (Requirement 2 Core Feature!) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-600" />
              <h3 className="text-base font-bold text-slate-900">
                Deadline Threat Rankings (Sensitivity Audit)
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Ranked by how strongly a slip in each task threatens the final project deadline (based on slack & downstream propagation).
            </p>
          </div>

          <span className="text-xs text-slate-400">
            Automated Sensitivity Index (0–100)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Task Name</th>
                <th className="py-3 px-4">Trade</th>
                <th className="py-3 px-4">Contractor</th>
                <th className="py-3 px-4 text-center">Available Float</th>
                <th className="py-3 px-4 text-center">Downstream Successors</th>
                <th className="py-3 px-4 text-center">Threat Level</th>
                <th className="py-3 px-4 text-right">Threat Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {taskThreatRankings.map((tr, index) => (
                <tr key={tr.taskId} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-slate-500">#{index + 1}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">{tr.taskName}</td>
                  <td className="py-3 px-4 text-slate-600">{tr.trade}</td>
                  <td className="py-3 px-4 text-slate-600">{tr.contractor}</td>
                  <td className="py-3 px-4 text-center font-mono">
                    {tr.totalFloat === 0 ? (
                      <span className="text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded">0d (Critical)</span>
                    ) : (
                      <span className="text-slate-600">{tr.totalFloat} days</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center font-mono text-slate-700">
                    {tr.downstreamCount} tasks
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        tr.threatLevel === 'Critical'
                          ? 'bg-red-100 text-red-700'
                          : tr.threatLevel === 'High'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {tr.threatLevel}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-black text-slate-900 font-mono">
                    {tr.threatScore}/100
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
