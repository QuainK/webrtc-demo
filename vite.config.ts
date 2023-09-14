import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import * as path from "path";
import mkcert from 'vite-plugin-mkcert';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    mkcert(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, './src'),
    },
  },
  server: {
    // https: false,
    https: true,
    // port: 443,
    // port: 80,
  },
  // css: {
  //   preprocessorOptions: {
  //     scss: {
  //       // additionalData: '@import "./src/style.scss";'
  //     }
  //   }
  // }
})
