# Phase 01: Project Setup & Environment

**Date:** 2025-12-12
**Priority:** High
**Status:** ✅ Completed
**Progress:** 100%

---

## Context Links

- [Main Plan](./plan.md)
- [Next.js Research](./research/researcher-01-nextjs-webspeech.md)

---

## Parallelization Info

**Can run in parallel with:** Phase 02, Phase 03
**Must complete before:** Phase 04
**Parallelization group:** Group A

**File ownership:** Exclusive to this phase
- No overlap with other phases
- Safe for parallel execution

---

## Overview

Initialize Next.js 15 project with TypeScript, Tailwind CSS, proper directory structure, environment variables.

**Estimated time:** 15-20 minutes

---

## Key Insights

- Next.js 15 supports TypeScript next.config.ts with NextConfig type
- Use `force-dynamic` in API routes to prevent env var freezing
- App Router required for modern Next.js patterns
- Tailwind CSS for rapid UI development

---

## Requirements

### Functional
- Next.js 15 project with App Router
- TypeScript strict mode enabled
- Tailwind CSS configured
- Environment variables setup
- Git repository initialized

### Non-Functional
- TypeScript strict mode for type safety
- ESLint configured (Next.js defaults)
- Clean project structure

---

## Architecture

```
toolen/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page (created in Phase 02)
│   ├── globals.css         # Tailwind imports
│   └── api/
│       └── translate/
│           └── route.ts    # Translation API (Phase 03)
├── components/             # React components (Phase 02)
├── hooks/                  # Custom hooks (Phase 04)
├── lib/                    # Utilities (Phase 03)
├── public/                 # Static assets
├── .env.local              # Environment variables
├── .gitignore
├── next.config.ts          # Next.js config
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

## Related Code Files

### Files to Create
- `package.json`
- `tsconfig.json`
- `next.config.ts`
- `tailwind.config.ts`
- `postcss.config.mjs`
- `.env.local`
- `.gitignore`
- `app/layout.tsx`
- `app/globals.css`
- `.env.example`

### Files to Modify
None (new project)

---

## File Ownership

**This phase owns ALL config/setup files:**
- Root config files: `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `postcss.config.mjs`
- Environment: `.env.local`, `.env.example`, `.gitignore`
- Base app files: `app/layout.tsx`, `app/globals.css`

**Other phases MUST NOT modify these files.**

---

## Implementation Steps

### 1. Initialize Next.js Project
```bash
npx create-next-app@latest . --typescript --app --tailwind --eslint --no-src-dir --import-alias "@/*"
```

Answer prompts:
- TypeScript: Yes
- ESLint: Yes
- Tailwind CSS: Yes
- `src/` directory: No
- App Router: Yes
- Import alias: Yes (@/*)

### 2. Verify TypeScript Configuration

**File:** `tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{"name": "next"}],
    "paths": {"@/*": ["./*"]}
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### 3. Configure Next.js

**File:** `next.config.ts`
```typescript
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: false  // Strict type checking
  },
  eslint: {
    ignoreDuringBuilds: false
  }
}

export default nextConfig
```

### 4. Setup Environment Variables

**File:** `.env.local`
```bash
# Translation API
# Option 1: Azure Translator (Recommended)
# AZURE_TRANSLATOR_KEY=your_key_here
# AZURE_TRANSLATOR_REGION=eastasia

# Option 2: LibreTranslate
# LIBRETRANSLATE_API_KEY=your_key_here  # Optional
```

**File:** `.env.example`
```bash
# Translation API Configuration
# Choose ONE option:

# Option 1: Azure Translator (Recommended - 2M chars/month free)
AZURE_TRANSLATOR_KEY=
AZURE_TRANSLATOR_REGION=

# Option 2: LibreTranslate (Free public instance)
LIBRETRANSLATE_API_KEY=  # Optional, not required for public instance
```

### 5. Update .gitignore

**File:** `.gitignore`
```
# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local
.env

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts
```

### 6. Create Base Layout

**File:** `app/layout.tsx`
```typescript
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Voice Transcript Tool',
  description: 'Real-time English speech-to-text with Vietnamese translation',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
```

### 7. Configure Tailwind CSS

**File:** `app/globals.css`
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --foreground-rgb: 0, 0, 0;
  --background-start-rgb: 214, 219, 220;
  --background-end-rgb: 255, 255, 255;
}

@media (prefers-color-scheme: dark) {
  :root {
    --foreground-rgb: 255, 255, 255;
    --background-start-rgb: 0, 0, 0;
    --background-end-rgb: 0, 0, 0;
  }
}

body {
  color: rgb(var(--foreground-rgb));
  background: linear-gradient(
      to bottom,
      transparent,
      rgb(var(--background-end-rgb))
    )
    rgb(var(--background-start-rgb));
}
```

### 8. Install Dependencies
```bash
npm install
```

### 9. Verify Setup
```bash
npm run dev
```

Access http://localhost:3000 - should see default Next.js page.

### 10. Create Directory Structure
```bash
mkdir -p components hooks lib app/api/translate
```

---

## Todo List

- [x] Run `create-next-app` with correct flags (manual config creation)
- [x] Verify TypeScript config (strict mode)
- [x] Configure Next.js (no ignore errors)
- [x] Create `.env.local` and `.env.example`
- [x] Update `.gitignore`
- [x] Create base `app/layout.tsx`
- [x] Configure Tailwind in `app/globals.css`
- [x] Install dependencies (`npm install`)
- [x] Test dev server (`npm run dev`)
- [x] Create directory structure (`components`, `hooks`, `lib`)

---

## Success Criteria

- [x] `npm run dev` starts without errors
- [x] http://localhost:3002 accessible (port 3000 in use)
- [x] TypeScript strict mode enabled
- [x] Tailwind CSS working
- [x] Environment variables template created
- [x] All directories created
- [x] No TypeScript/ESLint errors

---

## Conflict Prevention

**File ownership is exclusive to Phase 01:**
- Config files: Only Phase 01 creates/modifies
- Other phases create NEW files in `app/`, `components/`, `hooks/`, `lib/`
- No other phase should touch root config files

---

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Node.js version incompatibility | High | Document required Node.js >= 18 |
| Port 3000 already in use | Low | Use different port or kill process |
| npm install failures | Medium | Use stable npm/node versions |

---

## Security Considerations

- `.env.local` in `.gitignore` (prevent API key leaks)
- Never commit API keys to git
- Use `.env.example` for documentation only

---

## Next Steps

After completion:
1. Proceed to Phase 02 (UI Components) in parallel
2. Proceed to Phase 03 (Translation API) in parallel
3. Both phases can work independently using the directory structure created here
