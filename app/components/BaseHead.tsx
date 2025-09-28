interface Props {
  title?: string
  description?: string
  image?: URL
  canonicalURL?: URL
}

const DEFAULT_IMAGE = new URL('/ogp.png', import.meta.url)
const DEFAULT_CANONICAL_URL = new URL('/', import.meta.url)

export const BaseHead = ({
  title = "futabooo's Blog",
  description = '',
  image = DEFAULT_IMAGE,
  canonicalURL = DEFAULT_CANONICAL_URL,
}: Props) => {
  return (
    <>
      {/* Global Metadata */}
      <meta charset='utf-8' />
      <meta name='viewport' content='width=device-width,initial-scale=1' />
      <link rel='icon' type='image/svg+xml' href='/favicon.ico' />
      <meta name='generator' content='Hono' />

      {/* Canonical URL */}
      <link rel='canonical' href={canonicalURL.toString()} />

      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name='title' content={title} />
      <meta name='description' content={description} />

      {/* Open Graph / Facebook */}
      <meta property='og:type' content='website' />
      <meta property='og:url' content={canonicalURL.toString()} />
      <meta property='og:title' content={title} />
      <meta property='og:description' content={description} />
      <meta
        property='og:image'
        content={new URL(image, canonicalURL).toString()}
      />

      {/* Twitter */}
      <meta property='twitter:card' content='summary_large_image' />
      <meta property='twitter:url' content={canonicalURL.toString()} />
      <meta property='twitter:title' content={title} />
      <meta property='twitter:description' content={description} />
      <meta
        property='twitter:image'
        content={new URL(image, canonicalURL).toString()}
      />

      {/* hatena */}
      <link rel='author' href='http://www.hatena.ne.jp/futabooo/' />

      {/* Global site tag (gtag.js) - Google Analytics */}
      <script
        type='text/partytown'
        src='https://www.googletagmanager.com/gtag/js?id=G-NCE9S2S68M'
      ></script>
      {/* <script type="text/partytown">
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  gtag("js", new Date());
  gtag("config", "G-NCE9S2S68M");
</script> */}
    </>
  )
}
