module.exports = {
  //"testRegex": "tests/.*\\.(ts|tsx)$",
  testMatch: ["**/tests/*.+(ts|tsx|js)"],
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
  },
  // An array of regexp pattern strings that are matched against all test paths, matched tests are skipped
  testPathIgnorePatterns: ["\\\\node_modules\\\\"],
};
