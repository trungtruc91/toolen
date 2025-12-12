import { NextRequest, NextResponse } from 'next/server'
import { translationService } from '@/lib/translator'

// CRITICAL: Prevent static optimization (env vars would be undefined)
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json()
    const { text } = body

    // Validate input
    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required and must be a string' },
        { status: 400 }
      )
    }

    if (text.length > 2000) {
      return NextResponse.json(
        { error: 'Text exceeds 2000 character limit' },
        { status: 400 }
      )
    }

    if (text.trim().length === 0) {
      return NextResponse.json(
        { vi: '' },
        { status: 200 }
      )
    }

    // Translate
    const translatedText = await translationService.translate(text, 'en', 'vi')

    return NextResponse.json({
      vi: translatedText
    })

  } catch (error) {
    console.error('Translation error:', error)

    // Graceful degradation: return original text with error flag
    return NextResponse.json(
      {
        vi: '',
        error: 'Translation service temporarily unavailable'
      },
      { status: 200 } // Don't fail the request
    )
  }
}

// Health check endpoint
export async function GET() {
  const usingAzure = !!process.env.AZURE_TRANSLATOR_KEY
  const usingLibre = !usingAzure

  return NextResponse.json({
    status: 'ok',
    service: usingAzure ? 'azure' : 'libretranslate',
    ready: true
  })
}
