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
    Bindings: {}
  }
  interface ContextRenderer {
    // biome-ignore lint/style/useShorthandFunctionType: <explanation>
    (
      content: string | Promise<string>,
      head?: Head
    ): Response | Promise<Response>
  }
}
