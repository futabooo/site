import { createRoute } from 'honox/factory'
import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

export default createRoute(async (c) => {
  const slug = c.req.param('slug')
  const filename = c.req.param('filename')

  // パストラバーサル対策: 許可ディレクトリ内かを確認
  const allowedDir = resolve(process.cwd(), 'content', 'blog')
  const imagePath = resolve(allowedDir, slug, 'assets', filename)

  if (!imagePath.startsWith(allowedDir + '/')) {
    c.status(403)
    return c.text('Forbidden')
  }

  // 開発環境でのみ動作する静的ファイル配信
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
