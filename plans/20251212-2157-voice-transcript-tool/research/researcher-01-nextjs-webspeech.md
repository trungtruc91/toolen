# Research Report: Next.js 15 & Web Speech API

**Date:** 2025-12-12
**Researcher:** 01
**Topics:** Next.js 15 Setup, Web Speech API Integration

---

## Next.js 15 App Router TypeScript Setup

### Project Initialization
```bash
npx create-next-app@latest voice-transcript --typescript --app --tailwind
```

**Key Configuration:**
- Enable `typedRoutes` in next.config for type-safe routing
- Use TypeScript next.config.ts with NextConfig type
- Keep strict TypeScript settings (no ignoreBuildErrors in production)

### Recommended Structure
```
app/              # App Router pages
  api/            # API routes
  components/
    ui/           # Reusable UI components
    features/     # Feature-specific components
lib/              # Utilities
hooks/            # Custom React hooks
types/            # TypeScript definitions
```

### API Routes Implementation
```typescript
// app/api/translate/route.ts
export const dynamic = "force-dynamic" // Prevent static optimization

export async function POST(request: Request) {
  const { text } = await request.json()
  // Translation logic
  return Response.json({ vi: translatedText })
}
```

**Critical:** Add `export const dynamic = "force-dynamic"` to prevent env vars being frozen to undefined during build.

### Environment Variables
- Server-only: `process.env.VARIABLE_NAME`
- Client-exposed: `NEXT_PUBLIC_VARIABLE_NAME`
- Use `.env.production` for production-specific vars
- Validate env vars at boot using zod/joi

**Production Issue Fix:**
```typescript
// GET handlers statically optimized → env vars undefined
// Solution: Force dynamic rendering
export const dynamic = "force-dynamic"
```

---

## Web Speech API Integration

### Browser Compatibility (2025)

**Supported:**
- Chrome 25-136: Partial support (primary browser)
- Edge: Improved support in 2025, uses Azure Cognitive Services
- Safari: Some versions support (via webkit prefix)

**Not Supported:**
- Firefox: No support
- Mobile browsers: Partial/no support

**Recommendation:** Target Chrome/Edge only for MVP, add browser detection.

### Basic Setup
```typescript
// Check browser support
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

if (!SpeechRecognition) {
  throw new Error("Browser doesn't support Speech Recognition")
}

const recognition = new SpeechRecognition()
```

### Continuous Listening Configuration
```typescript
recognition.continuous = true        // Keep listening
recognition.interimResults = true    // Get real-time partial results
recognition.lang = 'en-US'           // English language
recognition.maxAlternatives = 1      // Single best result
```

### Event Handlers
```typescript
// Interim + Final results
recognition.onresult = (event) => {
  for (let i = event.resultIndex; i < event.results.length; i++) {
    const transcript = event.results[i][0].transcript

    if (event.results[i].isFinal) {
      // Final text → send to translation API
      handleFinalTranscript(transcript)
    } else {
      // Interim text → display in UI (lighter color)
      displayInterimText(transcript)
    }
  }
}

// Error handling
recognition.onerror = (event) => {
  console.error('Speech recognition error:', event.error)
  // Handle: no-speech, audio-capture, not-allowed, etc.
}

// Session management
recognition.onend = () => {
  if (shouldContinue) {
    recognition.start() // Restart if needed
  }
}
```

### Microphone Permissions
```typescript
// Browser requests permission automatically on first start()
recognition.start()

// Handle permission denial
recognition.onerror = (event) => {
  if (event.error === 'not-allowed') {
    alert('Microphone access denied')
  }
}
```

### Key Implementation Notes

**Latency:** < 500ms for interim results (browser-dependent)

**Privacy:** Audio sent to server-based recognition engine (online required)

**Concatenation:** Include whitespace in results for proper transcript assembly

**Error Recovery:**
```typescript
recognition.onerror = (event) => {
  switch(event.error) {
    case 'no-speech': // User silent too long
    case 'audio-capture': // Mic not available
    case 'not-allowed': // Permission denied
    case 'network': // Network error
  }
}
```

### React Integration Pattern
```typescript
'use client'

export function VoiceRecorder() {
  const [isListening, setIsListening] = useState(false)
  const [interim, setInterim] = useState('')
  const [final, setFinal] = useState('')
  const recognitionRef = useRef<SpeechRecognition>()

  useEffect(() => {
    if (typeof window === 'undefined') return

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    recognitionRef.current = new SpeechRecognition()
    recognitionRef.current.continuous = true
    recognitionRef.current.interimResults = true

    // Setup handlers...
  }, [])

  const startListening = () => {
    recognitionRef.current?.start()
    setIsListening(true)
  }

  const stopListening = () => {
    recognitionRef.current?.stop()
    setIsListening(false)
  }
}
```

---

## Limitations

1. **Browser Dependency:** Chrome/Edge only, no Firefox/Safari guarantee
2. **Online Required:** Requires internet for speech processing
3. **No Offline:** Cannot work offline
4. **Privacy:** Audio sent to third-party servers
5. **Accuracy:** Depends on accent, noise, speech clarity
6. **No Control:** Cannot customize STT model quality

---

## Sources

- [Best Practices for Organizing Your Next.js 15 2025](https://dev.to/bajrayejoon/best-practices-for-organizing-your-nextjs-15-2025-53ji)
- [Next.js 15 Official Docs](https://nextjs.org/blog/next-15)
- [Next.js 15: App Router — Senior Guide](https://medium.com/@livenapps/next-js-15-app-router-a-complete-senior-level-guide-0554a2b820f7)
- [Using the Web Speech API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API/Using_the_Web_Speech_API)
- [SpeechRecognition API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition)
- [JavaScript Speech Recognition 2025](https://www.videosdk.live/developer-hub/stt/javascript-speech-recognition)
- [Next.js Environment Variables Guide](https://nextjs.org/docs/pages/guides/environment-variables)
- [Can I use Speech Recognition API](https://caniuse.com/speech-recognition)
