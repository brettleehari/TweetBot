// Base Agent class for all agents
export abstract class Agent {
  name: string;
  tools: Record<string, any>;

  constructor(name: string, tools: Record<string, any>) {
    this.name = name;
    this.tools = tools;
  }

  async delegateTask(agentName: string, task: string, payload?: any): Promise<any> {
    // In production, this would route to another agent or service
    throw new Error('delegateTask not implemented');
  }

  async notifyOrchestrator(event: string, data: any): Promise<void> {
    // In production, this would send a message to the orchestrator
    throw new Error('notifyOrchestrator not implemented');
  }
}
