import { bitcoinOrchestrator } from './bitcoin-orchestrator';

describe('Main Orchestrator Agent', () => {
  it('should have correct name and responsibilities', () => {
    expect(bitcoinOrchestrator.name).toBe('bitcoin-orchestrator');
    expect(bitcoinOrchestrator.responsibilities).toContain('Workflow coordination');
    expect(bitcoinOrchestrator.responsibilities).toContain('Event scheduling');
    expect(bitcoinOrchestrator.responsibilities).toContain('Error handling');
    expect(bitcoinOrchestrator.responsibilities).toContain('Agent communication');
  });

  it('should have required tools', () => {
    expect(bitcoinOrchestrator.tools).toContain('workflow-scheduler');
    expect(bitcoinOrchestrator.tools).toContain('event-dispatcher');
    expect(bitcoinOrchestrator.tools).toContain('health-monitor');
    expect(bitcoinOrchestrator.tools).toContain('agent-coordinator');
  });

  it('should have workflows defined', () => {
    expect(bitcoinOrchestrator.workflows).toHaveProperty('dailyIntelligence');
    expect(bitcoinOrchestrator.workflows).toHaveProperty('breakingNews');
    expect(bitcoinOrchestrator.workflows).toHaveProperty('priceMonitoring');
  });
});
