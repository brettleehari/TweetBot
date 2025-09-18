// Production Content Formatter tool
export const contentFormatter = {
  async formatDailySummary(analysis: any): Promise<string> {
    const priceChange = analysis.priceData?.change || 0;
    const changeEmoji = priceChange > 0 ? '📈' : priceChange < 0 ? '📉' : '➡️';
    const sentimentEmoji = this.getSentimentEmoji(analysis.sentiment?.overall || 0);
    
    return `📊 Bitcoin Daily Intel:

Price: $${analysis.priceData?.price?.toLocaleString() || 'N/A'} (${changeEmoji} ${priceChange}%)

Market Sentiment: ${sentimentEmoji}
Trend: ${analysis.priceTrend?.trend || 'neutral'}
Volatility: ${analysis.volatility?.volatility || 'low'}

Key Driver: ${analysis.topNews?.title || 'Market consolidation'}

${this.getHashtagString(['#Bitcoin', '#BTC', '#Crypto', '#DailyIntel'])}`;
  },

  async formatPriceAlert(priceData: any, analysis: any): Promise<string> {
    const changePercent = Math.abs(priceData.change || 0);
    const direction = (priceData.change || 0) > 0 ? 'up' : 'down';
    const urgencyEmoji = changePercent > 5 ? '🚨' : changePercent > 2 ? '⚡' : '📊';
    
    return `${urgencyEmoji} Bitcoin Alert: BTC ${direction} ${changePercent}%!

Current Price: $${priceData.price?.toLocaleString()}
24h Change: ${priceData.change > 0 ? '+' : ''}${priceData.change}%

${analysis.signals?.overallRecommendation ? `Signal: ${analysis.signals.overallRecommendation}` : ''}

${this.getHashtagString(['#Bitcoin', '#BTC', '#PriceAlert', '#Crypto'])}`;
  },

  async formatNewsAlert(newsItem: any, impactScore: number): Promise<string> {
    const impactEmoji = impactScore > 80 ? '🚨' : impactScore > 60 ? '⚡' : '📰';
    
    return `${impactEmoji} Bitcoin News Alert:

${newsItem.title}

Impact Score: ${impactScore}/100
Source: ${newsItem.source?.name || 'Unknown'}

${this.getHashtagString(['#Bitcoin', '#BTC', '#News', '#Crypto'])}`;
  },

  async formatMarketInsight(analysis: any): Promise<string> {
    const signals = analysis.signals?.signals || [];
    const topSignal = signals[0];
    
    return `🔍 Market Insight:

Bitcoin showing ${analysis.priceTrend?.trend || 'neutral'} trend
Sentiment: ${this.getSentimentLabel(analysis.sentiment?.overall || 0)}
Risk Level: ${analysis.signals?.riskLevel || 'Medium'}

${topSignal ? `Top Signal: ${topSignal.type} - ${topSignal.reason}` : 'Market in consolidation phase'}

${this.getHashtagString(['#Bitcoin', '#MarketAnalysis', '#Trading', '#Crypto'])}`;
  },

  getSentimentEmoji(sentiment: number): string {
    if (sentiment > 0.5) return '🚀';
    if (sentiment > 0.2) return '📈';
    if (sentiment < -0.5) return '📉';
    if (sentiment < -0.2) return '⚠️';
    return '➡️';
  },

  getSentimentLabel(sentiment: number): string {
    if (sentiment > 0.5) return 'Very Bullish';
    if (sentiment > 0.2) return 'Bullish';
    if (sentiment < -0.5) return 'Very Bearish';
    if (sentiment < -0.2) return 'Bearish';
    return 'Neutral';
  },

  getHashtagString(hashtags: string[]): string {
    return hashtags.join(' ');
  }
};
