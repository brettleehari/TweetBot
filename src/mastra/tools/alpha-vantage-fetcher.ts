// Production Alpha Vantage fetcher tool
import axios from 'axios';

const API_KEY = process.env.ALPHA_VANTAGE_API_KEY;
const BASE_URL = 'https://www.alphavantage.co/query';

export const alphaVantageFetcher = {
  async getCurrentPrice(symbol: string): Promise<{ price: number }> {
    const response = await axios.get(BASE_URL, {
      params: {
        function: 'CURRENCY_EXCHANGE_RATE',
        from_currency: symbol,
        to_currency: 'USD',
        apikey: API_KEY,
      },
    });
    const data = response.data['Realtime Currency Exchange Rate'];
    return { price: parseFloat(data['5. Exchange Rate']) };
  },
};
