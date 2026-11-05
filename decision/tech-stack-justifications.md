# 🛠️ Tech Stack Justifications & Comparative Analysis

## 1. Executive Summary Table

| Category | Chosen Technology | Primary Alternatives Considered | Why It Is Best for PrepAI |
| :--- | :--- | :--- | :--- |
| **Language** | **Modern JavaScript (ES Modules)** | TypeScript, Vanilla JS, Python | Ubiquitous runtime compatibility, zero compile friction, seamless execution of candidate code inside the same JS engine. |
| **Frontend Framework** | **React 19** | Next.js, Vue 3, Svelte 5 | Unmatched ecosystem for rich developer tooling (Framer Motion, Chart.js), concurrent rendering, zero SSR overhead for local tools. |
| **Build Tool & Bundler** | **Vite 8** | Create-React-App, Webpack, Parcel | Sub-second dev server boot, lightning Hot-Module Replacement (HMR), tree-shaken static production bundle. |
| **Styling & Design System** | **Tailwind CSS 3.4** | Vanilla CSS, Sass, Styled-Components, Tailwind v4 | Rapid utility-first styling, zero runtime CSS-in-JS overhead, predictable dark-mode utility classes, and custom glassmorphism. |
| **Cloud Database** | **Supabase (PostgreSQL 15+)** | Firebase Firestore, AWS DynamoDB, MongoDB Atlas | Real relational SQL power with JSONB support, instant PostgREST API with `@supabase/supabase-js` (no custom backend server needed), built-in Row-Level Security (RLS). |
| **AI & LLM Engine** | **Google Gemini 1.5 Flash (`@google/generative-ai`)** | OpenAI GPT-4o, Claude 3.5 Sonnet, Local Llama 3 | 1M token context window for huge resumes/JDs, sub-second latency, generous free tier, structured JSON schema compliance. |
| **Local Cache Database** | **Dexie.js (IndexedDB)** | Pure localStorage, WebSQL | 50MB+ client-side storage capacity for storing large resumes and code histories, indexed queries, zero cloud bills, offline-first. |
| **Motion & Animations** | **Framer Motion 13** | CSS Keyframes, GSAP, React Spring | Declarative layout animations, physics-based springs, `<AnimatePresence>` for seamless modal transitions. |
| **Analytics & Data Viz** | **Chart.js + react-chartjs-2** | D3.js, Recharts, Victory | Ultra-fast Canvas rendering, built-in radar/spider chart support for 5-pillar skill matrices, zero SVG DOM overhead. |
| **Iconography** | **Lucide React** | FontAwesome, Heroicons, Material Icons | Lightweight, tree-shakeable SVG icons, consistent 24px stroke weight, 100% customizable via Tailwind classes. |

---

## 2. In-Depth Justifications by Category

### A. Cloud Database: Supabase (PostgreSQL) vs Firebase vs AWS
* **The Decision**: Supabase with client-side `@supabase/supabase-js` SDK.
* **Why not Firebase (Firestore)?**
  * Firestore is a NoSQL document database where complex queries and data filtering require composite indexes and can become messy.
  * Supabase provides a full **PostgreSQL** database with native `JSONB` support, allowing relational integrity while effortlessly storing flexible schemas like `daily_plans` and `scorecard` objects.
  * Supabase uses open-source PostgreSQL standards without vendor lock-in; SQL schemas can be exported and migrated anywhere.
* **Why not a custom Express / Node.js backend server?**
  * Building an Express/NestJS backend would require hosting, maintenance, container orchestration, and increased latency.
  * Supabase's PostgREST API turns the PostgreSQL database into a secure REST API accessed directly through the public anonymous key using Row-Level Security (RLS).

### B. AI & LLM Engine: Google Gemini 1.5 Flash vs OpenAI GPT-4o vs Claude
* **The Decision**: Google Gemini 1.5 Flash via `@google/generative-ai` with structured JSON prompting.
* **Why not OpenAI (GPT-4o / GPT-3.5)?**
  * OpenAI requires paid credits and API keys with strict payment card setup, presenting a barrier to entry for candidates and open-source reviewers.
  * Google Gemini provides a generous free tier (15 requests per minute, 1,500 requests per day) allowing students and developers to practice for free.
