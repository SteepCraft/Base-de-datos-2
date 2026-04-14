// ESLint Flat Config - React 19 + Vite 7 + TailwindCSS 4
import js from "@eslint/js";
import typescriptPlugin from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";
import prettierConfig from "eslint-config-prettier/flat";
import pluginImport from "eslint-plugin-import";
import pluginReact from "eslint-plugin-react";
import pluginReactHooks from "eslint-plugin-react-hooks";
import pluginReactRefresh from "eslint-plugin-react-refresh";
// import pluginTailwind from "eslint-plugin-tailwindcss"; // BETA no soporta TailwindCSS v4 aún
import globals from "globals";

const config = [];

// ============================================================================
// BASE CONFIGURATION
// ============================================================================
config.push(js.configs.recommended);

// ============================================================================
// REACT PLUGIN - Core React rules
// ============================================================================
config.push({
  plugins: { react: pluginReact },
  settings: { react: { version: "detect" } },
  rules: {
    ...pluginReact.configs.recommended.rules,
    // React 19 - No requiere React en scope
    "react/react-in-jsx-scope": "off",
    "react/jsx-uses-react": "off",
    // Mejores prácticas
    "react/prop-types": "off", // Usar TypeScript
    "react/jsx-uses-vars": "error",
    "react/jsx-no-target-blank": ["error", { allowReferrer: true }],
    "react/self-closing-comp": "warn",
    "react/jsx-curly-brace-presence": ["warn", { props: "never", children: "never" }],
  },
});

// ============================================================================
// TAILWINDCSS - Orden de clases y validación
// ============================================================================
// TODO: Activar cuando eslint-plugin-tailwindcss soporte TailwindCSS v4
// Issue: https://github.com/francoismassart/eslint-plugin-tailwindcss/issues
// La versión beta aún no puede resolver el config de TailwindCSS v4
/*
config.push({
  plugins: { tailwindcss: pluginTailwind },
  rules: {
    "tailwindcss/classnames-order": "warn",
    "tailwindcss/no-custom-classname": "off",
    "tailwindcss/no-contradicting-classname": "error",
    "tailwindcss/enforces-negative-arbitrary-values": "warn",
    "tailwindcss/enforces-shorthand": "warn",
    "tailwindcss/migration-from-tailwind-2": "off",
    "tailwindcss/no-arbitrary-value": "off",
  },
  settings: {
    tailwindcss: {
      callees: ["classnames", "clsx", "cn", "twMerge"],
      config: "tailwind.config.js",
    },
  },
});
*/

// ============================================================================
// IMPORT PLUGIN - Orden y validación de imports
// ============================================================================
config.push({
  plugins: { import: pluginImport },
  settings: {
    "import/resolver": {
      node: {
        extensions: [".js", ".jsx", ".ts", ".tsx"],
      },
    },
    "import/parsers": {
      "@typescript-eslint/parser": [".ts", ".tsx"],
    },
    "import/ignore": [
      "node_modules",
      "\\.(css|scss|sass|less|styl|svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|eot)$",
    ],
  },
  rules: {
    // Errores
    "import/no-unresolved": "error",
    "import/named": "error",
    "import/default": "error",
    "import/namespace": "error",
    "import/no-absolute-path": "error",
    "import/no-self-import": "error",
    "import/no-cycle": ["error", { maxDepth: Infinity, ignoreExternal: true }],
    "import/no-useless-path-segments": "error",
    "import/export": "error",
    "import/no-named-as-default": "warn",
    "import/no-named-as-default-member": "warn",
    "import/no-deprecated": "warn",
    "import/no-mutable-exports": "warn",
    // Estilo
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
        "newlines-between": "always",
        alphabetize: { order: "asc", caseInsensitive: true },
      },
    ],
    "import/newline-after-import": "warn",
    "import/no-anonymous-default-export": [
      "warn",
      {
        allowArray: false,
        allowArrowFunction: false,
        allowAnonymousClass: false,
        allowAnonymousFunction: false,
        allowCallExpression: true,
        allowLiteral: false,
        allowObject: true,
      },
    ],
    // Extensiones - Vite las maneja automáticamente
    "import/extensions": [
      "off", // Vite resuelve imports con o sin extensión
    ],
  },
});

// ============================================================================
// JAVASCRIPT/JSX FILES
// ============================================================================
config.push({
  files: ["src/**/*.{js,jsx}"],
  languageOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    parserOptions: {
      ecmaFeatures: { jsx: true },
    },
    globals: {
      ...globals.browser,
      ...globals.es2021,
    },
  },
  plugins: {
    "react-hooks": pluginReactHooks,
    "react-refresh": pluginReactRefresh,
  },
  rules: {
    // React Hooks
    ...pluginReactHooks.configs.recommended.rules,
    // React Refresh (Vite HMR)
    "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
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
    "no-use-before-define": ["error", { functions: false, classes: true, variables: true }],
    "prefer-const": "warn",
    "no-var": "error",
    // Funciones
    "arrow-body-style": ["warn", "as-needed"],
    "prefer-arrow-callback": "warn",
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
    "prefer-promise-reject-errors": "error",
    // Console
    "no-console": ["warn", { allow: ["warn", "error", "info"] }],
    "no-debugger": "warn",
    // Mejores prácticas
    eqeqeq: ["error", "always", { null: "ignore" }],
    "no-eval": "error",
    "no-implied-eval": "error",
    "no-param-reassign": ["warn", { props: false }],
    "no-throw-literal": "error",
    radix: "error",
  },
});

// ============================================================================
// TYPESCRIPT FILES (.ts, .tsx)
// ============================================================================
config.push({
  files: ["src/**/*.{ts,tsx}"],
  languageOptions: {
    parser: typescriptParser,
    parserOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      ecmaFeatures: { jsx: true },
    },
    globals: {
      ...globals.browser,
      ...globals.es2021,
    },
  },
  plugins: {
    "@typescript-eslint": typescriptPlugin,
    "react-hooks": pluginReactHooks,
    "react-refresh": pluginReactRefresh,
  },
  rules: {
    // Desactivar reglas JS que entran en conflicto
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
    "@typescript-eslint/no-use-before-define": ["error", { functions: false, classes: true }],
    // TypeScript específico
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/consistent-type-imports": ["warn", { prefer: "type-imports" }],
    // React Hooks (también para TS)
    ...pluginReactHooks.configs.recommended.rules,
    // React Refresh
    "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
  },
});

// ============================================================================
// TEST FILES
// ============================================================================
config.push({
  files: [
    "src/**/*.test.{js,jsx,ts,tsx}",
    "src/**/*.spec.{js,jsx,ts,tsx}",
    "**/__tests__/**/*.{js,jsx,ts,tsx}",
  ],
  languageOptions: {
    globals: {
      ...globals.browser,
      ...globals.jest,
      ...globals.node,
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
    "import/no-extraneous-dependencies": "off",
    "@typescript-eslint/no-explicit-any": "off",
  },
});

// ============================================================================
// CONFIG FILES - Permitir devDependencies del root
// ============================================================================
config.push({
  files: [
    "*.config.js",
    "*.config.ts",
    "vite.config.*",
    "tailwind.config.*",
    "eslint.config.js",
    "prettier.config.js",
  ],
  rules: {
    "import/no-anonymous-default-export": "off",
    "import/no-unresolved": "off", // Los configs pueden importar devDependencies
    "import/no-extraneous-dependencies": "off",
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
    "dist/**",
    "build/**",
    "node_modules/**",
    "public/**",
    "coverage/**",
    ".vite/**",
    "*.min.js",
  ],
});

export default config;
