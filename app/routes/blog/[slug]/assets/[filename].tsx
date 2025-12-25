import { createRoute } from 'honox/factory'
import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

export default createRoute(async (c) => {
  const slug = c.req.param('slug')
  const filename = c.req.param('filename')
  
  // 開発環境でのみ動作する静的ファイル配信
  const imagePath = join(process.cwd(), 'content', 'blog', slug, 'assets', filename)
  
  if (!existsSync(imagePath)) {
    c.status(404)
    return c.text('Not Found')
  }
  
  const imageBuffer = readFileSync(imagePath)
  const ext = filename.split('.').pop()?.toLowerCase()
  
  // Content-Typeを設定
  const contentTypeMap: Record<string, string> = {
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    svg: 'image/svg+xml',
    webp: 'image/webp',
  }
  
  const contentType = contentTypeMap[ext || ''] || 'application/octet-stream'
  
  c.header('Content-Type', contentType)
  return c.body(imageBuffer)
})

