import { loadDefaultJapaneseParser } from 'budoux'
import fs from 'node:fs'
import satori from 'satori'
import sharp from 'sharp'

const parser = loadDefaultJapaneseParser()

export const generateOGImage = async (
  title: string,
  fontPath: string,
  iconPath: string
): Promise<Buffer> => {
  const words = parser.parse(title)

  const font = fs.readFileSync(fontPath)
  const iconData = fs.readFileSync(iconPath)
  const iconBase64 = `data:image/jpeg;base64,${iconData.toString('base64')}`

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
          {words.map((word, index) => {
            // satoriではinline-blockは使用できないため、明示的にblockを指定する
            // https://github.com/facebook/yoga/issues/968
            return (
              <span key={index} style={{ display: 'block' }}>
                {word}
              </span>
            )
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
            src={iconBase64}
            alt='futabooo'
            style={{
              width: 60,
              height: 60,
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
