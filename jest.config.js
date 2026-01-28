module.exports = {
  preset: 'ts-jest',         
  testEnvironment: 'node',
  testTimeout: 30000,
  clearMocks: true,
  moduleFileExtensions: ['ts', 'js'],
  testMatch: ['**/tests/**/*.test.[jt]s'], 
};