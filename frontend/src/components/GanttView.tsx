import React, { useState } from 'react';
import { Calendar, Filter, ChevronLeft, ChevronRight, Zap, Search, MapPin } from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { formatDisplayDate } from '../utils/cpm';

export const GanttView: React.FC = () => {
  const {
    tasks,
    project,
    contractors,
    setActiveView,
    searchQuery,
  } = useProject();

  const [tradeFilter, setTradeFilter] = useState('All Trades');
  const [siteFilter, setSiteFilter] = useState('All Sites');
  const [contractorFilter, setContractorFilter] = useState('All Contractors');
  const [statusFilter, setStatusFilter] = useState('All Status');

  // Time window: Project base start date to beyond target date
  const baseStart = new Date('2025-10-01T00:00:00Z');
  const totalDays = 36;

  const milestones = [
    { day: 0, label: 'Oct 01' },
    { day: 5, label: 'Oct 05' },
    { day: 10, label: 'Oct 10' },
    { day: 15, label: 'Oct 15' },
    { day: 20, label: 'Oct 20' },
    { day: 25, label: 'Oct 25' },
    { day: 30, label: 'Oct 30' },
    { day: 35, label: 'Nov 05' },
  ];

  // Requirement 4: Filter by trade, site, contractor, status and search query
  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.trade.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.contractor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.siteZone && t.siteZone.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesTrade = tradeFilter === 'All Trades' || t.trade === tradeFilter;
    const matchesSite = siteFilter === 'All Sites' || t.siteZone?.includes(siteFilter);
    const matchesContractor = contractorFilter === 'All Contractors' || t.contractor === contractorFilter;
    const matchesStatus =
      statusFilter === 'All Status' ||
      (statusFilter === 'In Progress' && t.status === 'In Progress') ||
      t.status === statusFilter;

    return matchesSearch && matchesTrade && matchesSite && matchesContractor && matchesStatus;
  });

  const getBarColor = (task: any) => {
    // CPM-based risk coloring takes priority
    if (task.isCritical) return 'bg-red-500 border-red-700 text-white'; // Critical — 0 float
    if ((task.totalFloat ?? 99) <= 2) return 'bg-yellow-400 border-yellow-600 text-slate-900'; // Near-critical — ≤2d float
    if (task.status === 'Delayed') return 'bg-red-400 border-red-500 text-white';
    // Trade color fallback
    if (task.trade === 'Civil') return 'bg-amber-500 border-amber-600 text-white';
    if (task.trade === 'Structural') return 'bg-orange-500 border-orange-600 text-white';
    if (task.trade === 'Electrical') return 'bg-purple-500 border-purple-600 text-white';
    if (task.trade === 'Plumbing') return 'bg-blue-500 border-blue-600 text-white';
    if (task.trade === 'Finishing') return 'bg-emerald-500 border-emerald-600 text-white';
    return 'bg-indigo-500 border-indigo-600 text-white';
  };

  return (
    <div className="space-y-5 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-[11px] font-semibold mb-1 border border-blue-200">
            <Calendar className="w-3.5 h-3.5" />
            Requirement 4: Multi-Filter Gantt Schedule Timeline
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Gantt Chart View</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Filter by trade, site zone, contractor or status. Trace float consumption and milestone deadlines.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveView('simulation')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-800 border border-amber-300 rounded-lg text-xs font-semibold hover:bg-amber-100 transition-colors"
          >
            <Zap className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
            <span>Simulate Schedule Slip</span>
          </button>
        </div>
      </div>

      {/* Multi-Filter Toolbar (Requirement 4) */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-xs">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter by:</span>
          </div>

          {/* Trade Filter */}
          <select
            value={tradeFilter}
            onChange={(e) => setTradeFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 text-slate-700 font-medium focus:outline-none"
          >
            <option value="All Trades">All Trades</option>
            <option value="Civil">Civil</option>
            <option value="Structural">Structural</option>
            <option value="Electrical">Electrical</option>
            <option value="Plumbing">Plumbing</option>
            <option value="Finishing">Finishing</option>
            <option value="Logistics">Logistics</option>
          </select>

          {/* Site / Zone Filter */}
          <select
            value={siteFilter}
            onChange={(e) => setSiteFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 text-slate-700 font-medium focus:outline-none"
          >
            <option value="All Sites">All Site Zones</option>
            <option value="Zone A">Zone A (Logistics)</option>
            <option value="Zone B">Zone B (Structure)</option>
            <option value="Zone C">Zone C (MEP)</option>
            <option value="Zone D">Zone D (Interiors)</option>
          </select>

          {/* Contractor Filter */}
          <select
            value={contractorFilter}
            onChange={(e) => setContractorFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 text-slate-700 font-medium focus:outline-none"
          >
            <option value="All Contractors">All Contractors</option>
            {contractors.map((c) => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 text-slate-700 font-medium focus:outline-none"
          >
            <option value="All Status">All Status</option>
            <option value="Delayed">Delayed</option>
            <option value="In Progress">In Progress</option>
            <option value="Not Started">Not Started</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
            Target Finish: 30 Oct 2025
          </span>
          <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-red-50 text-red-700 border border-red-200">
            Projected: 02 Nov (+3d)
          </span>
        </div>
      </div>

      {/* Main Gantt Canvas */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[900px]">
            {/* Timeline Header */}
            <div className="grid grid-cols-12 border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold text-slate-500">
              <div className="col-span-4 p-3 border-r border-slate-200">
                Task Breakdown & Allocation
              </div>
              <div className="col-span-8 p-3 flex justify-between relative">
                {milestones.map((m) => (
                  <span key={m.day} className="text-slate-600 font-mono text-[10px]">
                    {m.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Task Rows */}
            <div className="divide-y divide-slate-100">
              {filteredTasks.length > 0 ? (
                filteredTasks.map((t) => {
                  const startDay = t.earlyStart ?? 0;
                  const duration = t.duration;
                  const leftPercent = Math.min(100, Math.max(0, (startDay / totalDays) * 100));
                  const widthPercent = Math.min(100 - leftPercent, Math.max(3, (duration / totalDays) * 100));

                  return (
                    <div
                      key={t.id}
                      className="grid grid-cols-12 items-center hover:bg-slate-50/70 transition-colors group"
                    >
                      {/* Left Meta */}
                      <div className="col-span-4 p-3 border-r border-slate-200 text-xs flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className={`w-2 h-2 rounded-full shrink-0 ${
                              t.status === 'Delayed'
                                ? 'bg-red-500 ring-2 ring-red-200'
                                : t.status === 'In Progress'
                                ? 'bg-blue-500 ring-2 ring-blue-200'
                                : t.status === 'Completed'
                                ? 'bg-emerald-500'
                                : 'bg-slate-300'
                            }`}
                          />
                          <div className="truncate">
                            <span className="font-bold text-slate-800">{t.name}</span>
                            <span className="text-[10px] text-slate-400 block truncate">
                              {t.contractor} • {t.siteZone || 'Main Zone'}
                            </span>
                          </div>
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono shrink-0 pl-2">
                          {t.duration}d
                        </div>
                      </div>

                      {/* Right Timeline Bar Canvas */}
                      <div className="col-span-8 p-3 relative h-12 flex items-center">
                        {/* Grid background ticks */}
                        <div className="absolute inset-0 flex justify-between pointer-events-none px-3">
                          {milestones.map((m) => (
                            <div key={m.day} className="h-full border-r border-slate-100 w-px" />
                          ))}
                        </div>

                        {/* Contractual Target Marker line (at day 30) */}
                        <div
                          className="absolute top-0 bottom-0 w-0.5 border-r-2 border-dashed border-red-500 z-10 pointer-events-none"
                          style={{ left: `${(30 / totalDays) * 100}%` }}
                          title="Contractual Target Date (30 Oct)"
                        />

                        {/* Task Bar */}
                        <div
                          className={`absolute h-7 rounded-lg shadow-xs flex items-center justify-between px-2.5 text-[10px] font-semibold border transition-all group-hover:brightness-105 ${getBarColor(
                            t
                          )}`}
                          style={{
                            left: `${leftPercent}%`,
                            width: `${widthPercent}%`,
                          }}
                          title={`${t.name} (${t.duration} days) | Float: ${t.totalFloat ?? 0} days | Status: ${t.status}`}
                        >
                          <span className="truncate">{t.name}</span>
                          <span className="opacity-90 text-[9px] font-mono">{t.duration}d</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center text-xs text-slate-400">
                  No tasks matched the selected filter criteria.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-600">
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>On Track</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <span>Delayed</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-4 h-1.5 bg-amber-500 rounded" />
              <span>Critical Path</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rotate-45 bg-blue-500" />
              <span>Milestone</span>
            </span>
          </div>

          <div className="text-[11px] text-slate-400">
            Red vertical dashed line marks contractual deadline (30-Oct-2025).
          </div>
        </div>
        {/* Color Legend */}
        <div className="flex items-center gap-4 flex-wrap text-[11px] text-slate-500 bg-white p-3 rounded-xl border border-slate-200 mt-4">
          <span className="font-semibold text-slate-700">Legend:</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-500" /> Critical (0 float)</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-yellow-400" /> Near-Critical (≤2d)</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-emerald-500" /> Safe (&gt;2d float)</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded border-2 border-dashed border-red-500" /> Contractual Deadline</span>
        </div>
      </div>
    </div>
  );
};
