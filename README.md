# Frame Studio

![demo](image.png)

AI motion graphics generator using React, Remotion, TypeScript, and Google Gemini API.

Provide a text prompt. Frame Studio generates a Remotion video project, compiles it, renders an MP4 **directly in your browser**, and downloads it. No server-side rendering, no AWS, no credit card needed.

## Architecture

```
Browser                 Server (Vercel - FREE)
   │                          │
   │── prompt ──────────────► │
   │                          │── Plan (Gemini)
   │                          │── Codegen (Gemini)
   │                          │── TypeScript check + fix loop
   │                          │── Compile TSX → JS (esbuild)
   │◄── compiled code ─────── │
   │                          │
   │── renderMediaOnWeb()     │
   │── (WebCodecs + Mediabunny)
   │── download MP4           │
```

**Flow:**
1. Plan: Gemini creates video structure from prompt
2. Codegen: Gemini writes React/Remotion code
3. Compile: TypeScript validation in sandbox
4. Fix: Gemini repairs compilation errors (max 3 attempts)
5. Server compiles TSX → JS using esbuild
6. Browser evaluates the code and renders MP4 using `@remotion/web-renderer`
7. Instant download — no queue, no waiting

**Tech:**
- Next.js 15 (free Vercel deployment)
- Remotion 4.0 for video rendering (client-side via WebCodecs)
- Google Gemini API for AI code generation
- Supabase for auth, storage, and database
- **Zero infrastructure costs** — no servers, no AWS, no credit card

## Prerequisites

- Node.js 18+
- pnpm
- Google Gemini API key
- Supabase project (free tier)

## Setup

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment

Copy `.env.example` to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```

```env
GEMINI_API_KEY=your_gemini_key
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **Authentication → Providers** and enable **Email/Password**
3. Set **Site URL** to `http://localhost:3000` (or your production URL)
4. Run the SQL from [`supabase-setup.sql`](./supabase-setup.sql) in the SQL editor

### 4. Run

```bash
pnpm dev
```

Application runs at `http://localhost:3000`.

You can also provide your Gemini API key in the web UI instead of the env var.

## Deployment (Vercel — free)

```bash
pnpm build
```

Deploy to Vercel. Set these environment variables in Vercel:

| Variable | Description |
|---|---|
| `GEMINI_API_KEY` | Your Gemini API key |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `NEXT_PUBLIC_SITE_URL` | Your production URL (e.g. `https://frame-studio.vercel.app`) |

Also update the Supabase dashboard **Site URL** to match your production domain.

## Features

- **Zero infrastructure** — renders entirely in the browser
- **Account system** — sign up / sign in via Supabase Auth (email/password or magic link)
- **Video history** — save videos to your account, browse them on your profile page
- **Custom animated cursor** (macOS-style arrow with hover states)
- **Model selector** (6 Gemini models)
- **Real-time progress screen** with stage updates
- **Premium glassmorphic UI**

## Browser Support

Client-side video rendering requires the [WebCodecs API](https://caniuse.com/webcodecs):
- Chrome 94+
- Firefox 130+
- Edge 94+

## Development

```bash
pnpm dev        # Start dev server
pnpm build      # Production build
pnpm lint       # Lint
```

## Project Structure

```
apps/web/                 Next.js app with API routes and UI
├── app/
│   ├── api/
│   │   ├── apikey/       API key management (httpOnly cookie)
│   │   ├── auth/user/    Current user endpoint
│   │   ├── generate/     Video generation pipeline
│   │   └── videos/       Save / list / delete saved videos
│   ├── auth/
│   │   ├── callback/     OAuth + email confirmation handler
│   │   ├── signin/       Sign-in page (password + magic link)
│   │   ├── signout/      Sign-out route
│   │   └── signup/       Sign-up page
│   └── profile/          Video history grid with preview & delete
├── components/
│   ├── Header.tsx        Auth-aware nav (Profile / Sign in link)
│   └── PreviewScreen.tsx Preview with download + save to account
├── lib/
│   ├── supabase/
│   │   ├── client.ts     Browser Supabase client
│   │   └── server.ts     Server Supabase client (cookies)
│   └── apiKey.ts         Server-side API key cookie management
└── middleware.ts          Auth redirect middleware
packages/pipeline/          AI processing (prompts, schemas, LLM client)
packages/remotion-skeleton/ Template for video projects
```

## Notes

- Uses webpack (not Turbopack) for stability
- Gemini API key stored in HTTP-only cookies
- Saved videos stored in Supabase Storage (`videos` bucket)
- Video metadata stored in a `videos` PostgreSQL table (RLS-protected)
- Videos render at 1920x1080, 30fps

## License

MIT
