import type { Tokens } from 'marked'

export interface LinkCardMeta {
  url: string
  title: string
  description?: string
  image?: string
}

export interface LinkCardNotFound {
  ok: false
}

export type LinkCardEntry = LinkCardMeta | LinkCardNotFound

export type LinkCardCache = Record<string, LinkCardEntry>

export function isLinkCardMeta(
  entry: LinkCardEntry | undefined
): entry is LinkCardMeta {
  return !!entry && (entry as LinkCardMeta).ok !== false
}

/**
 * 段落トークンがURLだけの行かどうかを判定する。
 * `[label](url)` やリスト内のURLはここには来ない
 * （前者はtokenのrawがlabel付きになり、後者はlistトークンとして扱われるため）。
 */
export function getBareLinkHref(token: Tokens.Paragraph): string | null {
  const { tokens } = token
  if (tokens.length !== 1) return null
  const [only] = tokens
  if (only.type !== 'link') return null
  const link = only as Tokens.Link
  if (link.raw !== link.href) return null
  return link.href
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function getHostname(url: string): string {
  try {
    return new URL(url).hostname
  } catch {
    return url
  }
}

export function renderLinkCard(meta: LinkCardMeta): string {
  const hostname = getHostname(meta.url)
  const faviconUrl = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(hostname)}&sz=32`

  const image = meta.image
    ? `<div class="rlc-image-container">
        <img class="rlc-image" src="${escapeHtml(meta.image)}" alt="" loading="lazy" />
      </div>`
    : ''

  const description = meta.description
    ? `<div class="rlc-description">${escapeHtml(meta.description)}</div>`
    : ''

  return `<a class="rlc-container" href="${escapeHtml(meta.url)}" target="_blank" rel="noreferrer noopener" data-pagefind-ignore>
    <div class="rlc-info">
      <div class="rlc-title">${escapeHtml(meta.title)}</div>
      ${description}
      <div class="rlc-url-container">
        <img class="rlc-favicon" src="${faviconUrl}" alt="" loading="lazy" />
        <span class="rlc-url">${escapeHtml(hostname)}</span>
      </div>
    </div>
    ${image}
  </a>`
}
