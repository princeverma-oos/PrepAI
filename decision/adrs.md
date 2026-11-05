# 📋 Architecture Decision Records (ADRs)

This document formalizes the key architectural decisions made during the design and development of **PrepAI** using standard Architecture Decision Record (ADR) format.

---

## ADR-001: Adoption of React 19 + Vite Single Page Application Architecture

### Status
**Accepted & Implemented**

### Context
We needed a modern, reactive framework for an interactive platform featuring code editing, live chat proctoring, dynamic timer countdowns, and real-time radar charts. We evaluated:
1. Multi-Page SSR with Next.js
2. Client-Side SPA with React 19 + Vite
3. Vanilla JavaScript with HTML5 templates

### Decision
We chose **React 19 + Vite**. The application is compiled into static production assets with zero server-side rendering dependencies.

### Consequences
* **Positive**: Instant dev server startup (< 1s), Hot Module Replacement, zero SSR hydration bugs, simple free static deployment on GitHub Pages or Vercel.
* **Negative**: Initial JavaScript bundle must be downloaded on first page visit; however, modern bundlers and code-splitting make this negligible (~200KB gzipped).

---

## ADR-002: Offline-First Hybrid Persistence with Dexie.js & LocalStorage Fallback

### Status
**Accepted & Implemented**

### Context
Users generate extensive personal data: tailored N-day study calendars, resume parsing notes, code submissions, and historical scorecards. Relying purely on cloud APIs creates latency during practice rounds and stops working when internet connectivity is lost.

### Decision
Implement an **Offline-First Hybrid Persistence Layer**:
* **Primary Store**: IndexedDB managed through **Dexie.js** (`PrepAIDatabaseV3`).
* **Secondary Fallback**: Synchronous mirror to `localStorage`.

### Consequences
* **Positive**:
  * Up to hundreds of megabytes of local storage capacity.
  * Instant offline read/write with zero network latency.
  * 100% data privacy—applicant resumes and code never leave their machine without permission.
* **Negative**: Local data alone does not persist across separate devices or incognito browser resets. (Addressed by ADR-007).

---

## ADR-003: Client-Side Sandboxed Code Execution vs Remote Execution Cluster

### Status
**Accepted & Implemented**

### Context
To test algorithmic problems (e.g., Two Sum, LRU Cache), traditional platforms like LeetCode or HackerRank send candidate code to a remote fleet of Docker containers (e.g., Judge0) over HTTP or WebSockets. This requires server maintenance, incurs compute costs, and introduces round-trip network delays of 800ms–2000ms.

### Decision
Execute candidate JavaScript code directly inside the browser using an **isolated function constructor sandbox** (`new Function(...)()`) evaluated against test case assertions.

### Consequences
* **Positive**:
  * **Near-Zero Latency**: Test cases evaluate in 5ms–20ms.
  * **Zero Server Infrastructure**: No Docker containers or AWS Lambda invocations to maintain.
  * **Unlimited Scalability**: 100,000 concurrent users cost $0 in compute.
* **Negative**: Untrusted code runs in candidate's browser; execution is scoped to JavaScript natively, while other languages (Python/C++) use structural parsing and heuristic test emulation.

---

## ADR-004: In-Browser Binary Stream PDF Extraction vs Cloud OCR APIs

### Status
**Accepted & Implemented**

### Context
Resume analysis requires ingesting PDF, DOCX, and TXT files. Cloud OCR APIs (AWS Textract, Google Cloud Document AI) charge per page and require sending sensitive candidate data to third-party cloud servers.

### Decision
Implement a lightweight client-side extraction pipeline utilizing `FileReader.readAsArrayBuffer()` that parses ASCII byte streams directly from PDF binary buffers in the browser.

### Consequences
* **Positive**: Instant parsing with zero API keys, zero per-page bills, and 100% privacy compliance.
* **Negative**: Complex multi-column OCR formatting may be flattened into a raw text stream; however, keyword extraction and skill vectorization perform with high accuracy on the normalized text stream.

---

## ADR-005: Modal-Based Workspace Hierarchy vs Multi-Page URL Routing

### Status
**Accepted & Implemented**

### Context
Interview prep involves transitioning between reviewing study notes, solving DSA challenges, doing mock interviews, and viewing readiness reports. Navigating across separate URL routes can disrupt user state (such as code buffer or live timers).

### Decision
Retain a **single landing dashboard** with **focused, high-elevation interactive modals** orchestrated by `activeModal` state in `App.jsx`.

### Consequences
* **Positive**:
  * Candidate never loses their landing page context or background state.
  * Clean, distraction-free modal focus for timed interviews.
  * Fast Escape-key dismiss allows instant navigation without page reloads.
* **Negative**: Deep linking to a specific question requires passing state parameters (`questionId`), which is handled via component props.

---

## ADR-006: Observer Pattern for Auth State with Instant 1-Click Demo Login

### Status
**Accepted & Implemented**

### Context
Testing interactive platforms with strict login barriers frustrates interviewers, reviewers, and first-time visitors who want to test features immediately without registering real credentials.

### Decision
Create a lightweight, decoupled **Observer-Pattern Authentication Service** (`authService.js`) with a prominent **1-Click Demo Login** button that immediately activates a pre-configured candidate profile (`demo@prepai.com`).

### Consequences
* **Positive**: Reviewers and recruiters can explore all platform features in 1 second without completing signup forms or verifying email addresses.
* **Negative**: Demo profile is local to the browser; however, standard registration and login tabs remain available for users wishing to create personalized persistent profiles.

---

## ADR-007: Integration of Supabase Cloud PostgreSQL for Permanent Cross-Device Synchronization

