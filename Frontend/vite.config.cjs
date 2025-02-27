import { defineConfig } from './node_modules/vite/dist/node'
import react from './node_modules/@vitejs/plugin-react/dist/index.d.mts'

export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173, // ✅ Change the port so it doesn't conflict with ASP.NET Core
        proxy: {
            "/api": {
                target: "http://localhost:5000", // ✅ Proxy API calls to ASP.NET Core backend
                changeOrigin: true,
                secure: false,
            }
        }
    },
    root: './Frontend',  // ✅ Ensures Vite looks in frontend/
    build: {
        outDir: "dist",
        rollupOptions: {
            input: './Frontend/index.html', // ✅ Explicitly define entry
        }
    }
})
