#!/usr/bin/env bun
// content/blog 配下の記事からURLだけの行を集め、OGPを取得して
// content/link-cards.json に書き出す。
//
// 使い方:
//   bun run link-cards            # 未取得のURLだけ取得
//   bun run link-cards -- --refresh   # 既存キャッシュも含め全件取り直す
//
// blog.ts の marked パースは同期でWorkerバンドルに焼き込まれるため、
// OGP取得はここで完結させ、ビルドをネットワーク非依存に保つ。
import { existsSync, globSync, readFileSync, writeFileSync } from 'node:fs'
import { default as matter } from 'gray-matter'
import { Marked, type Token, type Tokens } from 'marked'
import { SITE_URL } from '../app/consts'
import {
  getBareLinkHref,
  type LinkCardCache,
  type LinkCardEntry,
} from '../app/lib/link-card'

const CACHE_PATH = 'content/link-cards.json'
const REFRESH = process.argv.includes('--refresh')
const TIMEOUT_MS = 10_000

function collectBareUrls(): string[] {
  const marked = new Marked()
  const urls = new Set<string>()
  const files = globSync('content/blog/**/index.md')

  for (const file of files) {
    const raw = readFileSync(file, 'utf-8')
    const { content } = matter(raw)
    const tokens = marked.lexer(content)
    marked.walkTokens(tokens, (token: Token) => {
      if (token.type !== 'paragraph') return
      const href = getBareLinkHref(token as Tokens.Paragraph)
      if (href) urls.add(href)
    })
  }

  return [...urls]
}

function loadCache(): LinkCardCache {
  if (!existsSync(CACHE_PATH)) return {}
  return JSON.parse(readFileSync(CACHE_PATH, 'utf-8'))
}

function saveCache(cache: LinkCardCache) {
  const sorted: LinkCardCache = {}
  for (const key of Object.keys(cache).sort()) {
    sorted[key] = cache[key]
  }
  writeFileSync(CACHE_PATH, `${JSON.stringify(sorted, null, 2)}\n`)
}

function decodeEntities(value: string): string {
  return value
    .replace(/&nbsp;/g, ' ')
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) =>
      String.fromCodePoint(Number.parseInt(hex, 16))
    )
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number(dec)))
    .replace(/&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim()
}

function matchMetaContent(html: string, attr: string, value: string) {
  const patterns = [
    new RegExp(
      `<meta[^>]+${attr}=["']${value}["'][^>]+content=["']([^"']*)["']`,
      'i'
    ),
    new RegExp(
      `<meta[^>]+content=["']([^"']*)["'][^>]+${attr}=["']${value}["']`,
      'i'
    ),
  ]
  for (const re of patterns) {
    const match = html.match(re)
    if (match) return decodeEntities(match[1])
  }
  return undefined
}

function extractMeta(html: string, pageUrl: string) {
  const titleTagMatch = html.match(/<title>([^<]*)<\/title>/i)?.[1]
  const title =
    matchMetaContent(html, 'property', 'og:title') ||
    (titleTagMatch ? decodeEntities(titleTagMatch) : undefined)
  const description =
    matchMetaContent(html, 'property', 'og:description') ||
    matchMetaContent(html, 'name', 'description')
  let image = matchMetaContent(html, 'property', 'og:image')
  if (image) {
    try {
      image = new URL(image, pageUrl).toString()
    } catch {
      image = undefined
    }
  }
  return { title, description, image }
}

async function fetchExternal(url: string): Promise<LinkCardEntry> {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; futabooo-link-card-bot/1.0)',
      },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
    if (!res.ok) {
      console.error(`  failed: ${url} (status ${res.status})`)
      return { ok: false }
    }
    const html = await res.text()
    const { title, description, image } = extractMeta(html, url)
    if (!title) {
      console.error(`  failed: ${url} (no title found)`)
      return { ok: false }
    }
    return { url, title, description, image }
  } catch (error) {
    console.error(`  failed: ${url} (${(error as Error).message})`)
    return { ok: false }
  }
}

// 自サイト内の記事URLはfetchせず、frontmatterから直接メタ情報を組み立てる。
// 対象外（/blog/以下でない）なら null を返す。
function resolveInternal(url: string): LinkCardEntry | null {
  const prefix = `${SITE_URL}/blog/`
  if (!url.startsWith(prefix)) return null

  const slug = url.slice(prefix.length).split(/[/?#]/)[0]
  const mdPath = `content/blog/${slug}/index.md`
  if (!existsSync(mdPath)) {
    console.error(`  failed: ${url} (${mdPath} not found)`)
    return { ok: false }
  }

  const raw = readFileSync(mdPath, 'utf-8')
  const { data } = matter(raw)
  if (!data.title) return { ok: false }

  const eyeCatchImg = data.eyeCatchImg
    ? String(data.eyeCatchImg).replace(/^\.\//, '')
    : undefined

  return {
    url,
    title: String(data.title),
    description: data.description ? String(data.description) : undefined,
    image: eyeCatchImg
      ? new URL(`/blog/${slug}/${eyeCatchImg}`, SITE_URL).toString()
      : undefined,
  }
}

async function main() {
  const urls = collectBareUrls()
  const cache = loadCache()

  const targets = urls.filter((url) => REFRESH || !(url in cache))

  console.log(
    `bare URLs: ${urls.length} total, ${targets.length} to fetch (refresh=${REFRESH})`
  )

  let succeeded = 0
  let failed = 0

  for (const url of targets) {
    const internal = resolveInternal(url)
    const entry = internal ?? (await fetchExternal(url))
    cache[url] = entry
    if (entry.ok === false) {
      failed++
    } else {
      succeeded++
      console.log(`  ok: ${url} -> ${entry.title}`)
    }
  }

  saveCache(cache)

  console.log(
    `done. 新規 ${targets.length}件 (成功 ${succeeded} / 失敗 ${failed}), 合計 ${Object.keys(cache).length}件`
  )
}

main()
