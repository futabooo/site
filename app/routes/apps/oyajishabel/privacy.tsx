import { createRoute } from 'honox/factory'
import { SITE_URL } from '../../../consts'

const APP_NAME = 'おやじシャベル'
const CONTACT_EMAIL = 'mail@futabooo.com'

export default createRoute((c) => {
  return c.render(
    <div class='w-full max-w-3xl flex-grow'>
      <article class='prose max-w-none pt-6 pb-2'>
        <h1>{APP_NAME} プライバシーポリシー</h1>
        <p>
          futabooo（以下「運営者」）は、Android アプリ「{APP_NAME}
          」（以下「本アプリ」）におけるユーザーの情報の取り扱いについて、以下のとおりプライバシーポリシーを定めます。
        </p>

        <h2>収集する情報</h2>
        <p>
          本アプリは、氏名、メールアドレス、位置情報、端末識別子、利用状況などを含む、いかなる個人情報も収集しません。
        </p>

        <h2>情報の外部送信・第三者提供</h2>
        <p>
          本アプリはインターネット通信を行わず、端末上のみで動作します。そのため、ユーザーの情報を外部へ送信したり、第三者に提供したりすることはありません。
        </p>

        <h2>広告・解析ツール</h2>
        <p>
          本アプリは、広告配信サービスやアクセス解析ツールなど、第三者のサービスを利用していません。
        </p>

        <h2>子どものプライバシー</h2>
        <p>
          本アプリは、13歳未満の子どもを含むすべてのユーザーについて、個人情報を収集しません。
        </p>

        <h2>プライバシーポリシーの変更</h2>
        <p>
          運営者は、必要に応じて本ポリシーを変更することがあります。変更後のポリシーは、本ページに掲載した時点から効力を生じるものとします。
        </p>

        <h2>お問い合わせ</h2>
        <p>
          本ポリシーに関するお問い合わせは、以下までご連絡ください。
          <br />
          運営者：futabooo
          <br />
          メール：<a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
        </p>

        <p>制定日：2026年10月9日</p>
      </article>
    </div>,
    {
      title: `${APP_NAME} プライバシーポリシー - futabooo.com`,
      description: `Android アプリ「${APP_NAME}」のプライバシーポリシー`,
      canonicalURL: new URL(new URL(c.req.url).pathname, SITE_URL),
    }
  )
})
