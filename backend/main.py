import os
import json
from typing import List, Dict, Any
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from models import (
    TaskModel,
    ProjectModel,
    ContractorModel,
    AlertModel,
    DelaySimulationRequest,
    MaterialDeliveryModel,
    TaskCommentModel,
)
from cpm import calculate_cpm_python, simulate_delay_python

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: Dict[str, Any]):
        for connection in self.active_connections:
            try:
                await connection.send_text(json.dumps(message))
            except Exception:
                pass

manager = ConnectionManager()

# In-Memory Database store
DEMO_PROJECT = ProjectModel(
    id="proj-1",
    name="Skyline Commercial Complex",
    description="Construction of a commercial complex with offices, retail and parking.",
    startDate="2025-10-01",
    targetFinishDate="2025-10-30",
    projectedFinishDate="2025-11-02",
    location="Mumbai",
    projectType="Commercial",
    overallProgress=42,
    scheduleVarianceDays=3,
    status="At Risk",
    budget="$4.2M",
    floatAlertThreshold=2
)

DEMO_TASKS = [
    TaskModel(
        id="t0",
        name="Material Delivery",
        trade="Logistics",
        duration=2,
        dependencies=[],
        contractor="ABC Construction",
        status="Completed",
        progress=100,
        riskLevel="Low",
        delayImpactDays=0,
        plannedStart="2025-09-29",
        plannedEnd="2025-10-01",
        actualStart="2025-09-29",
        actualEnd="2025-10-01",
        siteZone="Zone A - Logistics Yard"
    ),
    TaskModel(
        id="t1",
        name="Foundation",
        trade="Civil",
        duration=5,
        dependencies=["t0"],
        contractor="ABC Construction",
        status="Delayed",
        progress=60,
        riskLevel="High",
        delayImpactDays=3,
        plannedStart="2025-10-01",
        plannedEnd="2025-10-05",
        actualStart="2025-10-01",
        siteZone="Zone B - Substructure",
        notes="Ground water seepage caused slow curing of footings."
    ),
    TaskModel(
        id="t2",
        name="Columns",
        trade="Structural",
        duration=4,
        dependencies=["t1"],
        contractor="XYZ Contractors",
        status="In Progress",
        progress=40,
        riskLevel="High",
        delayImpactDays=3,
        plannedStart="2025-10-06",
        plannedEnd="2025-10-10",
        actualStart="2025-10-06",
        siteZone="Zone B - Level 1"
    ),
    TaskModel(
        id="t3",
        name="Walls",
        trade="Civil",
        duration=7,
        dependencies=["t2"],
        contractor="ABC Construction",
        status="Not Started",
        progress=0,
        riskLevel="Medium",
        delayImpactDays=3,
        plannedStart="2025-10-11",
        plannedEnd="2025-10-18",
        siteZone="Zone B - Core"
    ),
    TaskModel(
        id="t4",
        name="Electrical",
        trade="Electrical",
        duration=6,
        dependencies=["t3"],
        contractor="Electrical Co.",
        status="Not Started",
        progress=0,
        riskLevel="Medium",
        delayImpactDays=3,
        plannedStart="2025-10-16",
        plannedEnd="2025-10-22",
        siteZone="Zone C - MEP Conduits"
    ),
    TaskModel(
        id="t5",
        name="Plumbing",
        trade="Plumbing",
        duration=7,
        dependencies=["t3"],
        contractor="Plumbing Co.",
        status="Not Started",
        progress=0,
        riskLevel="Low",
        delayImpactDays=1,
        plannedStart="2025-10-16",
        plannedEnd="2025-10-23",
        siteZone="Zone C - Risers"
    ),
    TaskModel(
        id="t6",
        name="Finishing",
        trade="Finishing",
        duration=5,
        dependencies=["t4", "t5"],
        contractor="Finishing Ltd.",
        status="Not Started",
        progress=0,
        riskLevel="Low",
        delayImpactDays=1,
        plannedStart="2025-10-20",
        plannedEnd="2025-10-25",
        siteZone="Zone D - Interiors"
    ),
    TaskModel(
        id="t7",
        name="Handover",
        trade="General",
        duration=2,
        dependencies=["t6"],
        contractor="ABC Construction",
        status="Not Started",
        progress=0,
        riskLevel="Low",
        delayImpactDays=0,
        plannedStart="2025-10-26",
        plannedEnd="2025-10-28",
        siteZone="Whole Site"
    ),
]

