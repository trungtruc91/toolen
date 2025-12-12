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
      <div className="flex items-center justify-center h-full">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center max-w-md">
          <p className="text-red-800 dark:text-red-200 font-medium">
            ⚠️ Speech Recognition not supported
          </p>
          <p className="text-sm text-red-600 dark:text-red-300 mt-2">
            Please use Google Chrome or Microsoft Edge
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Error Display */}
      {error && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
          <p className="text-yellow-800 dark:text-yellow-200 text-sm">
            ⚠️ {error}
          </p>
        </div>
      )}

      {/* Transcript Display - Maximized */}
      <div className="flex-1 min-h-0">
        <TranscriptDisplay
          interimText={interimText}
          finalText={finalText}
          translation={translation}
        />
      </div>

      {/* Controls + Statusfooter */}
      <div className="flex-shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-gray-200 dark:border-gray-800">
        {/* Status Indicators */}
        <div className="flex items-center gap-3 text-sm">
          {isListening && (
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
              </span>
              <span className="font-medium">Listening</span>
            </div>
          )}
          {isTranslating && (
            <span className="text-blue-600 dark:text-blue-400 font-medium">
              Translating...
            </span>
          )}
          {!isListening && !isTranslating && (
            <span className="text-gray-500 dark:text-gray-500">
              Ready
            </span>
          )}
        </div>

        {/* Control Buttons */}
        <ControlButtons
          isListening={isListening}
          onStart={startListening}
          onStop={stopListening}
          onClear={handleClear}
          disabled={false}
        />
      </div>
    </div>
  )
}
