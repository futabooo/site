import { BaseHead } from '@components/BaseHead'
import { Footer } from '@components/Footer'
import { Navbar } from '@components/Navbar'
import { Search } from '@components/Search'
import { ThemeChange } from '@components/ThemeChange'
import { jsxRenderer } from 'hono/jsx-renderer'
import { Link, Script } from 'honox/server'

export default jsxRenderer(
  ({ children, title, description, image, canonicalURL }, c) => {
    const pathName = new URL(c.req.url).pathname
    return (
      <html lang='ja'>
        <head>
          <BaseHead
            title={title}
            description={description}
            image={image}
            canonicalURL={canonicalURL}
          />
          <Link href='/app/style.css' rel='stylesheet' />
          {/* asyncを付けるとHTML解析完了前にcreateClient()が実行され、
              ページ下部のislandを取りこぼすレースが起きるので付けない
              (type=moduleはデフォルトでdefer相当なので実行は解析完了後になる) */}
          <Script src='/app/client.ts' />
          <link href='/pagefind/pagefind-ui.css' rel='stylesheet' />
          <script src='/pagefind/pagefind-ui.js' async />
        </head>
        <body class='flex flex-col items-center h-screen'>
          <div class='w-full max-w-3xl flex-grow px-6'>
            <Navbar pathName={pathName}>
              <Search />
              <ThemeChange />
            </Navbar>
            {children}
          </div>
        </body>
        <Footer />
      </html>
    )
  }
)
