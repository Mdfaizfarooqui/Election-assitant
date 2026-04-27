# ElectIQ — Election Process Assistant

> An interactive, AI-powered assistant that guides users through the democratic election process step-by-step — from voter registration to inauguration.

---

## 🗳️ Chosen Vertical

**Civic Education / Election Guide**

---

## 💡 Approach & Logic

ElectIQ breaks the election process into **8 sequential stages**, each with dedicated context, quick-action prompts, and AI-powered conversational answers:

| # | Stage | Description |
|---|-------|-------------|
| 1 | Voter Registration | Eligibility, sign-up, and deadlines |
| 2 | Candidate Filing | How candidates officially enter the race |
| 3 | Primary Elections | Party nominee selection process |
| 4 | Campaigning | Debates, funding, and voter outreach |
| 5 | Election Day | Polling, ID requirements, early/mail voting |
| 6 | Vote Counting | Ballot tallying and recount processes |
| 7 | Certification | Official result confirmation |
| 8 | Inauguration | Transfer of power and oath of office |

### Decision Logic

- Users can **navigate freely** between stages via the interactive sidebar timeline.
- **Quick-action prompts** are stage-aware — they change contextually for each stage.
- The **AI assistant** (Google Gemini) maintains full **multi-turn conversation history**, so follow-up questions are always understood in context.
- A **system instruction** keeps the AI non-partisan, factual, and focused on election topics.

---

## 🔧 How It Works

1. **Frontend**: Vanilla HTML + CSS + JavaScript, bundled with Vite.
2. **AI**: Google Gemini API (`gemini-2.0-flash`) via direct REST API calls from the browser.
3. **API Key**: Users enter their own Gemini API key via the sidebar UI. It is stored in `localStorage` — never sent to any backend.
4. **No Backend Required**: The app is fully static and can be hosted on any CDN.

---

## 🚀 Setup & Run

### Prerequisites
- Node.js 18+
- A free [Google Gemini API key](https://aistudio.google.com/app/apikey)

### Install & Start

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
```

---

## 🔑 Google Services Integration

| Service | Usage |
|---------|-------|
| **Google Gemini API** (`gemini-2.0-flash`) | Core AI engine powering all conversational answers |
| **Google Fonts** (Inter + Playfair Display) | Premium typography for the UI |

---

## 📐 Assumptions Made

- The default election context is the **US Federal Election** process. The AI can discuss other countries' systems if asked.
- Users provide their own Gemini API key (free tier is sufficient).
- The application is fully **client-side** — no server, no database, no user accounts required.
- Responses are limited to ~512 tokens per turn for a snappy user experience.

---

## ✅ Evaluation Areas Addressed

| Criterion | Implementation |
|-----------|----------------|
| **Code Quality** | Modular JS (`data.js`, `gemini.js`, `main.js`), clear separation of concerns |
| **Security** | API key stored only in `localStorage`, never logged or transmitted to a third party |
| **Efficiency** | Lightweight Vite bundle, no heavy frameworks, `gemini-2.0-flash` for fast responses |
| **Accessibility** | ARIA roles/labels, keyboard navigation, `aria-live` regions for screen readers |
| **Google Services** | Gemini AI + Google Fonts |

---

## 📁 Project Structure

```
election-assistant/
├── index.html          # App shell
├── vite.config.js      # Build config
├── package.json
├── .gitignore
├── README.md
└── src/
    ├── main.js         # App logic, event binding, chat
    ├── gemini.js       # Google Gemini API integration
    ├── data.js         # Stage data & system prompt
    └── style.css       # Full design system & UI
```
