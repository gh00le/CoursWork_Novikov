module.exports = {
  testEnvironment: "node",
  modulePathIgnorePatterns: ["<rootDir>/.next/"],
  transform: {
    "^.+\\.[jt]sx?$": ["babel-jest", { presets: ["@babel/preset-env"] }],
  },
};