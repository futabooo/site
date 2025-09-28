import { default as matter } from 'gray-matter'

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

const blog = defineCollection({
  loader: glob({ pattern: "**/[^_]*.{md,mdx}", base: "./src/content/blog" }),
  // Type-check frontmatter using a schema
  schema: ({ image }) =>
    z
      .object({
        title: z.string(),
        description: z.string(),
        tags: z.array(z.string()),
        // Transform string to Date object
        pubDate: z
          .string()
          .or(z.date())
          .transform((val) => new Date(val)),
        updatedDate: z
          .string()
          .optional()
          .transform((str) => (str ? new Date(str) : undefined)),
        eyeCatchImg: image().optional(),
        eyeCatchAlt: z.string().optional(),
      })
      .refine(
        (data) => {
          if (data.eyeCatchImg && !data.eyeCatchAlt) {
            return false;
          }
          return true;
        },
        {
          message: "eyeCatchAlt is required when eyeCatchImg is set",
          path: ["eyeCatchAlt"],
        }
      ),
});


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
    return {
      id: slug,
      data: {
        title: data.title,
        description: data.description,
        tags: data.tags,
        pubDate: new Date(data.pubDate),
        updatedDate: data.updatedDate ? new Date(data.updatedDate) : undefined,
        eyeCatchImg: data.eyeCatchImg,
        eyeCatchAlt: data.eyeCatchAlt,
      },
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

export function getAllTags(posts: BlogPost[]): Array<{ name: string; count: number }> {
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
