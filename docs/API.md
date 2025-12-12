# API Documentation

## Overview

Voice Transcript Tool exposes a single API endpoint for text translation. The API is designed for internal use by the frontend but can be called directly for testing or integration.

## Base URL

**Development:**
```
http://localhost:3000
```

**Production:**
```
https://your-app.vercel.app
```

---

## Endpoints

### POST /api/translate

Translates text from English to Vietnamese using Azure Translator or LibreTranslate.

#### Request

**Method:** `POST`

**Headers:**
```http
Content-Type: application/json
```

**Body:**
```json
{
  "text": "I am learning English"
}
```

**Parameters:**

| Field | Type | Required | Description | Constraints |
|-------|------|----------|-------------|-------------|
| `text` | string | Yes | Text to translate | Max 2000 characters |

#### Response

**Success (200 OK):**
```json
{
  "vi": "Tôi đang học tiếng Anh"
}
```

**Error Responses:**

**400 Bad Request - Invalid Input:**
```json
{
  "error": "Text is required and must be a string"
}
```

**400 Bad Request - Text Too Long:**
```json
{
  "error": "Text exceeds 2000 character limit"
}
```

**200 OK - Empty Translation (Service Error):**
```json
{
  "vi": "",
  "error": "Translation service temporarily unavailable"
}
```

> Note: Translation errors return 200 status for graceful degradation. Check for `error` field in response.

#### Examples

**cURL:**
```bash
curl -X POST http://localhost:3000/api/translate \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello, how are you?"}'
```

**JavaScript (fetch):**
```javascript
const response = await fetch('/api/translate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    text: 'Hello, how are you?'
  })
})

const data = await response.json()
console.log(data.vi) // "Xin chào, bạn khỏe không?"
```

**TypeScript:**
```typescript
interface TranslateRequest {
  text: string
}

interface TranslateResponse {
  vi: string
  error?: string
}

async function translateText(text: string): Promise<string> {
  const response = await fetch('/api/translate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  })

  const data: TranslateResponse = await response.json()

  if (data.error) {
    console.warn('Translation warning:', data.error)
  }

  return data.vi
}
```

---

### GET /api/translate

Health check endpoint to verify translation service status.

#### Request

**Method:** `GET`

**No parameters required**

#### Response

**Success (200 OK):**
```json
{
  "status": "ok",
  "service": "azure",
  "ready": true
}
```

**Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `status` | string | Always "ok" |
| `service` | string | "azure" or "libretranslate" |
| `ready` | boolean | Always true |

#### Examples

**cURL:**
```bash
curl http://localhost:3000/api/translate
```

**JavaScript:**
```javascript
const response = await fetch('/api/translate')
const health = await response.json()
console.log(`Using ${health.service}`) // "Using azure"
```

---

## Translation Service Logic

### Service Selection

The API automatically selects translation service based on environment variables:

```typescript
if (AZURE_TRANSLATOR_KEY is set) {
  use Azure Translator
} else {
  use LibreTranslate
}
```

### Azure Translator

**Endpoint:** `https://api.cognitive.microsofttranslator.com`

**Request:**
```http
POST /translate?api-version=3.0&from=en&to=vi
Content-Type: application/json
Ocp-Apim-Subscription-Key: <key>
Ocp-Apim-Subscription-Region: <region>

[{"text": "Hello"}]
```

**Response:**
```json
[{
  "translations": [{
    "text": "Xin chào",
    "to": "vi"
  }]
}]
```

### LibreTranslate

**Endpoint:** `https://libretranslate.com/translate`

**Request:**
```http
POST /translate
Content-Type: application/json

{
  "q": "Hello",
  "source": "en",
  "target": "vi",
  "format": "text"
}
```

**Response:**
```json
{
  "translatedText": "Xin chào"
}
```

---

## Error Handling

### Validation Errors

**Empty Text:**
```json
Request:  {"text": ""}
Response: {"vi": "", status: 200}  // Empty → empty translation
```

**Missing Text:**
```json
Request:  {}
Response: {"error": "Text is required and must be a string", status: 400}
```

**Wrong Type:**
```json
Request:  {"text": 123}
Response: {"error": "Text is required and must be a string", status: 400}
```

**Text Too Long:**
```json
Request:  {"text": "<2001 characters>"}
Response: {"error": "Text exceeds 2000 character limit", status: 400}
```

### Service Errors

**Azure Translator Error:**
```typescript
// Server logs
Translation error: Azure Translator error: 401

// Response (graceful degradation)
{
  "vi": "",
  "error": "Translation service temporarily unavailable"
}
```

**LibreTranslate Error:**
```typescript
// Server logs
Translation error: LibreTranslate error: 503

// Response
{
  "vi": "",
  "error": "Translation service temporarily unavailable"
}
```

### Network Errors

**Timeout (5s):**
```typescript
// Internal timeout handling
fetch(endpoint, {
  signal: AbortSignal.timeout(5000)
})

// Response
{
  "vi": "",
  "error": "Translation service temporarily unavailable"
}
```

---

## Rate Limits

### Azure Translator (Free Tier)

- **Limit:** 2,000,000 characters/month
- **Requests:** Unlimited
- **Character counting:** All characters in request text

**Example:**
```
Text: "Hello, how are you?" (20 characters)
Cost: 20 characters from monthly quota
```

### LibreTranslate (Public Instance)

- **Official limits:** Not documented
- **Practical limits:** ~100 requests/hour per IP
- **Rate limit response:** HTTP 429 (Too Many Requests)

