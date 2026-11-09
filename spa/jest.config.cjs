module.exports = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/src/test/setup.js"],
  transform: {
    "^.+\\.tsx?$": "<rootDir>/jest.transformer.cjs",
    "^.+\\.jsx?$": ["babel-jest", { presets: ["@babel/preset-env", ["@babel/preset-react", { runtime: "automatic" }]] }],
  },
};
