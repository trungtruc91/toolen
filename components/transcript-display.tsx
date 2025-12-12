'use client'

import { useState } from 'react'

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
  const [copiedEn, setCopiedEn] = useState(false)
  const [copiedVi, setCopiedVi] = useState(false)

  const handleCopy = async (text: string, type: 'en' | 'vi') => {
    if (!text.trim()) return
    
    try {
      await navigator.clipboard.writeText(text)
      if (type === 'en') {
        setCopiedEn(true)
        setTimeout(() => setCopiedEn(false), 2000)
      } else {
        setCopiedVi(true)
        setTimeout(() => setCopiedVi(false), 2000)
      }
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
      {/* English Transcript - Maximized */}
      <div className="flex flex-col border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden bg-white dark:bg-gray-900">
        <div className="flex-shrink-0 px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex items-center justify-between">
          <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
            English Transcript
          </h3>
          <button
            onClick={() => handleCopy(finalText + ' ' + interimText, 'en')}
            disabled={!finalText && !interimText}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-200"
            title="Copy to clipboard"
          >
            {copiedEn ? (
              <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            )}
          </button>
        </div>
        <div className="flex-1 p-4 overflow-auto min-h-[300px] lg:min-h-[400px]">
          <div className="text-base sm:text-lg leading-relaxed">
            {/* Final text (bold) */}
            {finalText && (
              <span className="text-gray-900 dark:text-white">
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
      </div>

      {/* Vietnamese Translation - Maximized */}
      <div className="flex flex-col border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden bg-white dark:bg-gray-900">
        <div className="flex-shrink-0 px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex items-center justify-between">
          <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
            Vietnamese Translation
          </h3>
          <button
            onClick={() => handleCopy(translation, 'vi')}
            disabled={!translation}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-200"
            title="Copy to clipboard"
          >
            {copiedVi ? (
              <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            )}
          </button>
        </div>
        <div className="flex-1 p-4 overflow-auto min-h-[300px] lg:min-h-[400px]">
          <div className="text-base sm:text-lg leading-relaxed">
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
    </div>
  )
}
