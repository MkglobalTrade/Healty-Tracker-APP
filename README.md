# VitaTrack - Your Personal Health Companion

A comprehensive health tracking application built with Next.js, React, and Tailwind CSS. Deploy seamlessly on Vercel.

![VitaTrack](https://img.shields.io/badge/VitaTrack-Health%20Tracker-0ea5e9)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![React](https://img.shields.io/badge/React-18-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue)

## Features

### Home Dashboard
- **At-a-glance health overview** with latest glucose, blood pressure, and medication status
- **Interactive charts** for glucose and blood pressure trends
- **Today's summary** with color-coded status indicators
- **Quick actions** for fast navigation to key features
- **7-day averages** and statistics

### Upload & Lab Results
- **Upload lab reports** via PDF or photo (drag & drop supported)
- **Auto-categorization** into 10 categories: Blood Work, Metabolic, Lipid, Thyroid, Vitamins, Hormones, Urinalysis, Imaging, Stelo CGM, and Other
- **Glucose tracking** with meal context (fasting, before/after meals, bedtime)
- **Stelo CGM photo upload** - capture screenshots from your Dexcom Stelo app
- **Smart status** classification (Normal, Elevated, High, Low)

### Blood Pressure
- **Daily BP logging** with systolic, diastolic, and pulse
- **ACC/AHA classification** (Normal, Elevated, Stage 1, Stage 2, Crisis)
- **Trend charts** showing 14-day history
- **Time-of-day tracking** (morning, afternoon, evening, night)

### Medications
- **Morning & Evening routines** with checkable lists
- **Flexible scheduling** (morning only, evening only, or both)
- **Dosage tracking** with notes
- **Daily compliance** visualization

### Dr. AI
- **Personal health chatbot** with awareness of your data
- **Context-aware responses** referencing your glucose, BP, medications, and labs
- **Suggested questions** for quick access
- **General health information** on glucose, BP, medications, labs, and longevity

### Health News
- **Curated articles** on longevity, breakthroughs, and health debates
- **Category filtering** (Breakthrough, Research, Technology, Neuroscience, Longevity)
- **Auto-refresh** capability

### PDF Export
- **Comprehensive health report** generation
- **30-day statistics** summary
- **Complete data export** including glucose, BP, medications, and labs
- **Print-ready format** for healthcare provider visits

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Hooks + localStorage
- **Database**: Prisma + SQLite (ready for production upgrade)
- **Charts**: Recharts
- **PDF Generation**: jsPDF
- **AI**: OpenAI GPT-4o-mini (optional, with fallback)

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- GitHub account
- Vercel account (free)

### Local Development

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/health-tracker.git
cd health-tracker

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Generate Prisma client
npm run db:generate

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Vercel Deployment

#### Option 1: GitHub Integration (Recommended)

1. **Push to GitHub**:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/health-tracker.git
git push -u origin main
```

2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Framework Preset: Next.js
   - Click "Deploy"

3. **Environment Variables** (Optional):
   - Go to Project Settings → Environment Variables
   - Add `OPENAI_API_KEY` for AI features (optional)
   - Add `DATABASE_URL` for server-side database (optional)

#### Option 2: Vercel CLI
```bash
npm i -g vercel
vercel
```

## Project Structure

```
health-tracker/
├── src/
│   ├── app/              # Next.js App Router pages
│   │   ├── page.tsx      # Home Dashboard
│   │   ├── upload/       # Lab & Sugar Upload
│   │   ├── blood-pressure/
│   │   ├── medications/
│   │   ├── dr-ai/        # AI Chat
│   │   ├── news/         # Health News
│   │   └── export/       # PDF Export
│   ├── components/       # React components
│   │   ├── ui/           # Base UI components
│   │   ├── Navigation.tsx
│   │   ├── BottomNav.tsx
│   │   ├── StatsCard.tsx
│   │   ├── HealthChart.tsx
│   │   └── QuickActions.tsx
│   ├── hooks/            # Custom React hooks
│   │   └── useHealthData.ts
│   ├── lib/              # Utilities
│   │   ├── utils.ts
│   │   ├── health-categories.ts
│   │   └── ai.ts
│   └── app/
│       ├── layout.tsx
│       └── globals.css
├── prisma/
│   └── schema.prisma     # Database schema
├── public/               # Static assets
├── package.json
├── next.config.js
├── tsconfig.json
└── tailwind.config.js
```

## Data Storage

By default, VitaTrack uses **localStorage** for browser persistence, making it fully functional without a backend.

For production with multiple devices or team access, enable the **Prisma database**:

1. Update `DATABASE_URL` in `.env.local`
2. Run `npm run db:push` to sync schema
3. Switch from localStorage to API calls in `useHealthData.ts`

## Customization

### Adding New Categories
Edit `src/lib/health-categories.ts` to add lab categories, meal types, or medication schedules.

### AI Features
The app works without an API key using built-in fallback responses. To enable GPT-4o-mini:

1. Get an OpenAI API key at [platform.openai.com](https://platform.openai.com)
2. Add `OPENAI_API_KEY` to your Vercel environment variables

### Theming
Modify `tailwind.config.js` to change colors, or edit `src/app/globals.css` for dark mode adjustments.

## Brilliant Ideas Included

- **Stelo CGM Integration**: Photo upload specifically designed for Dexcom Stelo continuous glucose monitor screenshots
- **Auto-Categorization**: Smart keyword detection categorizes lab reports automatically
- **Context-Aware AI**: Dr. AI knows your current health data when answering questions
- **Visual Health Status**: Color-coded indicators (green/yellow/red) for every reading
- **Time-of-Day Patterns**: Track how your body changes throughout the day
- **Export for Doctors**: One-click PDF generation for healthcare appointments
- **Medication Compliance**: Visual checkboxes with morning/evening split
- **Longevity Focus**: News section specifically curated for anti-aging and healthspan research
- **Offline First**: Works entirely in the browser without internet (except AI chat)
- **Responsive Design**: Mobile-first with bottom navigation, desktop-ready with sidebar

## License

MIT License - feel free to use for personal or commercial projects.

## Disclaimer

VitaTrack is a personal health tracker, not a medical device. Always consult healthcare professionals for diagnosis and treatment decisions. Dr. AI provides general information only and is not a substitute for professional medical advice.

---

Built with care for your health journey. Track smarter, live longer.
