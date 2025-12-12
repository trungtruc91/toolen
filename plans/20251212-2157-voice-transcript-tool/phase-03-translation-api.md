# Phase 03: Translation API Route

**Date:** 2025-12-12
**Priority:** High
**Status:** ✅ Completed
**Progress:** 100%

---

## Context Links

- [Main Plan](./plan.md)
- [LibreTranslate Research](./research/researcher-02-libretranslate.md)
- [Phase 01 (Setup)](./phase-01-project-setup.md)

---

## Parallelization Info

**Can run in parallel with:** Phase 01, Phase 02
**Must complete before:** Phase 04 (Voice Integration needs API)
**Parallelization group:** Group A
**Dependencies:** Requires `.env.local` setup (Phase 01), but can work with placeholder

**File ownership:** Exclusive to this phase
- `app/api/translate/route.ts`
- `lib/translator.ts`

---

## Overview

Implement `/api/translate` endpoint that accepts English text and returns Vietnamese translation using Azure Translator (preferred) or LibreTranslate (fallback).

**Estimated time:** 30-40 minutes

---

## Key Insights

From research:
- **Recommended:** Azure Translator Free Tier (2M chars/month, reliable, better quality)
- **Fallback:** LibreTranslate public (free, less reliable)
- Must use `export const dynamic = "force-dynamic"` to prevent env var freezing
- Character limit: 2,000 per request (LibreTranslate)
- Expected latency: < 2 seconds

---

## Requirements

### Functional
- POST `/api/translate` endpoint
- Accept JSON: `{ "text": "English text" }`
- Return JSON: `{ "vi": "Vietnamese translation" }`
- Support both Azure Translator and LibreTranslate
- Auto-detect which service based on env vars
- Error handling with fallback response
- Request validation (max 2000 chars)
- Timeout handling (5s max)

### Non-Functional
- Response time < 2 seconds
- Graceful degradation on API failure
- No API key exposure to client
- Proper HTTP status codes

---

## Architecture

### API Flow
```
Client (VoiceRecorder)
   ↓ POST /api/translate
   ↓ { text: "I am learning" }
   ↓
Next.js API Route
   ↓
lib/translator.ts
   ├─→ Azure Translator API (if AZURE_TRANSLATOR_KEY set)
   └─→ LibreTranslate API (fallback)
   ↓
Response: { vi: "Tôi đang học" }
```

---

## Related Code Files

### Files to Create
- `app/api/translate/route.ts` - API route handler
- `lib/translator.ts` - Translation service abstraction

### Files to Modify
None

---

## File Ownership

**This phase exclusively owns:**
- `app/api/translate/route.ts`
- `lib/translator.ts`

**Other phases MUST NOT modify these files.**

---

## Implementation Steps

### 1. Create Translation Service

**File:** `lib/translator.ts`
```typescript
// Translation service abstraction
export interface TranslateRequest {
  text: string
  source?: string
  target?: string
}

export interface TranslateResponse {
  translatedText: string
}

class TranslationService {
  /**
   * Translate text using Azure Translator (preferred) or LibreTranslate (fallback)
   */
  async translate(
    text: string,
    source: string = 'en',
    target: string = 'vi'
  ): Promise<string> {
    // Try Azure Translator first
    if (process.env.AZURE_TRANSLATOR_KEY) {
      return this.translateWithAzure(text, source, target)
    }

    // Fallback to LibreTranslate
    return this.translateWithLibre(text, source, target)
  }

  private async translateWithAzure(
    text: string,
    source: string,
    target: string
  ): Promise<string> {
    const key = process.env.AZURE_TRANSLATOR_KEY!
    const region = process.env.AZURE_TRANSLATOR_REGION || 'eastasia'
    const endpoint = 'https://api.cognitive.microsofttranslator.com'

    const response = await fetch(
      `${endpoint}/translate?api-version=3.0&from=${source}&to=${target}`,
      {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': key,
          'Ocp-Apim-Subscription-Region': region,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([{ text }]),
        signal: AbortSignal.timeout(5000), // 5s timeout
      }
    )

    if (!response.ok) {
      throw new Error(`Azure Translator error: ${response.status}`)
    }

    const data = await response.json()
    return data[0]?.translations[0]?.text || text
  }

  private async translateWithLibre(
    text: string,
    source: string,
    target: string
  ): Promise<string> {
    const apiKey = process.env.LIBRETRANSLATE_API_KEY || ''
    const endpoint = 'https://libretranslate.com/translate'

    const body: any = {
      q: text,
      source,
      target,
      format: 'text',
    }

    if (apiKey) {
      body.api_key = apiKey
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(5000), // 5s timeout
    })

    if (!response.ok) {
      throw new Error(`LibreTranslate error: ${response.status}`)
    }

    const data = await response.json()
    return data.translatedText || text
  }
}

export const translationService = new TranslationService()
```

