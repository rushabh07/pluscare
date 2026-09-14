import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [
      react(),
      tailwindcss()
    ],
    define: {
      'process.env': env,
      'process.env.REACT_BACKEND_URL': JSON.stringify(env.REACT_BACKEND_URL || env.VITE_BACKEND_URL),
    },
  };
})
