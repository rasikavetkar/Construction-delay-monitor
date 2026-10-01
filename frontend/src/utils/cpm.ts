import {
  Task,
  SimulationResult,
  AffectedTaskResult,
  TaskThreatRanking,
  CriticalPathShift,
} from '../types';

/**
 * Calculates Critical Path Method (CPM) values:
 * Early Start (ES), Early Finish (EF), Late Start (LS), Late Finish (LF),
 * Total Float (TF), Free Float (FF), and Critical Path identification.
 */
export function calculateCPM(tasks: Task[]): {
  tasks: Task[];
  projectDuration: number;
  criticalPathIds: string[];
} {
  if (!tasks || tasks.length === 0) {
    return { tasks: [], projectDuration: 0, criticalPathIds: [] };
  }

  const taskMap = new Map<string, Task>();
  tasks.forEach((t) => taskMap.set(t.id, { ...t }));

  // Build adjacency list: parents -> children (successors)
  const successors = new Map<string, string[]>();
  tasks.forEach((t) => successors.set(t.id, []));
  tasks.forEach((t) => {
    t.dependencies.forEach((parentId) => {
      if (successors.has(parentId)) {
        successors.get(parentId)!.push(t.id);
      }
    });
  });

  // 1. FORWARD PASS (Early Start, Early Finish)
  const inDegree = new Map<string, number>();
  tasks.forEach((t) => inDegree.set(t.id, t.dependencies.length));

  const queue: string[] = [];
  tasks.forEach((t) => {
    if (t.dependencies.length === 0) {
      queue.push(t.id);
      const node = taskMap.get(t.id)!;
      node.earlyStart = 0;
      node.earlyFinish = node.duration;
    }
  });

  const topoOrder: string[] = [];

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    topoOrder.push(currentId);
    const currentTask = taskMap.get(currentId)!;

    const succs = successors.get(currentId) || [];
    succs.forEach((childId) => {
      const child = taskMap.get(childId);
      if (child) {
        const candidateES = currentTask.earlyFinish || 0;
        child.earlyStart = Math.max(child.earlyStart ?? 0, candidateES);
        child.earlyFinish = (child.earlyStart ?? 0) + child.duration;

        const updatedInDegree = (inDegree.get(childId) || 1) - 1;
        inDegree.set(childId, updatedInDegree);
        if (updatedInDegree === 0) {
          queue.push(childId);
        }
      }
    });
  }

  // Handle any disconnected nodes or circular fallback
  tasks.forEach((t) => {
    const node = taskMap.get(t.id)!;
    if (node.earlyStart === undefined) {
      node.earlyStart = 0;
      node.earlyFinish = node.duration;
      if (!topoOrder.includes(t.id)) topoOrder.push(t.id);
    }
  });

  // Project duration is maximum earlyFinish
  const projectDuration = Math.max(
    ...Array.from(taskMap.values()).map((t) => t.earlyFinish ?? 0),
    0
  );

  // 2. BACKWARD PASS (Late Start, Late Finish)
  const revTopo = [...topoOrder].reverse();

  revTopo.forEach((id) => {
    const task = taskMap.get(id)!;
    const succs = successors.get(id) || [];

    if (succs.length === 0) {
      task.lateFinish = projectDuration;
    } else {
      let minChildLS = Infinity;
      succs.forEach((childId) => {
        const child = taskMap.get(childId);
        if (child && child.lateStart !== undefined) {
          minChildLS = Math.min(minChildLS, child.lateStart);
        }
      });
      task.lateFinish = minChildLS === Infinity ? projectDuration : minChildLS;
    }

    task.lateStart = task.lateFinish - task.duration;
    task.totalFloat = Math.max(0, task.lateStart - (task.earlyStart ?? 0));
    task.isCritical = task.totalFloat === 0;

    // Calculate Free Float (slack before affecting the very next task)
    if (succs.length === 0) {
      task.freeFloat = task.totalFloat;
    } else {
      let minChildES = Infinity;
      succs.forEach((childId) => {
        const child = taskMap.get(childId);
        if (child && child.earlyStart !== undefined) {
          minChildES = Math.min(minChildES, child.earlyStart);
        }
      });
      task.freeFloat = Math.max(0, (minChildES === Infinity ? projectDuration : minChildES) - (task.earlyFinish ?? 0));
    }
  });

  const calculatedTasks = Array.from(taskMap.values());
  const criticalPathIds = calculatedTasks
    .filter((t) => t.isCritical)
    .sort((a, b) => (a.earlyStart ?? 0) - (b.earlyStart ?? 0))
    .map((t) => t.id);

  return {
    tasks: calculatedTasks,
    projectDuration,
    criticalPathIds,
  };
}

