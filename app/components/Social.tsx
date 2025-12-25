interface Props {
  platform: string
  username: string
  imgPath: string
}

export const Social = ({ platform, username, imgPath }: Props) => {
  return (
    <a href={`https://www.${platform}.com/${username}`}>
      <img class='w-8 h-8' src={`/${imgPath}`} alt={platform} />
    </a>
  )
}
