import { defineConfig, globalIgnores } from 'eslint/config';
import mocha from 'eslint-plugin-mocha';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import globals from 'globals';
import tsParser from '@typescript-eslint/parser';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all
});

export default defineConfig([globalIgnores(['dist/*', '**/*.js']), {
  extends: compat.extends(
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended'
  ),

  plugins: {
    mocha,
    '@typescript-eslint': typescriptEslint
  },

  languageOptions: {
    globals: {
      ...globals.mocha,
      ...globals.node
    },

    parser: tsParser,
    ecmaVersion: 2017,
    sourceType: 'module'
  },

  rules: {
    'max-len': ['error', { 'code': 80 }],
    quotes: ['error', 'single']
  }
}]);
