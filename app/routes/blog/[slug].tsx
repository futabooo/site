import { BlogPost } from '@layouts/BlogPost'
import { ssgParams } from 'hono/ssg'
import { createRoute } from 'honox/factory'
import { marked } from 'marked'
import { SITE_URL } from '../../consts'
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
    let html = await marked(post.html)
    // マークダウン内の相対パスを絶対パスに変換
    // ./assets/image.png -> /blog/{slug}/assets/image.png
    html = html.replace(
      /src="\.\/assets\/([^"]+)"/g,
      `src="/blog/${post.id}/assets/$1"`
    )
    return c.render(
      <BlogPost
        blogData={post.data}
        ogImage={`/blog/${post.id}/ogp.png`}
        url={new URL(new URL(c.req.url).pathname, SITE_URL)}
      >
        {html}
      </BlogPost>,
      {
        title: `${post.data.title} - futabooo.com`,
        description: `${post.data.description} - futabooo.com`,
        image: post.data.eyeCatchImg ?? `/blog/${post.id}/ogp.png`,
        canonicalURL: new URL(new URL(c.req.url).pathname, SITE_URL),
      }
    )
  }
)
