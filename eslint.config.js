/**
 * @file ESLint configuration for threejs-edit (ESLint v9+)
 * Modern, modular, and compatible with ES6 modules
 */

import js from '@eslint/js';
import globals from 'globals';
import importPlugin from 'eslint-plugin-import';

// Remove any global keys with leading/trailing whitespace
function cleanGlobals(obj) {
  return Object.fromEntries(
    Object.entries(obj).filter(([key]) => key.trim() === key)
  );
}

/** @type {import('eslint').Linter.FlatConfig} */
export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...cleanGlobals(globals.browser),
        ...cleanGlobals(globals.node)
      }
    },
    plugins: {
      import: importPlugin
    },
    rules: {
      'no-unused-vars': 'warn',
      'no-console': 'off',
      'no-debugger': 'warn',
      'eqeqeq': 'error',
      'curly': 'error',
      'semi': ['error', 'always'],
      'quotes': ['error', 'single'],
      'comma-dangle': ['error', 'never'],
      'no-var': 'error',
      'prefer-const': 'error',
      'object-shorthand': 'error',
      'arrow-body-style': ['error', 'as-needed'],
      'no-duplicate-imports': 'error',
      'import/order': ['warn', { 'alphabetize': { 'order': 'asc' } }]
    }
  },
  // Jest globals for test files
  {
    files: ['**/*.test.js', 'src/tests/*.js'],
    languageOptions: {
      globals: {
        ...globals.jest
      }
    }
  }
]; 