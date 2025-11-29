import build from '@hono/vite-build/cloudflare-workers'
import adapter from '@hono/vite-dev-server/cloudflare'
import ssg from '@hono/vite-ssg'
import tailwindcss from '@tailwindcss/vite'
import honox from 'honox/vite'
import { copyFileSync, globSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { defineConfig } from 'vite'

const entry = './app/server.ts'

// content/blog配下の各記事フォルダ内のassetsをdistにコピーするプラグイン
const copyContentAssets = () => {
  return {
    name: 'copy-content-assets',
    buildStart() {
      // content/blog配下の各記事フォルダ内のassetsをコピー
      const imageFiles = globSync(
        'content/blog/**/assets/**/*.{png,jpg,jpeg,gif,svg,webp}'
      )
      imageFiles.forEach((filePath) => {
        // content/blog/2025-03-19-electricity-usage-2024/assets/image.png
        // → dist/blog/2025-03-19-electricity-usage-2024/assets/image.png
        const relativePath = filePath.replace('content/blog/', 'blog/')
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