DEMO_DELIVERIES = [
    MaterialDeliveryModel(
        id="m1",
        materialName="Ready-Mix Grade 40 Concrete",
        supplier="UltraTech Concrete Ltd",
        quantity="240 cu.m",
        expectedDate="2025-10-01",
        revisedDate="2025-10-03",
        linkedTaskId="t1",
        linkedTaskName="Foundation",
        status="Delayed",
        delayDays=2,
        contactPerson="Suresh Patil (+91 98201 11223)"
    ),
    MaterialDeliveryModel(
        id="m2",
        materialName="Structural Rebar Steel Fe-500D",
        supplier="Tata Steel Infra",
        quantity="35 Metric Tons",
        expectedDate="2025-10-05",
        revisedDate="2025-10-05",
        linkedTaskId="t2",
        linkedTaskName="Columns",
        status="On Time",
        delayDays=0,
        contactPerson="Naveen Rao (+91 98202 33445)"
    ),
]

DEMO_COMMENTS = [
    TaskCommentModel(
        id="comm1",
        taskId="t1",
        taskName="Foundation",
        author="Rohit Kumar",
        role="ABC Construction Lead",
        content="Subsoil water seepage at Grid C-4 delayed footing pour. Deploying two 5HP dewatering pumps today.",
        timeAgo="2h ago",
        timestamp="2025-10-05T08:15:00Z",
        tag="Blocker"
    ),
    TaskCommentModel(
        id="comm2",
        taskId="t0",
        taskName="Material Delivery",
        author="Suresh Patil",
        role="UltraTech Logistics Mgr",
        content="Second convoy of 8 transit mixers dispatched with accelerator admixtures.",
        timeAgo="3h ago",
        timestamp="2025-10-05T07:10:00Z",
        tag="Update"
    ),
]

DEMO_CONTRACTORS = [
    ContractorModel(id="c1", name="ABC Construction", trade="Civil", email="abc@construction.com", phone="+91 98200 12345", status="Active", assignedTasks=3),
    ContractorModel(id="c2", name="XYZ Contractors", trade="Structural", email="xyz@contractors.com", phone="+91 98200 67890", status="Active", assignedTasks=1),
    ContractorModel(id="c3", name="Electrical Co.", trade="Electrical", email="elec@electric.com", phone="+91 98200 11223", status="Active", assignedTasks=1),
    ContractorModel(id="c4", name="Plumbing Co.", trade="Plumbing", email="plumbing@pipe.com", phone="+91 98200 44556", status="Active", assignedTasks=1),
    ContractorModel(id="c5", name="Finishing Ltd.", trade="Finishing", email="finishing@ltd.com", phone="+91 98200 77889", status="Active", assignedTasks=1),
]

DEMO_ALERTS = [
    AlertModel(id="a1", title="Foundation is 3 days behind schedule", severity="Critical", timeAgo="2h ago", taskId="t1", category="Schedule", timestamp="2025-10-05T08:00:00Z"),
    AlertModel(id="a2", title="Concrete delivery delayed by 2 days", severity="Critical", timeAgo="3h ago", taskId="t0", category="Material", timestamp="2025-10-05T07:00:00Z"),
    AlertModel(id="a3", title="Electrical has only 1 day of float left", severity="Warning", timeAgo="4h ago", taskId="t4", category="Float", timestamp="2025-10-05T06:00:00Z"),
    AlertModel(id="a4", title="Project completion at risk (+3 days)", severity="Critical", timeAgo="4m ago", category="Schedule", timestamp="2025-10-05T09:55:00Z"),
]

