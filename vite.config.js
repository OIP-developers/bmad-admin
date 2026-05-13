import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const healthEndpoint = () => ({
  name: 'health-endpoint',
  configureServer(server) {
    server.middlewares.use('/health', (req, res) => {
      res.setHeader('Content-Type', 'application/json')
      res.statusCode = 200
      res.end(JSON.stringify({ status: 'ok' }))
    })
  },
  configurePreviewServer(server) {
    server.middlewares.use('/health', (req, res) => {
      res.setHeader('Content-Type', 'application/json')
      res.statusCode = 200
      res.end(JSON.stringify({ status: 'ok' }))
    })
  },
})

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), healthEndpoint()],
  server: {
    port: 5173,
  },
})
