/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
  // Avoid conflicts with Arco Design's CSS
  corePlugins: {
    preflight: false,
  },
};
