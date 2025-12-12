# Phase 02: UI Components & Layout

**Date:** 2025-12-12
**Priority:** High
**Status:** ✅ Completed
**Progress:** 100%

---

## Context Links

- [Main Plan](./plan.md)
- [Next.js Research](./research/researcher-01-nextjs-webspeech.md)
- [Phase 01 (Setup)](./phase-01-project-setup.md)

---

## Parallelization Info

**Can run in parallel with:** Phase 01, Phase 03
**Must complete before:** Phase 04 (Voice Integration needs UI components)
**Parallelization group:** Group A
**Dependencies:** None (can start immediately if directory structure exists)

**File ownership:** Exclusive to this phase
- `app/page.tsx`
- `components/transcript-display.tsx`
- `components/control-buttons.tsx`

---

## Overview

Create clean, responsive UI components for voice transcript tool: main page layout, transcript display area, control buttons.

**Estimated time:** 30-40 minutes

---

## Key Insights

- Keep UI minimal for MVP (KISS principle)
- Separate concerns: Display vs Controls
- Use Tailwind for rapid styling
- Client components needed for interactivity
- Visual distinction: interim (light) vs final (bold) text

---

## Requirements

### Functional
- Main page layout with header
- Transcript display area (interim + final text)
- Control buttons (Start/Stop Listening)
- Clear visual states (listening/stopped)
- Responsive design (desktop-first, mobile-friendly)

### Non-Functional
- Clean, readable typography
- Accessible color contrast
- Loading states
- Mobile-responsive

---

## Architecture

### Component Hierarchy
```
page.tsx (Server Component)
  └── VoiceRecorder (Client Component - Phase 04)
       ├── ControlButtons (Presentation Component)
       └── TranscriptDisplay (Presentation Component)
```

**Note:** VoiceRecorder created in Phase 04, but we prepare the UI components here.

---

## Related Code Files

### Files to Create
- `app/page.tsx` - Main page layout
- `components/transcript-display.tsx` - Display component
- `components/control-buttons.tsx` - Button controls

### Files to Modify
None

---

## File Ownership

**This phase exclusively owns:**
- `app/page.tsx`
- `components/transcript-display.tsx`
- `components/control-buttons.tsx`

**Other phases MUST NOT modify these files.**

---

## Implementation Steps

### 1. Create Main Page Layout

**File:** `app/page.tsx`
```typescript
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

        {/* Voice Recorder Component (to be created in Phase 04) */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <p className="text-center text-gray-500">
            Voice recorder will be integrated in Phase 04
          </p>
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

### 2. Create Transcript Display Component

**File:** `components/transcript-display.tsx`
```typescript
interface TranscriptDisplayProps {
  interimText: string
  finalText: string
  translation: string
}

export function TranscriptDisplay({
  interimText,
  finalText,
  translation
}: TranscriptDisplayProps) {
  return (
    <div className="space-y-4">
      {/* English Transcript */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 min-h-[200px] bg-gray-50 dark:bg-gray-900">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          English Transcript
        </h3>
        <div className="text-lg leading-relaxed">
          {/* Final text (bold) */}
          {finalText && (
            <span className="text-gray-900 dark:text-white font-medium">
              {finalText}{' '}
            </span>
          )}
          {/* Interim text (lighter) */}
          {interimText && (
            <span className="text-gray-500 dark:text-gray-400 italic">
              {interimText}
            </span>
          )}
          {/* Empty state */}
          {!finalText && !interimText && (
            <span className="text-gray-400 dark:text-gray-600">
              Start speaking to see transcript...
            </span>
          )}
        </div>
      </div>

      {/* Vietnamese Translation */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 min-h-[150px] bg-gray-50 dark:bg-gray-900">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Vietnamese Translation
        </h3>
        <div className="text-lg leading-relaxed">
          {translation ? (
            <span className="text-gray-900 dark:text-white">
              {translation}
            </span>
          ) : (
            <span className="text-gray-400 dark:text-gray-600">
              Translation will appear here...
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
```

### 3. Create Control Buttons Component

**File:** `components/control-buttons.tsx`
```typescript
interface ControlButtonsProps {
  isListening: boolean
  onStart: () => void
  onStop: () => void
  onClear?: () => void
  disabled?: boolean
}

export function ControlButtons({
  isListening,
  onStart,
  onStop,
  onClear,
  disabled = false
}: ControlButtonsProps) {
  return (
    <div className="flex gap-3 justify-center items-center">
      {/* Start/Stop Button */}
      {!isListening ? (
        <button
          onClick={onStart}
          disabled={disabled}
          className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold rounded-lg shadow-md transition-colors"
        >
          <svg
            className="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
              clipRule="evenodd"
            />
          </svg>
          Start Listening
        </button>
      ) : (
        <button
          onClick={onStop}
          className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-md transition-colors animate-pulse"
        >
          <svg
            className="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z"
              clipRule="evenodd"
            />
          </svg>
          Stop Listening
        </button>
      )}

      {/* Clear Button (Optional) */}
      {onClear && (
        <button
          onClick={onClear}
          disabled={disabled}
          className="px-4 py-3 bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 text-gray-800 font-medium rounded-lg shadow-sm transition-colors"
        >
          Clear
        </button>
      )}
    </div>
  )
}
```

### 4. Add TypeScript Declarations (if needed)

**File:** `types/speech-recognition.d.ts` (if not exists)
```typescript
interface Window {
  SpeechRecognition: typeof SpeechRecognition
  webkitSpeechRecognition: typeof SpeechRecognition
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
  resultIndex: number
}

interface SpeechRecognitionResultList {
  length: number
  item(index: number): SpeechRecognitionResult
  [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionResult {
  isFinal: boolean
  length: number
  item(index: number): SpeechRecognitionAlternative
  [index: number]: SpeechRecognitionAlternative
}

interface SpeechRecognitionAlternative {
  transcript: string
  confidence: number
}
```

---

## Todo List

- [x] Create `app/page.tsx` with layout and header
- [x] Create `components/transcript-display.tsx`
- [x] Create `components/control-buttons.tsx`
- [x] Add TypeScript declarations (if needed)
- [ ] Test UI renders correctly (`npm run dev`) - Pending Phase 01 setup
- [ ] Verify responsive design (mobile/desktop) - Pending Phase 01 setup
- [ ] Check dark mode styling - Pending Phase 01 setup

---

## Success Criteria

- [ ] Page renders at http://localhost:3000
- [ ] Components properly typed (no TypeScript errors)
- [ ] UI responsive on mobile/desktop
- [ ] Dark mode works correctly
- [ ] Components accept props correctly
- [ ] Buttons styled and accessible

---

## Conflict Prevention

**File ownership rules:**
- This phase creates UI components ONLY
- Phase 04 will import and use these components
- No modifications to config files (owned by Phase 01)
- No API implementation (owned by Phase 03)

---

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Dark mode color contrast issues | Low | Test with browser dark mode |
| Mobile layout breaks | Medium | Use responsive Tailwind classes |
| Component props type mismatch | Low | Strict TypeScript interfaces |

---

## Security Considerations

- No security concerns (presentation layer only)
- No user input handling (Phase 04)

---

## Next Steps

After completion:
1. Components ready for Phase 04 integration
2. Can run Phase 03 (Translation API) in parallel
3. Phase 04 will create VoiceRecorder component that uses these UI components
