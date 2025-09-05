module.exports = {
  root: true,
  env: {
    browser: true,
    es2022: true,
    node: true
  },
  extends: [
    'eslint:recommended',
    '@vue/eslint-config-typescript/recommended',
    '@vue/eslint-config-prettier'
  ],
  parser: 'vue-eslint-parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    parser: '@typescript-eslint/parser'
  },
  plugins: ['@typescript-eslint', 'vue'],
  rules: {
    // TypeScript 规范
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/prefer-const': 'error',
    '@typescript-eslint/no-non-null-assertion': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    
    // Vue 规范
    'vue/multi-word-component-names': 'error',
    'vue/component-definition-name-casing': ['error', 'PascalCase'],
    'vue/component-name-in-template-casing': ['error', 'PascalCase'],
    'vue/define-props-declaration': ['error', 'type-based'],
    'vue/define-emits-declaration': ['error', 'type-based'],
    'vue/no-unused-vars': 'error',
    'vue/require-default-prop': 'off',
    'vue/require-prop-types': 'off',
    'vue/prop-name-casing': ['error', 'camelCase'],
    'vue/custom-event-name-casing': ['error', 'kebab-case'],
    
    // 代码质量
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-debugger': 'error',
    'no-alert': 'error',
    'no-var': 'error',
    'prefer-const': 'error',
    'no-unused-vars': 'off', // 使用 TypeScript 版本
    
    // 命名规范
    'camelcase': ['error', { properties: 'never' }],
    
    // 导入规范
    'import/order': ['error', {
      'groups': [
        'builtin',
        'external',
        'internal',
        'parent',
        'sibling',
        'index'
      ],
      'newlines-between': 'always'
    }]
  },
  overrides: [
    {
      files: ['*.vue'],
      rules: {
        // Vue 文件特定规则
        'vue/block-order': ['error', {
          order: ['script', 'template', 'style']
        }],
        'vue/component-tags-order': ['error', {
          order: ['script', 'template', 'style']
        }]
      }
    },
    {
      files: ['**/*.test.ts', '**/*.spec.ts'],
      rules: {
        // 测试文件可以使用 any 类型
        '@typescript-eslint/no-explicit-any': 'off'
      }
    }
  ]
} 