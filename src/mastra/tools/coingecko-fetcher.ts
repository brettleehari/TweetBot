// Production CoinGecko fetcher tool
import axios from 'axios';

const BASE_URL = 'https://api.coingecko.com/api/v3/simple/price';

export const coinGeckoFetcher = {
  async getCurrentPrice(coinId: string): Promise<{ price: number }> {
    const response = await axios.get(BASE_URL, {
      params: {
        ids: coinId,
        vs_currencies: 'usd',
      },
    });
    return { price: response.data[coinId].usd };
  },
};
