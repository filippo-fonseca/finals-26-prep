# Finals Prep

A minimal, zen-inspired study tracker for finals season. Built with Next.js, Firebase, and a lot of caffeine.

![Finals Prep](https://img.shields.io/badge/Spring-2026-7c3aed?style=flat-square)
![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=flat-square)

## Features

- **Daily View** — Scroll through your study plan day by day
- **Calendar View** — See the big picture at a glance
- **Task Management** — Create, edit, delete, and reschedule tasks
- **Progress Tracking** — Check off completed tasks with satisfying animations
- **Daily Notes** — Capture thoughts and reflections for each day
- **Real-time Sync** — Data syncs across devices via Firebase
- **Dark Mode** — Easy on the eyes during late-night study sessions
- **Overdue Alerts** — Visual indicators for missed tasks

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: Firebase Firestore
- **Auth**: Firebase Authentication (Google)
- **Font**: Louize (custom serif)

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your Firebase config to .env.local

# Run development server
npm run dev
```

## Environment Variables

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=
```

## Project Structure

```
src/
├── app/           # Next.js app router pages
├── components/    # React components
├── data/          # Schedule data and types
├── hooks/         # Custom React hooks
└── lib/           # Utilities and Firebase config
```

## Author

**Filippo Fonseca**

- Website: [filippofonseca.com](https://filippofonseca.com)
- LinkedIn: [filippo-fonseca](https://linkedin.com/in/filippo-fonseca)
- Email: [filippo.fonseca@yale.edu](mailto:filippo.fonseca@yale.edu)

---

Built at Yale, Spring 2026
