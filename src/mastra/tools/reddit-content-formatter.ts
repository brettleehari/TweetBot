// Reddit Content Formatter tool
export const redditContentFormatter = {
  formatBitcoinPriceAlert(price: number, change: number): { title: string; text: string } {
    const emoji = change > 0 ? '🚀📈' : '📉⚠️';
    const direction = change > 0 ? 'up' : 'down';
    
    return {
      title: `Bitcoin ${direction} ${Math.abs(change).toFixed(2)}% - Now at $${price.toLocaleString()} ${emoji}`,
      text: `**Bitcoin Price Update**\n\n` +
            `Current Price: **$${price.toLocaleString()}**\n` +
            `24h Change: **${change > 0 ? '+' : ''}${change.toFixed(2)}%**\n\n` +
            `${change > 5 ? '🔥 **Major bullish movement!**' : change < -5 ? '⚠️ **Significant decline**' : '📊 **Steady trading**'}\n\n` +
            `*This is an automated Bitcoin intelligence update*`
    };
  },

  formatMarketAnalysis(analysis: any): { title: string; text: string } {
    return {
      title: `📊 Bitcoin Market Analysis - ${new Date().toLocaleDateString()}`,
      text: `**Daily Bitcoin Intelligence Report**\n\n` +
            `🏷️ **Price**: $${analysis.price?.toLocaleString() || 'N/A'}\n` +
            `📈 **Trend**: ${analysis.trend || 'Analyzing...'}\n` +
            `🎯 **Sentiment**: ${analysis.sentiment || 'Mixed'}\n\n` +
            `**Key Insights:**\n` +
            `• Market showing ${analysis.momentum || 'moderate'} momentum\n` +
            `• Volume trends: ${analysis.volume || 'Normal'}\n` +
            `• Technical outlook: ${analysis.technical || 'Neutral'}\n\n` +
            `*Automated analysis by Bitcoin Intelligence Bot*`
    };
  },

  formatNewsDigest(news: any[]): { title: string; text: string } {
    const topNews = news.slice(0, 3);
    
    return {
      title: `📰 Bitcoin News Digest - ${new Date().toLocaleDateString()}`,
      text: `**Top Bitcoin News Today**\n\n` +
            topNews.map((item, index) => 
              `**${index + 1}. ${item.title}**\n` +
              `${item.description?.substring(0, 200)}...\n` +
              `[Read more](${item.url})\n`
            ).join('\n') +
            `\n*Curated by Bitcoin Intelligence Bot*`
    };
  },

  getOptimalSubreddits(): string[] {
    return ['Bitcoin', 'CryptoCurrency', 'BitcoinMarkets', 'CryptoMarkets'];
  },

  addRedditFormatting(text: string): string {
    return text
      .replace(/\*\*(.*?)\*\*/g, '**$1**')  // Bold
      .replace(/\*(.*?)\*/g, '*$1*')        // Italic
      .replace(/#{1,6}\s/g, '**')           // Headers to bold
      .replace(/^\s*[-*+]\s/gm, '• ');      // Bullet points
  }
};
