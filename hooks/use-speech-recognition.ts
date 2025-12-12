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
