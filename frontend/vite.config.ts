import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'), // Fixed: point to src directory
      },
    },
    css: {
      postcss: './postcss.config.js',
    },
    server: {
      port: 3000,
      open: true,
      host: true,
      hmr: {
        overlay: true
      }
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      minify: 'terser',
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            ui: ['framer-motion', 'sonner'] // Fixed: use correct package names
          }
        }
      }
    },
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'framer-motion', // Fixed: correct package name
        'sonner'
      ]
    },
    publicDir: 'public',
    // Ensure favicon and other assets are properly served
    assetsInclude: ['**/*.svg', '**/*.png', '**/*.ico', '**/*.json'],
    // Define environment variables
    define: {
      __ENV__: JSON.stringify(env), // Fixed: stringify the env object
    },
  }
})