app_state = {
    "project": DEMO_PROJECT,
    "tasks": {t.id: t for t in DEMO_TASKS},
    "deliveries": {d.id: d for d in DEMO_DELIVERIES},
    "comments": list(DEMO_COMMENTS),
    "contractors": {c.id: c for c in DEMO_CONTRACTORS},
    "alerts": list(DEMO_ALERTS)
}

app = FastAPI(title="BuildTrack Construction Delay Monitor API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "BuildTrack FastAPI CPM Service",
        "version": "1.0.0",
        "active_tasks": len(app_state["tasks"]),
        "deliveries_tracked": len(app_state["deliveries"]),
        "database": os.environ.get("DATABASE_URL", "SQLite/In-Memory Local Engine")
    }

@app.get("/api/project")
def get_project():
    return app_state["project"]

@app.put("/api/project")
def update_project(updated: ProjectModel):
    app_state["project"] = updated
    return app_state["project"]

@app.get("/api/tasks")
def get_tasks():
    raw_list = [t.dict() for t in app_state["tasks"].values()]
    cpm_result = calculate_cpm_python(raw_list)
    return {
        "tasks": cpm_result["tasks"],
        "projectDuration": cpm_result["project_duration"],
        "criticalPathIds": cpm_result["critical_path_ids"]
    }

@app.post("/api/tasks")
def create_task(task: TaskModel):
    app_state["tasks"][task.id] = task
    return task

@app.put("/api/tasks/{task_id}")
def update_task(task_id: str, updates: Dict[str, Any]):
    if task_id not in app_state["tasks"]:
        raise HTTPException(status_code=404, detail="Task not found")
    current = app_state["tasks"][task_id].dict()
    current.update(updates)
    app_state["tasks"][task_id] = TaskModel(**current)
    return app_state["tasks"][task_id]

@app.delete("/api/tasks/{task_id}")
def delete_task(task_id: str):
    if task_id in app_state["tasks"]:
        del app_state["tasks"][task_id]
    return {"deleted": task_id}

@app.get("/api/deliveries")
def get_deliveries():
    return list(app_state["deliveries"].values())

@app.post("/api/deliveries")
def create_delivery(delivery: MaterialDeliveryModel):
    app_state["deliveries"][delivery.id] = delivery
    return delivery

@app.get("/api/comments")
def get_comments():
    return app_state["comments"]

@app.post("/api/comments")
async def create_comment(comment: TaskCommentModel):
    app_state["comments"].insert(0, comment)
    await manager.broadcast({
        "type": "NEW_TASK_COMMENT",
        "data": comment.dict()
    })
    return comment

@app.post("/api/simulate-delay")
async def simulate_delay_endpoint(req: DelaySimulationRequest):
    raw_list = [t.dict() for t in app_state["tasks"].values()]
    sim_result = simulate_delay_python(
        raw_list,
        req.taskId,
        req.delayDays,
        req.startDate
    )

    broadcast_payload = {
        "type": "DELAY_SIMULATION_BROADCAST",
        "data": {
            "taskId": req.taskId,
            "taskName": sim_result["taskName"],
            "delayDays": req.delayDays,
            "reason": req.reason,
            "newProjectFinish": sim_result["newProjectFinish"],
            "netProjectDelayDays": sim_result["netProjectDelayDays"],
            "affectedTasksCount": len(sim_result["affectedTasks"])
        }
    }
    await manager.broadcast(broadcast_payload)
    return sim_result

@app.get("/api/contractors")
def get_contractors():
    return list(app_state["contractors"].values())

@app.post("/api/contractors")
def add_contractor(contractor: ContractorModel):
    app_state["contractors"][contractor.id] = contractor
    return contractor

@app.get("/api/alerts")
def get_alerts():
    return app_state["alerts"]

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            try:
                parsed = json.loads(data)
                if parsed.get("type") == "PING":
                    await websocket.send_text(json.dumps({"type": "PONG"}))
            except Exception:
                pass
    except WebSocketDisconnect:
        manager.disconnect(websocket)
