import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/EnglishPersonalDict/',
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    minify: true,
    outDir: 'build',
    sourcemap: false,
  },
  
})

