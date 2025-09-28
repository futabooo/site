import { loadDefaultJapaneseParser } from 'budoux'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import satori from 'satori'
import sharp from 'sharp'

const parser = loadDefaultJapaneseParser()

const generate = async (title: string) => {
  const words = parser.parse(title)

  const __filename = fileURLToPath(import.meta.url)
  const __dirname = path.dirname(__filename)
  const font = fs.readFileSync(
    path.resolve(__dirname, 'NotoSansJP-SemiBold.ttf')
  )
  const svg = await satori(
    <div
      style={{
        display: 'flex',
        height: '100%',
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700,
        background: '#fff',
      }}
    >
      <div
        style={{
          display: 'flex',
          height: '80%',
          width: '90%',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '10px 10px 0 #394e6a',
          border: '3px solid #394e6a',
          borderRadius: '30px 30px 0 0',
        }}
      >
        <div
          style={{
            marginBottom: 30,
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            letterSpacing: '-2',
            fontSize: 60,
            width: 'auto',
            maxWidth: '92%',
            textAlign: 'start',
            color: 'black',
            lineHeight: 1,
          }}
        >
          {words.map((word) => {
            // satoriではinline-blockは使用できないため、明示的にblockを指定する
            // https://github.com/facebook/yoga/issues/968
            return <span style={{ display: 'block' }}>{word}</span>
          })}
        </div>
        <div
          style={{
            right: 60,
            bottom: 30,
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <img
            src='/ic_futabooo_orenge.jpg'
            width='60'
            height='60'
            alt='futabooo'
            style={{
              borderRadius: '100%',
              background: 'transparent',
            }}
          />
          <span
            style={{
              marginTop: 8,
              marginLeft: 8,
              fontSize: 24,
            }}
          >
            futabooo
          </span>
        </div>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: 'Noto Sans JP',
          data: font,
          style: 'normal',
        },
      ],
    }
  )
  return await sharp(Buffer.from(svg)).png().toBuffer()
}

export const createOGImage = ({
  config,
}: {
  config: { path: string }
}): AstroIntegration => {
  return {
    name: 'og-image',
    hooks: {
      'astro:build:done': async ({ dir, pages }) => {
        const blogPages = pages.filter((page) =>
          page.pathname.includes(config.path)
        )

        await Promise.all(
          blogPages.map(async (page) => {
            const indexHtmlPath = path.join(
              dir.pathname,
              page.pathname,
              'index.html'
            )

            const indexHtml = fs.readFileSync(indexHtmlPath, 'utf8') as any
            const title = await indexHtml.match(
              /<title[^>]*>([^<]+)<\/title>/
            )[1]
            const buffer = await generate(title)
            const filename = path.join(dir.pathname, page.pathname, 'ogp.png')
            // 非同期のfs.writeFileだと生成がうまく以下あない場合があるので同期的に書き込む
            fs.writeFileSync(filename, buffer)
          })
        )
      },
    },
  }
}
