import React, { useState } from 'react';
import {
  Building2,
  Calendar,
  MapPin,
  Clock,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Edit,
  DollarSign,
  Shield,
  Save,
} from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { formatDisplayDate } from '../utils/cpm';

interface ProjectDetailsViewProps {
  onOpenEditModal: () => void;
}

export const ProjectDetailsView: React.FC<ProjectDetailsViewProps> = ({ onOpenEditModal }) => {
  const { project, tasks, updateProject } = useProject();
  const [subTab, setSubTab] = useState<'overview' | 'settings'>('overview');

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'Completed').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'In Progress').length;
  const delayedTasks = tasks.filter((t) => t.status === 'Delayed').length;

  return (
    <div className="space-y-6 pb-12 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Project Details & Settings</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Baseline dates, spatial metadata, contract boundaries and risk tolerance thresholds.
          </p>
        </div>

        <button
          onClick={onOpenEditModal}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm shadow-blue-500/20 transition-all"
        >
          <Edit className="w-3.5 h-3.5" />
          <span>Edit Project</span>
        </button>
      </div>

      {/* Hero Project Banner (Screen 12 Exact Match) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 flex flex-col md:flex-row items-center gap-6">
        <div className="w-full md:w-56 h-36 rounded-xl overflow-hidden shrink-0 shadow-xs border border-slate-200 relative">
          <img
            src={project.imageUrl || 'https://images.unsplash.com/photo-1541888946425-d0fbb18615f3?auto=format&fit=crop&w=600&q=80'}
            alt="Site Project"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-1 space-y-2 text-left">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-slate-900">{project.name}</h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
              Active Site
            </span>
          </div>

          <p className="text-xs text-slate-600 max-w-xl leading-relaxed">
            {project.description}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs text-slate-600">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Start: <strong>{formatDisplayDate(project.startDate)}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Target: <strong>{formatDisplayDate(project.targetFinishDate)}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>Location: <strong>{project.location}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span>Type: <strong>{project.projectType}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setSubTab('overview')}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
            subTab === 'overview'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setSubTab('settings')}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
            subTab === 'settings'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Project Settings
        </button>
      </div>

      {/* Subtab Content */}
      {subTab === 'overview' ? (
        <div className="space-y-6">
          {/* Project Summary Cards (Screen 12 Exact Match) */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Project Execution Summary
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
                <div className="text-xs text-slate-500 font-medium">Total Tasks</div>
                <div className="text-2xl font-black text-slate-900 mt-1">{totalTasks}</div>
                <div className="text-[10px] text-slate-400 mt-1">Full WBS Scope</div>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-emerald-200/80 shadow-xs">
                <div className="text-xs text-emerald-600 font-medium">Completed</div>
                <div className="text-2xl font-black text-emerald-600 mt-1">{completedTasks}</div>
                <div className="text-[10px] text-slate-400 mt-1">Verified on site</div>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-blue-200/80 shadow-xs">
                <div className="text-xs text-blue-600 font-medium">In Progress</div>
                <div className="text-2xl font-black text-blue-600 mt-1">{inProgressTasks}</div>
                <div className="text-[10px] text-slate-400 mt-1">Under active execution</div>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-red-200/80 shadow-xs">
                <div className="text-xs text-red-600 font-medium">Delayed</div>
                <div className="text-2xl font-black text-red-600 mt-1">{delayedTasks}</div>
                <div className="text-[10px] text-red-700 mt-1">Pushing baseline</div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-4 text-xs">
          <h3 className="font-bold text-slate-900 text-sm">Critical Path & Risk Configuration</h3>
          <div className="space-y-3 max-w-lg">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Zero-Float Critical Alert Threshold (Days)
              </label>
              <input
                type="number"
                defaultValue={1}
                className="w-full px-3 py-2 rounded-lg border border-slate-300"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Tasks with total float below this value will trigger automatic warnings.
              </p>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                FastAPI / Real-time WebSocket Propagation
              </label>
              <div className="flex items-center gap-2 text-slate-700">
                <input type="checkbox" defaultChecked className="rounded accent-blue-600" />
                <span>Broadcast simulated delays to all connected field engineers immediately</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
