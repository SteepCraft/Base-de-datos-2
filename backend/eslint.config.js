// ESLint Flat Config - Node.js 22 + Express 5 + ESM
import js from "@eslint/js";
import typescriptPlugin from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";
import prettierConfig from "eslint-config-prettier/flat";
import importPlugin from "eslint-plugin-import";
import nodePlugin from "eslint-plugin-n";
import promisePlugin from "eslint-plugin-promise";
import securityPlugin from "eslint-plugin-security";
import globals from "globals";

const config = [];

// ============================================================================
// BASE CONFIGURATION
// ============================================================================
config.push(js.configs.recommended);

// Plugin N (Node.js)
config.push({
  plugins: { n: nodePlugin },
  rules: {
    // Configuración moderna de eslint-plugin-n
    "n/no-missing-import": "off", // Manejado por import plugin
    "n/no-unsupported-features/es-syntax": "off", // Permitir ES modules
    "n/no-unsupported-features/node-builtins": "error",
    "n/no-deprecated-api": "error",
    "n/no-extraneous-import": "error",
    "n/no-extraneous-require": "error",
    "n/no-unpublished-import": "off",
    "n/prefer-global/buffer": "warn",
    "n/prefer-global/process": "warn",
  },
});

// ============================================================================
// PROMISE PLUGIN - Async/Promise patterns
// ============================================================================
config.push({
  plugins: { promise: promisePlugin },
  rules: {
    "promise/always-return": "warn",
    "promise/catch-or-return": "error",
    "promise/no-return-wrap": "error",
    "promise/param-names": "error",
    "promise/no-nesting": "warn",
    "promise/no-promise-in-callback": "warn",
    "promise/no-callback-in-promise": "warn",
    "promise/avoid-new": "off",
    "promise/no-new-statics": "error",
    "promise/valid-params": "error",
  },
});

// ============================================================================
// SECURITY PLUGIN - Backend security checks
// ============================================================================
config.push({
  plugins: { security: securityPlugin },
  rules: {
    "security/detect-unsafe-regex": "warn",
    "security/detect-non-literal-regexp": "warn",
    "security/detect-non-literal-fs-filename": "warn",
    "security/detect-object-injection": "off", // Muchos falsos positivos
    "security/detect-possible-timing-attacks": "warn",
    "security/detect-eval-with-expression": "error",
    "security/detect-no-csrf-before-method-override": "error",
  },
});

// ============================================================================
// IMPORT PLUGIN - Orden y validación de imports
// ============================================================================
config.push({
  plugins: { import: importPlugin },
  settings: {
    "import/resolver": {
      node: {
        extensions: [".js", ".mjs", ".ts", ".d.ts"],
      },
    },
    "import/parsers": {
      "@typescript-eslint/parser": [".ts", ".d.ts"],
    },
  },
  rules: {
    // Errores
    "import/no-unresolved": ["error", { commonjs: true, caseSensitive: true }],
    "import/named": "error",
    "import/default": "error",
    "import/namespace": "error",
    "import/no-absolute-path": "error",
    "import/no-dynamic-require": "warn",
    "import/no-self-import": "error",
    // maxDepth debe ser número o Infinity (no string)
    "import/no-cycle": ["error", { maxDepth: Infinity, ignoreExternal: true }],
    "import/no-useless-path-segments": ["error", { commonjs: true }],

    // Advertencias
    "import/export": "error",
    "import/no-named-as-default": "warn",
    "import/no-named-as-default-member": "warn",
    "import/no-deprecated": "warn",
    "import/no-mutable-exports": "warn",

    // Estilo (opcional pero recomendado)
    "import/first": "error",
    "import/no-duplicates": "error",
    "import/order": [
      "warn",
      {
        groups: [
          "builtin",
          "external",
          "internal",
          ["parent", "sibling"],
          "index",
          "object",
          "type",
        ],
        "newlines-between": "never",
        alphabetize: { order: "asc", caseInsensitive: true },
      },
    ],
    "import/newline-after-import": "warn",
    "import/no-anonymous-default-export": "warn",

    // Extensiones - Para ES modules en Node.js SIEMPRE usar extensión .js
    // Referencia: https://nodejs.org/api/esm.html#mandatory-file-extensions
    "import/extensions": [
      "error",
      "always",
      {
        ignorePackages: true,
      },
    ],
  },
});

