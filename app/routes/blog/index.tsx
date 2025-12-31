import { BlogListItem } from '@components/BlogListItem'
import { createRoute } from 'honox/factory'
import { SITE_URL } from '../../consts'
import { allPosts } from '../../lib/blog'

export default createRoute(async (c) => {
  const posts = allPosts

  return c.render(
    <div>
      {posts.map((post) => (
        <BlogListItem post={post} />
      ))}
    </div>,
    {
      title: 'Blog - futabooo.com',
      description: 'Blog - futabooo.com',
      canonicalURL: new URL(new URL(c.req.url).pathname, SITE_URL),
    }
  )
})
