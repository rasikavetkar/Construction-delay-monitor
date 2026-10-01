import React, { useState } from 'react';
import {
  Plus,
  Filter,
  Search,
  MoreVertical,
  Trash2,
  Edit2,
  Zap,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  X,
} from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { Task, TaskStatus } from '../types';

export const TaskManagementView: React.FC = () => {
  const {
    tasks,
    contractors,
    addTask,
    updateTask,
    deleteTask,
    searchQuery,
    setActiveView,
    currentUser,
  } = useProject();

  const isPM = currentUser.role === 'Project Manager';

  const [selectedTrade, setSelectedTrade] = useState('All Trades');
  const [selectedContractor, setSelectedContractor] = useState('All Contractors');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // New task form state
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskTrade, setNewTaskTrade] = useState('Civil');
  const [newTaskDuration, setNewTaskDuration] = useState(5);
  const [newTaskContractor, setNewTaskContractor] = useState(contractors[0]?.name || 'ABC Construction');
  const [newTaskDependencies, setNewTaskDependencies] = useState<string[]>([]);
  const [newTaskStatus, setNewTaskStatus] = useState<TaskStatus>('Not Started');
  const [newTaskProgress, setNewTaskProgress] = useState(0);

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.contractor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.trade.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTrade = selectedTrade === 'All Trades' || t.trade === selectedTrade;
    const matchesContractor =
      selectedContractor === 'All Contractors' || t.contractor === selectedContractor;
    const matchesStatus =
      selectedStatus === 'All Status' ||
      (selectedStatus === 'In-Progress' && t.status === 'In Progress') ||
      t.status === selectedStatus;

    return matchesSearch && matchesTrade && matchesContractor && matchesStatus;
  });

  const tradesList = Array.from(new Set(tasks.map((t) => t.trade)));

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskName.trim()) return;

    addTask({
      name: newTaskName,
      trade: newTaskTrade,
      duration: Number(newTaskDuration) || 1,
      contractor: newTaskContractor,
      dependencies: newTaskDependencies,
      status: newTaskStatus,
      progress: Number(newTaskProgress) || 0,
      riskLevel: 'Low',
      delayImpactDays: 0,
      plannedStart: '2025-10-01',
      plannedEnd: '2025-10-06',
    });

    setIsAddModalOpen(false);
    setNewTaskName('');
    setNewTaskDuration(5);
    setNewTaskDependencies([]);
  };

  const getDependencyNames = (depIds: string[]) => {
    if (!depIds || depIds.length === 0) return 'None';
    return depIds
      .map((id) => tasks.find((t) => t.id === id)?.name || id)
      .join(', ');
  };

  return (
    <div className="space-y-5 pb-12">
      {/* Header bar (Screen 4 Layout) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Project Tasks</h1>
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
              isPM ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
            }`}>
              {isPM ? '👷 PM Mode — Full Access' : '🔧 Contractor View — Progress Updates Only'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage work breakdown structure, task predecessors, and contractor assignments.
          </p>
        </div>

        {isPM && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm shadow-blue-500/20 transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            <span>Add Task</span>
          </button>
        )}
      </div>

      {/* Filter Toolbar (Screen 4 Filter Bar) */}
      <div className="flex flex-wrap items-center gap-3 p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium pl-1">
          <Filter className="w-3.5 h-3.5" />
          <span>Filters:</span>
        </div>

        {/* All Trades */}
        <select
          value={selectedTrade}
          onChange={(e) => setSelectedTrade(e.target.value)}
          className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="All Trades">All Trades</option>
          {tradesList.map((tr) => (
            <option key={tr} value={tr}>{tr}</option>
          ))}
        </select>

        {/* All Contractors */}
        <select
          value={selectedContractor}
          onChange={(e) => setSelectedContractor(e.target.value)}
          className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="All Contractors">All Contractors</option>
          {contractors.map((c) => (
            <option key={c.id} value={c.name}>{c.name}</option>
          ))}
        </select>

        {/* All Status */}
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="All Status">All Status</option>
          <option value="Delayed">Delayed</option>
          <option value="In Progress">In-Progress</option>
          <option value="Not Started">Not Started</option>
          <option value="Completed">Completed</option>
          <option value="At Risk">At Risk</option>
          <option value="Blocked">Blocked</option>
        </select>

        <div className="ml-auto text-xs text-slate-400">
          Showing <strong>{filteredTasks.length}</strong> of {tasks.length} tasks
        </div>
      </div>

      {/* Main Tasks Table (Screen 4 Exact Match) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Task Name</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Dependency</th>
                <th className="py-3 px-4">Contractor</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Float / Critical</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTasks.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/70 transition-colors group">
                  {/* Task Name */}
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                          t.status === 'Delayed'
                            ? 'bg-red-500 ring-2 ring-red-200'
                            : t.status === 'In Progress'
                            ? 'bg-blue-500 ring-2 ring-blue-200'
                            : t.status === 'Completed'
                            ? 'bg-emerald-500'
                            : 'bg-slate-300'
                        }`}
                      />
                      <div>
                        <div>{t.name}</div>
                        <div className="text-[10px] font-normal text-slate-400">{t.trade}</div>
                      </div>
                    </div>
                  </td>

                  {/* Duration */}
                  <td className="py-3.5 px-4 text-slate-600 font-medium whitespace-nowrap">
                    {t.duration} days
                  </td>

                  {/* Dependency */}
                  <td className="py-3.5 px-4 text-slate-600 font-medium">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px]">
                      {getDependencyNames(t.dependencies)}
                    </span>
                  </td>

                  {/* Contractor */}
                  <td className="py-3.5 px-4 text-slate-700 font-medium">
                    {t.contractor}
                  </td>

                  {/* Status Badge */}
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-[11px] font-bold ${
                        t.status === 'Delayed'
                          ? 'bg-red-100 text-red-700'
                          : t.status === 'At Risk'
                          ? 'bg-amber-100 text-amber-800'
                          : t.status === 'Blocked'
                          ? 'bg-red-100 text-red-800'
                          : t.status === 'In Progress'
                          ? 'bg-blue-100 text-blue-700'
                          : t.status === 'Completed'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {t.status === 'In Progress' ? 'In-Progress' : t.status}
                    </span>
                  </td>

                  {/* Float / Critical */}
                  <td className="py-3.5 px-4 text-center">
                    {t.isCritical ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                        Critical (0d float)
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-500 font-mono">
                        {t.totalFloat ?? 0}d buffer
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {isPM ? (
                        <>
                          <button
                            onClick={() => setActiveView('simulation')}
                            title="Simulate delay on this task"
                            className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          >
                            <Zap className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteTask(t.id)}
                            title="Delete task"
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => setActiveView('progress')}
                          className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold transition-colors"
                        >
                          Update Progress
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Task Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-slate-900 text-sm">Add New Construction Task</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 uppercase mb-1">
                  Task Name *
                </label>
                <input
                  type="text"
                  required
                  value={newTaskName}
                  onChange={(e) => setNewTaskName(e.target.value)}
                  placeholder="e.g. HVAC Ducting Installation"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1">
                    Trade
                  </label>
                  <select
                    value={newTaskTrade}
                    onChange={(e) => setNewTaskTrade(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="Civil">Civil</option>
                    <option value="Structural">Structural</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Plumbing">Plumbing</option>
                    <option value="Finishing">Finishing</option>
                    <option value="Logistics">Logistics</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1">
                    Duration (Days) *
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={newTaskDuration}
                    onChange={(e) => setNewTaskDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase mb-1">
                  Contractor Assignment
                </label>
                <select
                  value={newTaskContractor}
                  onChange={(e) => setNewTaskContractor(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                >
                  {contractors.map((c) => (
                    <option key={c.id} value={c.name}>{c.name} ({c.trade})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase mb-1">
                  Predecessor / Dependencies
                </label>
                <select
                  multiple
                  value={newTaskDependencies}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions, (option) => option.value);
                    setNewTaskDependencies(selected);
                  }}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white h-24"
                >
                  {tasks.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.duration}d)
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400 mt-1">Hold Ctrl/Cmd to select multiple dependencies</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-xs"
                >
                  Add Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
