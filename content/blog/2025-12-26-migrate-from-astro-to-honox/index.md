---
title: "個人ブログをAstroからHonoXに作りかえる"
description: "個人ブログをAstroからHonoXに移行したのでその記録"
tags: ["HonoX", "Astro", "Hono"]
pubDate: "2025/12/26"
---

# はじめに

このブログは元々[Astro](https://astro.build/)で作られていましたが、[HonoX](https://github.com/honojs/honox)に移行しました。移行の理由と移行時に実施した変更について書きます。

# なぜHonoXに移行したのか

[HonoX](https://github.com/honojs/honox)は、[Hono](https://hono.dev/)をベースにしたフルスタックWebフレームワークです。Honoはエッジ環境で動作する軽量なWebフレームワークとして知られていて、HonoXはその上に構築されたフルスタックフレームワークです。

移行した理由は、Cloudflare Workersなどのエッジ環境で動作するのでより高速なレスポンスが期待できるのと、Astroよりもシンプルな構成で必要な機能だけを選択できること、あとは新しいフレームワークを試してみたかったからです。

# 移行時に実施した変更

## ルーティング

Astroでは`src/pages/`配下にファイルを配置することでルーティングが自動生成されていましたが、HonoXでは`app/routes/`配下にファイルを配置し、`createRoute`を使ってルートを定義します。

```typescript
// app/routes/blog/[slug].tsx
import { createRoute } from 'honox/factory'
import { ssgParams } from 'hono/ssg'

export default createRoute(
  ssgParams(async () => {
    const posts = allPosts
    return posts.map((post) => ({
      slug: post.id,
    }))
  }),
  async (c) => {
    const slug = c.req.param('slug')
    // ...
  }
)
```

## レンダリング

Astroでは`.astro`ファイルでコンポーネントを定義していましたが、HonoXではJSXを使用します。レンダラーは`app/routes/_renderer.tsx`で定義します。

```typescript
// app/routes/_renderer.tsx
import { jsxRenderer } from 'hono/jsx-renderer'

export default jsxRenderer(
  ({ children, title, description, image, canonicalURL }) => {
    return (
      <html lang='ja'>
        <head>
          {/* ... */}
        </head>
        <body>
          {children}
        </body>
      </html>
    )
  }
)
```

## ビルド設定

`vite.config.ts`でHonoX用のプラグインを設定します。`honox/vite`プラグインの追加、`@hono/vite-ssg`によるSSGの設定、`@hono/vite-build/cloudflare-workers`によるCloudflare Workers向けのビルド設定を行いました。

```typescript
// vite.config.ts
import honox from 'honox/vite'
import ssg from '@hono/vite-ssg'
import build from '@hono/vite-build/cloudflare-workers'

export default defineConfig({
  plugins: [
    honox({
      devServer: { adapter },
      client: { input: ['./app/style.css'] },
    }),
    ssg({
      entry: './app/server.ts',
    }),
    build(),
    // ...
  ],
})
```

主な依存関係は`honox`、`hono`、`@hono/vite-ssg`、`@hono/vite-build`、`@hono/vite-dev-server`です。

## コンテンツ管理

ブログ記事の読み込み方法は、Astroの`Astro.glob()`からViteの`import.meta.glob()`に変更しました。

```typescript
// app/lib/blog.ts
const markdownFiles = import.meta.glob('../../content/blog/**/index.md', {
  eager: true,
  query: '?raw',
  import: 'default',
})
```

## その他の変更

OGP画像生成はビルド時にOGP画像を生成するViteプラグインを追加しました。ブログ記事のアセットを`dist`にコピーするViteプラグインも追加しています。Pagefindについては開発サーバーでPagefindをサーブするViteプラグインを追加しました。

## OGP画像生成の実装

OGP画像は、satoriとsharpを使ってJSXからPNG画像を生成しています。ビルド時に各記事のタイトルからOGP画像を自動生成するViteプラグインを追加しました。

```typescript
// vite.config.ts
const generateOGImages = () => {
  return {
    name: 'generate-og-images',
    closeBundle: async () => {
      const markdownFiles = globSync('content/blog/**/index.md')

      for (const filePath of markdownFiles) {
        const raw = readFileSync(filePath, 'utf-8')
        const { data } = matter(raw)
        const title = data.title as string

        const buffer = await generateOGImage(title, fontPath, iconPath)
        writeFileSync(destPath, buffer)
      }
    },
  }
}
```

OGP画像の生成は`app/lib/ogimage.tsx`で実装しています。日本語のタイトルを適切に改行するために、budouxを使ってタイトルを分割しています。

```typescript
// app/lib/ogimage.tsx
import { loadDefaultJapaneseParser } from 'budoux'
import satori from 'satori'
import sharp from 'sharp'

const parser = loadDefaultJapaneseParser()

export const generateOGImage = async (
  title: string,
  fontPath: string,
  iconPath: string
): Promise<Buffer> => {
  const words = parser.parse(title)

  const svg = await satori(
    <div>
      <div>
        {words.map((word, index) => (
          <span key={index} style={{ display: 'block' }}>
            {word}
          </span>
        ))}
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      fonts: [{ name: 'Noto Sans JP', data: font, style: 'normal' }],
    }
  )
  return await sharp(Buffer.from(svg)).png().toBuffer()
}
```

### OGP画像生成で苦労したこと

Astroの時は`astro:build:done`フックを使っていましたが、HonoXではViteプラグインの`closeBundle`フックを使うように変更しました。ビルド完了時にOGP画像を生成するタイミングを調整するのに苦労しました。

また、satoriでは`inline-block`が使えないという制約があります。そのため、budouxで分割した単語を`display: block`で表示する必要がありました。最初は`inline-block`を使おうとしましたが、satoriの制約でエラーになったので、各単語を`display: block`で表示するように変更しました。

```typescript
// satoriではinline-blockは使用できないため、明示的にblockを指定する
// https://github.com/facebook/yoga/issues/968
{words.map((word, index) => (
  <span key={index} style={{ display: 'block' }}>
    {word}
  </span>
))}
```

OGP画像の保存先は`dist/blog/{slug}/ogp.png`ですが、ビルド時にフォルダが存在しない場合があるので、`mkdirSync`でフォルダを作成する処理を追加しました。また、タイトルが存在しない場合はOGP画像の生成をスキップするようにしています。

Astroの時はHTMLファイルからタイトルを抽出していましたが、今回はmarkdownファイルのfrontmatterから直接タイトルを取得するように変更しました。これにより、より確実にタイトルを取得できるようになりました。

## RSSフィードの実装

RSSフィードは`app/routes/rss.xml.tsx`で実装しています。Astroの時は`src/pages/rss.xml.ts`で実装していましたが、HonoXでは`createRoute`を使ってルートを定義します。

```typescript
// app/routes/rss.xml.tsx
export default createRoute((c) => {
  const items = allPosts
    .slice(0, 20) // 最新20件
    .map((post) => {
      const link = `${SITE_URL}/blog/${post.id}`
      return `
    <item>
      <title>${escapeXml(post.data.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <description>${escapeXml(post.data.description)}</description>
      <pubDate>${formatDate(post.data.pubDate)}</pubDate>
      <author>${SITE_AUTHOR}</author>
    </item>`
    })
    .join('')

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_TITLE)}</title>
    <link>${SITE_URL}</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>ja</language>
    <lastBuildDate>${formatDate(new Date())}</lastBuildDate>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml"/>${items}
  </channel>
</rss>`

  return c.body(rss, 200, {
    'Content-Type': 'application/xml; charset=utf-8',
  })
})
```

XMLを手動で組み立てて返しています。XMLエスケープは`escapeXml`関数で実装し、日付のフォーマットは`formatDate`関数で実装しています。最新20件の記事を取得してRSSフィードを生成しています。

### RSSフィードの実装で苦労したこと

SSGを使っているので、ビルド時にRSSフィードのXMLファイルを生成して`dist/rss.xml`として保存する構成にもできます（というか、SSGでビルドすると最終的には`dist/rss.xml`として出力されます）。OGP画像生成と同様に、Viteプラグインの`closeBundle`フックで「ビルド後にXMLを生成して保存する」という作りに寄せることもできます。

今回は`app/routes/rss.xml.tsx`としてルートを実装しておいて、そこからRSSを組み立てる形にしています（結果としてSSGでは静的ファイルに落ちます）。どちらが正しい/制約というより、どこで生成するか（ルート側で書くか、ビルド後に吐くか）の好みの問題だと思います。XMLを手動で組み立てる必要があったので、XMLエスケープの処理を正しく実装する必要がありました。また、`Content-Type`ヘッダーを正しく設定しないと、RSSリーダーで正しく認識されないので注意が必要でした。

## GoogleAnalyticsの実装

GoogleAnalyticsは`app/components/BaseHead.tsx`に実装しています。本番環境でのみ読み込むように`import.meta.env.PROD`で条件分岐しています。

```typescript
// app/components/BaseHead.tsx
{import.meta.env.PROD && (
  <>
    <script
      async
      src='https://www.googletagmanager.com/gtag/js?id=G-NCE9S2S68M'
    />
    <script
      dangerouslySetInnerHTML={{
        __html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-NCE9S2S68M');
        `,
      }}
    />
  </>
)}
```

### GoogleAnalyticsの実装で苦労したこと

Astroの時は`import.meta.env.MODE === 'production'`を使っていましたが、Viteでは`import.meta.env.PROD`を使うように変更しました。また、`dangerouslySetInnerHTML`を使ってスクリプトを埋め込む必要がありました。開発環境ではGoogleAnalyticsを読み込まないようにすることで、開発時のパフォーマンスを向上させています。

## Markdown内の画像パスの処理

ブログ記事のmarkdownファイル内では、画像を`![](./assets/image.png)`という相対パスで書いています。このパスを、production、development、手元のmarkdownで正しく表示されるように工夫しました。

### フォルダ構成の変更

相対パスで書けるようにするために、ブログ記事のフォルダ構成を以下のようにしました。

```
content/blog/
  └── {slug}/
      ├── index.md
      └── assets/
          └── image.png
```

各記事フォルダ内に`index.md`と`assets/`フォルダを配置することで、markdownファイルから見て`./assets/image.png`という相対パスで画像を参照できるようになりました。この構成により、手元のmarkdownエディタでも画像が正しく表示されます。

ブログ記事の読み込みは、`import.meta.glob('../../content/blog/**/index.md')`で`index.md`ファイルを読み込み、フォルダ名からslugを取得しています。

```typescript
// app/lib/blog.ts
const markdownFiles = import.meta.glob('../../content/blog/**/index.md', {
  eager: true,
  query: '?raw',
  import: 'default',
})

export const allPosts: BlogPost[] = Object.entries(markdownFiles)
  .map(([filePath, raw]) => {
    // 例: '../../content/blog/2025-03-19-electricity-usage-2024/index.md'
    // → '2025-03-19-electricity-usage-2024'
    const pathParts = filePath.split('/')
    const slug = pathParts[pathParts.length - 2] || ''
    // ...
  })
```

この構成により、各記事が独立したフォルダに配置され、そのフォルダ内の`assets/`フォルダに画像を配置することで、相対パスで画像を参照できるようになりました。

### 開発環境での画像配信

開発時に手元で困らないように、`app/routes/blog/[slug]/assets/[filename].tsx`というルートで画像ファイルを返せるようにしています（`content/`配下から直接読むやつ）。

```typescript
// app/routes/blog/[slug]/assets/[filename].tsx
export default createRoute(async (c) => {
  const slug = c.req.param('slug')
  const filename = c.req.param('filename')
  
  // （主に開発時向けの）静的ファイル配信
  const imagePath = join(process.cwd(), 'content', 'blog', slug, 'assets', filename)
  
  if (!existsSync(imagePath)) {
    c.status(404)
    return c.text('Not Found')
  }
  
  const imageBuffer = readFileSync(imagePath)
  // Content-Typeを設定して返す
  // ...
})
```

これにより、開発中は`content/blog/{slug}/assets/`配下の画像ファイルを直接配信できます（本番は次の「ビルド時コピー」で`dist`配下に置く想定です）。

### 本番環境での画像配信

本番環境では、ビルド時に`copyContentAssets`プラグインで`content/blog/**/assets/**/*`を`dist/blog/**/assets/**/*`にコピーしています。

```typescript
// vite.config.ts
const copyContentAssets = () => {
  return {
    name: 'copy-content-assets',
    buildStart() {
      const imageFiles = globSync(
        'content/blog/**/assets/**/*.{png,jpg,jpeg,gif,svg,webp}'
      )
      imageFiles.forEach((filePath) => {
        // content/blog/2025-03-19-electricity-usage-2024/assets/image.png
        // → dist/blog/2025-03-19-electricity-usage-2024/assets/image.png
        const relativePath = filePath.replace('content/blog/', 'blog/')
        const destPath = join('dist', relativePath)
        mkdirSync(dirname(destPath), { recursive: true })
        copyFileSync(filePath, destPath)
      })
    },
  }
}
```

### パスの変換

markdownファイル内の`![](./assets/image.png)`を、HTMLに変換した後に`/blog/{slug}/assets/image.png`に変換しています。

```typescript
// app/routes/blog/[slug].tsx
let html = await marked(post.html)
// マークダウン内の相対パスを絶対パスに変換
// ./assets/image.png -> /blog/{slug}/assets/image.png
html = html.replace(
  /src="\.\/assets\/([^"]+)"/g,
  `src="/blog/${post.id}/assets/$1"`
)
```

これにより、markdownファイル内では相対パスで書けるので、手元のmarkdownエディタでも画像が正しく表示されます。また、開発環境と本番環境の両方で正しく画像が表示されるようになりました。

### Markdown内の画像パス処理で苦労したこと

最初は絶対パスで書こうとしましたが、手元のmarkdownエディタで画像が表示されないのが不便でした。相対パスで書けるようにするために、markedでHTMLに変換した後に正規表現でパスを変換する方法を採用しました。

開発環境と本番環境で画像の配信方法が異なるので、開発環境では動的にファイルを配信するルートを追加し、本番環境ではビルド時にファイルをコピーするプラグインを追加しました。これにより、どちらの環境でも正しく画像が表示されるようになりました。

## テーマ変更ボタンの実装

DaisyUIを使っているので、テーマ変更は`data-theme`属性を切り替えるだけで実現できます。テーマ変更ボタンは`ThemeChange`コンポーネントとして実装しました。

```tsx
// app/components/ThemeChange.tsx
export const ThemeChange = () => (
  <>
    <button
      id='themeChange'
      class='btn btn-square btn-ghost swap swap-rotate'
      type='button'
      aria-label='テーマを切り替え'
    >
      <svg class='swap-off fill-current w-5 h-5'>{/* Sun icon */}</svg>
      <svg class='swap-on fill-current w-5 h-5'>{/* Moon icon */}</svg>
    </button>
    <script dangerouslySetInnerHTML={{ __html: themeScript }} />
  </>
)
```

テーマの切り替えはインラインスクリプトで実装しています。localStorageに保存したテーマを読み込んで、`data-theme`属性を設定しています。

```javascript
const themeScript = `
(function() {
  // 初期テーマの設定
  var theme = localStorage.getItem('theme');
  if (!theme) {
    theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'night' : 'winter';
  }
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);

  // DOMContentLoadedでボタンの初期化
  document.addEventListener('DOMContentLoaded', function() {
    var btn = document.getElementById('themeChange');
    if (!btn) return;

    // 初期状態の設定
    if (theme === 'night') {
      btn.classList.add('swap-active');
    }

    // クリックイベント
    btn.addEventListener('click', function() {
      var currentTheme = document.documentElement.getAttribute('data-theme');
      var newTheme = currentTheme === 'winter' ? 'night' : 'winter';

      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      btn.classList.toggle('swap-active');
    });
  });
})();
`
```

### テーマ変更ボタンの実装で苦労したこと

今回はSSG（Static Site Generation）構成で、テーマの状態もlocalStorageベースにしているので、リクエスト時にサーバー側でユーザーのテーマを判定してHTMLに反映する、ということはしていません。そのため、ページ読み込み時にテーマが適用される前に一瞬フラッシュが発生する可能性があります。

これを防ぐために、インラインスクリプトを即座に実行するIIFE（即時実行関数）にして、HTMLのパース中にテーマを設定するようにしました。スクリプトは`ThemeChange`コンポーネント内で`dangerouslySetInnerHTML`を使って埋め込んでいます。

また、DaisyUIの`swap`クラスを使っているので、ボタンの初期状態を`swap-active`クラスで制御する必要があります。テーマが`night`の場合は`swap-active`を追加して、アイコンが正しく表示されるようにしています。`DOMContentLoaded`イベントでボタンの初期化を行っているので、ボタンが存在しない場合は早期リターンするようにしています。

最初はクライアントサイドのJavaScriptでテーマを管理しようとしましたが、ページ読み込み時のフラッシュが気になったので、インラインスクリプトを使う方法に変更しました。`dangerouslySetInnerHTML`を使うのはあまり推奨されませんが、この場合はページ読み込み時のフラッシュを防ぐために必要な選択でした。`_renderer.tsx`の`<head>`内にスクリプトを配置することも可能ですが、今回はコンポーネント内で実装する方法を選択しました。

# 移行してみて

Cloudflare Workersでの実行により、エッジ環境での高速なレスポンスが可能になったのと、Astroよりもシンプルな構成で必要な機能だけを選択できるようになりました。TypeScriptを第一級でサポートしているので型安全性も高く、ルーティングやレンダリングをより細かく制御できるようになりました。

一方で、Astroほど成熟したエコシステムがないのと、ドキュメントもAstroほど充実していないので、新しいフレームワークを学習する必要があります。ただ、Honoのエコシステムを活用できるので、今後も発展が期待できると思います。

# おわりに

AstroからHonoXへの移行は、主に学習目的とエッジ環境での実行を目的として実施しました。

