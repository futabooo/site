import { createRoute } from 'honox/factory'
import { getPostById } from '../../../lib/blog'

// 1リクエストで加算できる最大数(クライアントのデバウンス送信に合わせる)
const MAX_AMOUNT_PER_REQUEST = 50

const kvKey = (slug: string) => `likes:${slug}`

const readCount = async (kv: KVNamespace, slug: string): Promise<number> => {
  const value = await kv.get(kvKey(slug))
  const count = value ? Number.parseInt(value, 10) : 0
  return Number.isFinite(count) && count >= 0 ? count : 0
}

// GET /api/likes/:slug -> { count }
export default createRoute(async (c) => {
  const slug = c.req.param('slug')
  const kv = c.env.LIKES
  if (!kv) {
    return c.json({ count: 0 })
  }
  const count = await readCount(kv, slug)
  return c.json({ count })
})

// POST /api/likes/:slug body: { amount } -> { count }
export const POST = createRoute(async (c) => {
  const slug = c.req.param('slug')

  // 実在する記事のslugのみ受け付ける(任意キーの量産を防ぐ)
  if (!getPostById(slug)) {
    return c.json({ error: 'Not Found' }, 404)
  }

  const kv = c.env.LIKES
  if (!kv) {
    return c.json({ error: 'KV not configured' }, 503)
  }

  let amount = 0
  try {
    const body = (await c.req.json()) as { amount?: unknown }
    amount = Math.floor(Number(body.amount))
  } catch {
    return c.json({ error: 'Invalid body' }, 400)
  }
  if (!Number.isFinite(amount) || amount < 1) {
    return c.json({ error: 'Invalid amount' }, 400)
  }
  // 過大な加算を抑止
  amount = Math.min(amount, MAX_AMOUNT_PER_REQUEST)

  // KVはread-modify-writeで厳密にアトミックではないが、個人ブログでは許容する
  const current = await readCount(kv, slug)
  const next = current + amount
  await kv.put(kvKey(slug), String(next))

  return c.json({ count: next })
})
