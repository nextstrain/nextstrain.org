/* eslint-disable quote-props */
module.exports = {
  "testMatch": [
    "**/*.test.js"
  ],
  "globals": {
    "BASE_URL": "http://localhost:5000"
  },
  "setupFilesAfterEnv": [
    "jest-extended/all"
  ]
};
