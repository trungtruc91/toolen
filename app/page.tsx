import { VoiceRecorder } from '@/components/voice-recorder'

export default function Home() {
  return (
    <main className="h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      {/* Compact Header */}
      <header className="flex-shrink-0 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Voice Transcript
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                Real-time speech-to-text with Vietnamese translation
              </p>
            </div>
            <div className="hidden sm:block text-xs text-gray-500 dark:text-gray-500">
              Chrome/Edge recommended
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Maximized */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 h-full">
          <VoiceRecorder />
        </div>
      </div>
    </main>
  )
}
