import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import * as path from "path"
import mkcert from 'vite-plugin-mkcert'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    mkcert(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
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
