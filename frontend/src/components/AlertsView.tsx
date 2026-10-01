import React, { useState } from 'react';
import { Bell, AlertTriangle, AlertCircle, Info, Check, Trash2, ShieldAlert } from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { AlertSeverity } from '../types';

export const AlertsView: React.FC = () => {
  const { alerts, dismissAlert, setActiveView } = useProject();
  const [activeTab, setActiveTab] = useState<'All' | AlertSeverity>('All');

  const countAll = alerts.length;
  const countCritical = alerts.filter((a) => a.severity === 'Critical').length;
  const countWarning = alerts.filter((a) => a.severity === 'Warning').length;
  const countInfo = alerts.filter((a) => a.severity === 'Info').length;

  const handleMarkAllRead = () => {
    alerts.forEach(a => dismissAlert(a.id));
  };

  const filteredAlerts = alerts.filter((a) => {
    if (activeTab === 'All') return true;
    return a.severity === activeTab;
  });

  return (
    <div className="space-y-5 pb-12 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Alerts & Notifications</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time schedule risk warnings, float depletion alerts, and material delay warnings.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleMarkAllRead}
            disabled={alerts.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Mark All Read</span>
          </button>
          <button
            onClick={() => setActiveView('simulation')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-800 border border-amber-300 rounded-lg text-xs font-semibold hover:bg-amber-100 transition-colors"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>Simulate Mitigation</span>
          </button>
        </div>
      </div>

      {/* Tabs (Screen 9 Layout) */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('All')}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
            activeTab === 'All'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>All</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">({countAll})</span>
        </button>

        <button
          onClick={() => setActiveTab('Critical')}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
            activeTab === 'Critical'
              ? 'bg-red-600 text-white shadow-xs'
              : 'text-red-700 bg-red-50 hover:bg-red-100'
          }`}
        >
          <span>Critical</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-red-200 text-red-900">
            ({countCritical})
          </span>
        </button>

        <button
          onClick={() => setActiveTab('Warning')}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
            activeTab === 'Warning'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'text-amber-800 bg-amber-50 hover:bg-amber-100'
          }`}
        >
          <span>Warning</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-200 text-amber-900">
            ({countWarning})
          </span>
        </button>

        <button
          onClick={() => setActiveTab('Info')}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
            activeTab === 'Info'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-blue-700 bg-blue-50 hover:bg-blue-100'
          }`}
        >
          <span>Info</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-200 text-blue-900">
            ({countInfo})
          </span>
        </button>
      </div>

      {/* Notifications List (Screen 9 Exact Match) */}
      <div className="space-y-3">
        {filteredAlerts.length > 0 ? (
          filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 shadow-xs ${
                alert.severity === 'Critical'
                  ? 'bg-white border-red-200 hover:border-red-300'
                  : alert.severity === 'Warning'
                  ? 'bg-white border-amber-200 hover:border-amber-300'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    alert.severity === 'Critical'
                      ? 'bg-red-100 text-red-600'
                      : alert.severity === 'Warning'
                      ? 'bg-amber-100 text-amber-600'
                      : 'bg-blue-100 text-blue-600'
                  }`}
                >
                  {alert.severity === 'Critical' ? (
                    <ShieldAlert className="w-5 h-5" />
                  ) : alert.severity === 'Warning' ? (
                    <AlertTriangle className="w-5 h-5" />
                  ) : (
                    <Info className="w-5 h-5" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{alert.title}</span>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        alert.severity === 'Critical'
                          ? 'bg-red-500 text-white'
                          : alert.severity === 'Warning'
                          ? 'bg-amber-500 text-white'
                          : 'bg-blue-500 text-white'
                      }`}
                    >
                      {alert.severity}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{alert.timeAgo}</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => dismissAlert(alert.id)}
                  title="Dismiss alert"
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors text-xs font-medium flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Acknowledge</span>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
            No alerts found for selected filter category.
          </div>
        )}
      </div>
    </div>
  );
};
