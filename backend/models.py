from pydantic import BaseModel, Field
from typing import List, Optional

class TaskModel(BaseModel):
    id: str
    name: str
    trade: str
    duration: int
    dependencies: List[str] = []
    contractor: str
    status: str = "Not Started"
    progress: int = 0
    riskLevel: str = "Low"
    delayImpactDays: int = 0
    plannedStart: str = "2025-10-01"
    plannedEnd: str = "2025-10-06"
    actualStart: Optional[str] = None
    actualEnd: Optional[str] = None
    earlyStart: Optional[int] = None
    earlyFinish: Optional[int] = None
    lateStart: Optional[int] = None
    lateFinish: Optional[int] = None
    totalFloat: Optional[int] = None
    freeFloat: Optional[int] = None
    isCritical: Optional[bool] = None
    notes: Optional[str] = None
    siteZone: Optional[str] = None
    assignedWorkers: Optional[int] = None

class ProjectModel(BaseModel):
    id: str = "proj-1"
    name: str = "Skyline Commercial Complex"
    description: str = "Construction of a commercial complex with offices, retail and parking."
    startDate: str = "2025-10-01"
    targetFinishDate: str = "2025-10-30"
    projectedFinishDate: str = "2025-11-02"
    location: str = "Mumbai"
    projectType: str = "Commercial"
    overallProgress: int = 42
    scheduleVarianceDays: int = 3
    status: str = "At Risk"
    budget: Optional[str] = "$4.2M"
    imageUrl: Optional[str] = None
    floatAlertThreshold: Optional[int] = 2

class MaterialDeliveryModel(BaseModel):
    id: str
    materialName: str
    supplier: str
    quantity: str
    expectedDate: str
    revisedDate: Optional[str] = None
    linkedTaskId: str
    linkedTaskName: str
    status: str = "On Time"
    delayDays: int = 0
    contactPerson: Optional[str] = None
    notes: Optional[str] = None

class TaskCommentModel(BaseModel):
    id: str
    taskId: str
    taskName: str
    author: str
    role: str
    content: str
    timeAgo: str = "Just now"
    timestamp: str
    tag: str = "Update"

class ContractorModel(BaseModel):
    id: str
    name: str
    trade: str
    email: str
    phone: str
    status: str = "Active"
    assignedTasks: int = 0

class AlertModel(BaseModel):
    id: str
    title: str
    severity: str
    timeAgo: str
    taskId: Optional[str] = None
    category: Optional[str] = "Schedule"
    timestamp: str

class DelaySimulationRequest(BaseModel):
    taskId: str
    delayDays: int
    reason: str
    startDate: str = "2025-10-01"
