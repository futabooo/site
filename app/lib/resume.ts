import { z } from 'zod'

// レジュメの唯一の情報源。/about (Web版) と /about/resume (印刷版) の両方がこれを描画する。
// 旧 futabooo/curriculum-vitae リポジトリの jp/README.md から移植。

const yearMonth = z
  .string()
  .regex(/^\d{4}-\d{2}$/, 'YYYY-MM 形式で指定してください')

const periodSchema = z.object({
  from: yearMonth,
  // 省略時は「現在」
  to: yearMonth.optional(),
})

const linkSchema = z.object({
  label: z.string().min(1),
  url: z.url(),
})

const resumeSchema = z.object({
  profile: z.object({
    name: z.string().min(1),
    nameEn: z.string().min(1),
    links: z.array(linkSchema.extend({ service: z.string().min(1) })),
  }),
  experiences: z.array(
    z.object({
      company: z.string().min(1),
      role: z.string().min(1),
      divisions: z
        .array(
          z.object({
            name: z.string().optional(),
            period: periodSchema,
            tags: z.array(z.string()),
            highlights: z.array(z.string()),
          })
        )
        .min(1),
    })
  ),
  projects: z.array(
    z.object({
      name: z.string().min(1),
      summary: z.string().min(1),
      url: z.url().optional(),
      category: z.string().min(1),
      period: periodSchema,
      phases: z.array(z.string()).min(1),
      techs: z.array(z.string()).min(1),
      body: z.array(z.string()).min(1),
    })
  ),
  sideProjects: z.array(
    z.object({
      name: z.string().min(1),
      summary: z.string().min(1),
      url: z.url().optional(),
    })
  ),
  skills: z.array(
    z.object({
      name: z.string().min(1),
      level: z.number().int().min(1).max(5),
    })
  ),
  talks: z.array(
    z.object({
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      event: z.string().min(1),
      eventUrl: z.url().optional(),
      title: z.string().min(1),
      slideUrl: z.url().optional(),
    })
  ),
})

export type Resume = z.infer<typeof resumeSchema>
export type Period = z.infer<typeof periodSchema>
export type Talk = Resume['talks'][number]

const formatYearMonth = (ym: string) => ym.replace('-', '/')

export const formatPeriod = ({ from, to }: Period) =>
  `${formatYearMonth(from)} - ${to ? formatYearMonth(to) : '現在'}`

// 登壇歴を新しい年から順にグルーピングする
export const groupTalksByYear = (talks: Talk[]) => {
  const sorted = [...talks].sort((a, b) => b.date.localeCompare(a.date))
  const groups = new Map<string, Talk[]>()
  for (const talk of sorted) {
    const year = talk.date.slice(0, 4)
    groups.set(year, [...(groups.get(year) ?? []), talk])
  }
  return [...groups.entries()].map(([year, items]) => ({ year, items }))
}

