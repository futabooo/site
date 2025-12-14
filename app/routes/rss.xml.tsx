import { createRoute } from 'honox/factory'
import { SITE_AUTHOR, SITE_DESCRIPTION, SITE_TITLE, SITE_URL } from '../consts'
import { allPosts } from '../lib/blog'

const escapeXml = (str: string): string => {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

const formatDate = (date: Date): string => {
  return date.toUTCString()
}

export default createRoute((c) => {
  const items = allPosts
    .slice(0, 20) // 最新20件
    .map((post) => {
      const link = `${SITE_URL}/blog/${post.id}`
      return `
    <item>
      <title>${escapeXml(post.data.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <description>${escapeXml(post.data.description)}</description>
      <pubDate>${formatDate(post.data.pubDate)}</pubDate>
      <author>${SITE_AUTHOR}</author>
    </item>`
    })
    .join('')

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_TITLE)}</title>
    <link>${SITE_URL}</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>ja</language>
    <lastBuildDate>${formatDate(new Date())}</lastBuildDate>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml"/>${items}
  </channel>
</rss>`

  return c.body(rss, 200, {
    'Content-Type': 'application/xml; charset=utf-8',
  })
})
