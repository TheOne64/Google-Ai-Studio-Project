# 🎓 SyllabusStudyRoad — Adaptive Academic Study Planner

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB.svg?logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC.svg?logo=tailwind-css)](https://tailwindcss.com/)
[![Gemini AI](https://img.shields.io/badge/Google_Gemini-3.8_Flash-8E75C4.svg?logo=google-gemini)](https://ai.google.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **Transform dense course syllabi into an automated, stress-free daily study roadmap with multimodal AI deadline extraction and smart backwards scheduling.**

---

## 🌟 Why This Project Stands Out

Most student planners require hours of manual date entry and treat deliverables as single panic-inducing deadlines. **SyllabusStudyRoad** solves this through automated intelligence and cognitive pacing:

1. **AI Syllabus Scanner**: Upload an image, screenshot, or text of your syllabus. Powered by **Google Gemini 3.8 Flash** with structured JSON output schemas, the system automatically extracts course codes, assessments, grade weightings, and due dates.
2. **Backwards Milestone Scheduling Algorithm**: Instead of cramming the night before, tasks are scheduled backwards from the deadline. The algorithm balances study intensity across your preferred study days (Casual, Balanced, or Intense) while respecting daily study hour limits.
3. **Peak Workload Intelligence**: The scheduler computes aggregate daily study volume across all courses and proactively warns students when a specific day exceeds healthy study thresholds, offering 1-click workload redistribution.
4. **Multi-Schedule Workspaces**: Isolate academic terms, competitive exams (MCAT, LSAT, GRE), or professional certifications into isolated roadmap environments.
5. **Identity Verification & Security Checkpoint**: Robust authentication featuring account existence checks, password validation, and a Two-Factor (2FA) Identity Verification step (passkey/biometric authorization and time-based passcodes).
6. **Zero-Trace Ephemeral Guest Mode**: Privacy-first preview session that operates entirely in memory without writing to persistent browser storage, preserving client resources.

---

## 🛠️ Tech Stack & Architecture

### Frontend
- **React 19 & TypeScript**: Declarative UI with strong type safety.
- **Tailwind CSS v4**: Utility-first responsive design with custom color palettes and accessible typography.
- **Lucide React**: Clean, modern iconography.
- **Vite 6**: Lightning-fast build tooling and module bundling.

### Backend & AI
- **Node.js & Express**: Full-stack API proxy routes and server-side logic.
- **Google GenAI SDK (`@google/genai`)**: Integration with `gemini-3.8-flash` utilizing multimodal prompt parts and strict JSON response schemas.
- **Full-Stack Development Server**: Express server running with integrated Vite middleware in development and static bundle serving in production.

---

## 📁 Project Structure

```
├── .env.example              # Environment variables template
├── index.html                # HTML entry point with metadata & SEO tags
├── metadata.json             # AI Studio applet capabilities & permissions
├── package.json              # Dependencies and build scripts
├── server.ts                 # Express backend & Gemini API endpoints
├── tsconfig.json             # TypeScript compiler settings
├── vite.config.ts            # Vite bundler & Tailwind configuration
└── src/
    ├── types.ts              # Core data models (User, Course, Assignment, Milestone)
    ├── App.tsx               # Root application coordinator & state management
    ├── main.tsx              # React DOM mounting
    ├── components/
    │   ├── AssignmentList.tsx          # Deliverable management & inline milestone editor
    │   ├── DashboardStats.tsx          # Real-time study statistics & workload spike alerts
    │   ├── EmailVerificationModal.tsx  # Magic link authentication & inbox launcher
    │   ├── IdentityVerificationModal.tsx # 2FA Identity checkpoint & passkey authorization
    │   ├── LoginScreen.tsx             # Tabbed auth portal (Sign In / Register / Guest)
    │   ├── OAuthModal.tsx              # Google, Microsoft 365 & Apple Single Sign-On
    │   ├── ProviderIcons.tsx           # Brand SVG icons
    │   ├── ScheduleModal.tsx           # Multi-schedule creation & template picker
    │   ├── ScheduleSelectorBar.tsx     # Active term switcher
    │   ├── ScheduleView.tsx            # Chronological daily roadmap timeline
    │   ├── SettingsPanel.tsx           # Study intensity, working days & pace configuration
    │   ├── SyllabusUpload.tsx          # Drag-and-drop file upload & AI scanner interface
    │   └── UserMenu.tsx                # User profile & account management dropdown
    └── utils/
        ├── authStorage.ts              # Account registry, credential verification & session storage
        └── scheduleGenerator.ts        # Backwards scheduling algorithm & date math utilities
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18 or higher recommended)
- **npm** or **bun**
- A **Gemini API Key** from [Google AI Studio](https://aistudio.google.com/)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/syllabus-study-road.git
   cd syllabus-study-road
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   ```bash
   cp .env.example .env
   ```
   Open `.env` and add your Gemini API key:
   ```env
   GEMINI_API_KEY="your_gemini_api_key_here"
   PORT=3000
   ```

4. **Run the Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. **Build for Production**:
   ```bash
   npm run build
   npm start
   ```

---

## 🔒 Security & Privacy Highlights

- **Identity Verification**: Passwords are authenticated before initiating the two-factor security checkpoint.
- **Account Verification**: Sign-in requires an existing registered account with the specified provider (Google, Microsoft, Apple, or Email).
- **Client Credential Isolation**: AI API keys are stored strictly server-side; client code never exposes API tokens.
- **Ephemeral Guest Sessions**: Guest accounts run strictly in RAM without persistent local disk writes.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

## Live Demo

Here is the published AI website I created [SyllabusStudyRoad](https://syllabus-planner-work-scheduler.ai.studio/).
