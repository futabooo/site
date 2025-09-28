import build from '@hono/vite-build/cloudflare-workers'
import adapter from '@hono/vite-dev-server/cloudflare'
import ssg from '@hono/vite-ssg'
import tailwindcss from '@tailwindcss/vite'
import honox from 'honox/vite'
import { defineConfig } from 'vite'

const entry = './app/server.ts'

export default defineConfig({
  resolve: {
    alias: {
      '@components': '/app/components',
      '@layouts': '/app/layouts',
    },
  },
  ssr: {
    external: ['gray-matter', 'marked'],
  },
  optimizeDeps: {
    include: ['gray-matter', 'marked'],
  },
  plugins: [
    honox({
      devServer: { adapter },
      client: { input: ['./app/style.css'] },
    }),
    ssg({
      entry,
    }),
    tailwindcss(),
    build(),
  ],
})
