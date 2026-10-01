import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  Project,
  Task,
  Contractor,
  ResourceSummary,
  AlertNotification,
  ActivityItem,
  SuggestedRecoveryAction,
  SimulationResult,
  DelaySimulationInput,
  MaterialDelivery,
  TaskComment,
  TaskThreatRanking,
} from '../types';
import { calculateCPM, simulateDelay, addDays, computeTaskThreatRankings } from '../utils/cpm';

interface ProjectContextType {
  project: Project;
  tasks: Task[];
  deliveries: MaterialDelivery[];
  comments: TaskComment[];
  contractors: Contractor[];
  resources: ResourceSummary[];
  alerts: AlertNotification[];
  activities: ActivityItem[];
  recoveryActions: SuggestedRecoveryAction[];
  criticalPath: Task[];
  taskThreatRankings: TaskThreatRanking[];
  activeView: string;
  setActiveView: (view: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedSiteFilter: string;
  setSelectedSiteFilter: (site: string) => void;
  selectedTradeFilter: string;
  setSelectedTradeFilter: (trade: string) => void;
  selectedContractorFilter: string;
  setSelectedContractorFilter: (contractor: string) => void;
  selectedStatusFilter: string;
  setSelectedStatusFilter: (status: string) => void;
  currentUser: { name: string; role: string; email: string };
  isLoggedIn: boolean;
  setIsLoggedIn: (status: boolean) => void;

  // Actions
  addTask: (task: Omit<Task, 'id'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  updateTaskActuals: (id: string, actualStart?: string, actualEnd?: string, progress?: number) => void;
  updateProject: (updates: Partial<Project>) => void;
  runDelaySimulation: (input: DelaySimulationInput) => SimulationResult;
  applySimulationToSchedule: (result: SimulationResult) => void;
  addDelivery: (delivery: Omit<MaterialDelivery, 'id'>) => void;
  updateDelivery: (id: string, updates: Partial<MaterialDelivery>) => void;
  simulateDeliveryDelay: (deliveryId: string, additionalDays: number) => void;
  addComment: (taskId: string, content: string, tag?: 'Update' | 'Blocker' | 'Resolution' | 'General') => void;
  addContractor: (contractor: Omit<Contractor, 'id' | 'assignedTasks'>) => void;
  dismissAlert: (id: string) => void;
  applyRecoveryAction: (id: string) => void;
  resetToDemoData: () => void;
  backendOnline: boolean;
  exportProjectJson: () => void;
}

const DEFAULT_PROJECT: Project = {
  id: 'proj-1',
  name: 'Skyline Commercial Complex',
  description: 'Construction of a commercial complex with offices, retail and parking.',
  startDate: '2025-10-01',
  targetFinishDate: '2025-10-30',
  projectedFinishDate: '2025-11-02',
  location: 'Mumbai',
  projectType: 'Commercial',
  overallProgress: 42,
  scheduleVarianceDays: 3,
  status: 'At Risk',
  budget: '$4.2M',
  floatAlertThreshold: 2, // warning when float <= 2 days
  imageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb18615f3?auto=format&fit=crop&w=1200&q=80',
};

const DEFAULT_TASKS: Task[] = [
  {
    id: 't0',
    name: 'Material Delivery',
    trade: 'Logistics',
    duration: 2,
    dependencies: [],
    contractor: 'ABC Construction',
    status: 'Completed',
    progress: 100,
    riskLevel: 'Low',
    delayImpactDays: 0,
    plannedStart: '2025-09-29',
    plannedEnd: '2025-10-01',
    actualStart: '2025-09-29',
    actualEnd: '2025-10-01',
    siteZone: 'Zone A - Logistics Yard',
  },
  {
    id: 't1',
    name: 'Foundation',
    trade: 'Civil',
    duration: 5,
    dependencies: ['t0'],
    contractor: 'ABC Construction',
    status: 'Delayed',
    progress: 60,
    riskLevel: 'High',
    delayImpactDays: 3,
    plannedStart: '2025-10-01',
    plannedEnd: '2025-10-05',
    actualStart: '2025-10-01',
    siteZone: 'Zone B - Substructure',
    assignedWorkers: 14,
    notes: 'Ground water seepage caused slow curing of footings.',
  },
  {
    id: 't2',
    name: 'Columns',
    trade: 'Structural',
    duration: 4,
    dependencies: ['t1'],
    contractor: 'XYZ Contractors',
    status: 'In Progress',
    progress: 40,
    riskLevel: 'High',
    delayImpactDays: 3,
    plannedStart: '2025-10-06',
    plannedEnd: '2025-10-10',
    actualStart: '2025-10-06',
    siteZone: 'Zone B - Level 1',
    assignedWorkers: 10,
  },
  {
    id: 't3',
    name: 'Walls',
    trade: 'Civil',
    duration: 7,
    dependencies: ['t2'],
    contractor: 'ABC Construction',
    status: 'Not Started',
    progress: 0,
    riskLevel: 'Medium',
    delayImpactDays: 3,
    plannedStart: '2025-10-11',
    plannedEnd: '2025-10-18',
    siteZone: 'Zone B - Core',
    assignedWorkers: 8,
  },
  {
    id: 't4',
    name: 'Electrical',
    trade: 'Electrical',
    duration: 6,
    dependencies: ['t3'],
    contractor: 'Electrical Co.',
    status: 'Not Started',
    progress: 0,
    riskLevel: 'Medium',
    delayImpactDays: 3,
    plannedStart: '2025-10-16',
    plannedEnd: '2025-10-22',
    siteZone: 'Zone C - MEP Conduits',
    assignedWorkers: 6,
  },
  {
    id: 't5',
    name: 'Plumbing',
    trade: 'Plumbing',
    duration: 7,
    dependencies: ['t3'],
    contractor: 'Plumbing Co.',
    status: 'Not Started',
    progress: 0,
    riskLevel: 'Low',
    delayImpactDays: 1,
    plannedStart: '2025-10-16',
    plannedEnd: '2025-10-23',
    siteZone: 'Zone C - Risers',
    assignedWorkers: 5,
  },
  {
    id: 't6',
    name: 'Finishing',
    trade: 'Finishing',
    duration: 5,
    dependencies: ['t4', 't5'],
    contractor: 'Finishing Ltd.',
    status: 'Not Started',
    progress: 0,
    riskLevel: 'Low',
    delayImpactDays: 1,
    plannedStart: '2025-10-20',
    plannedEnd: '2025-10-25',
    siteZone: 'Zone D - Interiors',
    assignedWorkers: 12,
  },
  {
    id: 't7',
    name: 'Handover',
    trade: 'General',
    duration: 2,
    dependencies: ['t6'],
    contractor: 'ABC Construction',
    status: 'Not Started',
    progress: 0,
    riskLevel: 'Low',
    delayImpactDays: 0,
    plannedStart: '2025-10-26',
    plannedEnd: '2025-10-28',
    siteZone: 'Whole Site',
    assignedWorkers: 4,
  },
];

const DEFAULT_DELIVERIES: MaterialDelivery[] = [
  {
    id: 'm1',
    materialName: 'Ready-Mix Grade 40 Concrete',
    supplier: 'UltraTech Concrete Ltd',
    quantity: '240 cu.m',
    expectedDate: '2025-10-01',
    revisedDate: '2025-10-03',
    linkedTaskId: 't1',
    linkedTaskName: 'Foundation',
    status: 'Delayed',
    delayDays: 2,
    contactPerson: 'Suresh Patil (+91 98201 11223)',
    notes: 'Transit mix truck breakdown and monsoon road waterlogging caused 2-day delivery slip.',
  },
  {
    id: 'm2',
    materialName: 'Structural Rebar Steel Fe-500D',
    supplier: 'Tata Steel Infra',
    quantity: '35 Metric Tons',
    expectedDate: '2025-10-05',
    revisedDate: '2025-10-05',
    linkedTaskId: 't2',
    linkedTaskName: 'Columns',
    status: 'On Time',
    delayDays: 0,
    contactPerson: 'Naveen Rao (+91 98202 33445)',
    notes: 'Consignment cleared warehouse dock.',
  },
  {
    id: 'm3',
    materialName: 'AAC Autoclaved Aerated Blocks',
    supplier: 'Siporex Building Solutions',
    quantity: '15,000 Units',
    expectedDate: '2025-10-09',
    revisedDate: '2025-10-09',
    linkedTaskId: 't3',
    linkedTaskName: 'Walls',
    status: 'In Transit',
    delayDays: 0,
    contactPerson: 'Vikram Joshi (+91 98203 55667)',
  },
  {
    id: 'm4',
    materialName: 'Fire-Retardant PVC Conduits & Wire Bundles',
    supplier: 'Polycab Wires Ltd',
    quantity: '850 meters',
    expectedDate: '2025-10-14',
    revisedDate: '2025-10-14',
    linkedTaskId: 't4',
    linkedTaskName: 'Electrical',
    status: 'On Time',
    delayDays: 0,
    contactPerson: 'Amit Shah (+91 98204 77889)',
  },
  {
    id: 'm5',
    materialName: 'CPVC Pressure Piping & Fittings',
    supplier: 'Astral Pipes India',
    quantity: '400 meters',
    expectedDate: '2025-10-15',
    revisedDate: '2025-10-15',
    linkedTaskId: 't5',
    linkedTaskName: 'Plumbing',
    status: 'On Time',
    delayDays: 0,
    contactPerson: 'Ramesh Nair (+91 98205 99001)',
  },
];

const DEFAULT_COMMENTS: TaskComment[] = [
  {
    id: 'comm1',
    taskId: 't1',
    taskName: 'Foundation',
    author: 'Rohit Kumar',
    role: 'ABC Construction Lead',
    content: 'Subsoil water seepage at Grid C-4 delayed footing pour. Deploying two 5HP dewatering pumps today.',
    timeAgo: '2h ago',
    timestamp: '2025-10-05T08:15:00Z',
    tag: 'Blocker',
  },
  {
    id: 'comm2',
    taskId: 't0',
    taskName: 'Material Delivery',
    author: 'Suresh Patil',
    role: 'UltraTech Logistics Mgr',
    content: 'Second convoy of 8 transit mixers dispatched with accelerator admixtures.',
    timeAgo: '3h ago',
    timestamp: '2025-10-05T07:10:00Z',
    tag: 'Update',
  },
  {
    id: 'comm3',
    taskId: 't2',
    taskName: 'Columns',
    author: 'Arjun Verma',
    role: 'XYZ Contractors Site Engg',
    content: 'Pre-tied rebar cages for Ground Floor ready on staging platform. Ready to hoist once footings cure.',
    timeAgo: '4h ago',
    timestamp: '2025-10-05T06:30:00Z',
    tag: 'Update',
  },
  {
    id: 'comm4',
    taskId: 't1',
    taskName: 'Foundation',
    author: 'Zainab S.',
    role: 'Project Manager',
    content: 'Approved expediting rapid-hardening cement to compress curing from 5 days to 4 days.',
    timeAgo: '5h ago',
    timestamp: '2025-10-05T05:20:00Z',
    tag: 'Resolution',
  },
];

const DEFAULT_CONTRACTORS: Contractor[] = [
  {
    id: 'c1',
    name: 'ABC Construction',
    trade: 'Civil',
    email: 'abc@construction.com',
    phone: '+91 98200 12345',
    status: 'Active',
    assignedTasks: 3,
  },
  {
    id: 'c2',
    name: 'XYZ Contractors',
    trade: 'Structural',
    email: 'xyz@contractors.com',
    phone: '+91 98200 67890',
    status: 'Active',
    assignedTasks: 1,
  },
  {
    id: 'c3',
    name: 'Electrical Co.',
    trade: 'Electrical',
    email: 'elec@electric.com',
    phone: '+91 98200 11223',
    status: 'Active',
    assignedTasks: 1,
  },
  {
    id: 'c4',
    name: 'Plumbing Co.',
    trade: 'Plumbing',
    email: 'plumbing@pipe.com',
    phone: '+91 98200 44556',
    status: 'Active',
    assignedTasks: 1,
  },
  {
    id: 'c5',
    name: 'Finishing Ltd.',
    trade: 'Finishing',
    email: 'finishing@ltd.com',
    phone: '+91 98200 77889',
    status: 'Active',
    assignedTasks: 1,
  },
];

const DEFAULT_RESOURCES: ResourceSummary[] = [
  { type: 'Workers', quantity: 12, details: '8 skilled, 4 helpers' },
  { type: 'Equipment', quantity: 3, details: 'Excavator, Crane, Mixer' },
  { type: 'Material', quantity: 4, details: 'Concrete, Steel, Bricks' },
];

const DEFAULT_ALERTS: AlertNotification[] = [
  {
    id: 'a1',
    title: 'Foundation is 3 days behind schedule',
    severity: 'Critical',
    timeAgo: '2h ago',
    taskId: 't1',
    category: 'Schedule',
    timestamp: '2025-10-05T08:00:00Z',
  },
  {
    id: 'a2',
    title: 'Ready-Mix Concrete delivery delayed by 2 days',
    severity: 'Critical',
    timeAgo: '3h ago',
    taskId: 't0',
    category: 'Material',
    timestamp: '2025-10-05T07:00:00Z',
  },
  {
    id: 'a3',
    title: 'Electrical has only 1 day of float left (Float Alert)',
    severity: 'Warning',
    timeAgo: '4h ago',
    taskId: 't4',
    category: 'Float',
    timestamp: '2025-10-05T06:00:00Z',
  },
  {
    id: 'a4',
    title: 'Project completion at risk (+3 days)',
    severity: 'Critical',
    timeAgo: '4m ago',
    category: 'Schedule',
    timestamp: '2025-10-05T09:55:00Z',
  },
  {
    id: 'a5',
    title: 'Low float for Plumbing (1 day remaining)',
    severity: 'Warning',
    timeAgo: '5h ago',
    taskId: 't5',
    category: 'Float',
    timestamp: '2025-10-05T05:00:00Z',
  },
  {
    id: 'a6',
    title: 'Contractor update posted on Foundation by Rohit Kumar',
    severity: 'Info',
    timeAgo: '6h ago',
    taskId: 't1',
    category: 'Contractor',
    timestamp: '2025-10-05T04:00:00Z',
  },
];

const DEFAULT_ACTIVITIES: ActivityItem[] = [
  {
    id: 'act1',
    user: 'Rohit Kumar (ABC)',
    action: 'posted field comment on Foundation: Dewatering pumps deployed',
    timeAgo: '2h ago',
    type: 'comment',
  },
  {
    id: 'act2',
    user: 'Supply Chain Dispatch',
    action: 'Flagged 2-day delivery slip on Ready-Mix Concrete',
    timeAgo: '3h ago',
    type: 'delivery',
  },
  {
    id: 'act3',
    user: 'XYZ Contractors',
    action: 'Progress updated for Columns (40% complete)',
    timeAgo: '4h ago',
    type: 'progress',
  },
  {
    id: 'act4',
    user: 'AI Schedule Monitor',
    action: 'Recalculated Critical Path: project completion shifted by +3 days',
    timeAgo: '5h ago',
    type: 'system',
  },
];

const DEFAULT_RECOVERY_ACTIONS: SuggestedRecoveryAction[] = [
  {
    id: 'rec1',
    title: 'Add 3 workers to Foundation (Crashing)',
    description: 'Deploys 2 skilled masons and 1 helper from reserve civil pool to accelerate concrete pouring.',
    category: 'Labor',
    impactBadge: '+1.5 days recovered',
    recoveryDays: 1,
  },
  {
    id: 'rec2',
    title: 'Expedite concrete delivery via rapid batching',
    description: 'Switch to ready-mix rapid-hardening cement supplier with priority transit.',
    category: 'Logistics',
    impactBadge: '+1.0 day recovered',
    recoveryDays: 1,
  },
  {
    id: 'rec3',
    title: 'Fast-track non-dependent tasks (Reordering)',
    description: 'Pre-fabricate electrical conduit frames while masonry walls are curing.',
    category: 'Scheduling',
    impactBadge: '+1.0 day recovered',
    recoveryDays: 1,
  },
];

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [project, setProject] = useState<Project>(() => {
    const saved = localStorage.getItem('buildtrack_project');
    return saved ? JSON.parse(saved) : DEFAULT_PROJECT;
  });

  const [rawTasks, setRawTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('buildtrack_tasks');
    return saved ? JSON.parse(saved) : DEFAULT_TASKS;
  });

