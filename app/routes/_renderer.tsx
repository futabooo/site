import { BaseHead } from '@components/BaseHead'
import { Footer } from '@components/Footer'
import { Navbar } from '@components/Navbar'
import { ThemeChange } from '@components/ThemeChange'
import { jsxRenderer } from 'hono/jsx-renderer'
import { Search } from '@components/Search'
import { Link, Script } from 'honox/server'

export default jsxRenderer(
  ({ children, title, description, image, canonicalURL }) => {
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
          <Script src='/app/client.ts' async />
        </head>
        <body class='flex flex-col items-center h-screen'>
          <div class='w-full max-w-3xl flex-grow'>
            <Navbar pathName='/'>
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
