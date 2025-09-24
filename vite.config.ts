import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0", // ✅ listen on all IPs
    port: 5173,
    strictPort: true, // optional but good
    allowedHosts: [
      "cd753217b0d6.ngrok-free.app", // ✅ your ngrok host
      "localhost",
      "127.0.0.1",
    ],
  },
});