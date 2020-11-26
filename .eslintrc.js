module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    project: 'tsconfig.json',
    include: ['./src/**/*']
  },
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint-config-jude'
  ],
  root: true,
  env: {
    node: true,
    jest: true,
    es6: true
  }
};