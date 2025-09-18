// Production OpenAI Sentiment Analysis tool
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export const openaiSentiment = {
  async analyze(prompt: string, newsItems: any[]): Promise<any> {
    const newsText = newsItems.map(item => 
      `Title: ${item.title}\nContent: ${item.description || item.content?.substring(0, 200) || ''}`
    ).join('\n\n');

    const fullPrompt = `${prompt}\n\nNews Articles:\n${newsText}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: fullPrompt }],
      max_tokens: 500,
      temperature: 0.3
    });

    return {
      sentiment: response.choices[0].message?.content || '',
      confidence: 0.85,
      analysis: 'OpenAI sentiment analysis complete'
    };
  }
};
