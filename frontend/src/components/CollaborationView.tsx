import React, { useState } from 'react';
import {
  MessageSquare,
  Send,
  Share2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Printer,
  Copy,
  Building2,
  Calendar,
  ShieldAlert,
  User,
  Filter,
  Check,
} from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { formatDisplayDate } from '../utils/cpm';

export const CollaborationView: React.FC = () => {
  const {
    comments,
    tasks,
    addComment,
    project,
    criticalPath,
    alerts,
    deliveries,
    taskThreatRankings,
    currentUser,
  } = useProject();

  const [selectedTaskId, setSelectedTaskId] = useState(tasks[1]?.id || 't1');
  const [commentContent, setCommentContent] = useState('');
  const [commentTag, setCommentTag] = useState<'Update' | 'Blocker' | 'Resolution' | 'General'>('Update');
  const [activeFilterTag, setActiveFilterTag] = useState<string>('All');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentContent.trim()) return;
    addComment(selectedTaskId, commentContent, commentTag);
    setCommentContent('');
  };

  const filteredComments = comments.filter((c) => {
    if (activeFilterTag === 'All') return true;
    return c.tag === activeFilterTag;
  });

  const handleCopyReportLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-[11px] font-semibold mb-1 border border-indigo-200">
            <MessageSquare className="w-3.5 h-3.5" />
            Field Collaboration & Stakeholder Sharing
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Contractor Updates & Collaboration
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Post site updates, flag delays or blockers directly on tasks, and share executive risk briefs with stakeholders.
          </p>
        </div>

        <button
          onClick={() => setIsShareModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
        >
          <Share2 className="w-4 h-4" />
          <span>Share Stakeholder Report</span>
        </button>
      </div>

      {/* Main Grid: Comment Input & Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Post Update Form (4 Cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Post Field Update / Comment</h3>
            <p className="text-xs text-slate-400">Subcontractors and site engineers log remarks</p>
          </div>

          <form onSubmit={handlePostComment} className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 uppercase mb-1">
                Select Construction Task *
              </label>
              <select
                value={selectedTaskId}
                onChange={(e) => setSelectedTaskId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
              >
                {tasks.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.contractor})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 uppercase mb-1">
                Update Category
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['Update', 'Blocker', 'Resolution', 'General'] as const).map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setCommentTag(tag)}
                    className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold border transition-all ${
                      commentTag === tag
                        ? tag === 'Blocker'
                          ? 'bg-red-500 text-white border-red-500'
                          : tag === 'Resolution'
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-blue-600 text-white border-blue-600'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 uppercase mb-1">
                Site Remarks & Evidence *
              </label>
              <textarea
                rows={4}
                required
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                placeholder="Log delays, material status, weather conditions or inspection results..."
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Broadcast Update</span>
            </button>
          </form>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-500">
            <strong>Logged as:</strong> {currentUser.name} ({currentUser.role})
          </div>
        </div>

        {/* Right Column: Collaboration Feed (8 Cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Task Collaboration Feed</h3>
              <p className="text-xs text-slate-400">Live communication history between site teams & managers</p>
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-1.5">
              {['All', 'Blocker', 'Update', 'Resolution'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => setActiveFilterTag(tag)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    activeFilterTag === tag
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {filteredComments.map((comm) => (
              <div
                key={comm.id}
                className="p-4 rounded-xl border border-slate-200/80 hover:border-slate-300 transition-all text-xs space-y-2 bg-slate-50/50"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-[11px]">
                      {comm.author.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <span className="font-bold text-slate-900">{comm.author}</span>
                      <span className="text-[10px] text-slate-400 ml-1.5">({comm.role})</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                        comm.tag === 'Blocker'
                          ? 'bg-red-100 text-red-700'
                          : comm.tag === 'Resolution'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {comm.tag}
                    </span>
                    <span className="text-[10px] text-slate-400">{comm.timeAgo}</span>
                  </div>
                </div>

                <div className="text-slate-700 pl-9 leading-relaxed">
                  {comm.content}
                </div>

                <div className="pl-9 pt-1 text-[10px] text-slate-400 flex items-center gap-1.5">
                  <span>Linked Task:</span>
                  <span className="font-semibold text-slate-700 px-1.5 py-0.5 rounded bg-white border border-slate-200">
                    {comm.taskName}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Share Stakeholder Executive Brief Modal (Requirement 5) */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
              <div className="flex items-center gap-2.5">
                <Building2 className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="font-bold text-sm">Executive Stakeholder Delay Risk Brief</h3>
                  <p className="text-[11px] text-slate-300">BuildTrack Autonomous CPM Schedule Audit</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintReport}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print PDF</span>
                </button>
                <button
                  onClick={handleCopyReportLink}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Copied!' : 'Copy Share Link'}</span>
                </button>
                <button
                  onClick={() => setIsShareModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  &times;
                </button>
              </div>
            </div>

            {/* Printable Brief Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-800 print:text-black">
              {/* Project Top Line */}
              <div className="flex justify-between items-start pb-4 border-b border-slate-200">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{project.name}</h2>
                  <p className="text-slate-500">{project.description}</p>
                  <div className="mt-1 text-slate-600">
                    Location: <strong>{project.location}</strong> | Type: <strong>{project.projectType}</strong>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-slate-400 text-[10px] uppercase font-bold">Audit Timestamp</div>
                  <div className="font-mono text-slate-700">{new Date().toLocaleString()}</div>
                  <div className="mt-1">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700">
                      Schedule Status: {project.status} (+{project.scheduleVarianceDays}d)
                    </span>
                  </div>
                </div>
              </div>

              {/* 3 Metric Callouts */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-slate-400 text-[10px] uppercase">Target Delivery</div>
                  <div className="text-base font-bold text-slate-900">{formatDisplayDate(project.targetFinishDate)}</div>
                </div>
                <div className="p-3 bg-red-50 rounded-xl border border-red-200">
                  <div className="text-red-600 text-[10px] uppercase">Projected Delivery</div>
                  <div className="text-base font-bold text-red-700">
                    {formatDisplayDate(project.projectedFinishDate)} (+{project.scheduleVarianceDays}d)
                  </div>
                </div>
                <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="text-blue-600 text-[10px] uppercase">Progress Complete</div>
                  <div className="text-base font-bold text-blue-700">{project.overallProgress}%</div>
                </div>
              </div>

              {/* Top Deadline Threat Rankings */}
              <div>
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2">
                  Highest Threat Tasks (Ranked by Deadline Vulnerability)
                </h4>
                <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
                  <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="p-2">Rank</th>
                      <th className="p-2">Task</th>
                      <th className="p-2">Contractor</th>
                      <th className="p-2">Total Float</th>
                      <th className="p-2 text-right">Threat Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {taskThreatRankings.slice(0, 4).map((rank, idx) => (
                      <tr key={rank.taskId} className="hover:bg-slate-50">
                        <td className="p-2 font-mono font-bold text-slate-500">#{idx + 1}</td>
                        <td className="p-2 font-bold text-slate-900">{rank.taskName}</td>
                        <td className="p-2 text-slate-600">{rank.contractor}</td>
                        <td className="p-2 font-mono">{rank.totalFloat} days</td>
                        <td className="p-2 text-right">
                          <span className="font-bold text-red-600">{rank.threatScore}/100</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Material Deliveries Status */}
              <div>
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2">
                  Supply Chain & Material Delivery Status
                </h4>
                <div className="space-y-1.5">
                  {deliveries.slice(0, 3).map((d) => (
                    <div key={d.id} className="flex justify-between p-2 rounded bg-slate-50 border border-slate-200">
                      <span><strong>{d.materialName}</strong> ({d.supplier})</span>
                      <span className={d.status === 'Delayed' ? 'text-red-600 font-bold' : 'text-slate-600'}>
                        {d.status} ({formatDisplayDate(d.expectedDate)})
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sign-off footer */}
              <div className="pt-4 border-t border-slate-200 flex justify-between items-center text-slate-400 text-[10px]">
                <span>Certified by: Zainab S., Project Manager</span>
                <span>Report Generated automatically by BuildTrack CPM Engine</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