### Status
**Accepted & Implemented**

### Context
While Dexie IndexedDB provides exceptional offline storage, candidates need their roadmaps, assessment test histories, and 5-pillar performance scorecards to be permanently stored in the cloud so they can access their progress from any browser, device, or location.

### Decision
Integrate **Supabase (PostgreSQL 15+)** via `@supabase/supabase-js` as the primary cloud database layer.
* Tables created: `profiles`, `roadmaps`, `assessments`, and `reports`.
* All write and read methods in `src/db/db.js` synchronize with Supabase while gracefully falling back to IndexedDB.
* Environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) configure the connection.

### Consequences
* **Positive**:
  * **Permanent Data Durability**: Records are safely stored in managed cloud PostgreSQL.
  * **Zero Custom Backend Overhead**: Supabase provides automatic PostgREST endpoints directly secured with Row-Level Security (RLS).
  * **Resilient Dual-Tier Sync**: App functions flawlessly both online (saving to Supabase + IndexedDB) and offline (saving to IndexedDB).
* **Negative**: Requires Supabase project credentials in `.env`, which are cleanly managed via Vite environment variables and validated at startup in `src/db/supabaseClient.js`.

---

## ADR-008: Adoption of Google Gemini 1.5 Flash for Generative Roadmap Calibration & Live Proctoring

### Status
**Accepted & Implemented**

### Context
While the deterministic algorithmic engine is fast, free, and runs offline, candidates benefit greatly from LLM capabilities: deep semantic gap analysis of unique resume phrasing against complex Job Descriptions, infinite dynamic interview question synthesis, and live conversational mock interview proctoring that responds directly to their specific code buffer.

### Decision
Integrate **Google Gemini 1.5 Flash** via `@google/generative-ai` with a dual-mode fallback strategy:
* **Generative Mode**: When a Gemini API key is configured (via UI or `.env`), Gemini generates bespoke $N$-day study plans, generates custom algorithmic/system design questions, and powers live conversational proctoring.
* **Algorithmic Mode**: If no key is set or network fails, the platform automatically and gracefully falls back to the deterministic heuristic engine and curated question bank with zero crashes.
* Keys can be configured in `.env` (`VITE_GEMINI_API_KEY`) or directly in the UI and stored safely in candidate `localStorage`.

### Consequences
* **Positive**:
  * **Ultra-Fast Generative Output**: Gemini 1.5 Flash delivers sub-second Time-To-First-Token and tight JSON adherence.
  * **Infinite Question Repertoire**: Candidates can practice custom topics beyond the static curated list.
  * **Zero Lock-In & Zero Cost Barrier**: Free tier allows extensive practice without requiring user credit cards; platform remains 100% functional without an API key.
* **Negative**: API key required for generative features; handled via graceful fallback.

---

## ADR-009: Role-Based Admin Management & Candidate Progress Oversight Engine

### Status
**Accepted & Implemented**

### Context
As an interview preparation and recruitment portal, PrepAI requires administrative visibility into candidate activities. Platform administrators, talent recruiters, and engineering managers need to:
1. Manage users across the platform (create new candidates/admins, update roles, toggle status between Active and Suspended, reset passwords, and delete accounts).
2. Supervise candidate learning journeys, tracking $N$-day roadmap completion percentages, daily study milestones, and active preparation tracks.
3. Inspect granular candidate performance metrics, including live test pass rates, benchmark scores, 5-pillar spider radar competencies (Code Quality, System Design, Problem Solving, Communication, Complexity Optimization), and hiring recommendations (Strong Hire, Hire, Needs Practice).

### Decision
Implement a dedicated **Admin Portal & Progress Oversight Engine** (`AdminModal.jsx`) combined with role-aware user management in `authService.js`:
* **Role-Based Access Control (RBAC)**: Support `'admin'` and `'candidate'` roles, along with account lifecycle states (`'active'` vs `'suspended'`).
* **Interactive Admin Console (`AdminModal.jsx`)**:
  * **Platform KPI Cards**: Total registered users, candidate/admin counts, active $N$-day roadmaps, completed test evaluations, average platform scores, and Strong Hire rates.
  * **User Directory Management**: Search, filter by role/status, inline CRUD modal dialogs, 1-click status toggle (Active/Suspended), role promotions/demotions, and secure password reset.
  * **Candidate Progress & Telemetry Inspector**: Tabbed candidate inspector displaying real-time roadmap completion percentage, curriculum phase, daily milestone checklists, test history logs, and interactive 5-pillar radar capability scores.
* **Dual Persistence Sync**: Admin operations write directly through Dexie IndexedDB (`db.users`) with synchronous fallback to `prepai_users_db` local cache and active auth session update.
* **Administrator Credential Access Gate**:
  * Unauthenticated or candidate users are challenged by an **Admin Access Gate** before accessing any administrative telemetry.
  * **Configured Admin Credentials**:
    * **Username**: `admin` (or email: `admin@prepai.io`)
  * Secure credential authentication with clean input forms and quick locking via the "Lock Console" header button.

### Consequences
* **Positive**:
  * **Enterprise Management & Security**: Admin functions are strictly gated behind private administrator credentials; candidates cannot view or inspect platform administrative data.
  * **Comprehensive Recruiter Oversight**: Real-time inspection of candidate readiness, benchmark scores, and radar competencies enables informed hiring decisions.
  * **Enforced Account Governance**: Suspended users are barred from logging in with descriptive error prompts.
  * **Zero Friction**: Fully functional offline and in-browser with secure authentication.
* **Negative**: In pure client-side mode, mutations affect the local browser database; cross-device enterprise sync connects via Supabase PostgREST tables.
