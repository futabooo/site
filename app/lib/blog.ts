import { default as matter } from 'gray-matter'
import hljs from 'highlight.js'
import { Marked } from 'marked'
import { markedHighlight } from 'marked-highlight'
import { z } from 'zod'
import linkCardsJson from '../../content/link-cards.json'
import {
  getBareLinkHref,
  isLinkCardMeta,
  type LinkCardCache,
  renderLinkCard,
} from './link-card'

export interface BlogPost {
  id: string
  data: BlogPostMetaData
  html: string
}

export interface BlogPostMetaData {
  title: string
  description: string
  tags: string[]
  pubDate: Date
  updatedDate?: Date
  eyeCatchImg?: string
  eyeCatchAlt?: string
}

const blogPostMetaDataSchema = z
  .object({
    title: z.string().min(1, 'タイトルは必須です'),
    description: z.string().min(1, '説明は必須です'),
    tags: z.array(z.string()).min(1, 'タグは最低1つ必要です'),
    pubDate: z.string().transform((str) => new Date(str)),
    updatedDate: z
      .string()
      .optional()
      .transform((str) => (str ? new Date(str) : undefined)),
    eyeCatchImg: z.string().optional(),
    eyeCatchAlt: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.eyeCatchImg && !data.eyeCatchAlt) {
        return false
      }
      return true
    },
    {
      message: 'eyeCatchImgが設定されている場合、eyeCatchAltは必須です',
      path: ['eyeCatchAlt'],
    }
  )

const linkCards = linkCardsJson as LinkCardCache

const marked = new Marked(
  markedHighlight({
    emptyLangClass: 'hljs',
    langPrefix: 'hljs language-',
    highlight(code, lang) {
      const language = hljs.getLanguage(lang) ? lang : 'plaintext'
      return hljs.highlight(code, { language }).value
    },
  })
)

// URLだけの行をリンクカードに変換する
// 対象URLのOGPは `bun run link-cards` で事前取得し content/link-cards.json に
// キャッシュしてある。キャッシュに無いURLは通常のリンクとして描画する。
marked.use({
  renderer: {
    paragraph(token) {
      const href = getBareLinkHref(token)
      if (!href) return false
      const meta = linkCards[href]
      if (!isLinkCardMeta(meta)) return false
      return renderLinkCard(meta)
    },
  },
})

// viteのbuild時にすべてのindex.mdファイルを読み込む
const markdownFiles = import.meta.glob('../../content/blog/**/index.md', {
  eager: true,
  query: '?raw',
  import: 'default',
})

export const allPosts: BlogPost[] = Object.entries(markdownFiles)
  .map(([filePath, raw]) => {
    // 例: '../../content/blog/2025-03-19-electricity-usage-2024/index.md'
    // → '2025-03-19-electricity-usage-2024'
    const pathParts = filePath.split('/')
    const slug = pathParts[pathParts.length - 2] || ''
    const { data, content } = matter(raw as string)
    const validatedMetaData = blogPostMetaDataSchema.parse(data)
    const html = marked.parse(content, { async: false })

    return {
      id: slug,
      data: validatedMetaData,
      html: html,
    }
  })
  .sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime())

export const allTags = [...new Set(allPosts.flatMap((post) => post.data.tags))]

export function getPostById(id: string) {
  return allPosts.find((post) => post.id === id) || null
}

export function getPostsByTag(tag: string) {
  return allPosts.filter((post) => post.data.tags.includes(tag))
}

export function getAllTags(
  posts: BlogPost[]
): Array<{ name: string; count: number }> {
  const tagCounts = new Map<string, number>()

  posts.forEach((post) => {
    post.data.tags.forEach((tag) => {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1)
    })
  })

  return Array.from(tagCounts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
}
