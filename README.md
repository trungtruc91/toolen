# Voice Transcript Tool

Real-time English speech-to-text transcription with Vietnamese translation. Built for English learners, teachers, and developers needing quick STT demos.

## Overview

Web-based tool that listens to your microphone, transcribes English speech in real-time, and translates to Vietnamese. Features:

- **Real-time transcription** using Web Speech API (< 500ms latency)
- **Vietnamese translation** via Azure Translator or LibreTranslate
- **Interim results** show what you're saying as you speak
- **Simple UI** - no learning curve required
- **Free/low-cost** - works with free translation tiers

## Tech Stack

- **Frontend:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS
- **Speech:** Web Speech API (browser-native)
- **Translation:** Azure Translator (preferred) or LibreTranslate (fallback)
- **Deployment:** Vercel-ready

## Browser Compatibility

**Supported:**
- Google Chrome (recommended)
- Microsoft Edge

**Not Supported:**
- Safari (Web Speech API limitations)
- Firefox (Web Speech API not available)

## Quick Start

### 1. Clone & Install

```bash
git clone <repository-url>
cd toolen
npm install
```

### 2. Configure Translation Service

Choose one option:

**Option A: Azure Translator (Recommended)**

1. Create free Azure account: https://azure.microsoft.com/free/
2. Create Translator resource in Azure portal
3. Copy key and region to `.env.local`

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
AZURE_TRANSLATOR_KEY=your_azure_key_here
AZURE_TRANSLATOR_REGION=eastasia
```

**Option B: LibreTranslate (Public Free)**

Leave `.env.local` empty - app will use LibreTranslate public instance automatically.

### 3. Run Development Server

```bash
npm run dev
```

Open http://localhost:3000

### 4. Use the Tool

1. Click **Start Listening**
2. Allow microphone access when prompted
3. Speak in English
4. Watch real-time transcript appear
5. See Vietnamese translation after each sentence
6. Click **Stop Listening** when done

## Scripts

```bash
npm run dev        # Start development server (Turbopack)
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Run ESLint
npm run typecheck  # TypeScript type checking
```

## Project Structure

```
toolen/
├── app/
│   ├── api/
│   │   └── translate/
│   │       └── route.ts           # POST /api/translate endpoint
│   ├── layout.tsx                 # Root layout
│   └── page.tsx                   # Main page
├── components/
│   ├── voice-recorder.tsx         # Main voice recording component
│   ├── transcript-display.tsx     # Shows English + Vietnamese
│   └── control-buttons.tsx        # Start/Stop/Clear buttons
├── hooks/
│   └── use-speech-recognition.ts  # Web Speech API hook
├── lib/
│   └── translator.ts              # Translation service abstraction
├── docs/
│   ├── ARCHITECTURE.md            # System architecture
│   ├── API.md                     # API documentation
│   └── DEVELOPMENT.md             # Development guide
├── .env.example                   # Environment template
└── package.json
```

## Environment Variables

See `.env.example` for full list:

```env
# Azure Translator (Option 1)
AZURE_TRANSLATOR_KEY=              # Get from Azure portal
AZURE_TRANSLATOR_REGION=eastasia   # Your Azure region

# LibreTranslate (Option 2 - fallback)
LIBRETRANSLATE_API_KEY=            # Optional, public instance works without key
```

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard:
   - `AZURE_TRANSLATOR_KEY`
   - `AZURE_TRANSLATOR_REGION`
4. Deploy

### Other Platforms

Compatible with any Node.js hosting (Netlify, Cloudflare Pages, Railway, etc.). Requires Node.js 18+.

## Troubleshooting

**"Speech Recognition not supported"**
- Use Chrome or Edge browser
- Check browser version is up to date

**"Microphone access denied"**
- Click lock icon in address bar
- Allow microphone permission
- Refresh page

**Translation not working**
- Check `.env.local` has correct Azure credentials
- For LibreTranslate: check internet connection (uses public API)
- Check browser console for errors

**No speech detected**
- Check microphone is working (test in system settings)
- Speak closer to microphone
- Reduce background noise

**Slow translation**
- Azure Translator: check region (use closest region)
- LibreTranslate: public instance can be slow during peak times
- Consider self-hosting LibreTranslate for better performance

## Limitations

- **Browser-dependent:** Relies on browser's STT model (quality varies)
- **English only:** Configured for en-US (can modify in code)
- **Online-only:** Requires internet for translation API
- **Rate limits:** Azure free tier = 2M chars/month, LibreTranslate may rate limit

## Future Enhancements

- Fallback to Google Speech-to-Text
- Save transcript history to localStorage
- Download transcript as TXT/PDF
- Highlight current word being spoken
- Multi-language support
- LLM integration for grammar explanations
- Pronunciation scoring

## License

MIT

## Contributing

Contributions welcome! Please open issues or PRs.

## Support

For issues, questions, or feature requests, please open an issue on GitHub.
# toolen
