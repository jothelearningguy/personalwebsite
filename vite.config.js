import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'emailjs': ['@emailjs/browser']
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true
      }
    }
  },
  build: {
    // Optimize chunk splitting for better code splitting
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'emailjs': ['@emailjs/browser']
        },
        // Optimize asset file names
        assetFileNames: 'assets/[name].[ext]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js'
      }
    },
    // Optimize for production
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'], // Remove more console calls
        unused: true, // Remove unused code
        dead_code: true // Remove dead code
      }
    },
    // CSS code splitting
    cssCodeSplit: true,
    // Enable source maps for debugging (optional)
    sourcemap: false,
    // Chunk size warnings
    chunkSizeWarningLimit: 1000,
    // Tree shaking
    treeshake: {
      moduleSideEffects: false
    }
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
    exclude: []
  },
  // CSS optimization
  css: {
    devSourcemap: false
  }
})

