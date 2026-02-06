import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
import UnoCSS from 'unocss/vite'

export default defineConfig({
  base: '/h5/', // 部署在 /h5 路径下
  plugins: [uni(), UnoCSS()],
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: '@import "@/styles/variables.scss";'
      }
    }
  },
  server: {
    port: 8888,
    cors: true
  }
})
