import { BlogListItem } from '@components/BlogListItem'
import { createRoute } from 'honox/factory'
import { allPosts } from '../../lib/blog'

export default createRoute(async (c) => {
  const url = c.req.url
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
      canonicalURL: new URL(url),
    }
  )
})
