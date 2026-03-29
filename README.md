<div align="center">

<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&size=32&duration=3000&pause=1000&color=6C47FF&center=true&vCenter=true&width=600&lines=PW+AI+Learning+Platform;Your+JEE+Command+Center;Powered+by+AI+%F0%9F%9A%80" alt="Typing SVG" />

<br/>

![Platform Banner](https://capsule-render.vercel.app/api?type=waving&color=6C47FF&height=200&section=header&text=PW%20AI%20Platform&fontSize=60&fontColor=ffffff&animation=fadeIn&fontAlignY=38&desc=Smarter%20Preparation.%20Faster%20Results.&descAlignY=60&descSize=20)

<br/>

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-pw--hackathon--eosin.vercel.app-6C47FF?style=for-the-badge&logoColor=white)](https://pw-hackathon-eosin.vercel.app)
[![Backend API](https://img.shields.io/badge/⚡_Backend_API-Railway-0B0D0E?style=for-the-badge&logo=railway&logoColor=white)](https://pwhackathon-production.up.railway.app)
[![GitHub](https://img.shields.io/badge/📁_Source_Code-GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Inexpert-trifler/PWHackathon)

<br/>

![Python](https://img.shields.io/badge/Python-3.13-3776AB?style=flat-square&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=flat-square&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?style=flat-square&logo=vite&logoColor=white)
![Groq](https://img.shields.io/badge/Groq-LLaMA_3.3_70B-FF6B35?style=flat-square&logoColor=white)
![AssemblyAI](https://img.shields.io/badge/AssemblyAI-Transcription-00C7B7?style=flat-square&logoColor=white)

</div>

---

## 🏆 Built for PW Hackathon 2026

> **Team Stack Masters** presents an AI-powered learning platform designed specifically for JEE aspirants. We built a full-stack intelligent system that solves doubts, analyzes lectures, generates mock tests, and creates personalized study plans — all powered by cutting-edge AI.

---

## ✨ Features at a Glance

<div align="center">

| Feature | Description | Tech Used |
|:---:|:---|:---:|
| 🧠 **AI Doubt Solver** | Get instant step-by-step solutions to any JEE problem | Groq LLaMA 3.3 |
| 🎥 **Lecture Analyzer** | Upload any video → AI transcribes + extracts topic timestamps | AssemblyAI + ffmpeg |
| 📝 **Mock Test Generator** | AI generates 20 MCQs with 5 difficulty levels + full analysis | Groq LLaMA 3.3 |
| 📅 **Study Planner** | Personalized daily roadmap based on your weak areas | Groq LLaMA 3.3 |
| 📊 **Performance Analyzer** | Track your progress with graphs and AI feedback | FastAPI + React |
| 🔍 **Lecture Search** | Search any concept across your lecture library | Custom Search API |

</div>

---

## 🎯 Problem Statement

JEE preparation is hard. Students face:

- ❌ **Doubt backlogs** — waiting hours for teachers to answer
- ❌ **Long lectures** — no way to jump to the exact topic
- ❌ **No feedback** — don't know which topics are actually weak
- ❌ **Generic plans** — one-size-fits-all study schedules

**We solved all of this with AI.** In under 30 seconds, a student can:
1. Get their doubt solved with full explanation
2. Upload a lecture and get timestamped topic breakdown
3. Take a custom AI MCQ test and get detailed feedback
4. Get a personalized study plan based on their weak areas

---

## 🚀 System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (Vercel)                     │
│              React + Vite + React Router                 │
│                                                          │
│  Dashboard → AskDoubt → LectureSearch → MockTest        │
│  StudyPlan → TestResults                                 │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTPS API Calls
                       ▼
┌─────────────────────────────────────────────────────────┐
│                   BACKEND (Railway)                      │
│              FastAPI + Python 3.13                       │
│                                                          │
│  /api/doubt      → AI Doubt Solver                      │
│  /api/lecture/*  → Video Upload + Transcription         │
│  /api/test/*     → MCQ Generation + Analysis            │
│  /api/plan       → Study Plan Generator                 │
│  /api/performance→ Performance Analyzer                 │
│  /api/search     → Lecture Search                       │
└──────────┬──────────────────┬───────────────────────────┘
           │                  │
           ▼                  ▼
    ┌─────────────┐   ┌──────────────┐
    │  Groq API   │   │ AssemblyAI   │
    │ LLaMA 3.3   │   │ Transcription│
    │   70B       │   │   API        │
    └─────────────┘   └──────────────┘
```

---

## 🎥 Feature Walkthrough

### 1. 🧠 AI Doubt Solver
Ask any JEE question — Physics, Chemistry, or Math — and get:
- ✅ Step-by-step explanation
- ✅ Formula and derivation
- ✅ Related topics to study

### 2. 🎥 Lecture Analyzer (Video → AI Transcript)
```
Upload .mp4 video
      ↓
ffmpeg extracts audio
      ↓
AssemblyAI transcribes speech to text
      ↓
Groq AI analyzes transcript
      ↓
Returns: Full transcript + Topic timestamps
```

### 3. 📝 AI Mock Test Generator
```
Student selects:
  - Topic (e.g. "Newton's Laws")
  - Questions (5 / 10 / 15 / 20)
  - Difficulty (🌱 Beginner → 💀 Expert)
        ↓
Groq AI generates MCQs
        ↓
Student attempts with live timer
        ↓
AI analyzes performance
        ↓
Returns: Score + Grade + Topic breakdown +
         Weak topics + AI feedback
```

### 4. 📊 Performance Analysis
After every test, get:
- 📈 Topic-wise bar graph
- ⚠️ Weak topic identification
- ✅ Strong topic highlights
- 🤖 Personalized AI feedback message
- 🏆 Grade (A+ to D)

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|-----------|---------|
| **FastAPI** | High-performance Python API framework |
| **Python 3.13** | Backend language |
| **Groq (LLaMA 3.3 70B)** | AI text generation — fast & free |
| **AssemblyAI** | Speech-to-text transcription |
| **ffmpeg** | Audio extraction from video files |
| **Pydantic** | Data validation and schemas |
| **python-dotenv** | Environment variable management |
| **Railway** | Backend deployment platform |

### Frontend
| Technology | Purpose |
|-----------|---------|
| **React 18** | UI framework |
| **Vite** | Build tool and dev server |
| **React Router v6** | Client-side routing |
| **Lucide React** | Icon library |
| **CSS Variables** | Theming system |
| **Vercel** | Frontend deployment platform |

---

## 📁 Project Structure

```
PWHackathon/
├── backend/
│   ├── routes/
│   │   ├── doubt.py          # AI Doubt Solver endpoint
│   │   ├── lecture.py        # Video upload + analysis
│   │   ├── test.py           # MCQ generation + analysis
│   │   ├── plan.py           # Study planner
│   │   ├── performance.py    # Performance analyzer
│   │   └── search.py         # Lecture search
│   ├── services/
│   │   ├── ai_service.py     # Groq AI integration
│   │   ├── ai_json_service.py# Error-safe JSON handling
│   │   ├── lecture_service.py# ffmpeg + AssemblyAI pipeline
│   │   └── search_service.py # Search logic
│   ├── temp/
│   │   ├── videos/           # Uploaded video storage
│   │   └── audios/           # Extracted audio storage
│   ├── main.py               # FastAPI app entry point
│   └── requirements.txt      # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx    # Navigation with streak popup
│   │   │   └── ResultCard.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx # Home with tip of the day
│   │   │   ├── AskDoubt.jsx  # Doubt solver UI
│   │   │   ├── LectureSearch.jsx # Search + Upload tabs
│   │   │   ├── MockTest.jsx  # MCQ test with timer
│   │   │   ├── TestResults.jsx # Results with graphs
│   │   │   └── StudyPlan.jsx # Study planner UI
│   │   ├── services/
│   │   │   └── api.js        # All API calls
│   │   └── App.jsx           # Routes configuration
│   ├── package.json
│   └── vite.config.js        # Vite + proxy config
├── .gitignore
├── railway.toml              # Railway deployment config
└── README.md
```

---

## ⚡ API Endpoints

| Method | Endpoint | Description |
|--------|---------|-------------|
| `GET` | `/api/doubt` | Solve a JEE doubt with AI |
| `POST` | `/api/lecture/upload` | Upload video → transcript + timestamps |
| `POST` | `/api/lecture/analyze-lecture` | Analyze text transcript |
| `POST` | `/api/test/generate` | Generate AI MCQ test |
| `POST` | `/api/test/analyze` | Analyze test answers |
| `GET` | `/api/plan` | Generate study plan |
| `GET/POST` | `/api/performance` | Analyze performance |
| `GET` | `/api/search` | Search lectures |

---

## 🚀 Local Setup

### Prerequisites
- Python 3.13+
- Node.js 18+
- ffmpeg installed
- Groq API key
- AssemblyAI API key

### Backend Setup

```bash
# Clone the repo
git clone https://github.com/Inexpert-trifler/PWHackathon.git
cd PWHackathon

# Create .env file in backend/
cat > backend/.env << EOF
GROQ_API_KEY=your_groq_key_here
ASSEMBLYAI_API_KEY=your_assemblyai_key_here
EOF

# Install dependencies
cd backend
pip install -r requirements.txt

# Run the backend
cd ..
uvicorn backend.main:app --reload
```

### Frontend Setup

```bash
# Install dependencies
cd frontend
npm install

# Create .env file
echo "VITE_API_BASE_URL=http://localhost:8000" > .env

# Run the frontend
npm run dev
```

Open `http://localhost:5173` 🎉

---

## 🌐 Deployment

| Service | Platform | URL |
|---------|---------|-----|
| Frontend | Vercel | [pw-hackathon-eosin.vercel.app](https://pw-hackathon-eosin.vercel.app) |
| Backend | Railway | [pwhackathon-production.up.railway.app](https://pwhackathon-production.up.railway.app) |

### Deploy Your Own

**Backend (Railway):**
1. Push code to GitHub
2. Connect repo to Railway
3. Set root directory: `backend`
4. Add env vars: `GROQ_API_KEY`, `ASSEMBLYAI_API_KEY`
5. Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

**Frontend (Vercel):**
1. Import GitHub repo to Vercel
2. Set root directory: `frontend`
3. Add env var: `VITE_API_BASE_URL=your_railway_url`
4. Deploy!

---

## 👥 Team

<div align="center">

### 🏆 Team Stack Masters

*Building smarter tools for smarter students.*

</div>

---

## 🎯 What Makes Us Different

| Feature | Traditional Apps | PW AI Platform |
|---------|----------------|----------------|
| Doubt solving | Wait for teacher | ⚡ Instant AI answer |
| Lecture study | Watch full video | 🎯 Jump to exact timestamp |
| Practice tests | Fixed question banks | 🤖 AI-generated custom MCQs |
| Performance tracking | Basic scores | 📊 Deep AI analysis + feedback |
| Study plans | Generic schedules | 🗓️ Personalized to weak areas |

---

## 📈 Impact

- ⚡ **< 30 seconds** to get any doubt solved
- 🎥 **Any video** can be analyzed for topics and timestamps
- 🧠 **Infinite tests** — AI generates unique questions every time
- 📊 **Real feedback** — not just scores, but actionable insights
- 🆓 **Free to use** — built on free-tier AI APIs

---

---

<div align="center">

<br/>

![divider](https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif)

<br/>

### 🏆 Team Stack Masters — PW Hackathon 2025

<br/>

| | |
|:---:|:---:|
| 🚀 **Live Platform** | [pw-hackathon-eosin.vercel.app](https://pw-hackathon-eosin.vercel.app) |
| ⚡ **Backend API** | [pwhackathon-production.up.railway.app](https://pwhackathon-production.up.railway.app) |
| 📁 **Source Code** | [github.com/Inexpert-trifler/PWHackathon](https://github.com/Inexpert-trifler/PWHackathon) |

<br/>

![divider](https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif)

<br/>

<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=16&duration=3000&pause=1000&color=6C47FF&center=true&vCenter=true&width=500&lines=Built+with+%E2%9D%A4%EF%B8%8F+by+Team+Stack+Masters;PW+Hackathon+2025;Smarter+Prep.+Faster+Results." alt="Footer Typing" />

<br/><br/>

[![Stars](https://img.shields.io/github/stars/Inexpert-trifler/PWHackathon?style=for-the-badge&logo=github&color=6C47FF)](https://github.com/Inexpert-trifler/PWHackathon)
[![Forks](https://img.shields.io/github/forks/Inexpert-trifler/PWHackathon?style=for-the-badge&logo=github&color=6C47FF)](https://github.com/Inexpert-trifler/PWHackathon/fork)
[![Issues](https://img.shields.io/github/issues/Inexpert-trifler/PWHackathon?style=for-the-badge&logo=github&color=6C47FF)](https://github.com/Inexpert-trifler/PWHackathon/issues)

<br/>

> *"The secret of getting ahead is getting started."*
> **— Start your JEE journey smarter with PW AI Platform** 🎯

<br/>

![Footer Wave](https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=150&section=footer&text=Stack%20Masters&fontSize=42&fontColor=fff&animation=twinkling&fontAlignY=65)

</div>
