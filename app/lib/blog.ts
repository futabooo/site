import { default as matter } from 'gray-matter'
import { z } from 'zod'

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

// viteのbuild時にすべてのmdファイルを読み込む
const markdownFiles = import.meta.glob('../../content/blog/**/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
})

export const allPosts: BlogPost[] = Object.entries(markdownFiles)
  .map(([filePath, raw]) => {
    const slug = filePath.split('/').pop()?.replace('.md', '') || ''
    const { data, content } = matter(raw as string)
    const validatedMetaData = blogPostMetaDataSchema.parse(data)
    return {
      id: slug,
      data: validatedMetaData,
      html: content,
    }
  })
  .sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime())

export const allTags = [...new Set(allPosts.flatMap((post) => post.data.tags))]

export function getPostById(id: string) {
  return allPosts.find((post) => post.id === id) || null
}

export async function getPostsByTag(tag: string) {
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
