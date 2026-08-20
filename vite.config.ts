import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      vue(),
      {
        name: 'watch-public-data',
        configureServer(server) {
          server.watcher.add(path.resolve('public/data/flowers.json'))
          server.watcher.on('change', (file) => {
            if (file.includes('flowers.json')) {
              server.ws.send({ type: 'full-reload' })
            }
          })
        },
      },
    ],
    // Слушаем и IPv4, и IPv6: иначе Vite поднимается только на ::1, а браузер,
    // который резолвит localhost в 127.0.0.1, получает ERR_CONNECTION_REFUSED.
    server: {
      host: true,
    },
    base: env.BASE_PATH || '/',
  }
})
