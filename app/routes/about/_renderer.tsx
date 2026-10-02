import { BaseHead } from '@components/BaseHead'
import { jsxRenderer } from 'hono/jsx-renderer'
import { Link } from 'honox/server'

// 印刷(PDF保存)用ページのレンダラー。
// Navbar / Footer / 検索 / テーマ切り替えを持たず、テーマは winter(ライト) 固定。
export default jsxRenderer(({ children, title, description, canonicalURL }) => (
  <html lang='ja' data-theme='winter'>
    <head>
      <BaseHead
        title={title}
        description={description}
        canonicalURL={canonicalURL}
      />
      <meta name='robots' content='noindex' />
      <Link href='/app/style.css' rel='stylesheet' />
      <style dangerouslySetInnerHTML={{ __html: printStyle }} />
    </head>
    <body class='bg-base-300 print:bg-white'>{children}</body>
  </html>
))

const printStyle = `
@page {
  size: A4;
  margin: 14mm 14mm 16mm;
}
@media print {
  html, body {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}
`
