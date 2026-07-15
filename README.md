# FanMate 2026 — AI-Powered Stadium Companion

> A GenAI-powered web app for FIFA World Cup 2026 fans, volunteers, and organizers.  
> Built with React + Vite, powered by Google Gemini AI.

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![Gemini](https://img.shields.io/badge/Gemini_AI-2.0_Flash-4285F4?logo=google)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 🎯 Features

### 1. 🧭 Stadium Navigation Chatbot
Ask natural-language questions about getting around the stadium. The AI uses a fixed stadium map JSON to give step-by-step directions with estimated walking times.

### 2. 👥 Crowd Alert Generator
View real-time zone occupancy bars and generate AI-powered congestion warnings with alternate route suggestions for staff and volunteers.

### 3. 📋 Organizer Dashboard
Review incident logs in a severity-coded table and generate AI-powered prioritized summaries with staffing recommendations.

### 4. 🌐 Multilingual Toggle
Switch between 7 languages (English, Spanish, French, Arabic, Portuguese, Japanese, Hindi). All AI outputs are regenerated in the selected language.

### 5. ♿ Accessibility Mode
Toggle larger text and simplified language. AI responses are generated with shorter sentences and simpler vocabulary.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- A Google Gemini API key ([get one free](https://aistudio.google.com/apikey))

### Setup

```bash
# 1. Clone and install
cd fanmate-2026
npm install

# 2. Configure your API key
cp .env.example .env
# Edit .env and add your Gemini API key:
# VITE_GEMINI_API_KEY=your_actual_key_here

# 3. Start the dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🤖 GenAI Usage

### Model
- **Google Gemini 2.0 Flash** (`gemini-2.0-flash`)
- Chosen for: fast response times, strong multilingual support, cost-effective free tier
- API client: `@google/genai` npm package

### API Key
- Stored in environment variable `VITE_GEMINI_API_KEY`
- **Never hardcoded** — loaded via Vite's `import.meta.env`
- Template provided in `.env.example`

### AI Calls & Sample Prompts

All AI calls flow through a single `generateText()` function in `src/services/geminiClient.js` that handles input validation, timeouts, and error catching.

#### 1. Navigation Chatbot (`src/services/navigationService.js`)
**Purpose**: Generate step-by-step walking directions within the stadium.

**Sample prompt** (simplified):
```
You are a friendly stadium navigation assistant for the FIFA World Cup 2026 at MetLife Stadium.

STADIUM MAP DATA:
{...full stadium JSON with zones, facilities, and paths...}

FAN'S QUESTION: "How do I get from Gate A to the food court?"

INSTRUCTIONS:
- Provide step-by-step walking directions based on the stadium map data above.
- Include estimated walking time for each segment and total time.
- Respond in English.
```

#### 2. Crowd Alert Generator (`src/services/crowdAlertService.js`)
**Purpose**: Analyze zone occupancy and produce congestion warnings with alternate routes.

**Sample prompt** (simplified):
```
You are a stadium crowd management analyst for the FIFA World Cup 2026.

CURRENT ZONE OCCUPANCY DATA:
Gate A (North): 92% (4600/5000, trend: rising)
Gate B (East): 45% (2250/5000, trend: stable)
...

INSTRUCTIONS:
- Identify zones above 80% capacity
- Generate: ALERT SUMMARY, CRITICAL ZONES, ALTERNATE ROUTES, RECOMMENDED ACTIONS
```

#### 3. Incident Summarizer (`src/services/incidentService.js`)
**Purpose**: Prioritize incident logs and generate staffing recommendations.

**Sample prompt** (simplified):
```
You are a stadium operations analyst for the FIFA World Cup 2026.

CURRENT INCIDENT LOG:
[INC-001] Severity: HIGH | Type: medical | Zone: Lower Bowl - Section 114
Description: Fan collapsed, possible heat exhaustion...
[INC-002] Severity: CRITICAL | Type: crowd-control | Zone: Gate A (North)
Description: Approaching maximum capacity, crush risk...

INSTRUCTIONS:
- Produce: SITUATION OVERVIEW, PRIORITY RANKING, STAFFING RECOMMENDATIONS, IMMEDIATE ACTIONS
```

### Error Handling
Every AI call is wrapped with:
- **Input validation**: Rejects empty/too-long prompts
- **Timeout**: Aborts after 30 seconds
- **Error catching**: Returns user-friendly error messages instead of crashing
- **API key check**: Shows configuration warning if key is missing

---

## 🎯 Problem Statement Alignment Mapping

To ensure unambiguous alignment with the problem statement, here is how each required capability maps to the implementation:

- **Navigation**: `src/services/navigationService.js` (Turn-by-turn stadium directions with map context).
- **Crowd Management**: `src/services/crowdAlertService.js` and `CrowdAlert.jsx` (Zone occupancy monitoring and congestion alerts).
- **Accessibility**: `src/context/AppContext.jsx` (Global mode for simplified 6th-grade level text and visual enlargement).
- **Transportation & Sustainability**: `src/services/transportService.js` and `TransportCard.jsx` (Gate-specific transit advice and eco-tips).
- **Multilingual Support**: `src/context/AppContext.jsx` and UI selectors (Dynamic switching of AI prompts across 7 languages).
- **Operational Intelligence**: `src/services/incidentService.js` (Synthesizing raw log data into structured intelligence).
- **Real-time Decision Support**: `src/components/OrganizerDashboard.jsx` (Refreshable dynamic incident queue generating immediate staffing actions based on current reality).

---

## 🧪 Testing

Tests use **Vitest** + **React Testing Library** with mocked AI calls.

```bash
# Run all tests
npx vitest run

# Run tests in watch mode
npx vitest
```

### Test Coverage
- `navigation.test.jsx`: Rendering, input validation, AI response display, error handling, quick actions
- `crowdAlert.test.jsx`: Occupancy bar rendering, AI alert generation, loading states, ARIA attributes

---

## 📁 Project Structure

```
fanmate-2026/
├── index.html
├── .env.example              # API key template
├── vite.config.js             # Vite + Vitest config
├── src/
│   ├── main.jsx               # Entry point
│   ├── index.css              # Global design system
│   ├── App.jsx                # Root component with tab routing
│   ├── App.css                # App layout styles
│   ├── context/
│   │   └── AppContext.jsx     # Global state (language, accessibility)
│   ├── data/
│   │   ├── stadiumMap.js      # Fixed stadium layout JSON
│   │   ├── mockOccupancy.js   # Zone occupancy numbers
│   │   └── mockIncidents.js   # Incident log entries
│   ├── services/
│   │   ├── geminiClient.js    # Central Gemini API wrapper
│   │   ├── navigationService.js
│   │   ├── crowdAlertService.js
│   │   └── incidentService.js
│   ├── components/
│   │   ├── ErrorBoundary.jsx
│   │   ├── Header.jsx + .css
│   │   ├── NavigationChat.jsx + .css
│   │   ├── CrowdAlert.jsx + .css
│   │   └── OrganizerDashboard.jsx + .css
│   └── __tests__/
│       ├── setup.js
│       ├── navigation.test.jsx
│       └── crowdAlert.test.jsx
└── README.md
```

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| React 18 | UI framework |
| Vite | Build tool & dev server |
| Google Gemini 2.0 Flash | AI text generation |
| Vanilla CSS | Styling with custom properties |
| Vitest + RTL | Testing |

---

## 📝 License

MIT — Built for the FIFA World Cup 2026 hackathon.
