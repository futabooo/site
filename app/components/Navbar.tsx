import { IC_FUTABOOO, SITE_TITLE } from '../consts'

interface Props {
  pathName?: string
  children?: any
}

const navItem = [
  {
    title: 'Blog',
    slug: '/blog',
  },
  {
    title: 'About',
    slug: '/about',
  },
]

export const Navbar = ({ pathName = '/' }: Props) => (
  <div class='navbar bg-base-100'>
    <div class='flex-1'>
      <a
        href='/'
        class='p-2 hover:underline md:text-2xl font-bold flex gap-4 items-center'
      >
        <img
          src={`/${IC_FUTABOOO}`}
          width='48'
          height='48'
          alt='futabooo'
          class='rounded-full bg-base-200 md:w-12 md:h-12 w-9 h-9'
        />
        {SITE_TITLE}
      </a>
    </div>
    <div class='flex-none flex'>
      <ul class='menu menu-horizontal hidden md:flex'>
        {navItem.map((item) => (
          <li
            class={
              pathName === item.slug
                ? 'border-b-2 border-primary'
                : 'border-b-2 border-transparent'
            }
          >
            <a href={item.slug}>{item.title}</a>
          </li>
        ))}
      </ul>
      <slot />
      <div class='dropdown dropdown-end md:hidden'>
        <button tabindex={0} class='btn btn-ghost btn-square' type='button'>
          <svg
            class='w-6 h-6 stroke-current feather feather-menu'
            xmlns='http://www.w3.org/2000/svg'
            width='24'
            height='24'
            viewBox='0 0 24 24'
            fill='none'
            stroke='#000'
            stroke-width='1.5'
            stroke-linecap='round'
            stroke-linejoin='round'
            title='Menu'
            role='img'
            aria-label='Menu'
          >
            <line x1='3' y1='12' x2='21' y2='12'></line>
            <line x1='3' y1='6' x2='21' y2='6'></line>
            <line x1='3' y1='18' x2='21' y2='18'></line>
          </svg>
        </button>
        <ul
          tabindex={0}
          class='dropdown-content menu bg-base-200 w-52 menu-compact'
        >
          {navItem.map((item) => (
            <li
              class={
                pathName === item.slug
                  ? 'border-l-2 border-primary'
                  : 'border-l-2 border-transparent'
              }
            >
              <a href={item.slug}>{item.title}</a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  </div>
)