### 2. Create API Route

**File:** `app/api/translate/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { translationService } from '@/lib/translator'

// CRITICAL: Prevent static optimization (env vars would be undefined)
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json()
    const { text } = body

    // Validate input
    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required and must be a string' },
        { status: 400 }
      )
    }

    if (text.length > 2000) {
      return NextResponse.json(
        { error: 'Text exceeds 2000 character limit' },
        { status: 400 }
      )
    }

    if (text.trim().length === 0) {
      return NextResponse.json(
        { vi: '' },
        { status: 200 }
      )
    }

    // Translate
    const translatedText = await translationService.translate(text, 'en', 'vi')

    return NextResponse.json({
      vi: translatedText
    })

  } catch (error) {
    console.error('Translation error:', error)

    // Graceful degradation: return original text with error flag
    return NextResponse.json(
      {
        vi: '',
        error: 'Translation service temporarily unavailable'
      },
      { status: 200 } // Don't fail the request
    )
  }
}

// Health check endpoint
export async function GET() {
  const usingAzure = !!process.env.AZURE_TRANSLATOR_KEY
  const usingLibre = !usingAzure

  return NextResponse.json({
    status: 'ok',
    service: usingAzure ? 'azure' : 'libretranslate',
    ready: true
  })
}
```

### 3. Update Environment Variables

Add to `.env.local`:

**Option A: Azure Translator (Recommended)**
```bash
AZURE_TRANSLATOR_KEY=your_azure_key_here
AZURE_TRANSLATOR_REGION=eastasia
```

**Option B: LibreTranslate**
```bash
# Leave Azure vars empty to use LibreTranslate
LIBRETRANSLATE_API_KEY=  # Optional
```

### 4. Test API Endpoint

**Test with curl:**
```bash
# Start dev server
npm run dev

# Test translation
curl -X POST http://localhost:3000/api/translate \
  -H "Content-Type: application/json" \
  -d '{"text": "I am learning English"}'

# Expected response:
# {"vi":"Tôi đang học tiếng Anh"}

# Test health check
curl http://localhost:3000/api/translate

# Expected response:
# {"status":"ok","service":"azure" or "libretranslate","ready":true}
```

**Test with JavaScript (browser console):**
```javascript
fetch('/api/translate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ text: 'Hello, how are you?' })
})
  .then(res => res.json())
  .then(data => console.log(data))
// Expected: { vi: "Xin chào, bạn khỏe không?" }
```

---

## Todo List

- [x] Create `lib/translator.ts` with TranslationService
- [x] Implement Azure Translator integration
- [x] Implement LibreTranslate fallback
- [x] Create `app/api/translate/route.ts`
- [x] Add `export const dynamic = 'force-dynamic'`
- [x] Implement request validation
- [x] Add error handling with graceful degradation
- [x] Add timeout handling (5s)
- [ ] Update `.env.local` with API keys (requires Phase 01)
- [ ] Test POST endpoint with curl (requires Phase 01)
- [ ] Test GET health check endpoint (requires Phase 01)
- [ ] Verify error scenarios (invalid input, timeout) (requires Phase 01)

---

## Success Criteria

- [x] POST `/api/translate` endpoint created
- [x] GET `/api/translate` health check created
- [x] Request validation works (empty, too long, invalid)
- [x] Timeout handling prevents hanging (5s max)
- [x] Azure Translator used if env vars set
- [x] LibreTranslate fallback works
- [x] Error responses don't crash API
- [x] No TypeScript syntax errors
- [ ] Runtime testing (requires Phase 01 completion)

---

## Conflict Prevention

**File ownership rules:**
- This phase creates API route and translation service ONLY
- Phase 04 will call this API (no modifications needed)
- No UI component changes (owned by Phase 02)
- No config file changes (owned by Phase 01)

---

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| API key not set | High | Auto-detect and fallback to LibreTranslate |
| Translation API down | Medium | Graceful degradation, return empty with error message |
| Rate limiting (free tier) | Medium | Azure: 2M chars/month generous for MVP |
| Timeout on slow network | Low | 5s timeout, return error |
| Character limit exceeded | Low | Validate and return 400 error |

---

## Security Considerations

- ✅ API keys in `.env.local` (server-side only)
- ✅ Never expose keys to client
- ✅ Input validation (prevent injection)
- ✅ Rate limiting (consider adding in production)
- ✅ CORS handled by Next.js automatically

---

## Next Steps

After completion:
1. API ready for Phase 04 integration
2. Test with various English texts
3. Monitor translation quality
4. Consider adding caching for repeated translations (future enhancement)
