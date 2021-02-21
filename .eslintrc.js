
 module.exports = {
    root: true,
    env: {
      commonjs: true,
      es6: true,
      node: true,
    },
    parserOptions: {
      ecmaVersion: 2020,
      parser: 'babel-eslint',
    },
    extends: ['prettier', 'plugin:prettier/recommended'],
    plugins: ['prettier'],
    // add your custom rules here
    rules: {},
  }