interface Props {
  name: string
  count?: number
}

export const TagBadge = ({ name, count }: Props) => (
  <a
    class='badge badge-outline p-3'
    // href={`/tag/${name.toLowerCase().replace(/ /g, '-')}`}
    href={`/tag/${name}`}
  >
    #{name} {count && `(${count})`}
  </a>
)
