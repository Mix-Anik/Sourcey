/*
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

export default {
  // Automatically clear mock calls and instances between every test
  clearMocks: true,

  // An array of glob patterns indicating a set of files for which coverage information should be collected
  collectCoverageFrom: [
    'src/**/*.[jt]s'
  ],

  // The directory where Jest should output its coverage files
  coverageDirectory: 'coverage',

  // An array of regexp pattern strings used to skip coverage collection
  coveragePathIgnorePatterns: [
    '\\\\node_modules\\\\',
    'src/index.ts'
  ],

  // Indicates which provider should be used to instrument code for coverage
  coverageProvider: 'v8',

  // A list of reporter names that Jest uses when writing coverage reports
  coverageReporters: [
  //  "json",
    'text',
    'lcov',
    'clover'
  ],

  // An object that configures minimum threshold enforcement for coverage results
  coverageThreshold: {
    'global': {
      'branches': 0,
      'functions': 0,
      'lines': 0,
      'statements': 0
    }
  },

  // An array of directory names to be searched recursively up from the requiring module's location
  moduleDirectories: [
    'node_modules',
    'src'
  ],

  // An array of file extensions your modules use
  moduleFileExtensions: [
    'js',
    'ts',
    'json'
  ],

  // A preset that is used as a base for Jest's configuration
  preset: 'ts-jest',

  // A list of paths to directories that Jest should use to search for files in
  roots: [
    'tests',
    'src'
  ],

  // The glob patterns Jest uses to detect test files
  testMatch: [
    '**/tests/**/*.spec.[jt]s'
  ],

  // An array of regexp pattern strings that are matched against all test paths, matched tests are skipped
  testPathIgnorePatterns: [
    '\\\\node_modules\\\\'
  ]
}
