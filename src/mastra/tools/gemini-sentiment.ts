// Production Google Gemini Sentiment Analysis tool
import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

export const geminiSentiment = {
  async analyze(prompt: string, newsItems: any[]): Promise<any> {
    try {
      const newsText = newsItems.map(item => 
        `Title: ${item.title}\nContent: ${item.description || item.content?.substring(0, 200) || ''}`
      ).join('\n\n');

      const fullPrompt = `${prompt}\n\nNews Articles:\n${newsText}\n\nPlease provide a JSON response with the following structure:
      {
        "overallSentiment": "bullish|bearish|neutral",
        "sentimentScore": number between -1 and 1,
        "confidence": number between 0 and 1,
        "keyFactors": ["factor1", "factor2"],
        "summary": "brief analysis summary"
      }`;

      const { text } = await generateText({
        model: google('models/gemini-pro'),
        prompt: fullPrompt,
        maxTokens: 500,
        temperature: 0.3,
      });

      // Try to parse JSON response, fallback to text analysis
      let analysis;
      try {
        analysis = JSON.parse(text);
      } catch (e) {
        // Fallback parsing if JSON fails
        analysis = this.parseTextResponse(text);
      }

      return {
        sentiment: analysis.overallSentiment || 'neutral',
        score: analysis.sentimentScore || 0,
        confidence: analysis.confidence || 0.75,
        keyFactors: analysis.keyFactors || [],
        summary: analysis.summary || text,
        rawResponse: text
      };
    } catch (error) {
      console.error('Gemini sentiment analysis error:', error);
      return {
        sentiment: 'neutral',
        score: 0,
        confidence: 0.5,
        keyFactors: [],
        summary: 'Analysis unavailable due to API error',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },

  parseTextResponse(text: string): any {
    // Simple text parsing fallback
    const lowerText = text.toLowerCase();
    let sentiment = 'neutral';
    let score = 0;

    if (lowerText.includes('bullish') || lowerText.includes('positive') || lowerText.includes('optimistic')) {
      sentiment = 'bullish';
      score = 0.6;
    } else if (lowerText.includes('bearish') || lowerText.includes('negative') || lowerText.includes('pessimistic')) {
      sentiment = 'bearish';
      score = -0.6;
    }

    return {
      overallSentiment: sentiment,
      sentimentScore: score,
      confidence: 0.7,
      keyFactors: [],
      summary: text.substring(0, 200)
    };
  }
};
