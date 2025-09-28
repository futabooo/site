import { BlogPost } from '@layouts/BlogPost'
import { ssgParams } from 'hono/ssg'
import { createRoute } from 'honox/factory'
import { marked } from 'marked'
import { allPosts, getPostById } from '../../lib/blog'

export default createRoute(
  ssgParams(async () => {
    const posts = allPosts
    return posts.map((post) => ({
      slug: post.id,
    }))
  }),
  async (c) => {
    const slug = c.req.param('slug')
    const post = await getPostById(slug)
    if (!post) {
      c.status(404)
      return c.text('Not Found')
    }
    const html = await marked(post.html)
    return c.render(
      <BlogPost
        blogData={post.data}
        ogImage={`/blog/${post.id}/ogp.png`}
        url={`/blog/${post.id}`}
      >
        {html}
      </BlogPost>,
      {
        title: `${post.data.title} - futabooo.com`,
        description: `${post.data.description} - futabooo.com`,
        image: post.data.eyeCatchImg ?? `/blog/${post.id}/ogp.png`,
        canonicalURL: new URL(c.req.url),
      }
    )
  }
)
