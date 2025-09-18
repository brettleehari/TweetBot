import { socialPublisher } from './social-publisher';

describe('Social Media Agent', () => {
  it('should have correct name and tools', () => {
    expect(socialPublisher.name).toBe('social-publisher');
    expect(socialPublisher.tools).toContain('twitter-api-v2');
    expect(socialPublisher.tools).toContain('engagement-tracker');
    expect(socialPublisher.tools).toContain('posting-scheduler');
    expect(socialPublisher.tools).toContain('analytics-collector');
  });

  it('should have posting strategies', () => {
    expect(socialPublisher.strategies.posting.dailySummary).toBe('9:00 AM EST');
    expect(socialPublisher.strategies.posting.breakingNews).toBe('immediate');
    expect(socialPublisher.strategies.posting.insights).toBe('market hours');
  });

  it('should have engagement strategies', () => {
    expect(socialPublisher.strategies.engagement.trackMetrics).toEqual(['likes', 'retweets', 'replies', 'impressions']);
    expect(socialPublisher.strategies.engagement.responseTime).toBe('< 1 hour');
    expect(socialPublisher.strategies.engagement.hashtagStrategy).toBe('trending + niche');
  });
});
