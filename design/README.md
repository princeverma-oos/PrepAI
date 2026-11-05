# 🎨 PrepAI — Design Documentation Hub

Welcome to the **Design Documentation** for **PrepAI**, an AI-Powered Interview Preparation Platform. This directory contains detailed specifications covering system architecture, user interface & user experience (UI/UX) design systems, component blueprints, multi-tier data schema, and core algorithmic engines.

---

## 📑 Directory Navigation

| Document | Purpose & Key Topics |
| :--- | :--- |
| **[1. System Architecture](file:///c:/Users/Preety/OneDrive/Desktop/task%202/design/system-architecture.md)** | Multi-tier architecture (Supabase Cloud + IndexedDB local cache), client-side sandboxing, component interactions, and data flow pipelines. |
| **[2. UI/UX Design System](file:///c:/Users/Preety/OneDrive/Desktop/task%202/design/ui-ux-design-system.md)** | Color palette (slate/indigo/cyan neon theme), typography, glassmorphism tokens, micro-interactions, and accessibility standards. |
| **[3. Component & Modal Blueprint](file:///c:/Users/Preety/OneDrive/Desktop/task%202/design/components-design.md)** | Anatomy of all 15 core components and interactive modals (including `AdminModal.jsx` for User CRUD and Candidate Progress Oversight), state transitions, and responsive behavior. |
| **[4. Database & State Design](file:///c:/Users/Preety/OneDrive/Desktop/task%202/design/database-and-state-design.md)** | Multi-tier persistence: Supabase Cloud PostgreSQL schemas (`profiles`, `roadmaps`, `assessments`, `reports`), Dexie.js (IndexedDB), Role-Based User entity & progress telemetry schemas, and localStorage resilience layers. |
| **[5. Engines & Algorithms](file:///c:/Users/Preety/OneDrive/Desktop/task%202/design/engines-and-algorithms.md)** | Algorithmic specs for Resume Parsing, Roadmap Generation, Code Sandboxing, AI Rubrics, and Google Gemini 1.5 Flash Generative Engine. |

---

## 🎯 Design Philosophy & Core Principles

1. **Zero-Latency Client-Side Performance**  
   All heavy operations—resume parsing, roadmap generation, code evaluation, and administrative directory searches—run entirely client-side. The user never waits for remote queues or encounters cold-start server delays.
2. **Multi-Tier Persistence (Cloud + Offline-First)**  
   By combining Supabase Cloud PostgreSQL with Dexie.js (IndexedDB) and automatic `localStorage` dual-write fallbacks, users retain all roadmaps, code solutions, scorecards, user directory states, and profiles permanently across devices, with full offline resilience.
3. **Glassmorphism & Cyberpunk-Inspired Professional Aesthetics**  
   A high-contrast dark palette (`#0B0F19` deep slate base) accented with electric cyan (`#06B6D4`), violet indigo (`#6366F1`), and emerald (`#10B981`) provides a futuristic, focused environment tailored for software engineers.
4. **Accessible & Intuitive Modal Hierarchy & Admin Governance**  
   Every major activity (DSA practice, live mock interview, roadmap builder, performance report, admin user directory & progress inspector) is isolated in a focused modal with Escape-key dismiss, backdrop blur, and scroll-locking to minimize cognitive overload.
