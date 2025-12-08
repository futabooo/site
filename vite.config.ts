import build from '@hono/vite-build/cloudflare-workers'
import adapter from '@hono/vite-dev-server/cloudflare'
import ssg from '@hono/vite-ssg'
import tailwindcss from '@tailwindcss/vite'
import { default as matter } from 'gray-matter'
import honox from 'honox/vite'
import {
  copyFileSync,
  existsSync,
  globSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { defineConfig } from 'vite'
import { generateOGImage } from './app/lib/ogimage'

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

// OGP画像を生成するプラグイン
const generateOGImages = () => {
  return {
    name: 'generate-og-images',
    closeBundle: async () => {
      const fontPath = resolve('public/NotoSansJP-SemiBold.ttf')
      const iconPath = resolve('public/ic_futabooo_orenge.jpg')

      // content/blog配下の各記事フォルダを取得
      const markdownFiles = globSync('content/blog/**/index.md')

      for (const filePath of markdownFiles) {
        // 例: 'content/blog/2025-03-19-electricity-usage-2024/index.md'
        // → '2025-03-19-electricity-usage-2024'
        const pathParts = filePath.split('/')
        const slug = pathParts[pathParts.length - 2] || ''

        const raw = readFileSync(filePath, 'utf-8')
        const { data } = matter(raw)
        const title = data.title as string

        if (!title) {
          console.warn(`Skipping OGP generation for ${slug}: no title found`)
          continue
        }

        const destDir = join('dist', 'blog', slug)
        const destPath = join(destDir, 'ogp.png')

        // destDirが存在しない場合は作成
        if (!existsSync(destDir)) {
          mkdirSync(destDir, { recursive: true })
        }

        try {
          const buffer = await generateOGImage(title, fontPath, iconPath)
          writeFileSync(destPath, buffer)
          console.log(`Generated OGP image: ${destPath}`)
        } catch (error) {
          console.error(`Failed to generate OGP image for ${slug}:`, error)
        }
      }
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
    generateOGImages(),
  ],
})
