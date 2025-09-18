// Production Trend Detector tool
export const trendDetector = {
  async detectPriceTrends(priceHistory: number[]): Promise<any> {
    if (priceHistory.length < 2) return { trend: 'insufficient_data', strength: 0 };
    
    const recent = priceHistory.slice(-5); // Last 5 data points
    let upward = 0, downward = 0;
    
    for (let i = 1; i < recent.length; i++) {
      if (recent[i] > recent[i-1]) upward++;
      else if (recent[i] < recent[i-1]) downward++;
    }
    
    const strength = Math.abs(upward - downward) / (recent.length - 1);
    
    if (upward > downward) {
      return { trend: 'bullish', strength, direction: 'up', confidence: strength };
    } else if (downward > upward) {
      return { trend: 'bearish', strength, direction: 'down', confidence: strength };
    } else {
      return { trend: 'sideways', strength: 0, direction: 'neutral', confidence: 0.5 };
    }
  },
  
  async detectVolatility(priceHistory: number[]): Promise<any> {
    if (priceHistory.length < 2) return { volatility: 'low', percentage: 0 };
    
    const changes = [];
    for (let i = 1; i < priceHistory.length; i++) {
      changes.push(Math.abs((priceHistory[i] - priceHistory[i-1]) / priceHistory[i-1]) * 100);
    }
    
    const avgChange = changes.reduce((a, b) => a + b, 0) / changes.length;
    
    if (avgChange > 5) return { volatility: 'high', percentage: avgChange };
    else if (avgChange > 2) return { volatility: 'medium', percentage: avgChange };
    else return { volatility: 'low', percentage: avgChange };
  }
};
