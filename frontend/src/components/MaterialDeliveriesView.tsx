import React, { useState } from 'react';
import {
  Truck,
  Plus,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Zap,
  Filter,
  PackageCheck,
  X,
} from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { formatDisplayDate } from '../utils/cpm';
import { DeliveryStatus } from '../types';

export const MaterialDeliveriesView: React.FC = () => {
  const { deliveries, tasks, addDelivery, updateDelivery, simulateDeliveryDelay, searchQuery } = useProject();
  const [statusFilter, setStatusFilter] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [simulateModalDeliveryId, setSimulateModalDeliveryId] = useState<string | null>(null);
  const [simDelayDays, setSimDelayDays] = useState(2);

  // New delivery state
  const [materialName, setMaterialName] = useState('');
  const [supplier, setSupplier] = useState('');
  const [quantity, setQuantity] = useState('');
  const [expectedDate, setExpectedDate] = useState('2025-10-08');
  const [linkedTaskId, setLinkedTaskId] = useState(tasks[0]?.id || 't1');
  const [contactPerson, setContactPerson] = useState('');
  const [notes, setNotes] = useState('');

  const filteredDeliveries = deliveries.filter((d) => {
    const matchesSearch =
      d.materialName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.supplier.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.linkedTaskName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || d.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateDelivery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!materialName.trim()) return;

    const linkedTask = tasks.find((t) => t.id === linkedTaskId);

    addDelivery({
      materialName,
      supplier,
      quantity,
      expectedDate,
      revisedDate: expectedDate,
      linkedTaskId,
      linkedTaskName: linkedTask?.name || 'Task',
      status: 'On Time',
      delayDays: 0,
      contactPerson,
      notes,
    });

    setIsAddModalOpen(false);
    setMaterialName('');
    setSupplier('');
    setQuantity('');
  };

  const handleSimulateLateDelivery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!simulateModalDeliveryId) return;
    simulateDeliveryDelay(simulateModalDeliveryId, simDelayDays);
    setSimulateModalDeliveryId(null);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-[11px] font-semibold mb-1 border border-blue-200">
            <Truck className="w-3.5 h-3.5" />
            Supply Chain & Procurement Tracker
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Material Deliveries</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor consignment arrival dates, identify supplier bottlenecks, and simulate delivery delay impact.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm shadow-blue-500/20 transition-all hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" />
          <span>Add Material Delivery</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter by Status:</span>
          </div>

          <div className="flex items-center gap-1.5">
            {['All', 'On Time', 'Delayed', 'In Transit', 'Delivered'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  statusFilter === st
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <div className="text-xs text-slate-400">
          Showing <strong>{filteredDeliveries.length}</strong> of {deliveries.length} consignments
        </div>
      </div>

      {/* Deliveries Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Material & Consignment</th>
                <th className="py-3 px-4">Supplier</th>
                <th className="py-3 px-4">Quantity</th>
                <th className="py-3 px-4">Expected Date</th>
                <th className="py-3 px-4">Revised / Actual</th>
                <th className="py-3 px-4">Linked Task</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDeliveries.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50/70 transition-colors">
                  {/* Material */}
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs shrink-0 ${
                          d.status === 'Delayed'
                            ? 'bg-red-50 text-red-600'
                            : d.status === 'In Transit'
                            ? 'bg-amber-50 text-amber-600'
                            : 'bg-emerald-50 text-emerald-600'
                        }`}
                      >
                        <Truck className="w-4 h-4" />
                      </div>
                      <div>
                        <div>{d.materialName}</div>
                        {d.contactPerson && (
                          <div className="text-[10px] font-normal text-slate-400">
                            POC: {d.contactPerson}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Supplier */}
                  <td className="py-3.5 px-4 text-slate-700 font-medium">
                    {d.supplier}
                  </td>

                  {/* Quantity */}
                  <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
                    {d.quantity}
                  </td>

                  {/* Expected Date */}
                  <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
                    {formatDisplayDate(d.expectedDate)}
                  </td>

                  {/* Revised Date */}
                  <td className="py-3.5 px-4 font-mono text-[11px]">
                    {d.status === 'Delayed' ? (
                      <span className="font-bold text-red-600">
                        {formatDisplayDate(d.revisedDate)} (+{d.delayDays}d)
                      </span>
                    ) : (
                      <span className="text-slate-600">{formatDisplayDate(d.revisedDate || d.expectedDate)}</span>
                    )}
                  </td>

                  {/* Linked Task */}
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 text-[11px] font-semibold">
                      {d.linkedTaskName}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        d.status === 'Delayed'
                          ? 'bg-red-100 text-red-700'
                          : d.status === 'In Transit'
                          ? 'bg-amber-100 text-amber-700'
                          : d.status === 'Delivered'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {d.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setSimulateModalDeliveryId(d.id)}
                        className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold rounded-lg text-[11px] border border-amber-200 flex items-center gap-1"
                        title="Simulate delay on this delivery"
                      >
                        <Zap className="w-3 h-3 text-amber-600 fill-amber-500" />
                        <span>Simulate Slip</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Delivery Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-slate-900 text-sm">Register New Material Delivery</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDelivery} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 uppercase mb-1">
                  Material Name *
                </label>
                <input
                  type="text"
                  required
                  value={materialName}
                  onChange={(e) => setMaterialName(e.target.value)}
                  placeholder="e.g. Ready-Mix Grade 40 Concrete"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1">
                    Supplier / Vendor *
                  </label>
                  <input
                    type="text"
                    required
                    value={supplier}
                    onChange={(e) => setSupplier(e.target.value)}
                    placeholder="e.g. UltraTech Cement"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1">
                    Quantity & Unit
                  </label>
                  <input
                    type="text"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="e.g. 240 cu.m or 50 Tons"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1">
                    Expected Arrival Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={expectedDate}
                    onChange={(e) => setExpectedDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1">
                    Linked Construction Task *
                  </label>
                  <select
                    value={linkedTaskId}
                    onChange={(e) => setLinkedTaskId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                  >
                    {tasks.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.trade})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase mb-1">
                  Contact Person / Dispatch Phone
                </label>
                <input
                  type="text"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  placeholder="e.g. Ramesh Kumar (+91 98200 00000)"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                />
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
                  Save Delivery
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Simulate Late Delivery Slip Modal */}
      {simulateModalDeliveryId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-amber-50">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <h3 className="font-bold text-slate-900 text-sm">Simulate Supplier Delivery Slip</h3>
              </div>
              <button
                onClick={() => setSimulateModalDeliveryId(null)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSimulateLateDelivery} className="p-6 space-y-4 text-xs">
              <p className="text-slate-600">
                Simulate what happens when this material arrival is delayed. The system will propagate the delay into the linked task and recalculate downstream CPM float!
              </p>

              <div>
                <label className="block font-semibold text-slate-700 uppercase mb-1">
                  Additional Delivery Delay (Days)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={simDelayDays}
                    onChange={(e) => setSimDelayDays(Number(e.target.value))}
                    className="w-full accent-amber-500"
                  />
                  <span className="font-bold text-amber-600 text-sm w-12 text-right">
                    +{simDelayDays}d
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSimulateModalDeliveryId(null)}
                  className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-semibold shadow-xs flex items-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5 fill-white" />
                  <span>Run Ripple Analysis</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
