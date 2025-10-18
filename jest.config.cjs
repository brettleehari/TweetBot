module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'tsx', 'js'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest'
  },
  // Limit tests to the agent tests under src/mastra/agents and ignore transpiled dist
  testMatch: ['**/src/mastra/agents/**/*.test.(ts|js)'],
  testPathIgnorePatterns: ['/dist/', '/node_modules/'],
  collectCoverageFrom: [
    'src/**/*.(ts|js)',
    '!src/**/*.test.(ts|js)'
  ]
};
