# Research Report: LibreTranslate API Integration

**Date:** 2025-12-12
**Researcher:** 02
**Topic:** LibreTranslate API for EN → VI Translation

---

## Overview

LibreTranslate: Free, Open Source Machine Translation API
- Powered by Argos Translate (not Google/Azure)
- Self-hosted, offline-capable, easy setup
- Latest version: 1.8.3 (Dec 4, 2025)

---

## API Integration

### Public Instance Endpoint
```
POST https://libretranslate.com/translate
```

### Request Format
```typescript
// Request body
{
  "q": "I am learning English",
  "source": "en",
  "target": "vi",
  "format": "text",
  "api_key": "YOUR_API_KEY" // Optional for public, required for rate limits
}

// Response
{
  "translatedText": "Tôi đang học tiếng Anh"
}
```

### Next.js API Route Implementation
```typescript
// app/api/translate/route.ts
export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const { text } = await request.json()

    const response = await fetch('https://libretranslate.com/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: text,
        source: 'en',
        target: 'vi',
        format: 'text',
        api_key: process.env.LIBRETRANSLATE_API_KEY // Optional
      })
    })

    const data = await response.json()

    return Response.json({
      vi: data.translatedText
    })
  } catch (error) {
    return Response.json(
      { error: 'Translation failed' },
      { status: 500 }
    )
  }
}
```

---

## Rate Limits & Costs

### Public Instance (libretranslate.com)

**Free Tier:**
- Public instances available without API key
- No documented rate limits for truly free tier
- Character limit: 2,000 per request
- Reliability/availability varies

**Paid Tier:**
- $9/month
- 80 requests/minute limit
- Higher reliability

### Self-Hosted Instance

**Costs:**
- FREE API usage (unlimited requests)
- Only pay for server infrastructure
- No per-request fees
- Full control over rate limits

**Requirements:**
- Docker/server to run
- RAM/CPU for translation models
- Storage for language models

**Setup:**
```bash
docker run -ti --rm -p 5000:5000 libretranslate/libretranslate

# With custom rate limits
docker run -ti --rm -p 5000:5000 \
  libretranslate/libretranslate \
  --req-limit 120
```

---

## Cost Analysis

### Scenarios:

**Low Usage (< 100 requests/day):**
- Recommendation: Use public free tier
- Cost: $0
- Risk: Rate limiting, downtime

**Medium Usage (100-1000 requests/day):**
- Recommendation: Paid public instance OR cheap VPS self-hosted
- Public cost: $9/month
- Self-hosted cost: ~$5-10/month VPS
- Trade-off: Convenience vs control

**High Usage (> 1000 requests/day):**
- Recommendation: Self-hosted
- Cost: Server costs only (~$10-20/month)
- Benefit: No per-request fees, unlimited usage

---

## Alternative Translation Services

### If LibreTranslate insufficient:

**1. Google Cloud Translation API**
- Cost: $20/1M characters
- Quality: High
- Free tier: $10/month credit
- Latency: < 500ms

**2. DeepL API**
- Cost: $5.49/500k characters (free tier)
- Quality: Very high
- Free tier: 500k characters/month
- Latency: < 1s

**3. Azure Translator**
- Cost: Free tier 2M characters/month
- Quality: High
- Paid: $10/1M characters
- Latency: < 1s

---

## Implementation Recommendations

### For MVP (Low Budget):

**Option 1: Public LibreTranslate (Free)**
```typescript
// No API key needed
fetch('https://libretranslate.com/translate', {
  method: 'POST',
  body: JSON.stringify({ q: text, source: 'en', target: 'vi' })
})
```

Pros: Free, simple
Cons: Unreliable, may have downtime

**Option 2: Paid LibreTranslate ($9/month)**
```typescript
// With API key
fetch('https://libretranslate.com/translate', {
  method: 'POST',
  body: JSON.stringify({
    q: text,
    source: 'en',
    target: 'vi',
    api_key: process.env.LIBRETRANSLATE_API_KEY
  })
})
```

Pros: Reliable, cheap
Cons: 80 req/min limit

**Option 3: Azure Translator Free Tier**
```typescript
// 2M characters/month free
fetch('https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&to=vi', {
  method: 'POST',
  headers: {
    'Ocp-Apim-Subscription-Key': process.env.AZURE_KEY,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify([{ text }])
})
```

Pros: Generous free tier, reliable, better quality
Cons: Azure account required

---

## Error Handling

```typescript
export async function POST(request: Request) {
  try {
    const { text } = await request.json()

    // Validate input
    if (!text || text.length > 2000) {
      return Response.json(
        { error: 'Text required, max 2000 chars' },
        { status: 400 }
      )
    }

    const response = await fetch('https://libretranslate.com/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        q: text,
        source: 'en',
        target: 'vi'
      }),
      signal: AbortSignal.timeout(5000) // 5s timeout
    })

    if (!response.ok) {
      throw new Error(`Translation API error: ${response.status}`)
    }

    const data = await response.json()

    return Response.json({ vi: data.translatedText })

  } catch (error) {
    console.error('Translation error:', error)

    // Fallback: return original text if translation fails
    return Response.json(
      { vi: request.body?.text || '', error: 'Translation unavailable' },
      { status: 200 } // Don't fail the request
    )
  }
}
```

---

## Recommendations for MVP

**Best approach for this project:**

1. **Start with Azure Translator Free Tier**
   - 2M characters/month free (very generous)
   - Reliable, production-ready
   - Better translation quality than LibreTranslate
   - Easy migration to paid if needed

2. **Fallback: LibreTranslate public (free)**
   - No API key needed
   - Works immediately
   - Acceptable for demo/MVP
   - Expect occasional failures

3. **Future: Self-host if high usage**
   - Only if > 1000 translations/day
   - Docker setup straightforward
   - Unlimited usage

---

## Sources

- [LibreTranslate Official Site](https://libretranslate.com/)
- [LibreTranslate API Documentation](https://docs.libretranslate.com/)
- [LibreTranslate GitHub](https://github.com/LibreTranslate/LibreTranslate)
- [LibreTranslate API Portal](https://portal.libretranslate.com/)
- [LibreTranslate Public API Directory](https://publicapi.dev/libre-translate-api)
- [LibreTranslate Self-Hosted Guide](https://technotes.videre.us/en/linux/self-hosted-and-free-libretranslate-language-translation/)
