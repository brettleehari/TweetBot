import { marketAnalyzer } from './market-analyzer';

describe('Analysis Agent', () => {
  it('should have correct name and tools', () => {
    expect(marketAnalyzer.name).toBe('market-analyzer');
    expect(marketAnalyzer.tools).toContain('openai-sentiment');
    expect(marketAnalyzer.tools).toContain('impact-scorer');
    expect(marketAnalyzer.tools).toContain('trend-detector');
    expect(marketAnalyzer.tools).toContain('signal-generator');
  });

  it('should have correct models', () => {
    expect(marketAnalyzer.models.sentiment).toBe('gpt-4o');
    expect(marketAnalyzer.models.classification).toBe('custom-bitcoin-model');
    expect(marketAnalyzer.models.embedding).toBe('text-embedding-3-large');
  });
});
