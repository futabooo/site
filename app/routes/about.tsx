import { createRoute } from 'honox/factory'
import { asHTML } from '../lib/about'

export default createRoute(async (c) => {
  return c.render(
    <div class='prose max-w-none'>
      <h1 class='title'>About</h1>
      <h2 class='text-2xl font-bold'>職務経歴</h2>
      <div dangerouslySetInnerHTML={{ __html: await asHTML() }} />
    </div>,
    {
      title: 'About - futabooo.com',
      description: 'About - futabooo.com',
      canonicalURL: new URL(c.req.url),
    }
  )
})
