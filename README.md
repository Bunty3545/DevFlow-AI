# 🚀 DevFlow AI – AI-Powered Software Development & Project Intelligence Platform
### Smart India Hackathon 2026 Problem Statement: SIH26103
**Proposed by:** Ministry of Statistics and Programme Implementation (MoSPI) / Enterprise Project Intelligence  
**Capstone Project:** B.Tech Computer Science & Engineering Final-Year Project

---

## 📌 Executive Summary

**DevFlow AI** is an enterprise-grade, centralized project and development intelligence platform. The platform transitions conventional retrospective project monitoring into proactive, **predictive early-warning surveillance**.

It answers four fundamental governance and delivery questions:
1. **What has happened?** (Historical milestones, financial disbursements, sprint & build progress)
2. **What is happening?** (Active physical vs financial velocity, ongoing blockers, clearances)
3. **What could happen next?** (Predictive cost overruns, schedule delay forecasting, Earned Value calculations)
4. **Which projects need immediate attention?** (Automated algorithmic risk scoring and escalation alerts)

---

## 🚀 Live Services & Ports

| Component | Port | Status | Health Check URL |
| :--- | :--- | :--- | :--- |
| **Frontend (Next.js 14 App Router)** | `3000` | 🟢 Online | [http://localhost:3000](http://localhost:3000) |
| **Backend API (Node.js / Express)** | `5000` | 🟢 Online | [http://localhost:5000/health](http://localhost:5000/health) |
| **Embedded Zero-Config Database** | Internal / 27017 | 🟢 Seeded | Pre-populated with 16 Mega Projects |

---

## 🔑 Demo Accounts & Role-Based Access Control (RBAC)

The platform comes pre-seeded with 4 distinct government roles. You can either log in with these credentials or use the **1-Click Quick Demo Switcher** directly in the UI Navbar:

| Role | Email | Password | Scope & Authority |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@infrawatch.gov.in` | `Admin@123` | Full administrative control, user RBAC, project registration & deletion, global settings |
| **Monitoring Officer** | `officer@infrawatch.gov.in` | `Officer@123` | Validates and approves contractor monthly progress updates, evaluates risk alerts, generates dossiers |
| **Project Manager** | `manager@infrawatch.gov.in` | `Manager@123` | Manages assigned projects, updates milestones, assigns bottlenecks, records expenditure vouchers |
| **Implementing Agency** | `agency@infrawatch.gov.in` | `Agency@123` | Submits field progress updates, logs physical hindrances, records monthly contractor outlay |

---

## 🛠️ Technology Stack

- **Frontend:**
  - **Framework:** Next.js 14 (React 18, TypeScript, App Router)
  - **Styling:** Tailwind CSS with Light/Dark Mode government enterprise palette
  - **Analytics & Data Viz:** Recharts (S-Curves, CPI vs SPI Scatter Matrices, Donut Distributions, Outlay Bars)
  - **Geographical GIS:** Leaflet & OpenStreetMap (Interactive state & district spatial mapping)
  - **Exporting:** jsPDF & jsPDF-AutoTable (PDF Dossiers), SheetJS XLSX (Excel), CSV
  - **Icons:** Lucide React

- **Backend:**
  - **Runtime:** Node.js 22 LTS with Express.js REST API in TypeScript
  - **Security:** JWT authentication, bcryptjs password hashing, role-authorization middleware, express-rate-limit
  - **Database:** MongoDB with Mongoose (Dual-mode: connects to external MongoDB URI or transparent in-memory fallback engine for zero-configuration testing)

- **AI & Predictive Analytics:**
  - **EVM Predictive Engine:** Multi-factor Earned Value Management ($CPI = \frac{EV}{AC}$, $SPI = \frac{EV}{PV}$, Estimate at Completion $EAC = \frac{BAC}{CPI}$)
  - **AI Project Assistant:** Configurable Google Gemini API with intelligent rule-based domain fallback grounded in live database figures

- **DevOps & Infrastructure:**
  - Multi-stage Dockerfiles for backend and frontend
  - `docker-compose.yml` for unified stack orchestration
  - GitHub Actions CI/CD workflow (`.github/workflows/ci.yml`)

---

## 📐 Mathematical Model & Risk Scoring Engine

InfraWatch AI employs a transparent, multi-factor risk index ($0 - 100$) compliant with MoSPI capital asset monitoring guidelines:

$$RiskScore = Baseline(10) + W_{delay} + W_{cost} + W_{milestone} + W_{bottleneck}$$

1. **Schedule Slippage Factor ($W_{delay} \le 35$):**
   - Evaluates deviation between planned progress ($PV$) and actual physical progress ($EV$):
   $$\Delta_{progress} = Planned\% - Actual\%$$
   - $> 25\%$ slippage $\implies +35$ points
   - $15\% - 25\%$ slippage $\implies +25$ points
   - $5\% - 15\%$ slippage $\implies +12$ points

2. **Cost Overrun & CPI Factor ($W_{cost} \le 25$):**
   - Cost Performance Index: $CPI = \frac{ActualProgress \times ApprovedCost}{ActualExpenditure}$
   - Budget Variance: $\%Var = \frac{RevisedCost - ApprovedCost}{ApprovedCost} \times 100$
   - $CPI < 0.75$ or $\%Var > 20\% \implies +25$ points

3. **Critical Milestone Failure Factor ($W_{milestone} \le 20$):**
   - Chronic delayed delivery gates on critical path activities.

4. **Active Bottlenecks Factor ($W_{bottleneck} \le 20$):**
   - Evaluates open statutory obstacles (Forest Clearance, Land Acquisition, Utility Shifting).

### Predictive Forecasting Outputs
- **Projected Delay (Months):**
  $$ExtraDays = \frac{PlannedDuration}{SPI} - PlannedDuration$$
  $$ProjectedDelay = \frac{ExtraDays}{30.4}$$
- **Projected Cost Overrun (₹ Cr):**
  $$EAC = \frac{ApprovedCost}{CPI}$$
  $$Overrun = EAC - ApprovedCost$$

---

## 🖥️ 16 Complete Application Modules

1. **Sign In (`/login`):** Role-based login with 1-click quick evaluation demo buttons.
2. **Registration (`/register`):** Multi-role official onboarding.
3. **Main Dashboard (`/`):** 8 primary KPI cards, Sector outlay bar chart, Risk distribution donut, S-curve expenditure trajectory, recent activities, and critical alerts.
4. **All Projects (`/projects`):** Full CRUD registry with table/card view toggle, multi-parameter filtering, search, sorting, and project creation modal.
5. **Project Details (`/projects/[id]`):** 360-degree project dossier, physical progress gauge, EVM indices, milestone timeline, and active bottlenecks.
6. **Project Monitoring (`/monitoring`):** Physical execution S-curve, contractor monthly progress submission form, and officer verification queue.
7. **Financial Analytics (`/financials`):** Sanctioned budget vs revised estimate vs expenditure, component-wise cost breakdown, and voucher recording.
8. **Predictive Risk Analytics (`/risk-analytics`):** CPI vs SPI scatter performance matrix, risk diagnosis, and recommended corrective directives.
9. **AI Project Assistant (`/ai-assistant`):** Interactive AI copilot grounded on live project data with suggested prompts and citation badges.
10. **Issue & Action Tracking (`/issues`):** Bottleneck board with category filtering, overdue badges, activity history, and ministerial escalation.
11. **Milestone Management (`/milestones`):** Critical path tracking, planned vs actual completion dates, and sequence progression.
12. **GIS Project Map (`/gis-map`):** Spatial interactive map of India with color-coded risk markers, district/state filters, and clickable popups.
13. **Reports & Export (`/reports`):** Client-side PDF generation via jsPDF, Excel (.xlsx) export, and CSV dataset download.
14. **User Management (`/users`):** Admin access control, role assignment, and account status toggling.
15. **System Settings (`/settings`):** Configurable Gemini API key, EVM alert cutoffs, and notification preferences.
16. **User Profile (`/profile`):** User identity badge, department credentials, and credential management.

---

## ⚡ Quick Start & Installation

### Option 1: Native Run (Already Live on this Machine!)

**Backend:**
```bash
cd backend
npm install
npm run build
npm start
# Runs on http://localhost:5000
```

**Frontend:**
```bash
cd frontend
npm install
npm run build
npm start
# Runs on http://localhost:3000
```

### Option 2: Docker Compose Orchestration

```bash
docker-compose up --build
```
Access frontend at `http://localhost:3000` and API at `http://localhost:5000`.

---

## 📜 MoSPI Capstone Project Certification

This platform satisfies all problem statement guidelines for **SIH26103**:
- Centralized multi-department oversight (Highways, Railways, Metros, Water, Power, Ports, Airports).
- Real-time descriptive and predictive monitoring with EVM analytics.
- Strict factual grounding of AI responses without financial hallucination.
- Seamless role-based separation of responsibilities between Government administrators and contractors.

