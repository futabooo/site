import build from '@hono/vite-build/cloudflare-workers'
import adapter from '@hono/vite-dev-server/cloudflare'
import ssg from '@hono/vite-ssg'
import tailwindcss from '@tailwindcss/vite'
import honox from 'honox/vite'
import { copyFileSync, globSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { defineConfig } from 'vite'

const entry = './app/server.ts'

// content配下の画像をdistにコピーするプラグイン
const copyContentAssets = () => {
  return {
    name: 'copy-content-assets',
    buildStart() {
      // content配下の画像をすべてコピー
      const imageFiles = globSync(
        'content/assets/**/*.{png,jpg,jpeg,gif,svg,webp}'
      )
      imageFiles.forEach((filePath) => {
        const relativePath = filePath.replace('content/', 'blog/')
        const destPath = join('dist', relativePath)
        mkdirSync(dirname(destPath), { recursive: true })
        copyFileSync(filePath, destPath)
      })
    },
  }
}

export default defineConfig({
  resolve: {
    alias: {
      '@components': '/app/components',
      '@layouts': '/app/layouts',
    },
  },
  server: {
    fs: {
      allow: ['..', 'content'],
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
    copyContentAssets(),
  ],
})
