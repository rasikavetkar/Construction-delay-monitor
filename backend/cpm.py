from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta

def calculate_cpm_python(tasks_data: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Computes Critical Path Method (CPM) values:
    Early Start (ES), Early Finish (EF), Late Start (LS), Late Finish (LF),
    Total Float (TF), and Critical Path.
    """
    if not tasks_data:
        return {"tasks": [], "project_duration": 0, "critical_path_ids": []}

    tasks = {t["id"]: dict(t) for t in tasks_data}
    successors: Dict[str, List[str]] = {t_id: [] for t_id in tasks}

    for t_id, t in tasks.items():
        for parent_id in t.get("dependencies", []):
            if parent_id in successors:
                successors[parent_id].append(t_id)

    # 1. FORWARD PASS
    in_degree = {t_id: len(tasks[t_id].get("dependencies", [])) for t_id in tasks}
    queue = [t_id for t_id, deg in in_degree.items() if deg == 0]

    for t_id in queue:
        tasks[t_id]["earlyStart"] = 0
        tasks[t_id]["earlyFinish"] = tasks[t_id]["duration"]

    topo_order = []
    while queue:
        curr_id = queue.pop(0)
        topo_order.append(curr_id)
        curr_ef = tasks[curr_id]["earlyFinish"]

        for succ_id in successors.get(curr_id, []):
            child = tasks[succ_id]
            child["earlyStart"] = max(child.get("earlyStart", 0), curr_ef)
            child["earlyFinish"] = child["earlyStart"] + child["duration"]
            in_degree[succ_id] -= 1
            if in_degree[succ_id] == 0:
                queue.append(succ_id)

    # Fallback for disconnected nodes
    for t_id, t in tasks.items():
        if "earlyStart" not in t:
            t["earlyStart"] = 0
            t["earlyFinish"] = t["duration"]
            if t_id not in topo_order:
                topo_order.append(t_id)

    project_duration = max((t["earlyFinish"] for t in tasks.values()), default=0)

    # 2. BACKWARD PASS
    for t_id in reversed(topo_order):
        t = tasks[t_id]
        succs = successors.get(t_id, [])
        if not succs:
            t["lateFinish"] = project_duration
        else:
            t["lateFinish"] = min(tasks[s]["lateStart"] for s in succs if "lateStart" in tasks[s])

        t["lateStart"] = t["lateFinish"] - t["duration"]
        t["totalFloat"] = max(0, t["lateStart"] - t["earlyStart"])
        t["isCritical"] = (t["totalFloat"] == 0)

    critical_ids = [t_id for t_id, t in tasks.items() if t["isCritical"]]
    critical_ids.sort(key=lambda x: tasks[x]["earlyStart"])

    return {
        "tasks": list(tasks.values()),
        "project_duration": project_duration,
        "critical_path_ids": critical_ids
    }

def simulate_delay_python(
    tasks_data: List[Dict[str, Any]],
    target_task_id: str,
    delay_days: int,
    start_date_str: str = "2025-10-01"
) -> Dict[str, Any]:
    """
    Simulates a task duration increase and calculates downstream ripple effects.
    """
    base_res = calculate_cpm_python(tasks_data)
    base_task_map = {t["id"]: t for t in base_res["tasks"]}

    simulated_input = []
    for t in tasks_data:
        item = dict(t)
        if item["id"] == target_task_id:
            item["duration"] = item["duration"] + delay_days
        simulated_input.append(item)

    sim_res = calculate_cpm_python(simulated_input)
    sim_task_map = {t["id"]: t for t in sim_res["tasks"]}

    net_project_delay = sim_res["project_duration"] - base_res["project_duration"]

    base_date = datetime.strptime(start_date_str, "%Y-%m-%d")
    orig_finish = base_date + timedelta(days=base_res["project_duration"])
    new_finish = base_date + timedelta(days=sim_res["project_duration"])

    affected = []
    for t_id, sim_t in sim_task_map.items():
        base_t = base_task_map.get(t_id)
        if not base_t:
            continue
        diff = sim_t["earlyFinish"] - base_t["earlyFinish"]
        if diff > 0:
            orig_t_end = base_date + timedelta(days=base_t["earlyFinish"])
            sim_t_end = base_date + timedelta(days=sim_t["earlyFinish"])
            affected.append({
                "taskId": t_id,
                "taskName": sim_t.get("name", t_id),
                "delayDays": diff,
                "isCritical": sim_t.get("isCritical", False),
                "originalEnd": orig_t_end.strftime("%Y-%m-%d"),
                "simulatedEnd": sim_t_end.strftime("%Y-%m-%d")
            })

    target_task = base_task_map.get(target_task_id, {})
    return {
        "taskId": target_task_id,
        "taskName": target_task.get("name", "Unknown"),
        "delayDays": delay_days,
        "originalProjectFinish": orig_finish.strftime("%Y-%m-%d"),
        "newProjectFinish": new_finish.strftime("%Y-%m-%d"),
        "netProjectDelayDays": net_project_delay,
        "affectedTasks": affected
    }
