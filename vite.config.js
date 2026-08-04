import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';
export default defineConfig(function (_a) {
    var mode = _a.mode;
    var env = loadEnv(mode, process.cwd(), '');
    return {
        plugins: [
            vue(),
            {
                name: 'watch-public-data',
                configureServer: function (server) {
                    server.watcher.add(path.resolve('public/data/flowers.json'));
                    server.watcher.on('change', function (file) {
                        if (file.includes('flowers.json')) {
                            server.ws.send({ type: 'full-reload' });
                        }
                    });
                },
            },
        ],
        base: env.BASE_PATH || '/',
    };
});
