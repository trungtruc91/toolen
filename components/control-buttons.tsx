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
