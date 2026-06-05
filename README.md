# Ikonex Academy — Student Management System (Frontend)

Web interface for the Ikonex Academy Student Management System. Built with **React 19**, **Vite**, **Tailwind CSS**, and **React Router**.


## Tech Stack

- **Framework:** React 19
- **Build tool:** Vite 8
- **Styling:** Tailwind CSS 4
- **Routing:** React Router 7
- **HTTP client:** Axios
- **Notifications:** React Hot Toast
- **Icons:** React Icons

## Project Structure

```
frontend/src/
├── App.jsx                 # Layout, navigation, routes
├── config.js               # API base URL
├── components/
│   ├── Dashboard.jsx       # Overview & quick actions
│   ├── ClassStreamList.jsx # Class stream management
│   ├── StudentList.jsx     # Student listing & filtering
│   ├── StudentForm.jsx     # Register / edit student
│   ├── StudentDetails.jsx  # Student profile & performance
│   ├── SubjectList.jsx     # Subject management
│   ├── AssessmentForm.jsx  # Record assessment scores
│   ├── ClassPerformance.jsx# Rankings & report exports
│   ├── LoadingSpinner.jsx
│   ├── ErrorDisplay.jsx
│   └── EmptyState.jsx
└── index.css               # Global styles & utility classes
```

## Routes

| Path | Component | Description |
|------|-----------|-------------|
| `/` | Dashboard | Stats, quick actions, system status |
| `/students` | StudentList | All students with class filter |
| `/students/new` | StudentForm | Register new student |
| `/students/edit/:id` | StudentForm | Edit student |
| `/students/:id` | StudentDetails | Profile, scores, report card |
| `/classes` | ClassStreamList | Manage class streams |
| `/subjects` | SubjectList | Manage subjects |
| `/assessments` | AssessmentForm | Record CA & exam scores |
| `/performance/class/:classId` | ClassPerformance | Rankings & exports |

## Getting Started

### Prerequisites

- Node.js 18+
- Backend API running (see [backend README](../backend/README.md))

### Setup

```bash
cd frontend
npm install
```

Create a `.env` file:

```env
VITE_API_URL=http://localhost:5000/api
```

For production, point to the deployed backend:

```env
VITE_API_URL=https://school-system-backend-v8yw.onrender.com/api
```

### Run

```bash
# Development server (http://localhost:5173)
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

During local development, Vite proxies `/api` requests to the deployed backend (see `vite.config.js`).

## Deployment

The frontend is configured for **Vercel** deployment via `vercel.json`:

- Build command: `npm run build`
- Output directory: `dist`

Set `VITE_API_URL` to your production backend URL in the Vercel environment variables.

