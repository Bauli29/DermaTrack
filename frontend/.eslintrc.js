module.exports = {
  // Extend recommended configurations
  extends: [
    'eslint:recommended',      // ESLint recommended rules
    'next/core-web-vitals',    // Next.js recommended rules
    '@typescript-eslint/recommended', // TypeScript rules (if using TS)
    'prettier',                // Prettier integration (disable conflicting rules)
  ],
  
  // Parser configuration
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  
  // Environment settings
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  
  // Plugins
  plugins: [
    '@typescript-eslint',
    'react',
    'react-hooks',
  ],
  
  // Custom rules - basic setup that can be extended
  rules: {
    // Possible Errors
    'no-console': 'warn',              // Warn about console statements
    'no-debugger': 'error',            // Disallow debugger statements
    'no-unused-vars': 'off',           // Handled by TypeScript
    '@typescript-eslint/no-unused-vars': 'warn',
    
    // Best Practices
    'prefer-const': 'error',           // Prefer const over let when possible
    'no-var': 'error',                 // Disallow var, use let/const
    'eqeqeq': ['error', 'always'],     // Require strict equality
    
    // React specific
    'react/react-in-jsx-scope': 'off', // Not needed in Next.js 13+
    'react/prop-types': 'off',         // Using TypeScript instead
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    
    // TypeScript specific
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-inferrable-types': 'off',
    
    // Code style (basic - can be extended)
    'indent': 'off', // Let Prettier handle this
    'quotes': ['error', 'single', { 'avoidEscape': true }],
    'semi': ['error', 'always'],
  },
  
  // Settings
  settings: {
    react: {
      version: 'detect',
    },
  },
  
  // Ignore patterns for specific files/directories
  ignorePatterns: [
    'node_modules/',
    '.next/',
    'out/',
    'dist/',
    '*.config.js',
  ],
  
  // Override rules for specific file patterns
  overrides: [
    {
      files: ['*.js', '*.jsx'],
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
      },
    },
    {
      files: ['*.test.js', '*.test.jsx', '*.test.ts', '*.test.tsx'],
      env: {
        jest: true,
      },
      rules: {
        'no-console': 'off', // Allow console in tests
      },
    },
  ],
};