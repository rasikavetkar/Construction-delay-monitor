# 🏗️ BuildTrack — Construction Project Delay Risk Monitor

> **AI-Powered Critical Path Method (CPM) Engine · Real-Time Delay Simulation · Role-Based Collaboration**

[![React](https://img.shields.io/badge/React-18-blue?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-6.x-purple?logo=vite)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38bdf8?logo=tailwindcss)](https://tailwindcss.com)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.11x-009688?logo=fastapi)](https://fastapi.tiangolo.com)
[![Python](https://img.shields.io/badge/Python-3.11+-yellow?logo=python)](https://python.org)

---

## 🚨 The Problem

Construction projects routinely overrun deadlines. One delayed material delivery or bad-weather day **quietly ripples** through every task that depends on it. Project managers stare at a static Gantt chart — they see *dates*, not *risk*.

> Delays are only noticed **after** the deadline is already threatened. Recovery becomes expensive.

**BuildTrack** fixes this by replacing the passive Gantt with a live risk intelligence platform that continuously computes which tasks matter most and warns before the schedule slips.

---

## ✅ How We Solve It

| Problem | BuildTrack's Answer |
|---|---|
| Delays are invisible until it's too late | CPM engine recalculates every dependency chain on **every state change** |
| Gantt shows dates, not risk | Every task has a **Threat Score 0–100** computed by simulating its impact |
| Critical path assumed to be static | **Dynamic critical path shift detection** — alerts fire when a non-critical task becomes critical |
| Managers react after damage is done | **Float-threshold alerts** fire when slack drops below 2 days — before the deadline is hit |
| No recovery guidance | Dashboard surfaces specific recovery actions: Crash / Fast-track / Expedite delivery |
| Contractors work in silos | Per-task comment feed, Blocker tags, printable stakeholder reports |

---

## 🛠️ Tech Stack

| Layer | Technology | Why |
|---|---|---|
| **Frontend Framework** | React 18 + Vite + TypeScript | Sub-second hot reload, type-safe codebase |
| **UI Styling** | Tailwind CSS 3 | Rapid utility-first design, amber/navy BuildTrack palette |
| **Dependency Graph** | React Flow (`@xyflow/react`) | Interactive, pannable, zoomable task network with animated critical edges |
| **Charts** | Recharts | Bar charts (schedule variance), Pie/Donut charts (task status distribution) |
| **CPM Engine** | Pure TypeScript (`src/utils/cpm.ts`) | Runs entirely in-browser — no round-trip needed, offline-capable |
| **State Management** | React Context + `useMemo` | Reactive CPM recalculation on every task/dependency change |
| **Persistence** | localStorage | Full session persistence across page reloads |
| **Icons** | Lucide React | Consistent 400+ icon library |
| **Backend** | Python FastAPI | REST API + WebSocket broadcast for real-time multi-user sync |
| **Backend CPM** | Python (`backend/cpm.py`) | Server-side CPM mirror for persistence-layer calculation |
| **Real-time** | WebSockets / Socket.IO | Broadcast delay simulations and delivery alerts to all connected clients |
| **Authentication** | Firebase Auth (pluggable) | Google OAuth + email/password, role-gated on login |
| **Deployment** | Vercel (frontend) + Render/Railway (backend) | Hackathon-optimized CI/CD |
| **Version Control** | GitHub | Collaboration + deployment triggers |

---

## 🧮 CPM Algorithm (The Core Engine)

All scheduling logic runs via a **topological sort → forward pass → backward pass** pipeline:

```
rawTasks[] → Kahn's Algorithm (topological sort)
           → Forward Pass:  ES = max(EF of predecessors),  EF = ES + duration
           → Backward Pass: LF = min(LS of successors),   LS = LF - duration
           → Float:         TF = LS - ES,  FF = min(ES of successors) - EF
           → Critical Path: isCritical = (TF === 0)
```

**Threat Score computation** — for every task, the engine hypothetically adds 3 days, reruns CPM, and measures project end shift:
```
Threat Score = min(100, (projectSlip / 3) × 100)
```

**Critical Path Shift Detection** — after simulation, compares `prevCriticalIds` vs `newCriticalIds` and identifies `newlyCriticalTasks` — tasks that were safe but are now on the critical path.

---

## 📱 Screens & Feature Breakdown

### 🔑 Screen 0 — Login & Role Gateway

**Purpose:** Entry point with instant role-based access.

| Control | Function |
|---|---|
| Role Selector (PM / Contractor) | Switches between two operational modes that gate feature access |
| Email + Password | Full sign-in (Firebase Auth ready) |
| Google OAuth | One-click sign-in |
| Demo as PM | Enters app as Project Manager with full CRUD access |
| Demo as Contractor | Enters app as Site Contractor — progress-only mode |

---

### 📊 Screen 1 — Main Dashboard

**Purpose:** Single executive command center. Satisfies **Requirement 6** fully.

**4 Live KPI Cards:**
- **Target Finish Date** — Contractual baseline deadline
- **Projected Finish (CPM)** — Live CPM-computed end date with slip badge (+X days / On Schedule)
- **Overall Progress %** — Weighted average of all task completion percentages
- **Schedule Variance** — Days beyond contractual deadline

**View Switcher (below KPIs):**
- 🕸 **Dependency Graph preview** — mini network of critical path nodes with arrows
- 📅 **Gantt Timeline preview** — horizontal bars colored by CPM risk level

**Top Delay Risk Rankings Table:**
- Top 4–5 tasks by Threat Score (0–100)
- Clicking any row → opens Delay Simulation with that task pre-selected

**Critical Path Sequence Strip:**
- Red-bordered task cards connected by arrows
- Shows the exact chain that governs the final deadline

**Active Alerts Panel:**
- Top 3 severity-color-coded alerts inline
- "View All" → navigates to Alerts screen

**Material Deliveries Tracker:**
- Quick supply chain status with color badges (On Time / At Risk / Delayed)

**Suggested Recovery Actions:**
- 3 pre-populated cards: **Crash Task** (add resources), **Fast-Track** (overlap tasks), **Expedite Delivery** (rush shipment)
- Each has an Apply button → marks applied, adds activity log entry, reduces schedule variance

---

### 📋 Screen 2 — Task Management

**Role: Project Manager**
- Full CRUD — Add, Edit, Delete tasks
- Add Task modal: Name, Trade, Duration, Contractor, Dependencies (multi-select), Site Zone, Resource, Status, Progress %, Notes
- Dependency multi-select → CPM recalculates immediately across the whole app
- Status options: Not Started / In Progress / At Risk / Blocked / Delayed / Completed
- Float badges: 🟢 >5d, 🟡 2–5d, 🔴 <2d, ⬛ CRITICAL (0d)

**Role: Site Contractor**
- Read-only view of assigned tasks
- "Update Progress" button per task (no add/edit/delete)
- Role badge shown: "🔧 Contractor View — Progress Updates Only"

**Filters:** Trade / Status / Contractor dropdowns + search bar

---

### 📅 Screen 3 — Gantt Chart Timeline

**Purpose:** Time-phased visual schedule with CPM-based risk coloring.

| Bar Color | Meaning |
|---|---|
| 🔴 Red | Critical — 0 float, directly governs deadline |
| 🟡 Yellow | Near-Critical — ≤2 days float remaining |
| 🟢 Trade color | Safe (Civil=amber, Structural=orange, Electrical=purple, Plumbing=blue, Finishing=green) |

**Components:**
- Sticky task name sidebar
- Float buffer extension (faint bar showing available slack)
- Contractual deadline — dashed red vertical line
- Progress overlay on each bar (% complete fill)
- Hover tooltip: Total Float, Free Float, Contractor, Site Zone
- **4 filters:** Trade / Site Zone / Contractor / Status
- **Color legend** at bottom

---

### 🕸 Screen 4 — Interactive Dependency Graph

**Purpose:** Network visualization showing WHY delays propagate.

| Visual | Meaning |
|---|---|
| Red node border | Critical task (0 float) |
| Red + animated edges | Both source and target are critical — the "chain of doom" |
| Gray edges | Non-critical connection — slack available |
| Dimmed nodes | Filtered out by active filter |

**Features:**
- React Flow canvas — pannable, zoomable
- Custom task nodes showing: name, duration, float badge, progress
- MiniMap for overview navigation
- Node Inspector Drawer (click node) — shows ES, EF, LS, LF, TF, FF, Site Zone, Contractor
- **Filters:** Trade / Site Zone / Contractor / Status
- **PM Mode:** Click any node → instantly navigates to Delay Simulation with that task pre-selected
- PM hint banner: "💡 Click any node to instantly open its simulation"

---

### ⚡ Screen 5 — Delay Simulation (What-If Sandbox)

**Purpose:** Core challenge — simulate delays before they happen, see exactly what breaks.

**Control Panel:**
- Target Task dropdown
- Delay Duration slider (1–30 days)
- Root Cause selector: Bad Weather / Material Shipment Delay / Subcontractor Labour Shortage / Permit Hold / Equipment Breakdown

**Impact Analysis Card:**
- Before / After project end dates
- Net schedule slip (+X days)
- 🚨 **Critical Path Shift banner** — lists tasks that were NOT critical before but ARE NOW after the simulation
- **Cascade list** — every downstream task affected, with individual slip days

**Live Network Diagram:**
- Dependency graph with red ripple connectors showing the exact propagation path

**Deadline Threat Rankings Table (full list):**
- All tasks ranked by Threat Score 0–100
- Columns: Rank, Task, Trade, Threat Score, Float, Downstream Count, Root Cause
- "Simulate" button per row → instantly runs that task's simulation

**"Apply to Live Schedule" button:**
- Commits simulation to real state → all views update, alerts fire, variance card turns red

---

### 🔄 Screen 6 — Progress Updates & Site Logging

**Purpose:** Field portal for recording actual progress.

**Two view modes:**
- ⊞ **Cards** — rich task cards showing float badge, progress ring, status, "Update Progress" button
- ☰ **Table** — compact list with inline sliders

**Per task:**
- % Complete slider (0–100) → triggers immediate CPM recalculation
- Status dropdown (In Progress / At Risk / Blocked / Completed)
- **Edit Dates modal** — Actual Start date, Actual Finish date
- Variance badge — days ahead/behind planned

**What happens on update:**
```
Slider changes → updateTaskActuals() → rawTasks updated
              → CPM useMemo fires → projected finish recalculates
              → Dashboard % Complete KPI updates
              → If behind → Warning alert generated
```

---

### 🔔 Screen 7 — Alerts & Notifications

**Purpose:** Centralized real-time notification center.

**Severity tabs:** All / Critical / Warning / Info

| Alert Type | Trigger |
|---|---|
| 🔴 Critical | Task enters critical path, delivery delay, critical path shift |
| 🟡 Warning | Float drops below 2 days, task starts late |
| 🔵 Info | Recovery action applied, contractor comment posted |

**Controls:**
- Acknowledge (dismiss) per alert
- **Mark All as Read** — one-click clear all
- Unread badge counter in Sidebar + Navbar bell icon

---

### 📈 Screen 8 — Reports & Analytics

**Tabs:** Schedule Overview / Risk Analysis / Resource Utilization

**Charts:**
- **Schedule Variance Bar Chart** (Recharts) — Planned Duration vs Delay Impact per task
- **Task Status Donut Chart** — Completed / In Progress / Not Started / Delayed breakdown

**Tables:**
- **Top Delay Risks** — ranked by risk level + delay impact
- **Critical Path Audit** — all zero-float tasks with duration, contractor, status

**Full CPM Breakdown Table:**
- Every task with computed: ES, EF, LS, LF, Total Float (color-coded), Free Float, Progress %, Risk badge
- Column key legend at bottom

**Exports:**
- 📄 **Export PDF** — browser print with sidebar/navbar hidden
- 📊 **Download CSV** — task schedule data
- 🔧 **Export JSON** — full project state including CPM data and threat rankings

---

### 👷 Screen 9 — Field Collaboration

**Purpose:** Communication hub for contractors + stakeholder reporting.

**Comment Feed:**
- Task selector dropdown
- Tag selector: Update / Blocker / Resolution / General
- Blocker tag = red highlight, manager attention
- Live reverse-chronological feed
- Filter by tag

**Share Stakeholder Report modal:**
- Generates printable HTML brief with: project status, top 5 threats, delivery table, critical path, sign-off section
- `window.print()` → browser print dialog

---

### 🚚 Screen 10 — Material Deliveries

**Purpose:** Supply chain tracking linked directly to the schedule.

**Delivery Table:**
- Material name, Supplier, Quantity, Expected Date, Linked Task, Status badge

**"Simulate Slip" per delivery:**
- Day slider (1–30) → `simulateDeliveryDelay()` → CPM ripples through all downstream tasks → alerts generated

**Add Delivery modal:**
- Material name, Supplier, Quantity, Expected Arrival Date, Linked Task (dropdown), Supplier contact

---

### 🏢 Screen 11 — Contractor Management

**Purpose:** Directory of all trade subcontractors.

- Contractor cards: Name, Company, Trade specialty, Phone/Email, Assigned task count
- Add Contractor modal
- Contractor directory feeds into Task Management dropdowns and Gantt/Graph filters

---

### ⚙️ Screen 12 — Project Settings

**Purpose:** Project-level configuration and metadata.

- Edit Project Name, Location, Start Date, Target Finish Date, Type, Description
- Live CPM readout — current computed duration, projected finish, variance, critical task count
- Activity log — chronological history of all state changes
- Multi-step Project Setup Wizard for creating new projects

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.11+

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
# Opens at http://localhost:5173
```

### Backend Setup

```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
# API docs at http://localhost:8000/docs
```

### One-Command Start (from root)

```bash
npm run dev        # starts both frontend (port 5173) + backend (port 8000)
```

> **Offline Mode:** The frontend runs fully offline. All CPM calculations, simulations, and threat rankings execute in-browser. The backend provides optional persistence and WebSocket broadcast.

---

## 📁 Project Structure

```
minithon/
├── frontend/
│   ├── src/
│   │   ├── components/           # All 14 screen components
│   │   │   ├── LandingLoginPage.tsx      # Screen 0 — Auth + Role Selector
│   │   │   ├── DashboardView.tsx         # Screen 1 — Command Center
│   │   │   ├── TaskManagementView.tsx    # Screen 2 — Task CRUD
│   │   │   ├── GanttView.tsx             # Screen 3 — Timeline
│   │   │   ├── DependencyGraphView.tsx   # Screen 4 — Network Graph
│   │   │   ├── DelaySimulationView.tsx   # Screen 5 — What-If Sandbox
│   │   │   ├── ProgressUpdatesView.tsx   # Screen 6 — Field Updates
│   │   │   ├── AlertsView.tsx            # Screen 7 — Notifications
│   │   │   ├── ReportsView.tsx           # Screen 8 — Analytics
│   │   │   ├── CollaborationView.tsx     # Screen 9 — Field Collaboration
│   │   │   ├── MaterialDeliveriesView.tsx # Screen 10 — Supply Chain
│   │   │   ├── ContractorManagementView.tsx # Screen 11 — Contractors
│   │   │   ├── ProjectDetailsView.tsx    # Screen 12 — Settings
│   │   │   ├── Sidebar.tsx               # Navigation + Role Badge
│   │   │   ├── Navbar.tsx                # Search + User Profile
│   │   │   ├── ProjectSetupModal.tsx     # 3-Step Wizard
│   │   │   └── ToastNotification.tsx     # Global Toast System
│   │   ├── context/
│   │   │   └── ProjectContext.tsx        # Central state + all actions
│   │   ├── utils/
│   │   │   └── cpm.ts                    # Full CPM engine (TS)
│   │   └── types/
│   │       └── index.ts                  # All TypeScript interfaces
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── package.json
│
├── backend/
│   ├── main.py                    # FastAPI app + WebSocket server
│   ├── cpm.py                     # Python CPM engine
│   ├── models.py                  # Pydantic request/response models
│   └── requirements.txt
│
└── README.md
```

---

## 🔗 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check + project stats |
| `GET/POST` | `/api/tasks` | List or create tasks |
| `PUT/DELETE` | `/api/tasks/{id}` | Update or delete a task |
| `GET/POST` | `/api/deliveries` | List or add material deliveries |
| `POST` | `/api/simulate-delay` | Run delay simulation + WebSocket broadcast |
| `GET/POST` | `/api/comments` | List or post task comments |
| `GET/POST` | `/api/contractors` | Contractor directory |
| `GET/POST` | `/api/alerts` | Alert stream |
| `WS` | `/ws` | WebSocket for real-time broadcast |

---

## 👥 Team

Built for **Minithon 2026** — Construction Project Delay Risk Monitor Track.

---

## 📄 License

MIT — Open for hackathon evaluation and extension.
