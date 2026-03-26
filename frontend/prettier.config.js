/**
 * Configuración de Prettier - Frontend React/Vite
 * Basada en Airbnb JavaScript Style Guide + convenciones de React
 * @type {import("prettier").Config}
 */
export default {
  // ============================================================================
  // Configuración Principal
  // ============================================================================

  // Longitud máxima de línea (Airbnb: 80-100 caracteres)
  printWidth: 80,

  // Indentación: 2 espacios (estándar Airbnb)
  tabWidth: 2,
  useTabs: false,

  // Punto y coma: siempre requerido (previene problemas de ASI)
  semi: true,

  // Comillas: dobles para consistencia en JS/TS
  singleQuote: false,

  // Comillas en propiedades de objetos: solo cuando sea necesario
  quoteProps: "as-needed",

  // JSX: usar comillas simples (convención común en React)
  jsxSingleQuote: true,

  // ============================================================================
  // Estilo de Código
  // ============================================================================

  // Comas finales: compatibles con ES5 (solo objetos y arrays)
  trailingComma: "es5",

  // Espaciado dentro de llaves: { foo } no {foo}
  bracketSpacing: true,

  // Posición del bracket JSX: en nueva línea para mejor legibilidad
  bracketSameLine: false,

  // Parámetros de arrow functions: siempre usar paréntesis (Airbnb)
  arrowParens: "always",

  // ============================================================================
  // Comportamiento de Formateo
  // ============================================================================

  // No requerir comentario pragma @prettier
  requirePragma: false,

  // No insertar pragma @format automáticamente
  insertPragma: false,

  // Preservar saltos de línea en Markdown
  proseWrap: "preserve",

  // Sensibilidad a espacios en blanco en HTML (importante para React)
  htmlWhitespaceSensitivity: "css",

  // ============================================================================
  // Finales de Línea y Código Embebido
  // ============================================================================

  // Finales de línea: LF (Unix) para consistencia en Git
  endOfLine: "lf",

  // Auto-formatear código embebido (ej: CSS en styled-components)
  embeddedLanguageFormatting: "auto",

  // JSX: permitir formato de atributos flexible
  singleAttributePerLine: false,
};