* **Why Gemini 1.5 Flash over Claude or Local Llama?**
  * **1 Million Token Context Window**: Easily handles massive resumes (even 10+ pages) alongside extensive enterprise Job Descriptions without truncation.
  * **Speed**: Flash model is optimized for sub-second Time-To-First-Token, crucial for responsive conversational mock interview chat.
  * **Strict JSON Mode**: Formats complete syllabus schedules and coding problem structures without conversational fluff.

---

### C. Language: Modern JavaScript (ES2023+ / ESM)
* **The Decision**: Native JavaScript utilizing ES Modules, asynchronous promises, and modern browser APIs.
* **Why it's best for this task**:
  1. **Direct Code Execution Parity**: Candidate DSA solutions are evaluated client-side in JavaScript. Using JavaScript as the host platform eliminates foreign-function interface (FFI) overhead. Candidate algorithms run directly in the host V8/SpiderMonkey engine.
  2. **Zero Compilation Lag**: Developers can tweak roadmap logic or scoring heuristics without waiting for transpilation pipelines.
  3. **Standard Web API Access**: Direct access to `FileReader`, `ArrayBuffer`, `performance.now()`, and native Speech Synthesis without type-wrapper friction.

---

### C. UI Framework: React 19
* **The Decision**: React 19 utilizing functional components and hooks (`useState`, `useEffect`, `useRef`).
* **Why not Next.js?**
  * Next.js introduces Server-Side Rendering (SSR) and edge functions. PrepAI is an interactive developer tool that relies on browser-only capabilities (`IndexedDB`, `FileReader`, audio synthesis, canvas). SSR causes hydration errors when accessing browser-specific globals like `window` or `navigator`.
  * Next.js requires a running Node.js server or Vercel serverless functions, increasing hosting costs. React 19 SPA compiles to static HTML/JS/CSS that can be hosted for free anywhere (GitHub Pages, Vercel, Netlify, or local offline USB drives).
* **Why React 19 over Svelte or Vue?**
  * React has the largest ecosystem for UI extensions, specifically `lucide-react`, `framer-motion`, and `react-chartjs-2`.

---

### D. Build Tool: Vite 8
* **The Decision**: Vite powered by ES modules and Rollup/Rolldown.
* **Why not Create-React-App or Webpack?**
  * CRA is deprecated, slow to start, and bundles outdated packages.
  * Webpack re-bundles the entire module graph on every file change.
  * Vite provides **instant dev server startup (< 1 second)** and updates changed modules instantaneously through native ESM.

---

### E. Persistence Layer: Dexie.js (IndexedDB)
* **The Decision**: Dexie.js wrapping native browser IndexedDB with dual-write fallback to `localStorage`.
* **Why Dexie over pure `localStorage`?**
  * `localStorage` is strictly limited to 5MB and is synchronous (can freeze the UI thread on large write operations).
  * `localStorage` only stores strings and lacks indexing.
  * Dexie provides indexed queries (e.g., `db.roadmaps.orderBy('id').reverse().first()`) and can store tens of megabytes of test outputs and resume texts without breaking a sweat.

---

### F. Animation Engine: Framer Motion
* **The Decision**: Framer Motion 13.
* **Why not pure CSS animations?**
  * While CSS transitions are lightweight, they cannot cleanly animate component *unmounting* from the DOM. Framer Motion’s `<AnimatePresence>` ensures modal backdrops fade out gracefully before being removed from the React virtual DOM.
  * Provides physics-based spring physics (`stiffness`, `damping`) that make modals and button clicks feel tactile and premium.

---

### G. Charting Engine: Chart.js
* **The Decision**: Chart.js 4 + react-chartjs-2.
* **Why not D3.js or Recharts?**
  * Recharts uses SVG DOM nodes. Rendering hundreds of SVG DOM nodes inside a modal can cause frame drops during animations.
  * Chart.js uses the HTML5 `<canvas>` element, which renders complex multi-dimensional radar charts in a single draw call with hardware acceleration.
  * D3.js is too low-level, requiring hundreds of lines of boilerplate just to render a radar grid. Chart.js provides out-of-the-box responsive radar charts with customizable tooltips and fills.
