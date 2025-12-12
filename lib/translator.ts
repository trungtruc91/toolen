// Translation service abstraction
export interface TranslateRequest {
  text: string
  source?: string
  target?: string
}

export interface TranslateResponse {
  translatedText: string
}

class TranslationService {
  /**
   * Translate text using Azure Translator (preferred) or LibreTranslate (fallback)
   */
  async translate(
    text: string,
    source: string = 'en',
    target: string = 'vi'
  ): Promise<string> {
    // Try Azure Translator first
    if (process.env.AZURE_TRANSLATOR_KEY) {
      return this.translateWithAzure(text, source, target)
    }

    // Fallback to LibreTranslate
    return this.translateWithLibre(text, source, target)
  }

  private async translateWithAzure(
    text: string,
    source: string,
    target: string
  ): Promise<string> {
    const key = process.env.AZURE_TRANSLATOR_KEY!
    const region = process.env.AZURE_TRANSLATOR_REGION || 'eastasia'
    const endpoint = 'https://api.cognitive.microsofttranslator.com'

    const response = await fetch(
      `${endpoint}/translate?api-version=3.0&from=${source}&to=${target}`,
      {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': key,
          'Ocp-Apim-Subscription-Region': region,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([{ text }]),
        signal: AbortSignal.timeout(5000), // 5s timeout
      }
    )

    if (!response.ok) {
      throw new Error(`Azure Translator error: ${response.status}`)
    }

    const data = await response.json()
    return data[0]?.translations[0]?.text || text
  }

  private async translateWithLibre(
    text: string,
    source: string,
    target: string
  ): Promise<string> {
    const apiKey = process.env.LIBRETRANSLATE_API_KEY || ''
    const endpoint = 'https://libretranslate.com/translate'

    const body: any = {
      q: text,
      source,
      target,
      format: 'text',
    }

    if (apiKey) {
      body.api_key = apiKey
    }

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(5000), // 5s timeout
      })

      if (!response.ok) {
        const errorText = await response.text().catch(() => '')
        console.warn(`LibreTranslate error ${response.status}: ${errorText}`)
        
        // Return demo translation for common phrases
        return this.getDemoTranslation(text)
      }

      const data = await response.json()
      return data.translatedText || text
    } catch (error) {
      console.warn('LibreTranslate request failed:', error)
      // Return demo translation on network errors
      return this.getDemoTranslation(text)
    }
  }

  /**
   * Demo translations for testing without API keys
   * Returns basic Vietnamese translation for common English phrases
   */
  private getDemoTranslation(text: string): string {
    const lowerText = text.toLowerCase().trim()
    
    // Common phrases
    const demoTranslations: Record<string, string> = {
      'hello': 'Xin chào',
      'hello world': 'Xin chào thế giới',
      'hi': 'Chào',
      'how are you': 'Bạn khỏe không',
      'thank you': 'Cảm ơn bạn',
      'thanks': 'Cảm ơn',
      'goodbye': 'Tạm biệt',
      'bye': 'Tạm biệt',
      'yes': 'Vâng',
      'no': 'Không',
      'good morning': 'Chào buổi sáng',
      'good afternoon': 'Chào buổi chiều',
      'good evening': 'Chào buổi tối',
      'good night': 'Chúc ngủ ngon',
      'please': 'Làm ơn',
      'sorry': 'Xin lỗi',
      'excuse me': 'Xin lỗi',
      'welcome': 'Chào mừng',
      'test': 'Kiểm tra',
      'testing': 'Đang kiểm tra',
    }

    // Check for exact matches
    if (demoTranslations[lowerText]) {
      return demoTranslations[lowerText]
    }

    // Return original text with note
    return `[Demo] ${text}`
  }
}

export const translationService = new TranslationService()

