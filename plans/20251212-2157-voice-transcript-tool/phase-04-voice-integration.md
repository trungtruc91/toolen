# Phase 04: Voice Recognition Integration

**Date:** 2025-12-12
**Priority:** High
**Status:** ✅ Completed
**Progress:** 100%

---

## Context Links

- [Main Plan](./plan.md)
- [Web Speech API Research](./research/researcher-01-nextjs-webspeech.md)
- [Phase 02 (UI Components)](./phase-02-ui-components.md)
- [Phase 03 (Translation API)](./phase-03-translation-api.md)

---

## Parallelization Info

**Cannot run in parallel** - depends on Phase 02, Phase 03
**Must complete:** Phase 02 (UI components), Phase 03 (Translation API)
**Parallelization group:** Group B (Sequential)

**Dependencies:**
- Needs UI components from Phase 02
- Needs `/api/translate` from Phase 03

**File ownership:** Exclusive to this phase
- `hooks/use-speech-recognition.ts`
- `components/voice-recorder.tsx`
- `app/page.tsx` (modification only)

---

## Overview

Integrate Web Speech API for real-time speech-to-text, connect to translation API, wire up UI components.

**Estimated time:** 45-60 minutes

---

## Key Insights

From research:
- Web Speech API requires `webkitSpeechRecognition` prefix
- `continuous: true` for continuous listening
- `interimResults: true` for real-time feedback
- Interim results (light text) vs Final results (send to translate)
- Browser-only (requires `'use client'`)
- Microphone permission requested automatically

---

## Requirements

### Functional
- Start/Stop voice recording
- Display interim results (light text)
- Display final results (bold text)
- Auto-translate final results to Vietnamese
- Show translation below English text
- Handle microphone permissions
- Browser compatibility detection
- Error handling (no-speech, not-allowed, network)

### Non-Functional
- < 500ms latency for interim results
- < 2s total latency for translation
- Graceful error messages
- Clean state management

---

## Architecture

### Data Flow
```
User speaks
   ↓
Web Speech API (browser)
   ↓
SpeechRecognition.onresult
   ├─→ Interim results → setState (display immediately)
   └─→ Final results → POST /api/translate → setState (display translation)
   ↓
React state updates
   ↓
UI re-renders (TranscriptDisplay)
```

---

## Related Code Files

### Files to Create
- `hooks/use-speech-recognition.ts` - Custom hook for Web Speech API
- `components/voice-recorder.tsx` - Main voice recorder component

### Files to Modify
- `app/page.tsx` - Replace placeholder with VoiceRecorder component

---

## File Ownership

**This phase exclusively owns:**
- `hooks/use-speech-recognition.ts`
- `components/voice-recorder.tsx`

**This phase modifies (owned by Phase 02):**
- `app/page.tsx` - Only to import and use VoiceRecorder

---

## Implementation Steps

### 1. Create Speech Recognition Hook

**File:** `hooks/use-speech-recognition.ts`
```typescript
'use client'

import { useEffect, useRef, useState } from 'react'

interface UseSpeechRecognitionReturn {
  isListening: boolean
  isSupported: boolean
  interimText: string
  finalText: string
  error: string | null
  startListening: () => void
  stopListening: () => void
  clearTranscript: () => void
}

export function useSpeechRecognition(
  onFinalResult?: (text: string) => void
): UseSpeechRecognitionReturn {
  const [isListening, setIsListening] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const [interimText, setInterimText] = useState('')
  const [finalText, setFinalText] = useState('')
  const [error, setError] = useState<string | null>(null)

  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const finalTranscriptRef = useRef('')

  useEffect(() => {
    // Check browser support
    if (typeof window === 'undefined') return

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition

    if (!SpeechRecognition) {
      setIsSupported(false)
      setError('Speech Recognition not supported. Use Chrome or Edge.')
      return
    }

    setIsSupported(true)

    // Initialize
    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'
    recognition.maxAlternatives = 1

    // Handle results
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = ''
      let final = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript

        if (event.results[i].isFinal) {
          final += transcript + ' '
        } else {
          interim += transcript
        }
      }

      // Update interim text
      if (interim) {
        setInterimText(interim)
      }

      // Update final text and trigger callback
      if (final) {
        finalTranscriptRef.current += final
        setFinalText(finalTranscriptRef.current)
        setInterimText('') // Clear interim when final received

        // Trigger callback for translation
        if (onFinalResult) {
          onFinalResult(final.trim())
        }
      }
    }

    // Handle errors
    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error)

      switch (event.error) {
        case 'not-allowed':
          setError('Microphone access denied. Please allow microphone access.')
          break
        case 'no-speech':
          setError('No speech detected. Please try again.')
          break
        case 'audio-capture':
          setError('Microphone not found. Please check your microphone.')
          break
        case 'network':
          setError('Network error. Please check your internet connection.')
          break
        default:
          setError(`Error: ${event.error}`)
      }

      setIsListening(false)
    }

    // Handle end
    recognition.onend = () => {
      setIsListening(false)
      setInterimText('') // Clear interim on end
    }

    recognitionRef.current = recognition

    return () => {
      recognition.stop()
    }
  }, [onFinalResult])

  const startListening = () => {
    if (!recognitionRef.current || !isSupported) return

    try {
      recognitionRef.current.start()
      setIsListening(true)
      setError(null)
    } catch (err) {
      console.error('Failed to start recognition:', err)
      setError('Failed to start listening. Please try again.')
    }
  }

  const stopListening = () => {
    if (!recognitionRef.current) return

    recognitionRef.current.stop()
    setIsListening(false)
    setInterimText('') // Clear interim when stopped
  }

  const clearTranscript = () => {
    finalTranscriptRef.current = ''
    setFinalText('')
    setInterimText('')
    setError(null)
  }

  return {
    isListening,
    isSupported,
    interimText,
    finalText,
    error,
    startListening,
    stopListening,
    clearTranscript,
  }
}
```

