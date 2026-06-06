# Ikonex Academy — Student Management System (Frontend)

Web interface for the Ikonex Academy Student Management System. Built with **React 19**, **Vite**, **Tailwind CSS**, and **React Router**.

## Features

| Area | Description |
|------|-------------|
| Dashboard | Summary stats, API health check, quick navigation |
| Student management | List, filter by class, register, edit, view performance & PDF report |
| Class streams | CRUD and subject assignment |
| Subjects | CRUD |
| Assessments | Record CA (0–30) and exam (0–70) scores per term |
| Class performance | Overall and per-subject rankings, PDF/CSV export |
| UI utilities | Loading spinners, error display, empty states, skeleton loaders |
| Responsive layout | Mobile hamburger navigation |

## Tech Stack

- **Framework:** React 19
- **Build tool:** Vite 8
- **Styling:** Tailwind CSS 4
- **Routing:** React Router 7
- **HTTP client:** Axios
- **Notifications:** React Hot Toast
- **Icons:** React Icons
- **Testing:** Vitest, React Testing Library, jsdom

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
│   ├── EmptyState.jsx
│   ├── SkeletonLoader.jsx  # Placeholder loading UI (table/card/text)
│   └── StudentForm.test.jsx
├── test/
│   └── setup.js            # Vitest + jest-dom matchers, cleanup
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
- Backend API running (see [backend README](https://github.com/m-alex-n/school-system-backend/))

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

## Testing

The frontend uses **Vitest** with **React Testing Library** and **jsdom**.

```bash
# Run tests once (CI-friendly)
npm run test:run

# Run tests in watch mode
npm test

# Run tests with Vitest UI
npm run test:ui
```

| Test file | Coverage |
|-----------|----------|
| `src/components/StudentForm.test.jsx` | Basic form render and submit button presence |

Test configuration lives in `vite.config.js` (`test.environment`, `test.setupFiles`).

## Linting

```bash
npm run lint
```

## Deployment

The frontend is configured for **Vercel** deployment via `vercel.json`:

- Build command: `npm run build`
- Output directory: `dist`

Set `VITE_API_URL` to your production backend URL in the Vercel environment variables.

