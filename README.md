# Mikail Kocak — Health Command Center

Personal health tracking app: lab upload with AI extraction (photo/PDF), glucose & blood
pressure trend charts with green/yellow/red status, medication schedule (day/night),
full history with downloadable report, AI Doctor chat, and health news (longevity,
glucose, cardio) refreshed every 3 hours.

## Deploy to Vercel (step by step)

1. **GitHub** — create a new repository (e.g. `mikail-health-tracker`) and upload ALL
   files in this folder, keeping the folder structure (`src/`, `api/`, etc.).
   You can drag-and-drop on github.com -> "Add file" -> "Upload files".

2. **Vercel** — go to vercel.com -> "Add New" -> "Project" -> Import the GitHub repo.
   Vercel detects Vite automatically. Do NOT change build settings.

3. **API key (required for AI features)** — in Vercel: Project -> Settings ->
   Environment Variables -> add:
   - Name: `ANTHROPIC_API_KEY`
   - Value: your key from console.anthropic.com
   Then redeploy. Without this key the app works, but Upload Labs analysis,
   AI Doctor, and News will show a configuration error.

4. **Auto-deploy** — after the first import, every push/upload to the GitHub repo
   redeploys automatically. No extra integration needed.

## Local development

```bash
npm install
npm run dev
```
Note: locally the `/api/claude` function only runs with `vercel dev` (install the
Vercel CLI), not with plain `npm run dev`.

## Known limits

- Data is stored in the browser (localStorage) — it stays on the device/browser
  where you use the app. Clearing browser data erases it.
- Uploaded PDFs/photos larger than ~3 MB may fail (serverless request limit).
  Use compressed photos or text PDFs.
- News auto-refresh runs while the page is open.
- Not medical advice — informational tracking only.
