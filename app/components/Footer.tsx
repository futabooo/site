import { Social } from '@components/Social'
import { IC_GITHUB, IC_TWITTER, SITE_AUTHOR } from '../consts'

const today = new Date()

export const Footer = () => {
  return (
    <footer class='footer footer-center bg-base-200 p-10'>
      <div class='w-full max-w-3xl'>
        <nav class='grid grid-flow-col gap-4'>
          <div class='w-7'>
            <Social platform='twitter' username={SITE_AUTHOR} imgPath={IC_TWITTER} />
          </div>

          <Social platform='github' username={SITE_AUTHOR} imgPath={IC_GITHUB} />
        </nav>

        <aside>
          <p class='text-xs'>
            &copy;{today.getFullYear()}&nbsp;
            <a class='link' href={`https://twitter.com/${SITE_AUTHOR}`} target='_blank'>
              {SITE_AUTHOR}
            </a>
            &nbsp;All rights reserved. Powered by
            <a class='link' href='https://hono.dev/' target='_blank' rel='noopener noreferrer'>
              {' '}
              Hono
            </a>
          </p>
        </aside>
      </div>
    </footer>
  )
}
