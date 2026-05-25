# RCN Frontend Functionality Report (High-Level)

## Scope
Frontend application only (React + Vite). This report summarizes the UI flows, role-based navigation, and API interactions observed in the current frontend code.

## Tech Stack (Frontend)
- React + Vite entry and routing: [frontend/src/main.tsx](frontend/src/main.tsx), [frontend/src/App.tsx](frontend/src/App.tsx)
- HTTP client with auth interceptors: [frontend/src/services/api.ts](frontend/src/services/api.ts)
- UI libraries used in code: `react-router-dom`, `react-hot-toast`, `lucide-react`, `recharts`, `react-leaflet`, `framer-motion` (see usage in pages/components)
- Styling and theme variables: [frontend/src/index.css](frontend/src/index.css)

## App Entry, Routing, and Access Control
- App bootstraps React, wraps routes in `BrowserRouter`: [frontend/src/main.tsx](frontend/src/main.tsx)
- Central routing + role gating lives in [frontend/src/App.tsx](frontend/src/App.tsx)
  - Public: `/` (Home), `/login`, `/register`
  - Authenticated shell: top navigation + nested routes
  - Role gating for:
    - Admin/Director analytics, audit, reference, duplicates
    - Lab staff routes (lab dashboard + lab request detail)
    - Doctor and lab staff access to lab request details

## Authentication & Session
- Login page posts to `POST /api/auth/login`, stores `token` + `user` in localStorage: [frontend/src/pages/LoginPage.tsx](frontend/src/pages/LoginPage.tsx)
- Registration page reads invitation params and posts to `POST /api/auth/register`:
  - Supports role-based registration, lab-specific types/activities, doctor specialties.
  - Fetches specialties from `GET /api/reference/specialties`.  
  [frontend/src/pages/RegistrationPage.tsx](frontend/src/pages/RegistrationPage.tsx)
- API layer auto-attaches bearer token and redirects to `/login` on 401: [frontend/src/services/api.ts](frontend/src/services/api.ts)

## Primary Pages and Key Flows

### Home / Landing
- Marketing-style public homepage with mission, stats, and CTA to login.  
  [frontend/src/pages/HomePage.tsx](frontend/src/pages/HomePage.tsx)

### Dashboard (Role-Based)
- Fetches KPI stats from `GET /api/dashboard/stats`.
- Renders different dashboard panels for:
  - National admin, hospital director, secretary, doctor.  
  [frontend/src/pages/Dashboard.tsx](frontend/src/pages/Dashboard.tsx)

### User Management
- Lists users from `GET /api/users`.
- Approve user: `PATCH /api/users/:id/approve`
- Delete user: `DELETE /api/users/:id`
- Filters visibility by role (national admin, wilaya supervisor, director, secretary, lab manager).  
  [frontend/src/pages/UserManagement.tsx](frontend/src/pages/UserManagement.tsx)

### Invitation Flow
- Invite modal posts `POST /api/invitations/send`.
- Generates manual link fallback if SMTP is not configured.  
  [frontend/src/components/InviteModal.tsx](frontend/src/components/InviteModal.tsx)

### Patient Management
- Lists patients from `GET /api/patients`
- Patient details navigation (per patient)
- Secretary-only delete: `DELETE /api/patients/:id`  
  [frontend/src/pages/PatientManagement.tsx](frontend/src/pages/PatientManagement.tsx)

### Patient Details (Clinical Record Hub)
- Large multi-tab patient view with:
  - Demographics, diagnostics, medical records, tumors
  - Lab requests and lab results integration
  - RCP/chat collaboration
  - Body map visualization + diagnosis forms
- Uses lab result templates for structured entry  
  [frontend/src/pages/PatientDetailsPage.tsx](frontend/src/pages/PatientDetailsPage.tsx)  
  [frontend/src/components/LabResultForm.tsx](frontend/src/components/LabResultForm.tsx)  
  [frontend/src/components/BodyMap/BodyMapViewer.tsx](frontend/src/components/BodyMap/BodyMapViewer.tsx)  
  [frontend/src/components/BodyMap/CancerDiagnosisForm.tsx](frontend/src/components/BodyMap/CancerDiagnosisForm.tsx)  
  [frontend/src/components/BodyMap/OrganDetailView.tsx](frontend/src/components/BodyMap/OrganDetailView.tsx)

