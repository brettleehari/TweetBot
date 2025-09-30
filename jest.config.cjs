module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'tsx', 'js'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest'
  },
  testMatch: ['**/*.test.(ts|js)'],
  collectCoverageFrom: [
    'src/**/*.(ts|js)',
    '!src/**/*.test.(ts|js)'
  ]
};
