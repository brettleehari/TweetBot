import { contentCreator } from './content-creator';

describe('Content Generation Agent', () => {
  it('should have correct name and tools', () => {
    expect(contentCreator.name).toBe('content-creator');
    expect(contentCreator.tools).toContain('tweet-composer');
    expect(contentCreator.tools).toContain('hashtag-optimizer');
    expect(contentCreator.tools).toContain('engagement-predictor');
    expect(contentCreator.tools).toContain('content-formatter');
  });

  it('should have templates defined', () => {
    expect(contentCreator.templates).toHaveProperty('dailySummary');
    expect(contentCreator.templates).toHaveProperty('priceAlert');
    expect(contentCreator.templates).toHaveProperty('newsAlert');
    expect(contentCreator.templates).toHaveProperty('marketInsight');
  });
});