// ============================================================================
// JAVASCRIPT FILES (.js, .mjs)
// ============================================================================
config.push({
  files: ["**/*.js", "**/*.mjs"],
  languageOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    globals: {
      ...globals.node,
      ...globals.es2021,
    },
  },
  rules: {
    // Variables
    "no-unused-vars": [
      "warn",
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        caughtErrorsIgnorePattern: "^_",
        destructuredArrayIgnorePattern: "^_",
      },
    ],
    "no-use-before-define": ["error", { functions: false, classes: true }],
    "prefer-const": "warn",
    "no-var": "error",

    // Funciones
    "arrow-body-style": ["warn", "as-needed"],
    "prefer-arrow-callback": "warn",
    "func-style": ["warn", "expression", { allowArrowFunctions: true }],

    // Objetos y Arrays
    "object-shorthand": ["warn", "always"],
    "prefer-destructuring": [
      "warn",
      { array: false, object: true },
      { enforceForRenamedProperties: false },
    ],
    "prefer-template": "warn",
    "prefer-spread": "warn",

    // Async/Promises
    "no-async-promise-executor": "error",
    "require-await": "warn",
    "no-return-await": "off", // Deprecated en favor de @typescript-eslint/return-await
    "prefer-promise-reject-errors": "error",

    // Console y debugging
    "no-console": ["warn", { allow: ["warn", "error", "info"] }],
    "no-debugger": "warn",

    // Mejores prácticas
    eqeqeq: ["error", "always", { null: "ignore" }],
    "no-eval": "error",
    "no-implied-eval": "error",
    "no-new-func": "error",
    "no-param-reassign": ["warn", { props: false }],
    "no-throw-literal": "error",
    "prefer-regex-literals": "warn",
    radix: "error",
    yoda: "warn",

    // Node.js específico
    "no-process-exit": "off", // Permitido en scripts
    "callback-return": "off", // Deprecated
    "handle-callback-err": "off", // Deprecated
  },
});

// ============================================================================
// TYPESCRIPT FILES (.ts, .d.ts)
// ============================================================================
config.push({
  files: ["**/*.ts", "**/*.d.ts"],
  languageOptions: {
    parser: typescriptParser,
    parserOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      // Si activas reglas que necesitan type info, añade `project: './tsconfig.json'`
      // project: "./tsconfig.json",
    },
  },
  plugins: {
    "@typescript-eslint": typescriptPlugin,
  },
  rules: {
    // Desactivar reglas de JS que entran en conflicto con TS
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": [
      "warn",
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        caughtErrorsIgnorePattern: "^_",
      },
    ],
    "no-use-before-define": "off",
    "@typescript-eslint/no-use-before-define": [
      "error",
      { functions: false, classes: true },
    ],
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-explicit-any": "warn",
  },
});

// ============================================================================
// TEST FILES
// ============================================================================
config.push({
  files: ["**/*.test.js", "**/*.spec.js", "tests/**/*.js"],
  languageOptions: {
    globals: {
      ...globals.node,
      ...globals.es2021,
      describe: "readonly",
      it: "readonly",
      test: "readonly",
      expect: "readonly",
      beforeEach: "readonly",
      afterEach: "readonly",
      beforeAll: "readonly",
      afterAll: "readonly",
      vi: "readonly",
    },
  },
  rules: {
    "no-unused-expressions": "off",
    "n/no-unpublished-import": "off",
    "import/no-extraneous-dependencies": "off",
  },
});

// ============================================================================
// CONFIG FILES - Permitir devDependencies del root
// ============================================================================
config.push({
  files: [
    "*.config.js",
    "*.config.ts",
    "eslint.config.js",
    "prettier.config.js",
    "**/*.d.ts",
  ],
  rules: {
    "n/no-extraneous-import": "off", // Permite usar deps del root
    "import/no-unresolved": "off",
    "import/no-anonymous-default-export": "off",
  },
});

// ============================================================================
// PRETTIER - Debe ir al final
// ============================================================================
config.push(prettierConfig);

// ============================================================================
// IGNORES
// ============================================================================
config.push({
  ignores: [
    "node_modules/**",
    "dist/**",
    "build/**",
    "coverage/**",
    "logs/**",
    "*.log",
    ".env*",
    "src/errors/theme.js",
  ],
});

export default config;