export const resume: Resume = resumeSchema.parse({
  profile: {
    name: '二川 隆浩',
    nameEn: 'Takahiro Futagawa',
    links: [
      { service: 'Site', label: 'futabooo.com', url: 'https://futabooo.com' },
      {
        service: 'GitHub',
        label: 'futabooo',
        url: 'https://github.com/futabooo',
      },
      { service: 'X', label: '@futabooo', url: 'https://x.com/futabooo' },
      {
        service: 'Speaker Deck',
        label: 'futaboooo',
        url: 'https://speakerdeck.com/futaboooo',
      },
      {
        service: 'Qiita',
        label: 'futabooo',
        url: 'https://qiita.com/futabooo',
      },
    ],
  },
  experiences: [
    {
      company: '株式会社10X',
      role: 'Software Engineer',
      divisions: [
        {
          period: { from: '2020-07' },
          tags: ['Flutter', 'Dart', 'GCP'],
          highlights: [],
        },
      ],
    },
    {
      company: '株式会社エウレカ',
      role: 'Software Engineer',
      divisions: [
        {
          name: 'Pairsエンゲージ事業部',
          period: { from: '2019-05', to: '2020-06' },
          tags: ['Android'],
          highlights: [
            '優先順位が高いものから順に並んだプロダクトバックログとカンバンでのDoing管理での開発',
          ],
        },
        {
          name: 'Pairs事業部',
          period: { from: '2016-04', to: '2019-05' },
          tags: ['Android', 'Team Building', 'Monetize'],
          highlights: [
            'Scrumチームでのスプリントベースの開発（Android開発とスクラムマスターを兼任）',
            'PairsのAndroid・Server Side・Web Frontの開発',
          ],
        },
        {
          name: 'Couples事業部',
          period: { from: '2014-07', to: '2016-04' },
          tags: ['Android'],
          highlights: [
            'Android版の開発',
            'マーケティングチームと連携した施策の開発',
          ],
        },
      ],
    },
    {
      company: '株式会社ボルテージ',
      role: 'Software Engineer',
      divisions: [
        {
          period: { from: '2012-04', to: '2014-06' },
          tags: ['Android', 'iOS', 'Team Lead'],
          highlights: [
            'ノベルゲームのAndroid版の新規開発',
            'ノベルゲームのAndroid版・iOS版の保守運用',
          ],
        },
      ],
    },
  ],
  projects: [
    {
      name: 'Stailer',
      summary: '小売チェーンのECを垂直立ち上げ',
      url: 'https://stailer.jp/',
      category: 'SaaS',
      period: { from: '2020-07' },
      phases: [
        '企画',
        '要件定義',
        '設計',
        'コーディング',
        'テスト',
        '保守/運用',
      ],
      techs: ['Flutter', 'Dart', 'Nuxt', 'GCP', 'GitHub Actions'],
      body: [
        '15番目の社員として入社しStailerの初期リリース時の機能開発をいくつか行いました。当時は1機能のClientとServerを1人ですべて開発していくスタイルでしたので、これまでほぼ未経験のServer Sideの開発も経験しました。',
        '初期リリース以降も新規パートナーのリリースや機能の追加保守運用など、ほぼ全ての工程にかかわり、Flutterアプリの機能追加・保守運用、またServer SideはDartとGCPでの機能追加・保守運用を行っています。',
      ],
    },
    {
      name: 'Pairsエンゲージ',
      summary: '結婚コンシェルジュサービス',
      url: 'https://engage.pairs.lv/',
      category: 'スマホアプリ',
      period: { from: '2019-05', to: '2020-06' },
      phases: [
        '企画',
        '要件定義',
        '設計',
        'コーディング',
        'テスト',
        '保守/運用',
        'データ分析',
      ],
      techs: ['Android', 'Kotlin', 'Fastlane', 'Bitrise'],
      body: [
        '技術選定から1人で行いました。Android Jetpackの安定版が複数リリースされていたり、公式のドキュメントや他社の事例も増えてきていることからAndroid Jetpackをメインとして使う構成にしました。このアプリでは自分とお相手の状態によって複雑な複数の状態変化があるため、Fluxによる単一方向データフローを用いた設計にし処理を追いやすいように実装しました。',
        '先にiOS版アプリが開発されているところに途中からAndroid版開発メンバーとして入りました。リリース日が決まっており約3ヶ月で0からリリースまで持っていく必要がありましたが、Android開発メンバーとしてアサインされたのは自分ひとりだけだったので現実的に間に合いそうにありませんでした。そこで知り合いのAndroidエンジニアに声をかけたところ副業で1人、業務委託で1人、3ヶ月の短期間のみ手伝ってくれる人を見つけることができ、なんとかリリース日の3日前にQAまで完了してリリースできる状態まで持っていくことができました。',
        'このプロジェクトではJiraをタスク管理に使っていましたが、手伝ってくれる二人には社内のセキュリティの都合上Jiraの閲覧権限を付与することができずGitHub Projectsを使いました。社内の企画・要件定義のミーティングを経てタスク化されたJiraチケットの内容をGitHub Issueにコピーすることで3人での開発の管理を行っていました。Issueには優先順位をつけ、手が空いたら上から順番に自分でIssueを取っていけばいい状態にすることで、私自身が極力プロジェクトマネジメント的なことをせずにコードを書く時間を確保するように心がけていました。',
        'またこのプロジェクトのリリースをきっかけに親会社であるMatch GroupのALL-STARSに選ばれて表彰されました。',
      ],
    },
    {
      name: 'Pairs',
      summary: 'オンラインデーティングサービス',
      url: 'https://www.pairs.lv/',
      category: 'スマホアプリ、Webアプリ',
      period: { from: '2016-04', to: '2019-04' },
      phases: [
        '企画',
        '要件定義',
        '設計',
        'コーディング',
        'テスト',
        '保守/運用',
        'データ分析',
      ],
      techs: [
        'Android',
        'iOS',
        'Kotlin',
        'Java',
        'Swift',
        'Objective-C',
        'TypeScript',
        'AngularJS',
      ],
      body: [
        'Androidを中心にiOSやWebフロントエンド、サーバーサイド開発まで多岐に渡って開発を行っていました。',
        '2016年頃のプロジェクト参加直後はそれまでやっていたAndroid開発を離れてgolangとTypeScriptを中心に用いてアプリ内で割引や特典オプションを付与する期間限定のキャンペーン開発を行っていました。サブスクリプションに登録している有料会員数をKGIとして、課金ページを開く人数、LPを開く人数、メールやPush通知のキャンペーン告知からアプリを開く人数などのファネルを意識した数値分析もチームで行い開発や改善を行っていました。',
      ],
    },
    {
      name: 'Couples',
      summary: 'カップル専用SNSアプリ',
      url: 'https://couples.lv/',
      category: 'スマホアプリ',
      period: { from: '2014-07', to: '2016-03' },
      phases: [
        '企画',
        '要件定義',
        '設計',
        'コーディング',
        'テスト',
        '保守/運用',
        'データ分析',
      ],
      techs: ['Android', 'Java', 'Wercker'],
      body: [
        'カップルで使うLINEのようにメッセージやアルバムが作れるアプリのAndroid版開発を行っていました。',
        '一番記憶に残っているのはメッセージ機能にアプリ独自の絵文字を実装したことで、この内容はDroidKaigi 2017でも発表しています。',
      ],
    },
  ],
  sideProjects: [],
  skills: [
    { name: 'Flutter', level: 5 },
    { name: 'Dart', level: 5 },
    { name: 'Android', level: 5 },
    { name: 'Kotlin', level: 4 },
    { name: 'Java', level: 4 },
    { name: 'Go', level: 1 },
    { name: 'TypeScript', level: 1 },
    { name: 'スクラム開発', level: 4 },
    { name: 'スクラムマスター', level: 3 },
  ],
  talks: [
    {
      date: '2015-07-14',
      event: '【第19回】potatotips(iOS/Android開発Tips共有会)',
      title: 'Push通知を届けるために',
      slideUrl:
        'https://speakerdeck.com/futaboooo/pushtong-zhi-wojie-kerutameni',
    },
    {
      date: '2016-01-22',
      event: 'オープンソースライブラリ研究会 #3',
      title: 'TryDateLibraryofAndroid',
      slideUrl: 'https://speakerdeck.com/futaboooo/trydatelibraryofandroid',
    },
    {
      date: '2016-02-05',
      event: 'エンジニアサポートCROSS2016(アンカンファレンス)',
      title:
        'エウレカで行っている勉強会について（飛び込みで社内の取り組みについて発表）',
    },
    {
      date: '2016-09-28',
      event: 'potatotips #33 (iOS/Android開発Tips共有会)',
      title: 'Battery Historian V2',
      slideUrl: 'https://speakerdeck.com/futaboooo/battery-historian-v2',
    },
    {
      date: '2017-03-09',
      event: 'DroidKaigi 2017',
      eventUrl: 'https://droidkaigi.github.io/2017',
      title: 'トークアプリで絵文字を実装した話',
      slideUrl:
        'https://speakerdeck.com/futaboooo/tokuapuridehui-wen-zi-woshi-zhuang-sitahua',
    },
    {
      date: '2017-03-17',
      event: 'Minami Aoyama Night #2',
      eventUrl: 'https://minami-aoyama-night.connpass.com/event/51171/',
      title: 'Pairsのデザインガイドラインを作って開発を効率化した話',
      slideUrl:
        'https://speakerdeck.com/futaboooo/pairsfalsedezaingaidorainwozuo-tutekai-fa-woxiao-lu-hua-sitahua',
    },
    {
      date: '2017-07-12',
      event: '【初心者歓迎】Kotlin開発Tech Talks',
      eventUrl: 'https://connpass.com/event/59898/',
      title: 'テストから始めるKotlin導入',
      slideUrl:
        'https://speakerdeck.com/futaboooo/tesutokarashi-merukotlindao-ru',
    },
    {
      date: '2018-01-12',
      event: 'eureka x Nulab スクラム開発の現場',
      eventUrl: 'https://eure.connpass.com/event/74590/',
      title: '新人スクラムマスターが開発者と兼任しながらやってきた事と成果',
      slideUrl:
        'https://speakerdeck.com/futaboooo/what-the-newcomer-scrum-master-came-while-concurrently-serving-as-a-developer-and-the-result',
    },
    {
      date: '2018-02-01',
      event: 'Connehito Marché #1〜Android市〜',
      eventUrl: 'https://connehito-marche.connpass.com/event/76245/',
      title: 'Androidでスクレイピングした話',
      slideUrl:
        'https://speakerdeck.com/futaboooo/talk-of-scraping-with-android',
    },
    {
      date: '2018-06-15',
      event: 'eureka Meetup #10 -PairsのAndroid開発の裏側-',
      eventUrl: 'https://eure.connpass.com/event/88415/',
      title: 'モブプログラミングという開発スタイル、あるいは生産性について',
      slideUrl:
        'https://speakerdeck.com/futaboooo/on-development-style-called-mob-programming-or-productivity',
    },
    {
      date: '2018-07-20',
      event: '【デザイナー×エンジニア】 プロダクトづくりのほんとのところ',
      eventUrl: 'https://eure.connpass.com/event/92040/',
      title: 'Pairsの開発のすべて',
      slideUrl: 'https://speakerdeck.com/futaboooo/all-of-pairs-development',
    },
    {
      date: '2018-08-07',
      event: 'Androidエンジニア デザイン部 #2',
      eventUrl: 'https://nohana.connpass.com/event/94621/',
      title: 'InvisionのAndroidアプリでみる4つのデザイン基本原則',
      slideUrl:
        'https://speakerdeck.com/futaboooo/four-design-basic-principles-seen-in-invisions-android-application',
    },
    {
      date: '2018-08-23',
      event: 'potatotips #54 (iOS/Android開発Tips共有会)',
      eventUrl: 'https://potatotips.connpass.com/event/95391/',
      title: 'ghq+peco+studioコマンドでプロジェクトをすぐ開く',
      slideUrl:
        'https://speakerdeck.com/futaboooo/project-open-lightning-speed-with-ghq-plus-peco-plus-studio-commands',
    },
    {
      date: '2019-01-09',
      event: 'Regional Scrum Gathering Tokyo 2019',
      eventUrl: 'https://2019.scrumgatheringtokyo.org/',
      title: 'スクラムチームをやめて、20人でカンバン運用してきた半年間の軌跡',
      slideUrl: 'https://speakerdeck.com/futaboooo/stop-scrum-start-kanban',
    },
    {
      date: '2019-01-30',
      event: '第31回 Tokyo Atlassian ユーザーグループ at Eureka',
      eventUrl: 'https://augj.connpass.com/event/116298/',
      title: 'ペアプロ・モブプロを広めるのに役立ったControl Chartの使い方',
      slideUrl:
        'https://speakerdeck.com/futaboooo/how-to-use-control-chart-which-helped-spread-pair-or-mob-programing',
    },
    {
      date: '2019-07-17',
      event: 'Matching Dev Meetup#4 - Engineering',
      eventUrl: 'https://matching-dev-group.connpass.com/event/133322/',
      title: 'チームの学びを活かす全社での取り組み',
      slideUrl:
        'https://speakerdeck.com/futaboooo/company-wide-efforts-to-make-use-of-teams-learning',
    },
    {
      date: '2019-12-17',
      event: 'potatotips #67 (iOS/Android開発Tips共有会)',
      eventUrl: 'https://potatotips.connpass.com/event/152899/',
      title: 'Android Jetpack Navigation Deep Links Tips',
      slideUrl:
        'https://speakerdeck.com/futaboooo/android-jetpack-navigation-deep-links-tips',
    },
  ],
})
