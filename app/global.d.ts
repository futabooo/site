import type {} from 'hono'

type Head = {
  title?: string
  description?: string
  image?: URL
  canonicalURL?: URL
}

declare module 'hono' {
  interface Env {
    Variables: {}
    Bindings: {
      // 記事ごとのいいね(拍手)数を保存するKVネームスペース
      LIKES: KVNamespace
    }
  }
  interface ContextRenderer {
    // biome-ignore lint/style/useShorthandFunctionType: <explanation>
    (
      content: string | Promise<string>,
      head?: Head
    ): Response | Promise<Response>
  }
}
