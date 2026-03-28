import { createRoute } from 'honox/factory'
import { SITE_URL } from '../consts'
import { allPosts } from '../lib/blog'

export default createRoute((c) => {
  const staticPages = ['/', '/blog', '/about']
  const postUrls = allPosts.map((post) => ({
    url: `${SITE_URL}/blog/${post.id}`,
    lastmod: (post.data.updatedDate ?? post.data.pubDate)
      .toISOString()
      .split('T')[0],
  }))

  const urls = [
    ...staticPages.map((path) => ({
      url: `${SITE_URL}${path}`,
      lastmod: undefined as string | undefined,
    })),
    ...postUrls,
  ]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    ({ url, lastmod }) =>
      `  <url>\n    <loc>${url}</loc>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ''}\n  </url>`
  )
  .join('\n')}
</urlset>`

  return c.body(xml, 200, {
    'Content-Type': 'application/xml; charset=utf-8',
  })
})
