import { css } from 'hono/css'

export const Search = () => (
  <>
    <button id='search' class='btn btn-square btn-ghost swap' type='button'>
      <svg
        class='fill-current w-5 h-5'
        xmlns='http://www.w3.org/2000/svg'
        viewBox='0 0 24 20'
        title='Search'
        role='img'
        aria-label='Search'
      >
        <path d='M 10 2 C 5.5965257 2 2 5.5965291 2 10 C 2 14.403471 5.5965257 18 10 18 C 11.752132 18 13.370523 17.422074 14.691406 16.458984 L 19.845703 21.613281 A 1.250125 1.250125 0 1 0 21.613281 19.845703 L 16.458984 14.691406 C 17.422074 13.370523 18 11.75213 18 10 C 18 5.5965291 14.403474 2 10 2 z M 10 4.5 C 13.052375 4.5 15.5 6.947627 15.5 10 C 15.5 13.052373 13.052375 15.5 10 15.5 C 6.9476251 15.5 4.5 13.052373 4.5 10 C 4.5 6.947627 6.9476251 4.5 10 4.5 z'></path>
      </svg>
    </button>

    <dialog id='searchModal' class='modal'>
      <div class='modal-box'>
        <form method='dialog'>
          <button class='btn btn-circle btn-ghost btn-xs absolute right-2 top-2' type='button'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              class='fill-current h-4 w-4'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
              title='Close'
              role='img'
              aria-label='Close'
            >
              <path
                stroke-linecap='round'
                stroke-linejoin='round'
                stroke-width='2'
                d='M6 18L18 6M6 6l12 12'
              ></path>
            </svg>
          </button>
        </form>
        <div id='search-box' class='mt-4 mb-2'></div>
      </div>
      <form method='dialog' class='modal-backdrop'>
        <button type='button'>close</button>
      </form>
    </dialog>

    {/* <script src="/pagefind/pagefind-ui.js"></script>
<script>
  document.getElementById("search").addEventListener("click", () => {
    document.getElementById("searchModal").showModal();
  });
  document.addEventListener("DOMContentLoaded", () => {
    new PagefindUI({ element: "#search-box" });
  });
</script> */}

    {/* 
 スタイルを当てるワークアラウンド pagefindのcssをmediaqueriesでは上書きできないため
 ref https://github.com/CloudCannon/pagefind/issues/614#issuecomment-2111199944

 !importantをつけることでrootの設定を上書きできるようにしている
*/}
    <link rel='stylesheet' href='/pagefind/pagefind-ui.css' />
    <style className={pagefindUiStyle} />
  </>
)

const pagefindUiStyle = css`{
  [data-theme="night"] {
    --pagefind-ui-primary: #9ca3af !important;
    --pagefind-ui-text: #9ca3af !important;
    --pagefind-ui-background: #0f172a !important;
    --pagefind-ui-border: #4b5563 !important;
    --pagefind-ui-tag: #4b5563 !important;
    --pagefind-ui-font: Noto Sans JP, Proxima Nova, system-ui, sans-serif !important;
  }

  [data-theme="winter"] {
    --pagefind-ui-primary: #1f2937 !important;
    --pagefind-ui-text: #374151 !important;
    --pagefind-ui-background: #ffffff !important;
    --pagefind-ui-border: #d1d5db !important;
    --pagefind-ui-tag: #e5e7eb !important;
    --pagefind-ui-font: Noto Sans JP, Proxima Nova, system-ui, sans-serif !important;
  }
}
`
