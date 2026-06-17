# VitaTrack — Personal Health Companion

Track glucose (CGM), blood pressure, medications, and lab results; get offline AI-style insights, browse health news, and export a clean PDF/JSON report for your doctor. All data lives in your browser via `localStorage` (no backend, fully private).

Built with **Next.js 14 (App Router) + TypeScript + Tailwind CSS**. Ships as a **static export** (`out/`), deployable to Vercel, Netlify, GitHub Pages, or any static host.

## Quick start

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # produces ./out (static site)
```

## Deploy

- **Vercel:** import the repo — `vercel.json` is preconfigured (`outputDirectory: out`).
- **GitHub Pages / Netlify:** serve the `out/` folder.

## Notes on Dr. AI

The app is a static export, so there is no server to safely hold an API key. Dr. AI therefore runs on a deterministic offline knowledge base (works with zero config). To use a real LLM, remove `output: 'export'` from `next.config.js`, add an App Router API route that calls your provider server-side, and have `askDoctor()` fetch it — the key stays on the server.

## Stack

Next.js 14.2.35 · React 18 · TypeScript 5 · Tailwind 3 · recharts · jsPDF · date-fns · lucide-react
