/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      // Agregar configuraciones personalizadas aquí si es necesario
      cursor: {
        pointer: "pointer",
      },
    },
  },
  plugins: [],
  // Configuración adicional para Tailwind v4
  future: {
    hoverOnlyWhenSupported: true, // Hover solo en dispositivos que lo soporten
  },
};
