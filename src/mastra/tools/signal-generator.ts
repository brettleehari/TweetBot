// Production Signal Generator tool
export const signalGenerator = {
  async generateTradingSignals(analysis: any): Promise<any> {
    const signals = [];
    
    // Price trend signals
    if (analysis.priceTrend?.trend === 'bullish' && analysis.priceTrend?.confidence > 0.7) {
      signals.push({
        type: 'BUY',
        strength: 'STRONG',
        reason: 'Strong bullish price trend detected',
        confidence: analysis.priceTrend.confidence
      });
    } else if (analysis.priceTrend?.trend === 'bearish' && analysis.priceTrend?.confidence > 0.7) {
      signals.push({
        type: 'SELL',
        strength: 'STRONG', 
        reason: 'Strong bearish price trend detected',
        confidence: analysis.priceTrend.confidence
      });
    }
    
    // Sentiment signals
    if (analysis.sentiment?.overall > 0.6) {
      signals.push({
        type: 'BUY',
        strength: 'MEDIUM',
        reason: 'Positive market sentiment',
        confidence: 0.6
      });
    } else if (analysis.sentiment?.overall < -0.6) {
      signals.push({
        type: 'SELL',
        strength: 'MEDIUM',
        reason: 'Negative market sentiment', 
        confidence: 0.6
      });
    }
    
    // Volatility signals
    if (analysis.volatility?.volatility === 'high') {
      signals.push({
        type: 'CAUTION',
        strength: 'HIGH',
        reason: 'High volatility detected - exercise caution',
        confidence: 0.8
      });
    }
    
    // Impact-based signals
    if (analysis.impactScore > 80) {
      signals.push({
        type: 'ALERT',
        strength: 'HIGH',
        reason: 'High-impact news detected',
        confidence: 0.9
      });
    }
    
    return {
      signals,
      overallRecommendation: this.getOverallRecommendation(signals),
      riskLevel: this.calculateRiskLevel(analysis)
    };
  },
  
  getOverallRecommendation(signals: any[]): string {
    const buySignals = signals.filter(s => s.type === 'BUY').length;
    const sellSignals = signals.filter(s => s.type === 'SELL').length;
    const cautionSignals = signals.filter(s => s.type === 'CAUTION').length;
    
    if (cautionSignals > 0) return 'HOLD_WITH_CAUTION';
    if (buySignals > sellSignals) return 'BUY';
    if (sellSignals > buySignals) return 'SELL';
    return 'HOLD';
  },
  
  calculateRiskLevel(analysis: any): string {
    let riskScore = 0;
    
    if (analysis.volatility?.volatility === 'high') riskScore += 3;
    else if (analysis.volatility?.volatility === 'medium') riskScore += 2;
    else riskScore += 1;
    
    if (analysis.impactScore > 80) riskScore += 2;
    if (Math.abs(analysis.sentiment?.overall || 0) > 0.8) riskScore += 1;
    
    if (riskScore >= 5) return 'HIGH';
    if (riskScore >= 3) return 'MEDIUM';
    return 'LOW';
  }
};
