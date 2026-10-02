import type { Child } from 'hono/jsx'
import { formatPeriod, groupTalksByYear, type Resume } from '../../lib/resume'
import { SkillLevel } from './SkillLevel'

interface Props {
  resume: Resume
}

// A4 に印刷して PDF 保存するための書類レイアウト。
// 画面では用紙を模したシートとして表示し、印刷時はシートの装飾を外す。

const Section = ({ title, children }: { title: string; children: Child }) => (
  <section class='mt-7'>
    <h2 class='text-[13px] font-bold tracking-wider border-b-2 border-neutral pb-1 mb-3 break-after-avoid'>
      {title}
    </h2>
    {children}
  </section>
)

const Row = ({ label, children }: { label: Child; children: Child }) => (
  <div class='grid grid-cols-[7.5rem_1fr] gap-4 break-inside-avoid'>
    <div class='font-mono text-[11px] text-neutral/70 pt-px'>{label}</div>
    <div>{children}</div>
  </div>
)

const plainUrl = (url: string) => url.replace(/^https?:\/\//, '')

export const ResumePrint = ({ resume }: Props) => {
  const { profile } = resume
  return (
    <>
      <div class='max-w-[210mm] mx-auto my-8 flex justify-end gap-2 print:hidden'>
        <a class='btn btn-sm btn-ghost' href='/about'>
          ← Web版に戻る
        </a>
        <button
          class='btn btn-sm btn-primary'
          type='button'
          onclick='window.print()'
        >
          PDFで保存
        </button>
      </div>
      <main class='w-[210mm] max-w-full mx-auto mb-12 bg-white text-neutral shadow-xl px-[14mm] py-[14mm] text-[12px] leading-relaxed print:w-auto print:m-0 print:p-0 print:shadow-none'>
        <header class='flex justify-between items-end gap-8 pb-4 border-b border-neutral/20'>
          <div>
            <h1 class='text-[26px] font-bold leading-tight'>職務経歴書</h1>
            <p class='mt-2 text-[15px] font-semibold'>
              {profile.name}
              <span class='ml-2 text-[12px] font-normal text-neutral/70'>
                {profile.nameEn}
              </span>
            </p>
          </div>
          <dl class='grid grid-cols-[auto_1fr] gap-x-3 text-[11px]'>
            {profile.links.map((link) => (
              <>
                <dt class='text-neutral/60'>{link.service}</dt>
                <dd>
                  <a href={link.url}>{plainUrl(link.url)}</a>
                </dd>
              </>
            ))}
          </dl>
        </header>
        <p class='text-right text-[11px] text-neutral/60 mt-2'>
          <span id='resume-date' />
          現在
        </p>
        {/* 日付はPDFを作るその日にしたいので閲覧時に埋める */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var d=new Date();document.getElementById('resume-date').textContent=d.getFullYear()+'年'+(d.getMonth()+1)+'月'+d.getDate()+'日 ';})()`,
          }}
        />

        <Section title='職務経歴'>
          <div class='space-y-4'>
            {resume.experiences.map((exp) => (
              <div class='break-inside-avoid'>
                <p class='font-bold text-[13px]'>
                  {exp.company}
                  <span class='ml-2 font-normal text-neutral/70'>
                    {exp.role}
                  </span>
                </p>
                <div class='mt-1 space-y-1.5'>
                  {exp.divisions.map((div) => (
                    <Row label={formatPeriod(div.period)}>
                      {div.name && <p class='font-semibold'>{div.name}</p>}
                      {div.highlights.length > 0 && (
                        <ul class='list-disc ml-4'>
                          {div.highlights.map((h) => (
                            <li>{h}</li>
                          ))}
                        </ul>
                      )}
                      <p class='text-[11px] text-neutral/60'>
                        {div.tags.join(' / ')}
                      </p>
                    </Row>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section title='プロジェクト'>
          <div class='space-y-5'>
            {resume.projects.map((p) => (
              <article class='break-inside-avoid'>
                <div class='flex justify-between items-baseline gap-4 bg-base-200 px-2 py-1'>
                  <h3 class='font-bold text-[13px]'>
                    {p.name}
                    <span class='ml-2 font-normal text-[11px] text-neutral/70'>
                      {p.summary}
                    </span>
                  </h3>
                  <span class='font-mono text-[11px] text-neutral/70 shrink-0'>
                    {formatPeriod(p.period)}
                  </span>
                </div>
                <dl class='grid grid-cols-[5rem_1fr] text-[11px] mt-1.5 px-2'>
                  <dt class='text-neutral/60'>カテゴリ</dt>
                  <dd>{p.category}</dd>
                  <dt class='text-neutral/60'>担当工程</dt>
                  <dd>{p.phases.join('、')}</dd>
                  <dt class='text-neutral/60'>技術</dt>
                  <dd>{p.techs.join('、')}</dd>
                  {p.url && (
                    <>
                      <dt class='text-neutral/60'>URL</dt>
                      <dd>
                        <a href={p.url}>{plainUrl(p.url)}</a>
                      </dd>
                    </>
                  )}
                </dl>
                <div class='mt-1.5 px-2 space-y-1.5'>
                  {p.body.map((para) => (
                    <p>{para}</p>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </Section>

        {resume.sideProjects.length > 0 && (
          <Section title='サイドプロジェクト'>
            <ul class='space-y-1'>
              {resume.sideProjects.map((p) => (
                <li>
                  <span class='font-semibold'>{p.name}</span>
                  <span class='ml-2'>{p.summary}</span>
                  {p.url && (
                    <a class='ml-2 text-[11px] text-neutral/60' href={p.url}>
                      {plainUrl(p.url)}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </Section>
        )}

        <Section title='テクニカルスキル'>
          <ul class='grid grid-cols-3 gap-x-8 gap-y-1.5 break-inside-avoid'>
            {resume.skills.map((s) => (
              <li class='flex items-center justify-between gap-2'>
                <span>{s.name}</span>
                <SkillLevel level={s.level} />
              </li>
            ))}
          </ul>
        </Section>

        <Section title='登壇歴'>
          <div class='space-y-3'>
            {groupTalksByYear(resume.talks).map(({ year, items }) => (
              <div>
                <p class='font-mono font-bold text-[11px] text-neutral/60 break-after-avoid'>
                  {year}
                </p>
                <ul class='mt-1 space-y-1.5'>
                  {items.map((t) => (
                    <li>
                      <Row label={t.date.replaceAll('-', '/')}>
                        <p class='font-semibold'>
                          {t.slideUrl ? (
                            <a href={t.slideUrl}>{t.title}</a>
                          ) : (
                            t.title
                          )}
                        </p>
                        <p class='text-[11px] text-neutral/70'>{t.event}</p>
                      </Row>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Section>
      </main>
    </>
  )
}
