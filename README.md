# PrepAI – AI-Powered Placement Preparation Platform

<p align="center">
  <img src="prepai/public/favicon.svg" width="90" alt="PrepAI Logo">
</p>

<h3 align="center">Prepare Smarter. Practice Better. Get Hired.</h3>

<p align="center">
  An AI-powered career preparation platform designed to help students and freshers prepare for placements, technical interviews, coding assessments, and professional opportunities.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black">
  <img src="https://img.shields.io/badge/Vite-Build-646CFF?style=for-the-badge&logo=vite&logoColor=white">
  <img src="https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white">
  <img src="https://img.shields.io/badge/AI-Gemini-4285F4?style=for-the-badge&logo=google&logoColor=white">
</p>

---

## About the Project

**PrepAI** is an intelligent placement preparation platform that helps students and freshers organize their entire job preparation journey in one place.

Traditional placement preparation often requires students to switch between multiple platforms for resume building, coding practice, interview preparation, learning resources, and progress tracking.

PrepAI aims to simplify this process by bringing these activities together through an AI-powered workspace.

The platform analyzes career-related information, generates personalized preparation guidance, provides coding practice, and helps users track their learning progress.

## ✨ Key Features

### 1. AI Resume Analysis
- Upload your resume for AI-powered analysis.
- Identify strengths and weaknesses.
- Receive suggestions to improve your resume.
- Understand how your profile aligns with career opportunities.

### 2. Personalized Preparation Roadmap
- Generate structured learning roadmaps.
- Organize preparation according to career goals.
- Identify important skills and learning areas.
- Follow a planned preparation journey.

### 3. DSA & Coding Practice
- Practice programming and data structure questions.
- Solve coding challenges within the platform.
- Improve problem-solving skills.
- Prepare for technical coding assessments.

### 4. AI Mock Interviews
- Practice interview questions.
- Prepare for technical and HR interviews.
- Receive AI-assisted interview guidance.
- Improve confidence and communication.

### 5. Performance Analytics
- Monitor preparation activities.
- Review learning progress.
- Identify areas that need improvement.
- Track your overall preparation journey.

### 6. Progress Tracking
- Maintain preparation-related information.
- Access previously saved activities.
- Continue preparation from where you left off.

### 7. Authentication & User Management
- User authentication.
- Protected application features.
- User-specific preparation experience.

---

## Technology Stack

| Technology | Purpose |
|---|---|
| React.js | Frontend development |
| Vite | Development server and build tool |
| Tailwind CSS | Responsive UI styling |
| JavaScript | Application functionality |
| Google Gemini API | AI-powered assistance |
| Supabase | Database and backend services |
| HTML5 | Application structure |
| CSS3 | Custom styling |
| Lucide Icons | Interface icons |

---

## 📂 Project Structure

```text
PrepAI/
│
├── decision/
│   ├── README.md
│   ├── adrs.md
│   ├── tech-stack-justifications.md
│   └── tradeoffs-and-future-roadmap.md
│
├── design/
│   ├── README.md
│   ├── components-design.md
│   ├── database-and-state-design.md
│   ├── engines-and-algorithms.md
│   ├── system-architecture.md
│   └── ui-ux-design-system.md
│
├── prepai/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── db/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   │
│   ├── documentation/
│   ├── scripts/
│   ├── .env.example
│   ├── package.json
│   ├── index.html
│   └── vite.config.js
│
└── README.md
```

---

## ⚙️ Installation & Setup

Follow these steps to run PrepAI locally.

### Prerequisites

Make sure you have installed:

- Node.js
- npm
- Git
- A code editor (VS Code recommended)

### Step 1: Clone the Repository

```bash
git clone https://github.com/princeverma-oos/PrepAI.git
```

### Step 2: Navigate to the Application

```bash
cd PrepAI/prepai
```

### Step 3: Install Dependencies

```bash
npm install
```

### Step 4: Configure Environment Variables

Create a `.env` file using the provided example:

```bash
cp .env.example .env
```

For Windows PowerShell, you can use:

```powershell
Copy-Item .env.example .env
```

Add your required API credentials and service configuration to `.env`.

Never upload your actual API keys, passwords, or secrets to GitHub.

### Step 5: Start the Development Server

```bash
npm run dev
```

Open the local URL displayed in your terminal, usually:

```text
http://localhost:5173
```

---

## Project Goals

PrepAI is developed with the following objectives:

- Make placement preparation more organized and accessible.
- Reduce the time students spend switching between preparation platforms.
- Provide AI-assisted personalized learning guidance.
- Improve technical interview and coding preparation.
- Help students understand their strengths and weaknesses.
- Encourage consistent preparation through progress tracking.

---

## Future Enhancements

Potential future improvements include:

- Advanced AI-powered resume scoring.
- Job description and resume matching.
- Company-specific interview preparation.
- Real-time AI interview simulations.
- More programming languages for coding practice.
- Advanced placement analytics.
- Personalized learning recommendations.
- Job and internship opportunity integration.

---

## Documentation

Additional technical and design documentation is available in the repository:

- `decision/` – Technical decisions and technology justifications.
- `design/` – System architecture, database design, UI/UX, and algorithms.
- `prepai/documentation/` – Technical and product documentation.

---

## Developer

**Prince Verma**

Aspiring Software Developer | Full Stack Developer | Problem Solver

GitHub: [@princeverma-oos](https://github.com/princeverma-oos)

Project: [PrepAI](https://github.com/princeverma-oos/PrepAI)

---

## License

This project is currently developed for educational and portfolio purposes.

---

<p align="center">
  <b>PrepAI – Your Preparation, Your Progress, Your Future. 🚀</b>
</p>
