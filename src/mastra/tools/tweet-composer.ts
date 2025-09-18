// Production Tweet Composer tool
export const tweetComposer = {
  async compose(data: any, template: string): Promise<string> {
    let content = template;
    
    // Replace placeholders with actual data
    content = content.replace('{{price}}', data.price?.toLocaleString() || 'N/A');
    content = content.replace('{{change}}', data.change || 'N/A');
    content = content.replace('{{sentiment}}', this.getSentimentEmoji(data.sentiment));
    content = content.replace('{{trend}}', data.trend || 'sideways');
    content = content.replace('{{timestamp}}', new Date().toLocaleDateString());
    
    return content;
  },

  async optimize(content: string, options: any): Promise<string> {
    // Ensure content fits Twitter's character limit
    if (content.length > 280) {
      content = content.substring(0, 277) + '...';
    }
    
    // Add engagement boosters based on target
    if (options.engagementTarget === 'high') {
      if (!content.includes('🚨') && !content.includes('📈') && !content.includes('📊')) {
        content = '🚨 ' + content;
      }
    }
    
    return content;
  },

  getSentimentEmoji(sentiment: number): string {
    if (sentiment > 0.5) return '🚀';
    if (sentiment > 0.2) return '📈';
    if (sentiment < -0.5) return '📉';
    if (sentiment < -0.2) return '⚠️';
    return '➡️';
  }
};
