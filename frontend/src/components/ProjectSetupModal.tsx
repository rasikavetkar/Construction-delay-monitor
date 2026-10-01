import React, { useState } from 'react';
import { X, Building2, Check, ArrowRight, ArrowLeft, Calendar, MapPin, Sparkles } from 'lucide-react';
import { useProject } from '../context/ProjectContext';

interface ProjectSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProjectSetupModal: React.FC<ProjectSetupModalProps> = ({ isOpen, onClose }) => {
  const { updateProject, project } = useProject();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: project.name || 'Skyline Commercial Complex',
    description: project.description || 'Construction of a commercial complex with offices, retail and parking.',
    startDate: project.startDate || '2025-10-01',
    targetFinishDate: project.targetFinishDate || '2025-10-30',
    location: project.location || 'Mumbai',
    projectType: project.projectType || 'Commercial',
  });

  if (!isOpen) return null;

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      updateProject({
        ...formData,
        projectedFinishDate: formData.targetFinishDate,
        scheduleVarianceDays: 0,
        status: 'On Track',
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header with Steps */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Create New Project</h2>
              <p className="text-xs text-slate-500">Configure scheduling parameters and baseline dates</p>
            </div>
          </div>

          {/* Stepper Wizard */}
          <div className="hidden sm:flex items-center gap-4">
            <div className={`flex items-center gap-1.5 text-xs font-semibold ${step >= 1 ? 'text-blue-600' : 'text-slate-400'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'}`}>1</span>
              <span>Project Details</span>
            </div>
            <div className="w-6 h-px bg-slate-200" />
            <div className={`flex items-center gap-1.5 text-xs font-semibold ${step >= 2 ? 'text-blue-600' : 'text-slate-400'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'}`}>2</span>
              <span>Add Tasks</span>
            </div>
            <div className="w-6 h-px bg-slate-200" />
            <div className={`flex items-center gap-1.5 text-xs font-semibold ${step >= 3 ? 'text-blue-600' : 'text-slate-400'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'}`}>3</span>
              <span>Review</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body (Screen 3 Layout) */}
        <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Form (8 Cols) */}
          <div className="lg:col-span-8 space-y-4">
            {step === 1 && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Project Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    placeholder="e.g. Skyline Commercial Complex"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    placeholder="Brief scope of works..."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" /> Start Date *
                    </label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" /> Target Finish Date *
                    </label>
                    <input
                      type="date"
                      value={formData.targetFinishDate}
                      onChange={(e) => setFormData({ ...formData, targetFinishDate: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" /> Location
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      placeholder="e.g. Mumbai, Maharashtra"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Project Type
                    </label>
                    <select
                      value={formData.projectType}
                      onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                    >
                      <option value="Commercial">Commercial</option>
                      <option value="Residential">Residential</option>
                      <option value="Infrastructure">Infrastructure</option>
                      <option value="Industrial">Industrial</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900">
                  <span className="font-bold">Initial Milestone Tasks Configured:</span> Default Critical Path sequence (Material Delivery &rarr; Foundation &rarr; Columns &rarr; Walls &rarr; Electrical/Plumbing &rarr; Finishing) is already seeded with full DAG dependencies.
                </div>
                <p className="text-xs text-slate-500">
                  You can edit individual task durations, contractor allocations, and custom dependency arrows directly in the Task Management or Dependency Graph screens.
                </p>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                <h3 className="font-bold text-slate-900 text-sm mb-2">Project Summary Confirmation</h3>
                <div className="grid grid-cols-2 gap-2 text-slate-600">
                  <div><strong>Name:</strong> {formData.name}</div>
                  <div><strong>Type:</strong> {formData.projectType}</div>
                  <div><strong>Location:</strong> {formData.location}</div>
                  <div><strong>Start Date:</strong> {formData.startDate}</div>
                  <div><strong>Target Finish:</strong> {formData.targetFinishDate}</div>
                  <div><strong>Algorithm:</strong> Automated CPM Forward/Backward Pass</div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Site Thumbnail + Quick Tips (4 Cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="rounded-xl overflow-hidden border border-slate-200 shadow-xs relative h-36">
              <img
                src="https://images.unsplash.com/photo-1541888946425-d0fbb18615f3?auto=format&fit=crop&w=600&q=80"
                alt="Site Preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent flex items-end p-3">
                <span className="text-white text-xs font-semibold">{formData.name}</span>
              </div>
            </div>

            {/* Quick Tips Box (Screen 3 Exact Match) */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Quick Tips
              </div>
              <ol className="text-xs text-slate-600 space-y-1.5 list-decimal pl-4">
                <li>Add all major tasks to construct baseline.</li>
                <li>Define dependencies between civil and MEP trades.</li>
                <li>Assign resources & contractors with phone/email contacts.</li>
                <li>Add material deliveries early to prevent supply chain float bottlenecks.</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              Cancel
            </button>
          )}

          <button
            onClick={handleNext}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all"
          >
            <span>{step === 3 ? 'Finish & Save Project' : 'Next'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
