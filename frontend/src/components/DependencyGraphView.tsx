import React, { useMemo, useState } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  Node,
  Edge,
  MarkerType,
  Handle,
  Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Zap, Maximize2, ShieldAlert, Sparkles, Clock, CheckCircle, Filter } from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { Task } from '../types';

// Custom Task Node Component for React Flow
const CustomTaskNode = ({ data }: { data: any }) => {
  const task: Task = data.task;
  const isSelected = data.isSelected;
  const isDimmed = data.isDimmed;

  const getNodeColors = () => {
    if (task.status === 'Delayed') {
      return 'bg-red-50 border-red-400 text-red-950 shadow-red-200/50';
    }
    if (task.trade === 'Civil') {
      return 'bg-amber-50 border-amber-400 text-amber-950 shadow-amber-200/50';
    }
    if (task.trade === 'Structural') {
      return 'bg-orange-50 border-orange-400 text-orange-950 shadow-orange-200/50';
    }
    if (task.trade === 'Electrical') {
      return 'bg-purple-50 border-purple-400 text-purple-950 shadow-purple-200/50';
    }
    if (task.trade === 'Plumbing') {
      return 'bg-blue-50 border-blue-400 text-blue-950 shadow-blue-200/50';
    }
    if (task.trade === 'Finishing') {
      return 'bg-emerald-50 border-emerald-400 text-emerald-950 shadow-emerald-200/50';
    }
    return 'bg-slate-50 border-slate-300 text-slate-800 shadow-slate-200/50';
  };

  const getRiskBadge = () => {
    if (task.riskLevel === 'High') return 'bg-red-500';
    if (task.riskLevel === 'Medium') return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  return (
    <div
      className={`px-4 py-3 rounded-2xl border-2 shadow-md transition-all min-w-[140px] text-center relative ${getNodeColors()} ${
        isSelected ? 'ring-4 ring-blue-500/40 scale-105' : ''
      } ${isDimmed ? 'opacity-25 grayscale' : 'opacity-100'}`}
    >
      <Handle type="target" position={Position.Left} className="w-2.5 h-2.5 !bg-slate-400" />

      {/* Risk Indicator Dot */}
      <div
        className={`w-2.5 h-2.5 rounded-full absolute -top-1 -right-1 ring-2 ring-white ${getRiskBadge()}`}
        title={`Risk Level: ${task.riskLevel}`}
      />

      <div className="font-bold text-xs leading-tight">{task.name}</div>
      <div className="text-[10px] text-slate-600 mt-1 font-medium">
        {task.duration} days
      </div>

      {task.isCritical && (
        <div className="mt-1.5 inline-block text-[9px] font-bold px-1.5 py-0.2 rounded bg-red-100 text-red-700">
          Critical Path (0d Float)
        </div>
      )}

      <Handle type="source" position={Position.Right} className="w-2.5 h-2.5 !bg-slate-400" />
    </div>
  );
};

const nodeTypes = {
  customTask: CustomTaskNode,
};

export const DependencyGraphView: React.FC = () => {
  const { tasks, contractors, setActiveView, searchQuery, currentUser } = useProject();
  const [selectedTask, setSelectedTask] = useState<Task | null>(tasks[1] || null);

  // Filters for Requirement 4
  const [tradeFilter, setTradeFilter] = useState('All Trades');
  const [contractorFilter, setContractorFilter] = useState('All Contractors');
  const [statusFilter, setStatusFilter] = useState('All Status');

  // Layout positions
  const { nodes, edges } = useMemo(() => {
    const positions: Record<string, { x: number; y: number }> = {
      t0: { x: 50, y: 160 },   // Material Delivery
      t1: { x: 260, y: 160 },  // Foundation
      t2: { x: 470, y: 160 },  // Columns
      t3: { x: 680, y: 160 },  // Walls
      t4: { x: 890, y: 90 },   // Electrical
      t5: { x: 890, y: 230 },  // Plumbing
      t6: { x: 1100, y: 160 }, // Finishing
      t7: { x: 1310, y: 160 }, // Handover
    };

    const initialNodes: Node[] = tasks.map((t, idx) => {
      const pos = positions[t.id] || { x: 100 + (idx % 4) * 200, y: 100 + Math.floor(idx / 4) * 150 };

      // Determine if node matches active filters
      const matchesSearch =
        !searchQuery ||
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.trade.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.contractor.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesTrade = tradeFilter === 'All Trades' || t.trade === tradeFilter;
      const matchesContractor = contractorFilter === 'All Contractors' || t.contractor === contractorFilter;
      const matchesStatus = statusFilter === 'All Status' || t.status === statusFilter;

      const isMatch = matchesSearch && matchesTrade && matchesContractor && matchesStatus;

      return {
        id: t.id,
        type: 'customTask',
        position: pos,
        data: {
          task: t,
          isSelected: selectedTask?.id === t.id,
          isDimmed: !isMatch,
        },
      };
    });

    const initialEdges: Edge[] = [];
    tasks.forEach((t) => {
      t.dependencies.forEach((parentId) => {
        const isCriticalEdge = t.isCritical && tasks.find((p) => p.id === parentId)?.isCritical;
        initialEdges.push({
          id: `e-${parentId}-${t.id}`,
          source: parentId,
          target: t.id,
          animated: isCriticalEdge,
          style: {
            stroke: isCriticalEdge ? '#ef4444' : '#94a3b8',
            strokeWidth: isCriticalEdge ? 2.5 : 1.5,
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: isCriticalEdge ? '#ef4444' : '#94a3b8',
          },
        });
      });
    });

    return { nodes: initialNodes, edges: initialEdges };
  }, [tasks, selectedTask, tradeFilter, contractorFilter, statusFilter, searchQuery]);

  const onNodeClick = (_: any, node: Node) => {
    const found = tasks.find((t) => t.id === node.id);
    if (found) {
      setSelectedTask(found);
      if (currentUser?.role === 'Project Manager') {
        localStorage.setItem('buildtrack_sim_preselect', found.id);
        setActiveView('simulation');
      }
    }
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-[11px] font-semibold mb-1 border border-blue-200">
            <Sparkles className="w-3.5 h-3.5" />
            Requirement 4: React Flow Topological DAG with Dynamic Filters
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dependency Graph</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Interactive Directed Acyclic Graph (DAG) for CPM topological calculations and buffer analysis.
          </p>
        </div>

        <button
          onClick={() => setActiveView('simulation')}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-800 border border-amber-300 rounded-lg text-xs font-semibold hover:bg-amber-100 transition-colors"
        >
          <Zap className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
          <span>Simulate Delay</span>
        </button>
      </div>

      {/* Filter Toolbar (Requirement 4) */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white rounded-xl border border-slate-200/80 shadow-xs">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <Filter className="w-3.5 h-3.5" />
            <span>Highlight Nodes:</span>
          </div>

          <select
            value={tradeFilter}
            onChange={(e) => setTradeFilter(e.target.value)}
            className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 bg-slate-50 text-slate-700 font-medium"
          >
            <option value="All Trades">All Trades</option>
            <option value="Civil">Civil</option>
            <option value="Structural">Structural</option>
            <option value="Electrical">Electrical</option>
            <option value="Plumbing">Plumbing</option>
            <option value="Finishing">Finishing</option>
          </select>

          <select
            value={contractorFilter}
            onChange={(e) => setContractorFilter(e.target.value)}
            className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 bg-slate-50 text-slate-700 font-medium"
          >
            <option value="All Contractors">All Contractors</option>
            {contractors.map((c) => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 bg-slate-50 text-slate-700 font-medium"
          >
            <option value="All Status">All Status</option>
            <option value="Delayed">Delayed</option>
            <option value="In Progress">In Progress</option>
            <option value="Not Started">Not Started</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        <div className="text-xs text-slate-400">
          Click any node to inspect float buffer and predecessors
        </div>
      </div>

      {/* Main Canvas & Detail Drawer Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* React Flow Graph (9 Cols) */}
        <div className="lg:col-span-9 bg-white rounded-2xl border border-slate-200/80 shadow-xs h-[560px] relative overflow-hidden flex flex-col">
          <div className="flex-1 relative">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              onNodeClick={onNodeClick}
              fitView
              attributionPosition="bottom-left"
            >
              <Background color="#cbd5e1" gap={20} size={1.2} variant={BackgroundVariant.Dots} />
              <Controls className="bg-white border border-slate-200 rounded-lg shadow-sm" />
              <MiniMap
                nodeStrokeColor="#64748b"
                nodeColor="#e2e8f0"
                maskColor="rgba(241, 245, 249, 0.7)"
                className="rounded-xl overflow-hidden border border-slate-200"
              />
            </ReactFlow>
            {/* Risk Level Floating Legend */}
            <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-xs p-3 rounded-xl border border-slate-200 shadow-md text-xs space-y-1.5 z-10">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Risk Level</div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <span className="text-slate-700">High (Zero Float / Critical Path)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="text-slate-700">Medium (&le; 2d Float Buffer)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-slate-700">Low (&gt; 3d Buffer)</span>
              </div>
            </div>
          </div>
          {currentUser?.role === 'Project Manager' && (
            <div className="p-3 bg-blue-50 border-t border-blue-100 text-blue-800 text-xs flex items-center justify-center gap-2">
              <span>💡 PM Mode: Click any task node to instantly open simulation for that task</span>
            </div>
          )}
        </div>

        {/* Selected Task Inspection Card (3 Cols) */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 flex flex-col justify-between">
          {selectedTask ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Node Inspector
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    selectedTask.riskLevel === 'High'
                      ? 'bg-red-100 text-red-700'
                      : selectedTask.riskLevel === 'Medium'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}
                >
                  {selectedTask.riskLevel} Risk
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900">{selectedTask.name}</h3>
                <p className="text-xs text-slate-500">{selectedTask.trade} Trade • {selectedTask.contractor}</p>
                {selectedTask.siteZone && (
                  <p className="text-[11px] text-blue-600 font-medium mt-0.5">{selectedTask.siteZone}</p>
                )}
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Duration:</span>
                  <span className="font-semibold text-slate-800">{selectedTask.duration} days</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Status:</span>
                  <span className="font-semibold text-slate-800">{selectedTask.status}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Progress:</span>
                  <span className="font-semibold text-slate-800">{selectedTask.progress}%</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Total Float (Buffer):</span>
                  <span className="font-semibold text-slate-800 font-mono">
                    {selectedTask.totalFloat ?? 0} days
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Free Float:</span>
                  <span className="font-semibold text-slate-800 font-mono">
                    {selectedTask.freeFloat ?? 0} days
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Critical Path:</span>
                  <span className={`font-bold ${selectedTask.isCritical ? 'text-red-600' : 'text-slate-600'}`}>
                    {selectedTask.isCritical ? 'YES (Zero Slack)' : 'No (Has Buffer)'}
                  </span>
                </div>
              </div>

              {selectedTask.notes && (
                <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200 text-[11px] text-amber-800">
                  <strong>Site Note:</strong> {selectedTask.notes}
                </div>
              )}

              <button
                onClick={() => setActiveView('simulation')}
                className="w-full py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition-all"
              >
                <Zap className="w-3.5 h-3.5 fill-white" />
                <span>Simulate Delay on {selectedTask.name}</span>
              </button>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 text-xs">
              Click any node in the graph to inspect CPM metrics and float details.
            </div>
          )}

          <div className="text-[11px] text-slate-400 text-center pt-3 border-t border-slate-100">
            Red animated edges represent zero-float critical dependencies.
          </div>
        </div>
      </div>
    </div>
  );
};
