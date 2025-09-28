interface Props {
  date: Date
}

export const FormattedDate = ({ date }: Props) => (
  <time datetime={date.toISOString()}>
    {date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })}
  </time>
)
