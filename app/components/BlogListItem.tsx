import type { BlogPost } from 'app/lib/blog'
import { FormattedDate } from './FormattedDate'
import { TagBadge } from './TagBadge'

interface Props {
  post: BlogPost
}

export const BlogListItem = ({ post }: Props) => (
  <div class='pb-8'>
    <p class='text-sm'>
      <FormattedDate date={post.data.pubDate} />
    </p>
    <h2 class='text-xl font-bold mb-1.5'>
      <a class='hover:underline' href={`/blog/${post.id}`}>
        {post.data.title}
      </a>
    </h2>
    <div class='flex flex-row flex-wrap gap-1'>
      {post.data.tags.map((tag) => (
        <TagBadge name={tag} />
      ))}
    </div>
  </div>
)
