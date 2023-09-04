import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    port: 80
  },
  // css: {
  //   preprocessorOptions: {
  //     scss: {
  //       // additionalData: '@import "./src/style.scss";'
  //     }
  //   }
  // }
})