**Mitigation:**
- Use Azure Translator for production
- Self-host LibreTranslate for unlimited usage
- Implement client-side throttling

---

## Performance

### Latency Benchmarks

**Azure Translator:**
- Average: 300-500ms
- P95: 800ms
- P99: 1200ms

**LibreTranslate (Public):**
- Average: 800-1500ms
- P95: 3000ms
- P99: 5000ms (timeout)

**Factors affecting latency:**
- Text length (longer = slower)
- Server region (use closest Azure region)
- Network conditions
- Service load

### Optimization Tips

1. **Use Azure Translator** for better performance
2. **Set correct region** in `AZURE_TRANSLATOR_REGION`
3. **Batch requests** if translating multiple sentences (future enhancement)
4. **Client-side caching** for repeated translations (future enhancement)

---

## Security

### API Key Protection

**Frontend:**
```typescript
// ❌ NEVER expose API keys in client code
const AZURE_KEY = 'secret' // WRONG!

// ✅ Always call backend API
fetch('/api/translate', { ... })
```

**Backend:**
```typescript
// ✅ API keys stored in .env.local (server-only)
const key = process.env.AZURE_TRANSLATOR_KEY
```

### Input Sanitization

**Length limit:**
```typescript
if (text.length > 2000) {
  return error('Text exceeds 2000 character limit')
}
```

**Type checking:**
```typescript
if (!text || typeof text !== 'string') {
  return error('Text is required and must be a string')
}
```

**Empty strings:**
```typescript
if (text.trim().length === 0) {
  return { vi: '' } // Skip API call
}
```

### CORS

**Default:** Same-origin only

**To enable external access:**
```typescript
// /api/translate/route.ts
export async function POST(request: NextRequest) {
  const response = NextResponse.json({ ... })

  // Add CORS headers
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'POST')

  return response
}
```

---

## Testing

### Manual Testing

**Test valid request:**
```bash
curl -X POST http://localhost:3000/api/translate \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello world"}'
```

**Test empty text:**
```bash
curl -X POST http://localhost:3000/api/translate \
  -H "Content-Type: application/json" \
  -d '{"text": ""}'
```

**Test invalid input:**
```bash
curl -X POST http://localhost:3000/api/translate \
  -H "Content-Type: application/json" \
  -d '{"text": 123}'
```

**Test health check:**
```bash
curl http://localhost:3000/api/translate
```

### Automated Testing (Future)

```typescript
// Example test with Jest
describe('POST /api/translate', () => {
  it('translates text successfully', async () => {
    const response = await fetch('/api/translate', {
      method: 'POST',
      body: JSON.stringify({ text: 'Hello' })
    })

    const data = await response.json()
    expect(data.vi).toBeTruthy()
    expect(response.status).toBe(200)
  })

  it('rejects text over 2000 characters', async () => {
    const longText = 'a'.repeat(2001)
    const response = await fetch('/api/translate', {
      method: 'POST',
      body: JSON.stringify({ text: longText })
    })

    expect(response.status).toBe(400)
  })
})
```

---

## Troubleshooting

**Problem: "Translation service temporarily unavailable"**

Solutions:
1. Check `.env.local` has correct `AZURE_TRANSLATOR_KEY`
2. Verify Azure region matches your resource region
3. Check Azure quota (2M chars/month)
4. Test LibreTranslate: remove Azure key from `.env.local`
5. Check server logs: `console.error` output

**Problem: Slow translations (> 3 seconds)**

Solutions:
1. Switch to Azure Translator (faster than LibreTranslate)
2. Set `AZURE_TRANSLATOR_REGION` to nearest region
3. Check internet connection
4. Self-host LibreTranslate for faster response

**Problem: 429 Too Many Requests (LibreTranslate)**

Solutions:
1. Use Azure Translator (no rate limits on free tier)
2. Self-host LibreTranslate
3. Add client-side request throttling

**Problem: Health check shows wrong service**

Solutions:
1. Restart dev server: `npm run dev`
2. Check `.env.local` is in project root
3. Verify `AZURE_TRANSLATOR_KEY` is set (no quotes)
4. Check API route uses `export const dynamic = 'force-dynamic'`

---

## Future Enhancements

**Planned API improvements:**
1. **Batch translation:** Translate multiple sentences in one request
2. **Language detection:** Auto-detect source language
3. **Caching:** Cache translations in Redis
4. **WebSocket:** Real-time translation stream
5. **Multiple targets:** Translate to multiple languages
6. **Authentication:** API key for external usage
7. **Rate limiting:** Per-user quotas

**Example future endpoint:**
```typescript
POST /api/translate/batch
{
  "texts": ["Hello", "Goodbye"],
  "from": "en",
  "to": ["vi", "fr", "es"]
}

Response:
{
  "translations": [
    { "vi": "Xin chào", "fr": "Bonjour", "es": "Hola" },
    { "vi": "Tạm biệt", "fr": "Au revoir", "es": "Adiós" }
  ]
}
```

---

## References

**Azure Translator:**
- API Docs: https://learn.microsoft.com/azure/ai-services/translator/
- Free tier: https://azure.microsoft.com/pricing/details/cognitive-services/translator/

**LibreTranslate:**
- API Docs: https://libretranslate.com/docs/
- Self-hosting: https://github.com/LibreTranslate/LibreTranslate

**Next.js API Routes:**
- Docs: https://nextjs.org/docs/app/building-your-application/routing/route-handlers
