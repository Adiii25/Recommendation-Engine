# Academic Pathway Recommendation Engine

## Overview

The Academic Pathway Recommendation Engine is a web application that helps users discover suitable academic pathways based on their qualifications, work experience, profession, and career goals.

The system collects user information, generates recommendations, stores submissions in a database, and provides an admin dashboard to manage records.

---

## Features

### User Features
- Submit academic and professional details
- Receive personalized academic pathway recommendations
- Responsive and user-friendly interface
- Form validation
- Loading states during recommendation generation

### Admin Features
- View all submissions
- Delete submissions
- View submission dates
- View total submission count

---

## Recommendation Logic

Recommendations are generated using qualification and experience-based rules.

Examples:

- 12th Pass → Certification Program
- Diploma Holder → Advanced Certification Program
- Bachelor's Degree + Experience → MBA
- Master's Degree + 5+ Years Experience → PhD
- 15+ Years Experience → Honorary Doctorate

---

## Tech Stack

### Frontend
- React
- Vite
- Tailwind CSS
- Axios
- React Router

### Backend
- Node.js
- Express.js

### Database
- Supabase

### Deployment
- Vercel (Frontend)
- Render (Backend)

---

## Project Structure

```text
academic-pathway-recommendation/

├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── server.js
│   ├── supabase.js
│   ├── .env
│   └── package.json
│
└── README.md
```

---

## Installation

### Clone Repository

```bash
git clone <repository-url>
cd academic-pathway-recommendation
```

---

### Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

Runs on:

```text
http://localhost:5173
```

---

### Backend Setup

```bash
cd backend

npm install

node server.js
```

Runs on:

```text
http://localhost:5000
```

---

## Environment Variables

Create a `.env` file inside the backend folder:

```env
SUPABASE_URL=YOUR_SUPABASE_URL
SUPABASE_KEY=YOUR_SUPABASE_KEY
PORT=5000
```

---

## API Endpoints

### Submit User Data

```http
POST /submit
```

### Get All Submissions

```http
GET /submissions
```

### Delete Submission

```http
DELETE /submissions/:id
```

---

## Future Improvements

- AI/ML-based recommendation engine
- User authentication
- Recommendation history
- Export submissions to CSV
- Analytics dashboard

---

## Author

Aditya Naruka
