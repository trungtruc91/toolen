# System Architecture

## Overview

Voice Transcript Tool is a client-heavy web application using browser-native Speech Recognition with server-side translation.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser (Client)                      │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                    User Interface                       │ │
│  │  - VoiceRecorder component                             │ │
│  │  - TranscriptDisplay component                         │ │
│  │  - ControlButtons component                            │ │
│  └───────────────┬────────────────────────────────────────┘ │
│                  │                                           │
│  ┌───────────────▼────────────────────────────────────────┐ │
│  │           Web Speech API (Browser Native)              │ │
│  │  - SpeechRecognition                                   │ │
│  │  - Continuous listening                                │ │
│  │  - Interim + Final results                             │ │
│  └───────────────┬────────────────────────────────────────┘ │
│                  │                                           │
│                  │ (text output)                             │
│                  ▼                                           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │      useSpeechRecognition Hook                       │  │
│  │  - Manages recognition lifecycle                     │  │
│  │  - Handles interim/final text                        │  │
│  │  - Error handling                                    │  │
│  └───────────────┬──────────────────────────────────────┘  │
│                  │                                           │
└──────────────────┼───────────────────────────────────────────┘
                   │ (final sentence)
                   │ HTTP POST /api/translate
                   ▼
┌─────────────────────────────────────────────────────────────┐
│                    Next.js Server (Backend)                  │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              API Route: /api/translate                  │ │
│  │  - Request validation                                  │ │
│  │  - Text sanitization                                   │ │
│  │  - Error handling + graceful degradation              │ │
│  └───────────────┬────────────────────────────────────────┘ │
│                  │                                           │
│  ┌───────────────▼────────────────────────────────────────┐ │
│  │           TranslationService (lib/translator.ts)       │ │
│  │  - Service abstraction layer                           │ │
│  │  - Auto-detect Azure vs LibreTranslate                 │ │
│  │  - Timeout handling (5s)                               │ │
│  └───────────────┬────────────────────────────────────────┘ │
│                  │                                           │
└──────────────────┼───────────────────────────────────────────┘
                   │
         ┌─────────┴──────────┐
         │                    │
         ▼                    ▼
┌─────────────────┐   ┌─────────────────┐
│ Azure Translator│   │ LibreTranslate  │
│  (Primary)      │   │  (Fallback)     │
│  - 2M chars/mo  │   │  - Public API   │
│  - Low latency  │   │  - Free         │
└─────────────────┘   └─────────────────┘
```

## Component Architecture

### Frontend (Client-side)

```
app/page.tsx
    └─ VoiceRecorder (components/voice-recorder.tsx)
        ├─ useSpeechRecognition hook (hooks/use-speech-recognition.ts)
        │   └─ Web Speech API
        ├─ TranscriptDisplay (components/transcript-display.tsx)
        │   ├─ English transcript (final + interim)
        │   └─ Vietnamese translation
        └─ ControlButtons (components/control-buttons.tsx)
            ├─ Start Listening
            ├─ Stop Listening
            └─ Clear
```

### Backend (Server-side)

```
app/api/translate/route.ts
    └─ TranslationService (lib/translator.ts)
        ├─ translateWithAzure()
        └─ translateWithLibre()
```

## Data Flow

### Speech Recognition Flow

```
1. User clicks "Start Listening"
   └─ useSpeechRecognition.startListening()
      └─ recognition.start()

2. User speaks into microphone
   └─ recognition.onresult event
      ├─ Extract interim results → setInterimText()
      └─ Extract final results → setFinalText() + onFinalResult callback

3. Final result triggers translation
   └─ VoiceRecorder.handleFinalResult(text)
      └─ POST /api/translate { text }
```

### Translation Flow

```
1. API Route receives request
   └─ /api/translate/route.ts POST handler
      ├─ Validate text (length, type)
      ├─ Sanitize input
      └─ Call translationService.translate()

2. Translation Service
   └─ lib/translator.ts
      ├─ Check AZURE_TRANSLATOR_KEY
      │   ├─ Yes → translateWithAzure()
      │   └─ No → translateWithLibre()
      └─ Return translated text

3. Response
   └─ { vi: "translated text" }
      └─ VoiceRecorder updates translation state
         └─ TranscriptDisplay shows translation
```

## Key Technical Decisions

### 1. Browser-Native Speech Recognition

**Choice:** Web Speech API (SpeechRecognition)

**Rationale:**
- Zero-cost (browser-native)
- Low latency (< 500ms)
- No server processing needed
- Good accuracy for English

**Trade-offs:**
- Chrome/Edge only
- Quality depends on browser implementation
- Online-only (needs internet)

### 2. Server-Side Translation

**Choice:** Next.js API Routes

**Rationale:**
- Hide API keys from client
- Unified codebase (no separate backend)
- Easy Vercel deployment
- Request validation and sanitization

**Trade-offs:**
- Extra HTTP roundtrip
- Server costs (minimal with Vercel free tier)

### 3. Dual Translation Service

**Choice:** Azure Translator (primary) + LibreTranslate (fallback)

**Rationale:**
- Azure: better quality, generous free tier (2M chars/month)
- LibreTranslate: zero-cost fallback
- Auto-detection based on env vars

**Implementation:**
```typescript
async translate(text: string) {
  if (process.env.AZURE_TRANSLATOR_KEY) {
    return this.translateWithAzure(text)
  }
  return this.translateWithLibre(text)
}
```

### 4. Real-time UI Updates

**Choice:** React state + useCallback hooks

**Rationale:**
- Simple state management (no Redux needed)
- Immediate UI updates
- Clean component separation

**State Flow:**
```typescript
useSpeechRecognition
  ├─ interimText (state) → TranscriptDisplay
  ├─ finalText (state) → TranscriptDisplay
  └─ onFinalResult → VoiceRecorder → translation (state) → TranscriptDisplay
