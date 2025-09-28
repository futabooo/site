import { IC_TWITTER } from '../consts'

// const buttonStyle = css`
//   .btn:hover img {
//     filter: brightness(0.8); /* マウスオーバー時の画像の色調整 */
//   }

//   @media (prefers-color-scheme: dark) {
//     .btn:hover img {
//       filter: invert(1); /* ダークモード時の画像の色反転 */
//     }
//   }
// `

export const TweetButton = ({ title, url }: { title: string; url: string }) => (
  <a
    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`}
  >
    <button className='btn btn-outline gap-2' type='button'>
      <img className='w-4 h-4' src={`/${IC_TWITTER}`} alt='Twitter' />
      <p className='text-base'>ポスト</p>
    </button>
  </a>
)