  const [deliveries, setDeliveries] = useState<MaterialDelivery[]>(() => {
    const saved = localStorage.getItem('buildtrack_deliveries');
    return saved ? JSON.parse(saved) : DEFAULT_DELIVERIES;
  });

  const [comments, setComments] = useState<TaskComment[]>(() => {
    const saved = localStorage.getItem('buildtrack_comments');
    return saved ? JSON.parse(saved) : DEFAULT_COMMENTS;
  });

  const [contractors, setContractors] = useState<Contractor[]>(() => {
    const saved = localStorage.getItem('buildtrack_contractors');
    return saved ? JSON.parse(saved) : DEFAULT_CONTRACTORS;
  });

  const [resources] = useState<ResourceSummary[]>(DEFAULT_RESOURCES);
  const [alerts, setAlerts] = useState<AlertNotification[]>(DEFAULT_ALERTS);
  const [activities, setActivities] = useState<ActivityItem[]>(DEFAULT_ACTIVITIES);
  const [recoveryActions, setRecoveryActions] = useState<SuggestedRecoveryAction[]>(DEFAULT_RECOVERY_ACTIONS);

  const [activeView, setActiveView] = useState<string>('dashboard');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSiteFilter, setSelectedSiteFilter] = useState<string>('All Sites');
  const [selectedTradeFilter, setSelectedTradeFilter] = useState<string>('All Trades');
  const [selectedContractorFilter, setSelectedContractorFilter] = useState<string>('All Contractors');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('All Status');

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);
  const [backendOnline, setBackendOnline] = useState<boolean>(false);

  const storedRole = localStorage.getItem('buildtrack_user_role') || 'Project Manager';
  const currentUser = {
    name: storedRole === 'Site Contractor' ? 'Rohit Kumar' : 'Zainab S.',
    role: storedRole,
    email: storedRole === 'Site Contractor' ? 'rohit.k@buildtrack.com' : 'zainab.s@buildtrack.com',
  };

  // Run CPM on rawTasks whenever they change
  const { tasks, criticalPath } = useMemo(() => {
    const cpm = calculateCPM(rawTasks);
    const criticalTasks = cpm.tasks.filter((t) => t.isCritical);
    return { tasks: cpm.tasks, criticalPath: criticalTasks };
  }, [rawTasks]);

  // Compute Task Threat Rankings
  const taskThreatRankings = useMemo(() => {
    return computeTaskThreatRankings(rawTasks);
  }, [rawTasks]);

  // Persist to local storage
  useEffect(() => {
    localStorage.setItem('buildtrack_project', JSON.stringify(project));
  }, [project]);

  useEffect(() => {
    localStorage.setItem('buildtrack_tasks', JSON.stringify(rawTasks));
  }, [rawTasks]);

  useEffect(() => {
    localStorage.setItem('buildtrack_deliveries', JSON.stringify(deliveries));
  }, [deliveries]);

  useEffect(() => {
    localStorage.setItem('buildtrack_comments', JSON.stringify(comments));
  }, [comments]);

  useEffect(() => {
    localStorage.setItem('buildtrack_contractors', JSON.stringify(contractors));
  }, [contractors]);

  // Backend Health Check
  useEffect(() => {
    let isMounted = true;
    const checkBackend = async () => {
      try {
        const res = await fetch('/api/health');
        if (res.ok && isMounted) {
          setBackendOnline(true);
        }
      } catch {
        if (isMounted) setBackendOnline(false);
      }
    };
    checkBackend();
    const interval = setInterval(checkBackend, 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const addTask = (taskInput: Omit<Task, 'id'>) => {
    const newId = 't' + (rawTasks.length + 1) + '_' + Math.random().toString(36).substr(2, 4);
    const newTask: Task = {
      ...taskInput,
      id: newId,
      delayImpactDays: 0,
      riskLevel: taskInput.riskLevel || 'Low',
    };
    setRawTasks((prev) => [...prev, newTask]);
    setActivities((prev) => [
      {
        id: 'act_' + Date.now(),
        user: currentUser.name,
        action: `Created new task "${newTask.name}"`,
        timeAgo: 'Just now',
        type: 'progress',
      },
      ...prev,
    ]);
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setRawTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
  };

  const deleteTask = (id: string) => {
    setRawTasks((prev) => {
      return prev
        .filter((t) => t.id !== id)
        .map((t) => ({
          ...t,
          dependencies: t.dependencies.filter((d) => d !== id),
        }));
    });
  };

  // Requirement 3: Progress updates logging actual start, actual finish, and completion percentage
  const updateTaskActuals = (
    id: string,
    actualStart?: string,
    actualEnd?: string,
    progress?: number
  ) => {
    setRawTasks((prev) => {
      return prev.map((t) => {
        if (t.id === id) {
          const updatedProgress = progress !== undefined ? progress : t.progress;
          let newStatus = t.status;
          if (updatedProgress === 100) newStatus = 'Completed';
          else if (updatedProgress > 0) newStatus = 'In Progress';

          return {
            ...t,
            actualStart: actualStart || t.actualStart,
            actualEnd: actualEnd || t.actualEnd,
            progress: updatedProgress,
            status: newStatus,
          };
        }
        return t;
      });
    });

    // Recompute weighted project progress
    const updatedTasks = rawTasks.map((t) =>
      t.id === id ? { ...t, progress: progress ?? t.progress } : t
    );
    const avgProg = Math.round(
      updatedTasks.reduce((acc, curr) => acc + curr.progress, 0) / updatedTasks.length
    );

    const taskObj = rawTasks.find((t) => t.id === id);
    const taskName = taskObj?.name || 'Task';

    updateProject({ overallProgress: avgProg });

    setActivities((prev) => [
      {
        id: 'act_' + Date.now(),
        user: currentUser.name,
        action: `Logged site progress for ${taskName}: ${progress}% complete`,
        timeAgo: 'Just now',
        type: 'progress',
      },
      ...prev,
    ]);
  };

  const updateProject = (updates: Partial<Project>) => {
    setProject((prev) => ({ ...prev, ...updates }));
  };

  const runDelaySimulation = (input: DelaySimulationInput): SimulationResult => {
    return simulateDelay(
      rawTasks,
      input.taskId,
      input.delayDays,
      input.reason,
      project.startDate,
      project.targetFinishDate
    );
  };

  const applySimulationToSchedule = (result: SimulationResult) => {
    setRawTasks((prev) =>
      prev.map((t) => {
        if (t.id === result.taskId) {
          return {
            ...t,
            duration: t.duration + result.delayDays,
            delayImpactDays: (t.delayImpactDays || 0) + result.delayDays,
            status: 'Delayed',
            riskLevel: 'High',
            notes: `${t.notes ? t.notes + ' | ' : ''}Delayed by ${result.delayDays}d due to ${result.reason}`,
          };
        }
        return t;
      })
    );

    const newVariance = project.scheduleVarianceDays + result.netProjectDelayDays;
    setProject((prev) => ({
      ...prev,
      projectedFinishDate: result.newProjectFinish,
      scheduleVarianceDays: newVariance,
      status: newVariance > 0 ? 'Delayed' : 'On Track',
    }));

    // Trigger Critical Path Shift alert if critical path changed
    if (result.criticalPathShift.isShifted) {
      setAlerts((prev) => [
        {
          id: 'a_shift_' + Date.now(),
          title: `Dynamic Critical Path Shift: ${result.criticalPathShift.newlyCriticalTasks.join(', ')} is now on the Critical Path!`,
          severity: 'Critical',
          timeAgo: 'Just now',
          category: 'Schedule',
          timestamp: new Date().toISOString(),
        },
        ...prev,
      ]);
    }

    setAlerts((prev) => [
      {
        id: 'a_' + Date.now(),
        title: `Schedule Recalculated: ${result.taskName} delayed by ${result.delayDays}d (${result.reason})`,
        severity: 'Critical',
        timeAgo: 'Just now',
        taskId: result.taskId,
        category: 'Schedule',
        timestamp: new Date().toISOString(),
      },
      ...prev,
    ]);

    setActivities((prev) => [
      {
        id: 'act_' + Date.now(),
        user: currentUser.name,
        action: `Simulated delay of +${result.delayDays} days on ${result.taskName} applied to live schedule`,
        timeAgo: 'Just now',
        type: 'delay',
      },
      ...prev,
    ]);
  };

  // Requirement 1 & 5: Material Deliveries
  const addDelivery = (deliveryInput: Omit<MaterialDelivery, 'id'>) => {
    const newId = 'm_' + Date.now();
    const newDelivery: MaterialDelivery = { ...deliveryInput, id: newId };
    setDeliveries((prev) => [newDelivery, ...prev]);

    setActivities((prev) => [
      {
        id: 'act_' + Date.now(),
        user: currentUser.name,
        action: `Registered material delivery for "${newDelivery.materialName}"`,
        timeAgo: 'Just now',
        type: 'delivery',
      },
      ...prev,
    ]);
  };

  const updateDelivery = (id: string, updates: Partial<MaterialDelivery>) => {
    setDeliveries((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...updates } : d))
    );
  };

  const simulateDeliveryDelay = (deliveryId: string, additionalDays: number) => {
    const delivery = deliveries.find((d) => d.id === deliveryId);
    if (!delivery) return;

    const newRevDate = addDays(delivery.revisedDate || delivery.expectedDate, additionalDays);
    const newDelay = delivery.delayDays + additionalDays;

    updateDelivery(deliveryId, {
      revisedDate: newRevDate,
      delayDays: newDelay,
      status: 'Delayed',
    });

    // Automatically trigger task simulation on linked task
    if (delivery.linkedTaskId) {
      const sim = simulateDelay(
        rawTasks,
        delivery.linkedTaskId,
        additionalDays,
        `Material Delivery Delay (${delivery.materialName})`,
        project.startDate,
        project.targetFinishDate
      );
      applySimulationToSchedule(sim);
    }

    setAlerts((prev) => [
      {
        id: 'a_del_' + Date.now(),
        title: `Late Material Delivery Alert: ${delivery.materialName} delayed by ${additionalDays} days (${delivery.supplier})`,
        severity: 'Critical',
        timeAgo: 'Just now',
        category: 'Material',
        timestamp: new Date().toISOString(),
      },
      ...prev,
    ]);
  };

  // Requirement 5: Contractor collaboration comments thread
  const addComment = (
    taskId: string,
    content: string,
    tag: 'Update' | 'Blocker' | 'Resolution' | 'General' = 'Update'
  ) => {
    const targetTask = rawTasks.find((t) => t.id === taskId);
    const newComment: TaskComment = {
      id: 'comm_' + Date.now(),
      taskId,
      taskName: targetTask?.name || 'Task',
      author: currentUser.name,
      role: currentUser.role,
      content,
      timeAgo: 'Just now',
      timestamp: new Date().toISOString(),
      tag,
    };

    setComments((prev) => [newComment, ...prev]);

    setActivities((prev) => [
      {
        id: 'act_' + Date.now(),
        user: currentUser.name,
        action: `posted comment on ${targetTask?.name || 'Task'}: "${content.slice(0, 40)}..."`,
        timeAgo: 'Just now',
        type: 'comment',
      },
      ...prev,
    ]);
  };

  const addContractor = (contractorInput: Omit<Contractor, 'id' | 'assignedTasks'>) => {
    const newId = 'c' + (contractors.length + 1);
    setContractors((prev) => [
      ...prev,
      {
        ...contractorInput,
        id: newId,
        assignedTasks: 0,
      },
    ]);
  };

  const dismissAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const applyRecoveryAction = (id: string) => {
    const action = recoveryActions.find((a) => a.id === id);
    if (!action) return;

    setRecoveryActions((prev) =>
      prev.map((a) => (a.id === id ? { ...a, applied: true } : a))
    );

    const recoveryAmount = action.recoveryDays || 1;
    setProject((prev) => {
      const newVar = Math.max(0, prev.scheduleVarianceDays - recoveryAmount);
      return {
        ...prev,
        scheduleVarianceDays: newVar,
        projectedFinishDate: addDays(prev.projectedFinishDate, -recoveryAmount),
        status: newVar === 0 ? 'On Track' : 'At Risk',
      };
    });

    setActivities((prev) => [
      {
        id: 'act_' + Date.now(),
        user: currentUser.name,
        action: `Applied recovery action: ${action.title} (Recovered ${recoveryAmount} days)`,
        timeAgo: 'Just now',
        type: 'progress',
      },
      ...prev,
    ]);
  };

  const resetToDemoData = () => {
    setProject(DEFAULT_PROJECT);
    setRawTasks(DEFAULT_TASKS);
    setDeliveries(DEFAULT_DELIVERIES);
    setComments(DEFAULT_COMMENTS);
    setContractors(DEFAULT_CONTRACTORS);
    setAlerts(DEFAULT_ALERTS);
    setActivities(DEFAULT_ACTIVITIES);
    setRecoveryActions(DEFAULT_RECOVERY_ACTIONS);
    localStorage.removeItem('buildtrack_project');
    localStorage.removeItem('buildtrack_tasks');
    localStorage.removeItem('buildtrack_deliveries');
    localStorage.removeItem('buildtrack_comments');
    localStorage.removeItem('buildtrack_contractors');
  };

  const exportProjectJson = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(
        JSON.stringify(
          {
            project,
            tasks,
            criticalPath,
            threatRankings: taskThreatRankings,
            deliveries,
            comments,
            contractors,
            alerts,
          },
          null,
          2
        )
      );
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `${project.name.replace(/\s+/g, '_')}_Risk_Report.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <ProjectContext.Provider
      value={{
        project,
        tasks,
        deliveries,
        comments,
        contractors,
        resources,
        alerts,
        activities,
        recoveryActions,
        criticalPath,
        taskThreatRankings,
        activeView,
        setActiveView,
        searchQuery,
        setSearchQuery,
        selectedSiteFilter,
        setSelectedSiteFilter,
        selectedTradeFilter,
        setSelectedTradeFilter,
        selectedContractorFilter,
        setSelectedContractorFilter,
        selectedStatusFilter,
        setSelectedStatusFilter,
        currentUser,
        isLoggedIn,
        setIsLoggedIn,
        addTask,
        updateTask,
        deleteTask,
        updateTaskActuals,
        updateProject,
        runDelaySimulation,
        applySimulationToSchedule,
        addDelivery,
        updateDelivery,
        simulateDeliveryDelay,
        addComment,
        addContractor,
        dismissAlert,
        applyRecoveryAction,
        resetToDemoData,
        backendOnline,
        exportProjectJson,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = (): ProjectContextType => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};