```

## Performance Considerations

### Latency Optimization

1. **Speech Recognition:** < 500ms
   - Browser-native processing
   - Continuous mode enabled
   - Interim results for immediate feedback

2. **Translation:** < 2s
   - 5s timeout on API calls
   - Parallel translation (doesn't block UI)
   - Graceful degradation on errors

3. **UI Updates:** < 16ms (60 FPS)
   - React state updates
   - No heavy computations in render
   - CSS transitions for smooth animations

### Resource Usage

**Client:**
- Minimal JS bundle (Next.js 15 optimizations)
- No heavy libraries
- Browser handles STT processing

**Server:**
- Stateless API routes
- No database (ephemeral transcripts)
- Minimal memory footprint

## Security Architecture

### API Key Protection

```
┌─────────────┐
│   Browser   │  ❌ No API keys exposed
└─────────────┘
       │
       │ POST /api/translate (no keys)
       ▼
┌─────────────┐
│   Server    │  ✅ API keys in env vars
│  .env.local │     (server-side only)
└─────────────┘
       │
       │ Authenticated request
       ▼
┌─────────────┐
│  Azure API  │
└─────────────┘
```

### Input Validation

```typescript
// /api/translate/route.ts
if (!text || typeof text !== 'string') {
  return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
}

if (text.length > 2000) {
  return NextResponse.json({ error: 'Text too long' }, { status: 400 })
}
```

### Error Handling

**Strategy:** Graceful degradation

```typescript
try {
  const translated = await translationService.translate(text)
  return { vi: translated }
} catch (error) {
  // Don't fail - return empty translation
  return { vi: '', error: 'Service unavailable' }
}
```

## Scalability

### Current Limitations

- **Browser limits:** 1 user = 1 recognition instance
- **API rate limits:** Azure free tier = 2M chars/month
- **No persistence:** Transcripts lost on page refresh

### Scaling Strategy (Future)

1. **Add database:** Store transcripts (PostgreSQL/MongoDB)
2. **User accounts:** Track usage, history
3. **Caching:** Cache translations (Redis)
4. **CDN:** Static assets via Vercel Edge Network
5. **Multiple regions:** Deploy API routes globally

## Deployment Architecture

### Vercel (Recommended)

```
┌─────────────────────────────────────────────────────┐
│              Vercel Edge Network (CDN)               │
│  - Static assets (JS, CSS, images)                  │
│  - Global distribution                               │
└───────────────────────┬─────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│            Vercel Serverless Functions               │
│  - API Routes (/api/translate)                      │
│  - Auto-scaling                                      │
│  - Region: Auto-selected                             │
└───────────────────────┬─────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│              External APIs                           │
│  - Azure Translator (primary)                       │
│  - LibreTranslate (fallback)                        │
└─────────────────────────────────────────────────────┘
```

### Environment Variables (Vercel)

Set in Vercel Dashboard → Project Settings → Environment Variables:
- `AZURE_TRANSLATOR_KEY` (production + preview)
- `AZURE_TRANSLATOR_REGION` (production + preview)

## Error Recovery

### Speech Recognition Errors

```typescript
recognition.onerror = (event) => {
  switch (event.error) {
    case 'not-allowed':
      // Show "Allow microphone" message
    case 'no-speech':
      // Show "Speak louder" hint
    case 'network':
      // Show "Check internet" warning
  }
}
```

### Translation Errors

```typescript
// Fallback chain
1. Try Azure Translator
   └─ Fail → Return error: 'Azure unavailable'
2. Try LibreTranslate
   └─ Fail → Return empty translation (graceful)
3. Display in UI
   └─ "Translation temporarily unavailable"
```

## Monitoring & Debugging

### Client-side Logs

```javascript
console.log('Speech recognition error:', error)
console.error('Translation failed:', error)
```

### Server-side Logs

```typescript
// /api/translate/route.ts
console.error('Translation error:', error)
```

**Vercel:** View logs in Vercel Dashboard → Deployments → Function Logs

## Browser Compatibility Matrix

| Feature | Chrome | Edge | Safari | Firefox |
|---------|--------|------|--------|---------|
| Web Speech API | ✅ Full | ✅ Full | ⚠️ Limited | ❌ No |
| Microphone Access | ✅ | ✅ | ✅ | ✅ |
| Translation API | ✅ | ✅ | ✅ | ✅ |
| Overall Support | ✅ | ✅ | ❌ | ❌ |

## Technology Stack Details

**Frontend:**
- Next.js 15.1.3 (App Router)
- React 19.0.0
- TypeScript 5.7.2
- Tailwind CSS 3.4.17

**Backend:**
- Next.js API Routes (Node.js 18+)
- Native fetch API
- Environment variables via `.env.local`

**APIs:**
- Web Speech API (W3C standard)
- Azure Translator API v3.0
- LibreTranslate API v1.3

**Development:**
- Turbopack (fast refresh)
- ESLint (code quality)
- TypeScript strict mode

## File Size Budget

**Target:** < 500 KB initial JS bundle

**Actual:**
- Next.js framework: ~200 KB (gzipped)
- Application code: ~50 KB (gzipped)
- Total: ~250 KB ✅

**Optimization:**
- Tree shaking enabled
- Code splitting via Next.js
- No large dependencies (no Axios, Lodash, etc.)