/**
 * Counts all transitive downstream tasks reachable from a given task
 */
export function getTransitiveDownstreamCount(taskId: string, tasks: Task[]): number {
  const successorsMap = new Map<string, string[]>();
  tasks.forEach((t) => successorsMap.set(t.id, []));
  tasks.forEach((t) => {
    t.dependencies.forEach((p) => {
      if (successorsMap.has(p)) successorsMap.get(p)!.push(t.id);
    });
  });

  const visited = new Set<string>();
  const queue = [taskId];

  while (queue.length > 0) {
    const curr = queue.shift()!;
    const children = successorsMap.get(curr) || [];
    children.forEach((c) => {
      if (!visited.has(c)) {
        visited.add(c);
        queue.push(c);
      }
    });
  }

  return visited.size;
}

/**
 * Computes Deadline Threat Rankings for all tasks (Core Requirement 2)
 * Tests how strongly each task's slip threatens the final deadline.
 */
export function computeTaskThreatRankings(tasks: Task[]): TaskThreatRanking[] {
  const baseCPM = calculateCPM(tasks);
  const baseDuration = baseCPM.projectDuration;

  const rankings: TaskThreatRanking[] = baseCPM.tasks.map((task) => {
    const floatDays = task.totalFloat ?? 0;
    const downstream = getTransitiveDownstreamCount(task.id, tasks);

    // Test a hypothetical 3-day slip on this task
    const testDelay = 3;
    const testTasks = tasks.map((t) =>
      t.id === task.id ? { ...t, duration: t.duration + testDelay } : { ...t }
    );
    const testCPM = calculateCPM(testTasks);
    const projectSlip = Math.max(0, testCPM.projectDuration - baseDuration);

    // Threat score: 0 to 100 based on float, critical status, downstream cascade, and project slip
    let threatScore = 0;
    if (task.isCritical) {
      threatScore = Math.min(100, 85 + downstream * 2.5);
    } else if (floatDays <= 1) {
      threatScore = Math.min(84, 70 + downstream * 2);
    } else if (floatDays <= 3) {
      threatScore = Math.min(65, 45 + downstream * 2);
    } else {
      threatScore = Math.max(10, Math.min(40, 30 - floatDays * 2 + downstream));
    }

    let threatLevel: 'Critical' | 'High' | 'Medium' | 'Low' = 'Low';
    if (threatScore >= 80) threatLevel = 'Critical';
    else if (threatScore >= 60) threatLevel = 'High';
    else if (threatScore >= 40) threatLevel = 'Medium';

    return {
      taskId: task.id,
      taskName: task.name,
      trade: task.trade,
      contractor: task.contractor,
      totalFloat: floatDays,
      threatScore: Math.round(threatScore),
      threatLevel,
      downstreamCount: downstream,
      delayMultiplier: projectSlip / testDelay,
    };
  });

  // Rank in descending order of threat score
  rankings.sort((a, b) => b.threatScore - a.threatScore);
  return rankings;
}

/**
 * Add days to a YYYY-MM-DD string
 */
