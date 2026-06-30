# Conversational SHL Assessment Recommender & Playground

An interactive, full-stack conversational web application that guides hiring managers to discover, compare, and simulate candidate benchmarks using the official **SHL Individual Test Solutions catalog**. Powered by a secure, server-side integration of **Gemini 2.5 Flash** using the modern `@google/genai` SDK, this application ensures high-fidelity product suggestions, absolute compliance, and an intuitive user experience.

---

## 🌟 Key Features

### 1. Conversational Playground
* **Adaptive Dialog**: Interact naturally with an AI assistant trained on the official SHL test catalog.
* **Smart Guidance**: The assistant proactively asks clarifying questions regarding roles, experience levels, and competencies rather than jumping directly to recommendations on vague inquiries.
* **Micro-Interactions**: Features instant message copying and helpful/unhelpful feedback logs.

### 2. Live-Tuning Adjuster
* **Response Styles**: Dynamically alter the assistant's tone with immediate system-level injections:
  * **Concise**: For brief, highly summarized, bulleted checklists.
  * **Balanced**: Standard professional, supportive advisory.
  * **Deep & Technical**: Elaborates on design methodologies (e.g., forced-choice ipsative vs. normative structures, faking prevention, typical durations, and metric definitions).
* **Focus Priority**: Steer recommendations toward specific domains such as *General Fit*, *Cognitive & Analytical (C)*, *Technical & Skills (K)*, or *Personality & Culture (P/B)*.

### 3. Candidate Pass-Rate & Hurdle Simulator
* **Percentile Cutoff Slider**: Interactively set recruitment cutoff benchmarks (from 30th to 95th percentile).
* **Normal Distribution Visualization**: Render an elegant, custom area-chart using **Recharts** highlighting "Fails Cut-off" vs. "Selected Candidates" cohorts based on simulated applicant distributions.
* **Recruitment Metrics**: Instantly calculate the estimated applicant pass rate, overall testing fatigue, drop-off risk warnings, and actionable hiring manager next steps.

### 4. Interactive Catalog & Side-by-Side Matrix
* **Unified Browse**: Easily search and filter the full catalog of 20+ SHL Individual Test Solutions by type (Knowledge, Personality, Cognitive, Behavioral).
* **Comparison Matrix**: Compare up to 3 tests side-by-side inside a responsive matrix table evaluating type, target roles, skills tested, product details, and official documentation links.

### 5. Multi-Layer Compliance Engine
* **Turn Cap Safeguard**: Caps conversations at a strict maximum of 8 turns (4 full question/answer exchanges) to ensure rapid convergence.
* **Strict Catalog Filter Guard**: Server-side normalization parses and matches model suggestions back against the official 20-product dictionary to completely eliminate AI hallucination.
* **Scope Restriction Shield**: Safely intercepts off-topic requests (e.g., requests for legal advice, resume writing, or custom interview questions) and gracefully refuses them.

---

## 🛠️ Technology Stack

* **Frontend**: React 19 (TypeScript), Vite 6, Tailwind CSS 4, Motion (formerly framer-motion)
* **Backend**: Node.js, Express (TypeScript) via `tsx`
* **Data Visualization**: Recharts (for fluid, responsive mathematical modeling)
* **AI Model**: Gemini 2.5 Flash via the modern official `@google/genai` TypeScript SDK
* **State Management**: React State with responsive context-based synchronized outcomes

---

## 📁 Directory Structure

```text
├── .env.example              # Template for required environment secrets
├── .gitignore                # Specifies intentionally untracked files to ignore
├── package.json              # App dependencies, engines, and run scripts
├── server.ts                 # Full-stack Express app serving Vite in dev and static files in production
├── tsconfig.json             # TypeScript compiler settings
├── vite.config.ts            # Vite server & bundler configuration
├── src/
│   ├── App.tsx               # Main application client entry, state controllers, and layout
│   ├── main.tsx              # React mounting file
│   ├── index.css             # Global CSS and Tailwind v4 imports
│   └── shl_catalog.ts        # Fully structured official SHL Individual Test Solutions catalog
```

---

## 🚀 Setup & Local Execution

### 1. Prerequisites
Ensure you have **Node.js (v18+)** and **npm** installed on your system.

### 2. Configure Secrets
Create a `.env` file in the root of your project directory based on `.env.example`:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

*Note: The app relies on `process.env.GEMINI_API_KEY` to run server-side inference. Never expose this key to the browser.*

### 3. Install Dependencies
Install all package configurations:
```bash
npm install
```

### 4. Run Development Server
Boot both the Express API and the Vite development hot-reloader concurrently on Port 3000:
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:3000`.

### 5. Production Build & Execution
To compile the TypeScript server and React application bundle for secure cloud deployment:

```bash
# Build static assets & bundle server using esbuild
npm run build

# Start production server
npm run start
```

---

## 🛡️ Key System Architecture & Security
* **Server-Side API Proxying**: The client never directly calls the Google Gemini endpoint or exposes the API token. Instead, all dialog events are forwarded through the Express server `/chat` and `/api/chat` routes.
* **Clean State Transitions**: State is fully modularized and responsive to window resizing using container-bound `ResponsiveContainer` nodes.