### Lab Workflow
- Lab dashboard lists lab requests and supports:
  - Filtering, assignment to doctor, status updates
  - Assignment: `PATCH /api/lab-requests/:id/assign`
  - Status: `PATCH /api/lab-requests/:id`  
  [frontend/src/pages/LaboratoryDashboard.tsx](frontend/src/pages/LaboratoryDashboard.tsx)

- Lab request detail:
  - Loads request + entries
  - Assigns template per test (auto-guess)
  - Creates/updates result entries
  - Finalize request: `PATCH /api/lab-requests/:id/complete`  
  [frontend/src/pages/LabRequestDetailPage.tsx](frontend/src/pages/LabRequestDetailPage.tsx)

### Research & Analytics
- Advanced analytics dashboard with multiple chart types and filters
- Uses population datasets and wilaya map
- Data sources include:
  - `GET /api/stats/global`
  - `GET /api/stats/map`
  - `GET /api/stats/cancers`
  - `GET /api/stats/wilayas`
  - `GET /api/stats/saved-reports`
  - `GET /api/population-datasets`
  - `GET /api/risk-zones`  
  [frontend/src/pages/ResearchAnalytics.tsx](frontend/src/pages/ResearchAnalytics.tsx)

### Audit Trail
- Secure audit log view from `GET /api/audit-logs`  
  [frontend/src/pages/AuditPage.tsx](frontend/src/pages/AuditPage.tsx)

### Duplicate Management
- Fetches suspected duplicates and supports ignore/merge:
  - `GET /api/patients/duplicates/potential`
  - `POST /api/patients/duplicates/ignore`
  - `POST /api/patients/merge`  
  [frontend/src/pages/DuplicateManagement.tsx](frontend/src/pages/DuplicateManagement.tsx)

## Key Reusable Components
- Top navigation with role-based links + theme toggle: [frontend/src/components/TopNav.tsx](frontend/src/components/TopNav.tsx)
- Command palette for quick patient search: [frontend/src/components/CommandPalette.tsx](frontend/src/components/CommandPalette.tsx)
- Add patient multi-step modal with duplicate checking and merge mode: [frontend/src/components/AddPatientModal.tsx](frontend/src/components/AddPatientModal.tsx)
- Population dataset editor modal for incidence calculations: [frontend/src/components/PopulationDatasetModal.tsx](frontend/src/components/PopulationDatasetModal.tsx)
- Wilaya map visualization (heat + risk zones): [frontend/src/components/WilayaMap.tsx](frontend/src/components/WilayaMap.tsx)

## Domain Constants & Reference Data
- Algerian wilaya list: [frontend/src/constants/wilayas.ts](frontend/src/constants/wilayas.ts)
- Lab categories and activities: [frontend/src/constants/labData.ts](frontend/src/constants/labData.ts)
- Medical specialties and cancer types mapping: [frontend/src/constants/medicalData.ts](frontend/src/constants/medicalData.ts)
- Structured lab result templates (numeric, grouped, IHC, FISH, imaging, etc.): [frontend/src/constants/resultTemplates.ts](frontend/src/constants/resultTemplates.ts)

## UX / Theming
- Light/dark theme variables and UI utility classes in global stylesheet: [frontend/src/index.css](frontend/src/index.css)
- Login/register gradient styling and shared input patterns in same stylesheet

## Notes / Observations
- Role gating is enforced at the routing layer and repeated within page logic (e.g., lab vs doctor access).
- Many clinical workflows are handled by rich modal forms and structured templates rather than free text.
- API interaction is centralized through a single Axios instance with auth interceptors.

---
Report generated from frontend source inspection only.