### 2. Create Voice Recorder Component

**File:** `components/voice-recorder.tsx`
```typescript
'use client'

import { useState, useCallback } from 'react'
import { useSpeechRecognition } from '@/hooks/use-speech-recognition'
import { TranscriptDisplay } from './transcript-display'
import { ControlButtons } from './control-buttons'

export function VoiceRecorder() {
  const [translation, setTranslation] = useState('')
  const [isTranslating, setIsTranslating] = useState(false)

  // Handle final speech results -> translate
  const handleFinalResult = useCallback(async (text: string) => {
    if (!text.trim()) return

    setIsTranslating(true)

    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      })

      const data = await response.json()

      if (data.vi) {
        setTranslation((prev) => prev + data.vi + ' ')
      }
    } catch (error) {
      console.error('Translation failed:', error)
      // Don't show error to user, just skip translation
    } finally {
      setIsTranslating(false)
    }
  }, [])

  const {
    isListening,
    isSupported,
    interimText,
    finalText,
    error,
    startListening,
    stopListening,
    clearTranscript,
  } = useSpeechRecognition(handleFinalResult)

  const handleClear = () => {
    clearTranscript()
    setTranslation('')
  }

  if (!isSupported) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
        <p className="text-red-800 dark:text-red-200 font-medium">
          ⚠️ Speech Recognition not supported in this browser
        </p>
        <p className="text-sm text-red-600 dark:text-red-300 mt-2">
          Please use Google Chrome or Microsoft Edge
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Status Indicator */}
      <div className="flex items-center justify-center gap-2">
        {isListening && (
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <span className="text-sm font-medium">Listening...</span>
          </div>
        )}
        {isTranslating && (
          <span className="text-sm text-blue-600 dark:text-blue-400">
            Translating...
          </span>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <p className="text-yellow-800 dark:text-yellow-200 text-sm">
            ⚠️ {error}
          </p>
        </div>
      )}

      {/* Transcript Display */}
      <TranscriptDisplay
        interimText={interimText}
        finalText={finalText}
        translation={translation}
      />

      {/* Control Buttons */}
      <ControlButtons
        isListening={isListening}
        onStart={startListening}
        onStop={stopListening}
        onClear={handleClear}
        disabled={false}
      />
    </div>
  )
}
```

### 3. Update Main Page

**File:** `app/page.tsx` (Replace placeholder)
```typescript
import { VoiceRecorder } from '@/components/voice-recorder'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Voice Transcript Tool
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Real-time English speech-to-text with Vietnamese translation
          </p>
        </header>

        {/* Instructions */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>How to use:</strong> Click "Start Listening", allow microphone access,
            and speak in English. Your speech will be transcribed in real-time and translated to Vietnamese.
          </p>
        </div>

        {/* Voice Recorder */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <VoiceRecorder />
        </div>

        {/* Browser Compatibility Warning */}
        <div className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
          Works best on Chrome and Edge browsers
        </div>
      </div>
    </main>
  )
}
```

### 4. Test Integration

```bash
# Start dev server
npm run dev

# Open browser
open http://localhost:3000

# Test flow:
# 1. Click "Start Listening"
# 2. Allow microphone access
# 3. Speak in English
# 4. Watch interim text appear (light)
# 5. Watch final text appear (bold) after pause
# 6. Watch Vietnamese translation appear below
# 7. Click "Stop Listening"
# 8. Click "Clear" to reset
```

---

## Todo List

- [ ] Create `hooks/use-speech-recognition.ts`
- [ ] Implement browser support detection
- [ ] Implement continuous listening
- [ ] Implement interim/final result handling
- [ ] Implement error handling (all error types)
- [ ] Create `components/voice-recorder.tsx`
- [ ] Integrate translation API call
- [ ] Wire up UI components (TranscriptDisplay, ControlButtons)
- [ ] Update `app/page.tsx` with VoiceRecorder
- [ ] Test microphone permission flow
- [ ] Test interim results display
- [ ] Test final results + translation
- [ ] Test error scenarios (denied permission, no speech, etc.)
- [ ] Test clear functionality

---

## Success Criteria

- [ ] "Start Listening" requests microphone permission
- [ ] Interim text appears immediately (< 500ms)
- [ ] Final text appears after speech pause
- [ ] Vietnamese translation appears (< 2s)
- [ ] "Stop Listening" stops recording
- [ ] "Clear" resets all text
- [ ] Error messages display correctly
- [ ] No console errors
- [ ] Works in Chrome/Edge

---

## Conflict Prevention

**File ownership rules:**
- This phase creates new hook and voice recorder component
- Modifies `app/page.tsx` ONLY to replace placeholder
- Does NOT modify UI components (owned by Phase 02)
- Does NOT modify API route (owned by Phase 03)

---

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Browser not supported | High | Show clear error message with browser recommendation |
| Microphone permission denied | High | Handle 'not-allowed' error, show instruction |
| Speech API stops unexpectedly | Medium | Handle onend event, allow restart |
| Translation API fails | Low | Graceful degradation, don't block transcript |
| Network latency | Low | Show "Translating..." indicator |

---

## Security Considerations

- ✅ Client-side only (no sensitive data)
- ✅ Microphone permission handled by browser
- ✅ Translation API called server-side (API keys hidden)

---

## Next Steps

After completion:
1. Full integration testing (Phase 05)
2. Fix any bugs found
3. Optimize user experience
4. Deploy to production
