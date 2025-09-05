import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import VueDevTools from 'vite-plugin-vue-devtools'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    VueDevTools()
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@/components': resolve(__dirname, './src/components'),
      '@/stores': resolve(__dirname, './src/stores'),
      '@/types': resolve(__dirname, './src/types'),
      '@/utils': resolve(__dirname, './src/utils'),
      '@/composables': resolve(__dirname, './src/composables'),
      '@/services': resolve(__dirname, './src/services'),
      '@/assets': resolve(__dirname, './src/assets')
    }
  },
  server: {
    port: 5173,
    open: true
  },
  build: {
    target: 'es2022',
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'vue-flow': ['@vue-flow/core'],
          'vue-vendor': ['vue', 'pinia']
        }
      }
    }
  }
})
