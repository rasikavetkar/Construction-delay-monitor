export type TaskStatus = 'Not Started' | 'In Progress' | 'Completed' | 'Delayed' | 'At Risk' | 'Blocked';
export type RiskLevel = 'High' | 'Medium' | 'Low';
export type AlertSeverity = 'Critical' | 'Warning' | 'Info';
export type DeliveryStatus = 'On Time' | 'Delayed' | 'Delivered' | 'In Transit';

export interface Task {
  id: string;
  name: string;
  trade: string;
  duration: number; // in days
  dependencies: string[]; // task IDs
  contractor: string;
  contractorId?: string;
  status: TaskStatus;
  progress: number; // 0 - 100
  riskLevel: RiskLevel;
  delayImpactDays: number;
  plannedStart: string; // YYYY-MM-DD
  plannedEnd: string;
  actualStart?: string;
  actualEnd?: string;
  // CPM calculated fields
  earlyStart?: number;
  earlyFinish?: number;
  lateStart?: number;
  lateFinish?: number;
  totalFloat?: number;
  freeFloat?: number;
  isCritical?: boolean;
  notes?: string;
  siteZone?: string;
  assignedWorkers?: number;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  startDate: string;
  targetFinishDate: string;
  projectedFinishDate: string;
  location: string;
  projectType: string;
  overallProgress: number; // percentage
  scheduleVarianceDays: number;
  status: 'On Track' | 'At Risk' | 'Delayed';
  budget?: string;
  imageUrl?: string;
  floatAlertThreshold?: number; // threshold in days to trigger warning
}

export interface MaterialDelivery {
  id: string;
  materialName: string;
  supplier: string;
  quantity: string;
  expectedDate: string;
  revisedDate?: string;
  linkedTaskId: string;
  linkedTaskName: string;
  status: DeliveryStatus;
  delayDays: number;
  contactPerson?: string;
  notes?: string;
}

export interface TaskComment {
  id: string;
  taskId: string;
  taskName: string;
  author: string;
  role: string;
  content: string;
  timeAgo: string;
  timestamp: string;
  tag: 'Update' | 'Blocker' | 'Resolution' | 'General';
}

export interface Contractor {
  id: string;
  name: string;
  trade: string;
  email: string;
  phone: string;
  status: 'Active' | 'On Leave' | 'Pending';
  assignedTasks: number;
}

export interface ResourceSummary {
  type: 'Workers' | 'Equipment' | 'Material';
  quantity: number;
  details: string;
}

export interface AlertNotification {
  id: string;
  title: string;
  severity: AlertSeverity;
  timeAgo: string;
  taskId?: string;
  category?: 'Schedule' | 'Material' | 'Float' | 'Contractor';
  timestamp: string;
}

export interface ActivityItem {
  id: string;
  user: string;
  action: string;
  timeAgo: string;
  type?: 'comment' | 'delay' | 'progress' | 'system' | 'delivery';
}

export interface SuggestedRecoveryAction {
  id: string;
  title: string;
  description: string;
  category: 'Labor' | 'Logistics' | 'Scheduling';
  impactBadge: string;
  applied?: boolean;
  recoveryDays: number;
}

export interface DelaySimulationInput {
  taskId: string;
  delayDays: number;
  reason: string;
}

export interface AffectedTaskResult {
  taskId: string;
  taskName: string;
  delayDays: number;
  isCritical: boolean;
  originalEnd: string;
  simulatedEnd: string;
}

export interface TaskThreatRanking {
  taskId: string;
  taskName: string;
  trade: string;
  contractor: string;
  totalFloat: number;
  threatScore: number; // 0 - 100
  threatLevel: 'Critical' | 'High' | 'Medium' | 'Low';
  downstreamCount: number;
  delayMultiplier: number; // how much 1 day of slip causes project slip
}

export interface CriticalPathShift {
  isShifted: boolean;
  previousCriticalIds: string[];
  newCriticalIds: string[];
  newlyCriticalTasks: string[];
}

export interface SimulationResult {
  taskId: string;
  taskName: string;
  delayDays: number;
  reason: string;
  originalProjectFinish: string;
  newProjectFinish: string;
  netProjectDelayDays: number;
  affectedTasks: AffectedTaskResult[];
  criticalPathShift: CriticalPathShift;
  threatRankings: TaskThreatRanking[];
}
