import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

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
    build: {
        outDir: "dist", // ✅ Ensure the build output is placed in "dist"
    }
})
