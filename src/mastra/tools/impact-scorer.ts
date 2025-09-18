// Production Impact Scorer tool
export const impactScorer = {
  async scoreNews(newsItem: any, priceData: any): Promise<number> {
    let score = 0;
    
    // Source credibility scoring
    const sourceWeights: Record<string, number> = {
      'CoinDesk': 0.9,
      'Decrypt': 0.8,
      'Bitcoin Magazine': 0.85,
      'Cointelegraph': 0.7,
      'default': 0.5
    };
    
    score += (sourceWeights[newsItem.source?.name] || sourceWeights.default) * 30;
    
    // Keyword importance
    const highImpactKeywords = ['regulation', 'SEC', 'ETF', 'institutional', 'adoption', 'ban'];
    const mediumImpactKeywords = ['price', 'market', 'trading', 'volume'];
    
    const title = (newsItem.title || '').toLowerCase();
    const content = (newsItem.description || '').toLowerCase();
    
    highImpactKeywords.forEach(keyword => {
      if (title.includes(keyword) || content.includes(keyword)) {
        score += 25;
      }
    });
    
    mediumImpactKeywords.forEach(keyword => {
      if (title.includes(keyword) || content.includes(keyword)) {
        score += 10;
      }
    });
    
    // Recency bonus
    const publishedTime = new Date(newsItem.publishedAt || Date.now());
    const hoursSincePublished = (Date.now() - publishedTime.getTime()) / (1000 * 60 * 60);
    
    if (hoursSincePublished < 1) score += 20;
    else if (hoursSincePublished < 6) score += 10;
    else if (hoursSincePublished < 24) score += 5;
    
    return Math.min(score, 100); // Cap at 100
  }
};
