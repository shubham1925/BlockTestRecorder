# Block Testing Recorder

Internal inventory and block testing portal for **Hexacarb Engineers**.

## Local development

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`

## Deploy to Vercel

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → "Add New Project"
3. Import your GitHub repo
4. Vercel auto-detects Vite — just click "Deploy"
5. Done. You get a URL like `block-testing-recorder.vercel.app`

Every future push to `main` auto-deploys.

## Project structure

```
src/
  pages/
    LoginPage.jsx       ← Employee ID entry screen
    Dashboard.jsx       ← Post-login landing (placeholder)
  App.jsx               ← Root component, manages login state
  index.css             ← Global styles + CSS variables
  main.jsx              ← React entry point
```

## What's next

- [ ] Connect Supabase for real auth + database
- [ ] SKU list and quantity update forms
- [ ] History / audit log
- [ ] Owner dashboard with CSV export