export function addDays(dateStr: string, days: number): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  } catch {
    return dateStr;
  }
}

/**
 * Format date nicely e.g. "02 Nov 2025"
 */
export function formatDisplayDate(dateStr: string | undefined): string {
  if (!dateStr) return '--';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, '0');
    const month = d.toLocaleString('en-US', { month: 'short' });
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  } catch {
    return dateStr;
  }
}

/**
 * Runs What-If delay simulation with Dynamic Critical Path Shift Detection (Core Requirement 2)
 */
export function simulateDelay(
  tasks: Task[],
  taskId: string,
  delayDays: number,
  reason: string,
  projectStartDate: string,
  targetFinishDate: string
): SimulationResult {
  const targetTask = tasks.find((t) => t.id === taskId);
  if (!targetTask) {
    return {
      taskId,
      taskName: 'Unknown',
      delayDays,
      reason,
      originalProjectFinish: targetFinishDate,
      newProjectFinish: targetFinishDate,
      netProjectDelayDays: 0,
      affectedTasks: [],
      criticalPathShift: { isShifted: false, previousCriticalIds: [], newCriticalIds: [], newlyCriticalTasks: [] },
      threatRankings: [],
    };
  }

  // Base CPM calculation
  const baseCPM = calculateCPM(tasks);
  const baseTaskMap = new Map(baseCPM.tasks.map((t) => [t.id, t]));
  const prevCriticalIds = baseCPM.criticalPathIds;

  // Simulated tasks with added duration to target task
  const simulatedTasks = tasks.map((t) => {
    if (t.id === taskId) {
      return { ...t, duration: t.duration + delayDays };
    }
    return { ...t };
  });

  const simCPM = calculateCPM(simulatedTasks);
  const simTaskMap = new Map(simCPM.tasks.map((t) => [t.id, t]));
  const newCriticalIds = simCPM.criticalPathIds;

  const netProjectDelay = Math.max(0, simCPM.projectDuration - baseCPM.projectDuration);
  const originalProjectFinish = addDays(projectStartDate, baseCPM.projectDuration);
  const newProjectFinish = addDays(projectStartDate, simCPM.projectDuration);

  // Dynamic Critical Path Shift Detection:
  // Are there tasks in newCriticalIds that were NOT in prevCriticalIds?
  const newlyCriticalTasks: string[] = [];
  newCriticalIds.forEach((id) => {
    if (!prevCriticalIds.includes(id)) {
      const taskObj = tasks.find((t) => t.id === id);
      if (taskObj) newlyCriticalTasks.push(taskObj.name);
    }
  });

  const isShifted = newlyCriticalTasks.length > 0;

  // Identify affected tasks (those whose early finish shifted)
  const affectedTasks: AffectedTaskResult[] = [];
  simCPM.tasks.forEach((simT) => {
    const baseT = baseTaskMap.get(simT.id);
    if (!baseT) return;

    const baseEF = baseT.earlyFinish ?? 0;
    const simEF = simT.earlyFinish ?? 0;
    const diff = simEF - baseEF;

    if (diff > 0) {
      affectedTasks.push({
        taskId: simT.id,
        taskName: simT.name,
        delayDays: diff,
        isCritical: !!simT.isCritical,
        originalEnd: addDays(projectStartDate, baseEF),
        simulatedEnd: addDays(projectStartDate, simEF),
      });
    }
  });

  // Calculate updated threat rankings under the new scenario
  const threatRankings = computeTaskThreatRankings(simulatedTasks);

  return {
    taskId,
    taskName: targetTask.name,
    delayDays,
    reason,
    originalProjectFinish,
    newProjectFinish,
    netProjectDelayDays: netProjectDelay,
    affectedTasks,
    criticalPathShift: {
      isShifted,
      previousCriticalIds: prevCriticalIds,
      newCriticalIds,
      newlyCriticalTasks,
    },
    threatRankings,
  };
}
