import React, { useState } from 'react';
import { CheckSquare, Plus, Save, Clock, CheckCircle2, AlertTriangle, ArrowRight, Calendar, Edit3, X } from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { formatDisplayDate } from '../utils/cpm';
import { Task } from '../types';

export const ProgressUpdatesView: React.FC = () => {
  const { tasks, updateTaskActuals, project } = useProject();
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards');

  // Modal editing state
  const [editActualStart, setEditActualStart] = useState('');
  const [editActualEnd, setEditActualEnd] = useState('');
  const [editProgress, setEditProgress] = useState(50);

  const startEdit = (task: Task) => {
    setEditingTaskId(task.id);
    setEditActualStart(task.actualStart || task.plannedStart);
    setEditActualEnd(task.actualEnd || '');
    setEditProgress(task.progress);
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTaskId) return;

    updateTaskActuals(
      editingTaskId,
      editActualStart || undefined,
      editProgress === 100 ? (editActualEnd || new Date().toISOString().split('T')[0]) : undefined,
      editProgress
    );

    setEditingTaskId(null);
  };

  return (
    <div className="space-y-5 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold mb-1 border border-emerald-200">
            <CheckSquare className="w-3.5 h-3.5" />
            Requirement 3: Site Actuals & Real-Time Schedule Recalculation
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Progress Updates</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Site teams log actual start dates, percent complete, and finish dates. Schedule dynamically recalculates completion.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                viewMode === 'cards' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
              }`}
            >
              ⊞ Cards
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                viewMode === 'table' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
              }`}
            >
              ☰ Table
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3.5 py-1.5 bg-blue-50 border border-blue-200 text-blue-800 rounded-xl text-xs font-bold">
              Overall Project: {project.overallProgress}% Complete
            </div>
            <div className="px-3.5 py-1.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-bold">
              Projected Slip: +{project.scheduleVarianceDays} days
            </div>
          </div>
        </div>
      </div>

      {/* Cards View */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {tasks.map((task) => (
            <div key={task.id} className={`bg-white rounded-2xl border p-4 shadow-xs transition-all hover:shadow-md ${
              task.isCritical ? 'border-red-300 ring-1 ring-red-200' :
              (task.totalFloat ?? 99) <= 2 ? 'border-yellow-300' :
              'border-slate-200'
            }`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-sm font-bold text-slate-900">{task.name}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{task.trade} • {task.contractor}</div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  task.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                  task.status === 'Delayed' ? 'bg-red-100 text-red-700' :
                  task.status === 'Blocked' ? 'bg-red-200 text-red-900' :
                  task.status === 'At Risk' ? 'bg-amber-100 text-amber-800' :
                  task.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                  'bg-slate-100 text-slate-600'
                }`}>{task.status}</span>
              </div>

              {/* Progress bar */}
              <div className="mb-3">
                <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                  <span>Completion</span>
                  <span className="font-bold">{task.progress}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      task.progress === 100 ? 'bg-emerald-500' :
                      task.progress >= 50 ? 'bg-blue-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${task.progress}%` }}
                  />
                </div>
              </div>

              {/* CPM info row */}
              <div className="grid grid-cols-2 gap-2 text-[10px] mb-3">
                <div className="bg-slate-50 rounded-lg p-2">
                  <div className="text-slate-400">Duration</div>
                  <div className="font-bold text-slate-700">{task.duration} days</div>
                </div>
                <div className={`rounded-lg p-2 ${
                  task.isCritical ? 'bg-red-50' : (task.totalFloat ?? 99) <= 2 ? 'bg-yellow-50' : 'bg-emerald-50'
                }`}>
                  <div className="text-slate-400">Float</div>
                  <div className={`font-bold ${
                    task.isCritical ? 'text-red-700' : (task.totalFloat ?? 99) <= 2 ? 'text-yellow-700' : 'text-emerald-700'
                  }`}>{task.isCritical ? '0d CRITICAL' : `${task.totalFloat ?? 0}d`}</div>
                </div>
              </div>

              {/* Actions */}
              <button
                onClick={() => startEdit(task)}
                className="w-full py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold transition-colors border border-blue-200"
              >
                Update Progress
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Main Table */}
      {viewMode === 'table' && (
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Task Name</th>
                <th className="py-3 px-4">Planned Window</th>
                <th className="py-3 px-4">Actual Start Date</th>
                <th className="py-3 px-4">Actual Finish Date</th>
                <th className="py-3 px-4 w-60">Completion %</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Log Actuals</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tasks.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                  {/* Task Name */}
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          t.status === 'Delayed'
                            ? 'bg-red-500'
                            : t.status === 'In Progress'
                            ? 'bg-blue-500'
                            : t.status === 'Completed'
                            ? 'bg-emerald-500'
                            : 'bg-slate-300'
                        }`}
                      />
                      <div>
                        <div>{t.name}</div>
                        <div className="text-[10px] font-normal text-slate-400">
                          {t.trade} • {t.contractor}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Planned Window */}
                  <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
                    {formatDisplayDate(t.plannedStart)} &rarr; {formatDisplayDate(t.plannedEnd)}
                  </td>

                  {/* Actual Start */}
                  <td className="py-3.5 px-4 font-mono text-[11px]">
                    {t.actualStart ? (
                      <span className="text-slate-800 font-semibold">{formatDisplayDate(t.actualStart)}</span>
                    ) : (
                      <span className="text-slate-400 italic">Not Commenced</span>
                    )}
                  </td>

                  {/* Actual Finish */}
                  <td className="py-3.5 px-4 font-mono text-[11px]">
                    {t.actualEnd ? (
                      <span className="text-emerald-700 font-semibold">{formatDisplayDate(t.actualEnd)}</span>
                    ) : (
                      <span className="text-slate-400">--</span>
                    )}
                  </td>

                  {/* Progress % Slider */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={t.progress}
                        onChange={(e) => updateTaskActuals(t.id, t.actualStart, t.actualEnd, Number(e.target.value))}
                        className="w-full accent-blue-600 cursor-pointer"
                      />
                      <span className="w-10 font-bold text-slate-800 text-right">{t.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1">
                      <div
                        className={`h-full rounded-full transition-all ${
                          t.status === 'Delayed'
                            ? 'bg-red-500'
                            : t.progress === 100
                            ? 'bg-emerald-500'
                            : 'bg-blue-500'
                        }`}
                        style={{ width: `${t.progress}%` }}
                      />
                    </div>
                  </td>

                  {/* Status Badge */}
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        t.status === 'Delayed'
                          ? 'bg-red-100 text-red-700'
                          : t.status === 'In Progress'
                          ? 'bg-blue-100 text-blue-700'
                          : t.status === 'Completed'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {t.status}
                    </span>
                  </td>

                  {/* Log Actuals Button */}
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => startEdit(t)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-blue-600 bg-blue-50 hover:bg-blue-100 font-semibold text-[11px] border border-blue-200 transition-colors"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Edit Dates</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* Edit Actuals Modal */}
      {editingTaskId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-slate-900 text-sm">Log Actual Site Milestones</h3>
              <button
                onClick={() => setEditingTaskId(null)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 uppercase mb-1">
                  Actual Start Date
                </label>
                <input
                  type="date"
                  value={editActualStart}
                  onChange={(e) => setEditActualStart(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase mb-1">
                  Completion Percentage: {editProgress}%
                </label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={editProgress}
                  onChange={(e) => setEditProgress(Number(e.target.value))}
                  className="w-full accent-blue-600"
                />
              </div>

              {editProgress === 100 && (
                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1">
                    Actual Finish Date
                  </label>
                  <input
                    type="date"
                    value={editActualEnd}
                    onChange={(e) => setEditActualEnd(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                  />
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingTaskId(null)}
                  className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-xs"
                >
                  Save & Recalculate Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
