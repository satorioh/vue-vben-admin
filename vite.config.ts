import { defineApplicationConfig } from '@vben/vite-config';

export default defineApplicationConfig({
  overrides: {
    optimizeDeps: {
      include: [
        'echarts/core',
        'echarts/charts',
        'echarts/components',
        'echarts/renderers',
        'qrcode',
        '@iconify/iconify',
        'ant-design-vue/es/locale/zh_CN',
        'ant-design-vue/es/locale/en_US',
      ],
    },
    server: {
      proxy: {
        '/basic-api': {
          target: 'http://localhost:8000',
          // target: 'http://100.127.94.56:7000/', // 开发环境
          // target: 'http://100.127.94.54:7000/', // 测试环境
          changeOrigin: true,
          ws: true,
          rewrite: (path) => path.replace(new RegExp(`^/basic-api`), ''),
          // only https
          // secure: false
        },
        '/upload': {
          target: 'http://localhost:3300/upload',
          changeOrigin: true,
          ws: true,
          rewrite: (path) => path.replace(new RegExp(`^/upload`), ''),
        },
        // 新增：OCR 后端代理，避免浏览器跨域
        '/py-api': {
          // target: 'http://100.127.94.201:7111',
          target: 'http://127.0.0.1:17654',
          // target: 'http://127.0.0.1:7111',
          changeOrigin: true,
          ws: true,
          // rewrite: (path) => path.replace(/^\/py-api/, ''),
          // 如后端仅支持 http，可保留；若是自签 https，可考虑 secure: false
          // secure: false,
        },
      },
      open: true, // 项目启动后，自动打开
      warmup: {
        clientFiles: ['./index.html', './src/{views,components}/*'],
      },
    },
  },
});
