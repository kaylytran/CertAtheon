const react = require('./node_modules/@vitejs/plugin-react/dist/index.d.mts').default;
const { defineConfig } = require('./node_modules/vite/dist/node');

module.exports = defineConfig({
    root: './Frontend', // Ensure this matches your actual directory name
    plugins: [react()],
    server: {
        port: 5173,
        proxy: {
            "/api": {
                target: "http://localhost:5000",
                changeOrigin: true,
                secure: false,
            }
        }
    },
    build: {
        outDir: "dist",
        rollupOptions: {
            input: './Frontend/index.html',
        }
    }
});
