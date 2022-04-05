module.exports = {
  globals: {
    should: true
  },
  parserOptions: {
    // this is required for dynamic import()
    ecmaVersion: 2020
  },
  env: {
    mocha: true,
    node: true
  },
  extends: ['digitalbazaar', 'digitalbazaar/jsdoc'],
  ignorePatterns: ['node_modules/']
};
