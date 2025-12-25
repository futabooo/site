import { FormattedDate } from '@components/FormattedDate'
import type { BlogPost } from 'app/lib/blog'

interface Props {
  post: BlogPost
}

export const BlogListItemSmall = ({ post }: Props) => (
  <div>
    <a class='flex justify-between group' href={`/blog/${post.id}`}>
      <h2 class='text-xl font-bold group-hover:underline'>{post.data.title}</h2>
      <p class='min-w-fit ps-4 text-sm invisible md:visible'>
        <FormattedDate date={post.data.pubDate} />
      </p>
    </a>
  </div>
)
