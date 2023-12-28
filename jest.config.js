export default {
    preset: "@shelf/jest-mongodb",
    coverageProvider: "v8",
    maxConcurrency: 5,
    maxWorkers: 5,
    roots: [""],
    testMatch: ["**/*.test.js"],
    testPathIgnorePatterns: ["/node_modules/"],
    testTimeout: 70 * 1000,
};
