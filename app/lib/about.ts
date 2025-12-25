import { readFile } from 'node:fs/promises'
import { marked } from 'marked'

export const asHTML = async () => {
  const content = await readFile('content/about/about-cv.md', 'utf-8')
  // MarkdownをHTMLに変換
  const html = await marked(content)
  return html
}
