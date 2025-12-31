import { FormattedDate } from '@components/FormattedDate'
import { TweetButton } from '@components/TweetButton'
import type { PropsWithChildren } from 'hono/jsx'
import type { BlogPostMetaData } from '../lib/blog'

interface Props {
  blogData: BlogPostMetaData
  ogImage: string
  url: URL
}

export const BlogPost = ({
  blogData,
  ogImage,
  url,
  children,
}: PropsWithChildren<Props>) => {
  return (
    <div class='w-full max-w-3xl flex-grow'>
      <div class='p-4 pt-6 pb-2'>
        <div>
          <article
            class='prose max-w-none'
            data-pagefind-body
            data-pagefind-meta={`image:${blogData.eyeCatchImg ?? ogImage}`}
          >
            {blogData.eyeCatchImg && (
              <img
                width={768}
                height={300}
                src={blogData.eyeCatchImg}
                alt={blogData.eyeCatchAlt ?? ''}
                loading='lazy'
              />
            )}

            <h1 class='title'>{blogData.title}</h1>
            <FormattedDate date={blogData.pubDate} />
            {blogData.updatedDate && (
              <div class='last-updated-on'>
                Last updated on <FormattedDate date={blogData.updatedDate} />
              </div>
            )}
            <hr />
            <div dangerouslySetInnerHTML={{ __html: children }} />
          </article>
        </div>
      </div>
      <div class='pb-10 flex justify-center'>
        <TweetButton title={blogData.title} url={url} />
      </div>
    </div>
  )
}
