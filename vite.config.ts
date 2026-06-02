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
    base: env.BASE_PATH || '/',
  }
})
