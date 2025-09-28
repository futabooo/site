import { BlogListItem } from '@components/BlogListItem'
import { ssgParams } from 'hono/ssg'
import { createRoute } from 'honox/factory'
import { allTags, getPostsByTag } from '../../lib/blog'

export default createRoute(
  ssgParams(async () => {
    const tags = allTags
    return tags.map((tag) => ({
      tag: tag,
    }))
  }),
  async (c) => {
    const tag = c.req.param('tag')
    const posts = await getPostsByTag(tag)
    return c.render(
      <div>
        {posts.map((post) => (
          <BlogListItem post={post} />
        ))}
      </div>,
      {
        title: `Tag: ${tag} - futabooo.com`,
        description: `Tag: ${tag} - futabooo.com`,
        canonicalURL: new URL(c.req.url),
      }
    )
  }
)
