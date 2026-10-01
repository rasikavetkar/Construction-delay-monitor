import React, { useState } from 'react';
import { ProjectProvider, useProject } from './context/ProjectContext';
import { LandingLoginPage } from './components/LandingLoginPage';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { TaskManagementView } from './components/TaskManagementView';
import { GanttView } from './components/GanttView';
import { DependencyGraphView } from './components/DependencyGraphView';
import { DelaySimulationView } from './components/DelaySimulationView';
import { ProgressUpdatesView } from './components/ProgressUpdatesView';
import { AlertsView } from './components/AlertsView';
import { ReportsView } from './components/ReportsView';
import { ContractorManagementView } from './components/ContractorManagementView';
import { ProjectDetailsView } from './components/ProjectDetailsView';
import { MaterialDeliveriesView } from './components/MaterialDeliveriesView';
import { CollaborationView } from './components/CollaborationView';
import { ProjectSetupModal } from './components/ProjectSetupModal';
import { ToastContainer, useToastManager } from './components/ToastNotification';

const AppContent: React.FC = () => {
  const { isLoggedIn, activeView } = useProject();
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const { toasts, removeToast } = useToastManager();

  if (!isLoggedIn) {
    return <LandingLoginPage />;
  }

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardView />;
      case 'projects':
      case 'settings':
        return <ProjectDetailsView onOpenEditModal={() => setIsProjectModalOpen(true)} />;
      case 'tasks':
        return <TaskManagementView />;
      case 'gantt':
        return <GanttView />;
      case 'graph':
        return <DependencyGraphView />;
      case 'simulation':
        return <DelaySimulationView />;
      case 'progress':
        return <ProgressUpdatesView />;
      case 'deliveries':
        return <MaterialDeliveriesView />;
      case 'collaboration':
        return <CollaborationView />;
      case 'alerts':
        return <AlertsView />;
      case 'reports':
        return <ReportsView />;
      case 'contractors':
        return <ContractorManagementView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 font-sans">
      {/* Dark Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Navbar */}
        <Navbar
          onOpenNewProjectModal={() => setIsProjectModalOpen(true)}
          onOpenNewTaskModal={() => {}}
        />

        {/* Scrollable Viewport */}
        <main className="flex-1 overflow-y-auto px-6 py-6 min-h-0 bg-slate-50">
          <div className="max-w-7xl mx-auto">
            {renderActiveView()}
          </div>
        </main>
      </div>

      {/* Project Setup Wizard Modal */}
      <ProjectSetupModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
      />
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ProjectProvider>
      <AppContent />
    </ProjectProvider>
  );
};

export default App;
