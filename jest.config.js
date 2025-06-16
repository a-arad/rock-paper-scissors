module.exports = {
  testEnvironment: 'node',
  collectCoverageFrom: [
    '**/*.js',
    '!node_modules/**',
    '!jest.config.js',
    '!coverage/**'
  ],
  testMatch: [
    '**/tests/**/*.test.js'
  ],
  verbose: true
};