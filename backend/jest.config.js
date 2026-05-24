// jest.config.js
process.env.NODE_ENV = 'test';
module.exports = {
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageProvider: "v8",
  testEnvironment: "node",
  collectCoverageFrom: ["src/**/*.js"],
  coveragePathIgnorePatterns: ["/node_modules/", "/prisma/"],
  // Se você usa variáveis de ambiente .env nos testes
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
};