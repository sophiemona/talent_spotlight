# Talent Spotlight

A Next.js 14 app that collects candidate information via a multi-step form, generates a LinkedIn post using Claude, and emails the result to Sophie Mona Pagès via Resend.

---

## Setup

### 1. Install dependencies

```bash
cd talent_spotlight
npm install
```

### 2. Configure environment variables

Copy `.env.local` and fill in your keys:

```env
ANTHROPIC_API_KEY=your_anthropic_key
RESEND_API_KEY=your_resend_key
RECIPIENT_EMAIL=sophie.pages@gmail.com
```

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Getting API keys

### Anthropic API key

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Sign in or create an account
3. Navigate to **API Keys** in the sidebar
4. Click **Create Key** and copy it into `ANTHROPIC_API_KEY`

The app uses `claude-sonnet-4-20250514`.

### Resend API key

1. Go to [resend.com](https://resend.com) and create a free account
2. Navigate to **API Keys** and click **Create API Key**
3. Copy it into `RESEND_API_KEY`

**Important — sender domain:**
The default `from` address used is `onboarding@resend.dev`, which works for testing but Resend restricts delivery to your own verified email on the free plan. For production:

1. Go to **Domains** in the Resend dashboard
2. Add and verify your domain (e.g. `spotlight.yourdomain.com`)
3. Update the `from` field in `app/api/submit/route.ts`:
   ```ts
   from: 'Talent Spotlight <noreply@yourdomain.com>',
   ```

---

## Deploy to Vercel

### Option A — Vercel CLI

```bash
npm i -g vercel
vercel
```

Follow the prompts. When asked about environment variables, add:
- `ANTHROPIC_API_KEY`
- `RESEND_API_KEY`
- `RECIPIENT_EMAIL`

### Option B — Vercel Dashboard

1. Push your repo to GitHub
2. Go to [vercel.com/new](https://vercel.com/new) and import the repo
3. In **Environment Variables**, add the three variables above
4. Click **Deploy**

---

## Project structure

```
talent_spotlight/
├── app/
│   ├── layout.tsx              # Root layout + Inter font
│   ├── globals.css             # Tailwind directives
│   ├── page.tsx                # Multi-step form (Steps 0–3)
│   ├── confirmation/
│   │   └── page.tsx            # Post-submit confirmation
│   └── api/
│       └── submit/
│           └── route.ts        # POST handler: Claude + Resend
├── .env.local                  # Environment variables (not committed)
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```
