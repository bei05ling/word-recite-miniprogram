module.exports = {
  root: true,
  env: {
    es2021: true,
    node: true,
  },
  globals: {
    App: 'readonly',
    Component: 'readonly',
    Page: 'readonly',
    getApp: 'readonly',
    getCurrentPages: 'readonly',
    wx: 'readonly',
  },
  parserOptions: {
    ecmaVersion: 2021,
  },
  extends: ['eslint:recommended'],
  rules: {
    'no-console': 'off',
    semi: ['error', 'always'],
    quotes: ['error', 'single', { avoidEscape: true }],
  },
};

