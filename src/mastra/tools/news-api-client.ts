// Production NewsAPI client tool
import axios from 'axios';

const API_KEY = process.env.NEWS_API_KEY;
const BASE_URL = 'https://newsapi.org/v2/everything';

export const newsApiClient = {
  async search(query: string): Promise<any[]> {
    const response = await axios.get(BASE_URL, {
      params: {
        q: query,
        apiKey: API_KEY,
        language: 'en',
        sortBy: 'publishedAt',
      },
    });
    return response.data.articles;
  },
};
