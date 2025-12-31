import { BlogListItemSmall } from '@components/BlogListItemSmall'
import { TagBadge } from '@components/TagBadge'
import { createRoute } from 'honox/factory'
import { SITE_URL } from '../consts'
import { allPosts } from '../lib/blog'

export default createRoute(async (c) => {
  const newestPosts = allPosts.slice(0, 3)
  const tags = [...new Set(allPosts.flatMap((post) => post.data.tags))]
  const tagWithCountList = tags.map((tag) => {
    const count = allPosts.filter(
      (post) => tag && post.data.tags?.includes(tag)
    ).length
    return { name: tag, count }
  })

  return c.render(
    <>
      <div class='mb-16'>
        <h1 class='text-3xl font-bold mb-4'>Hi, I'm futabooo!!</h1>
        <p>
          Welcome to my personal site.🏡
          <br />
          <br />
          株式会社10Xで働くソフトウェアエンジニアです。仕事ではコードを書くことを中心としてチームビルディングやプロセスの効率化を行っています。休日は家族と遊んだり、コードを書いたり、フットサルをしたりしています。
        </p>
      </div>
      <div>
        <div class='flex justify-between'>
          <h2 class='text-3xl font-bold mb-4'>最新の投稿</h2>
          <a href='/blog'>
            <button class='btn btn-outline btn-sm' type='button'>
              もっとみる
            </button>
          </a>
        </div>
        <div>
          {newestPosts.map((post, index) => (
            <div class=''>
              <BlogListItemSmall post={post} />
              {newestPosts.length - 1 > index && <div class='divider m-0' />}
            </div>
          ))}
        </div>

        <h2 class='text-3xl font-bold mb-4 mt-14'>Tag一覧</h2>
        <div class='flex flex-row flex-wrap gap-1'>
          {tagWithCountList.map((tagWithCount) => (
            <TagBadge name={tagWithCount.name} count={tagWithCount.count} />
          ))}
        </div>
      </div>
    </>,
    {
      title: 'futabooo.com',
      description: 'Home - futabooo.com',
      canonicalURL: new URL(new URL(c.req.url).pathname, SITE_URL),
    }
  )
})
