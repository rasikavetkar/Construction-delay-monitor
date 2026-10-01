import React, { useState } from 'react';
import {
  Download,
  BarChart3,
  PieChart as PieIcon,
  TrendingUp,
  FileSpreadsheet,
  CheckCircle,
  AlertTriangle,
  Layers,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { useProject } from '../context/ProjectContext';

export const ReportsView: React.FC = () => {
  const { tasks, project, criticalPath, exportProjectJson } = useProject();
  const [activeTab, setActiveTab] = useState<'schedule' | 'risk' | 'resources'>('schedule');

  // Task Status distribution data for Pie Chart
  const statusCounts = {
    Completed: tasks.filter((t) => t.status === 'Completed').length,
    'In-Progress': tasks.filter((t) => t.status === 'In Progress').length,
    'Not Started': tasks.filter((t) => t.status === 'Not Started').length,
    Delayed: tasks.filter((t) => t.status === 'Delayed').length,
  };

  const pieData = [
    { name: 'Completed', value: statusCounts.Completed, color: '#10b981' },
    { name: 'In-Progress', value: statusCounts['In-Progress'], color: '#3b82f6' },
    { name: 'Not Started', value: statusCounts['Not Started'], color: '#94a3b8' },
    { name: 'Delayed', value: statusCounts.Delayed, color: '#ef4444' },
  ];

  // Schedule Variance Bar Chart data
  const varianceBarData = tasks.map((t) => ({
    name: t.name,
    duration: t.duration,
    delay: t.delayImpactDays || (t.status === 'Delayed' ? 3 : 0),
    float: t.totalFloat || 0,
  }));

  const handleDownloadCsv = () => {
    const headers = ['Task Name', 'Trade', 'Duration (days)', 'Contractor', 'Status', 'Risk Level', 'Delay Impact (days)'];
    const rows = tasks.map((t) => [
      `"${t.name}"`,
      `"${t.trade}"`,
      t.duration,
      `"${t.contractor}"`,
      `"${t.status}"`,
      `"${t.riskLevel}"`,
      t.delayImpactDays || 0,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${project.name.replace(/\s+/g, '_')}_Risk_Report.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleExportPdf = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header (Screen 10 Layout) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Reports & Analytics</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Statistical schedule variance, risk exposure metrics, and critical path audit logs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportPdf}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl text-xs font-semibold border border-red-200 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export PDF</span>
          </button>
          <button
            onClick={exportProjectJson}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
          <button
            onClick={handleDownloadCsv}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm shadow-blue-500/20 transition-all"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Download CSV Report</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('schedule')}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'schedule'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Schedule Overview
        </button>
        <button
          onClick={() => setActiveTab('risk')}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'risk'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Risk Analysis
        </button>
        <button
          onClick={() => setActiveTab('resources')}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'resources'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Resource Utilization
        </button>
      </div>

      {/* Charts Grid (Screen 10 Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Chart: Schedule Variance Bar Chart (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Schedule Variance & Duration</h3>
              <p className="text-xs text-slate-400">Baseline duration vs simulated delay (days)</p>
            </div>
            <div className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
              +{project.scheduleVarianceDays} days variance
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={varianceBarData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-25} textAnchor="end" />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '11px',
                  }}
                />
                <Bar dataKey="duration" fill="#3b82f6" name="Planned Duration (d)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="delay" fill="#ef4444" name="Delay Impact (d)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Chart: Task Status Donut Chart (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-slate-900">Task Status Distribution</h3>
              <span className="text-xs font-bold text-slate-500">Total: {tasks.length} tasks</span>
            </div>
            <p className="text-xs text-slate-400 mb-4">Proportion of tasks by execution stage</p>

            <div className="h-56 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              {/* Center Progress Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-black text-slate-900">{project.overallProgress}%</span>
                <span className="text-[10px] text-slate-400 font-medium uppercase">Complete</span>
              </div>
            </div>
          </div>

          {/* Donut Legend */}
          <div className="grid grid-cols-2 gap-2 text-xs pt-3 border-t border-slate-100">
            {pieData.map((p) => (
              <div key={p.name} className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50">
                <span className="flex items-center gap-1.5 text-slate-600 text-[11px]">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                  <span>{p.name}</span>
                </span>
                <span className="font-bold text-slate-800">{p.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Tables: Top Delay Risks + Critical Path Tasks (Screen 10 Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Delay Risks Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
          <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span>Top Delay Risks</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px]">
                  <th className="pb-2">Task</th>
                  <th className="pb-2 text-center">Risk Level</th>
                  <th className="pb-2 text-right">Delay Impact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tasks.slice(0, 5).map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50">
                    <td className="py-2.5 font-bold text-slate-800">{t.name}</td>
                    <td className="py-2.5 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          t.riskLevel === 'High'
                            ? 'bg-red-100 text-red-700'
                            : t.riskLevel === 'Medium'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {t.riskLevel}
                      </span>
                    </td>
                    <td className="py-2.5 text-right font-bold text-red-600">
                      +{t.delayImpactDays || (t.riskLevel === 'High' ? 3 : 1)} days
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Critical Path Tasks Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
          <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-red-500" />
            <span>Critical Path Tasks (Zero Float)</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px]">
                  <th className="pb-2">Task Name</th>
                  <th className="pb-2">Duration</th>
                  <th className="pb-2">Contractor</th>
                  <th className="pb-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {criticalPath.map((cp) => (
                  <tr key={cp.id} className="hover:bg-slate-50">
                    <td className="py-2.5 font-bold text-slate-800">{cp.name}</td>
                    <td className="py-2.5 text-slate-600 font-mono">{cp.duration} days</td>
                    <td className="py-2.5 text-slate-600">{cp.contractor}</td>
                    <td className="py-2.5 text-right">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {cp.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Full CPM Breakdown Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-500" />
              Full CPM Schedule Breakdown
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Complete Early Start / Finish, Late Start / Finish, Total Float and Free Float audit for all tasks</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold">
                <th className="px-3 py-2.5 border border-slate-200 rounded-tl-lg">Task</th>
                <th className="px-3 py-2.5 border border-slate-200">Trade</th>
                <th className="px-3 py-2.5 border border-slate-200 text-center">Dur (d)</th>
                <th className="px-3 py-2.5 border border-slate-200 text-center bg-blue-50 text-blue-700">ES</th>
                <th className="px-3 py-2.5 border border-slate-200 text-center bg-blue-50 text-blue-700">EF</th>
                <th className="px-3 py-2.5 border border-slate-200 text-center bg-purple-50 text-purple-700">LS</th>
                <th className="px-3 py-2.5 border border-slate-200 text-center bg-purple-50 text-purple-700">LF</th>
                <th className="px-3 py-2.5 border border-slate-200 text-center bg-amber-50 text-amber-700">TF</th>
                <th className="px-3 py-2.5 border border-slate-200 text-center bg-emerald-50 text-emerald-700">FF</th>
                <th className="px-3 py-2.5 border border-slate-200 text-center">Progress</th>
                <th className="px-3 py-2.5 border border-slate-200 text-center rounded-tr-lg">Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tasks.map((t, i) => (
                <tr key={t.id} className={`hover:bg-slate-50 transition-colors ${t.isCritical ? 'bg-red-50/40' : ''}`}>
                  <td className="px-3 py-2.5 border border-slate-100">
                    <div className="flex items-center gap-1.5">
                      {t.isCritical && <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />}
                      <span className="font-bold text-slate-800">{t.name}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 border border-slate-100 text-slate-500">{t.trade}</td>
                  <td className="px-3 py-2.5 border border-slate-100 text-center font-mono text-slate-700">{t.duration}</td>
                  <td className="px-3 py-2.5 border border-slate-100 text-center font-mono text-blue-700 bg-blue-50/30">{t.earlyStart ?? '—'}</td>
                  <td className="px-3 py-2.5 border border-slate-100 text-center font-mono text-blue-700 bg-blue-50/30">{t.earlyFinish ?? '—'}</td>
                  <td className="px-3 py-2.5 border border-slate-100 text-center font-mono text-purple-700 bg-purple-50/30">{t.lateStart ?? '—'}</td>
                  <td className="px-3 py-2.5 border border-slate-100 text-center font-mono text-purple-700 bg-purple-50/30">{t.lateFinish ?? '—'}</td>
                  <td className="px-3 py-2.5 border border-slate-100 text-center">
                    <span className={`font-bold font-mono px-1.5 py-0.5 rounded text-[11px] ${
                      (t.totalFloat ?? 0) === 0 ? 'bg-red-100 text-red-700' :
                      (t.totalFloat ?? 0) <= 2 ? 'bg-amber-100 text-amber-700' :
                      'bg-emerald-100 text-emerald-700'
                    }`}>{t.totalFloat ?? '—'}</span>
                  </td>
                  <td className="px-3 py-2.5 border border-slate-100 text-center font-mono text-emerald-700 bg-emerald-50/30">{t.freeFloat ?? '—'}</td>
                  <td className="px-3 py-2.5 border border-slate-100 text-center">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-blue-500 h-full rounded-full" style={{ width: `${t.progress}%` }} />
                      </div>
                      <span className="font-mono text-slate-600 text-[10px]">{t.progress}%</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 border border-slate-100 text-center">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      t.isCritical ? 'bg-red-100 text-red-700' :
                      t.riskLevel === 'High' ? 'bg-amber-100 text-amber-700' :
                      t.riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-emerald-100 text-emerald-700'
                    }`}>{t.isCritical ? 'CRITICAL' : t.riskLevel}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3 flex items-center gap-4 text-[10px] text-slate-400">
          <span className="flex items-center gap-1"><span className="w-2 h-2 bg-blue-100 rounded border border-blue-300" /> ES/EF = Early Start/Finish</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 bg-purple-100 rounded border border-purple-300" /> LS/LF = Late Start/Finish</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 bg-amber-100 rounded border border-amber-300" /> TF = Total Float</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 bg-emerald-100 rounded border border-emerald-300" /> FF = Free Float</span>
        </div>
      </div>
    </div>
  );
};
