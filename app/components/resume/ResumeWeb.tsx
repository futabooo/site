import type { Child } from 'hono/jsx'
import { formatPeriod, groupTalksByYear, type Resume } from '../../lib/resume'
import { SkillLevel } from './SkillLevel'

interface Props {
  resume: Resume
}

const Section = ({ title, children }: { title: string; children: Child }) => (
  <section class='mt-14'>
    <h2 class='text-2xl font-bold mb-6 flex items-center gap-3'>
      <span class='w-1.5 h-6 rounded-full bg-primary' />
      {title}
    </h2>
    {children}
  </section>
)

const Tags = ({ tags }: { tags: string[] }) => (
  <div class='flex flex-wrap gap-1.5'>
    {tags.map((tag) => (
      <span class='badge badge-sm badge-soft badge-primary'>{tag}</span>
    ))}
  </div>
)

const Header = ({ profile }: { profile: Resume['profile'] }) => (
  <header class='flex flex-col sm:flex-row sm:items-end justify-between gap-6'>
    <div>
      <p class='text-sm tracking-widest uppercase text-base-content/60'>
        Curriculum Vitae
      </p>
      <h1 class='text-4xl font-bold mt-1'>{profile.name}</h1>
      <p class='text-base-content/70 mt-1'>{profile.nameEn}</p>
      <ul class='flex flex-wrap gap-x-4 gap-y-1 mt-4 text-sm'>
        {profile.links.map((link) => (
          <li>
            <span class='text-base-content/60'>{link.service}: </span>
            <a class='link link-hover' href={link.url}>
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
    <a
      class='btn btn-outline btn-sm self-start sm:self-auto'
      href='/about/resume'
    >
      PDF版を開く
    </a>
  </header>
)

const Experiences = ({ items }: { items: Resume['experiences'] }) => (
  // daisyUI の timeline は compact と snap-icon の変数指定が同じ詳細度で競合し、
  // 本番ビルドの CSS 出力順次第で右寄りになるので Tailwind だけで組む
  <ol>
    {items.map((exp) => (
      <li class='relative pl-7 pb-10 last:pb-0 border-l-2 border-base-300 last:border-transparent ml-1.5'>
        <span
          class={`absolute -left-[7px] top-1.5 block w-3 h-3 rounded-full ${
            exp.divisions.some((d) => !d.period.to)
              ? 'bg-primary'
              : 'bg-base-content/30'
          }`}
        />
        <div>
          <h3 class='text-lg font-bold leading-tight'>{exp.company}</h3>
          <p class='text-sm text-base-content/60'>{exp.role}</p>
          <div class='mt-3 space-y-4'>
            {exp.divisions.map((div) => (
              <div>
                <div class='flex flex-wrap items-baseline gap-x-3'>
                  {div.name && <span class='font-semibold'>{div.name}</span>}
                  <span class='text-sm font-mono text-base-content/60'>
                    {formatPeriod(div.period)}
                  </span>
                </div>
                {div.highlights.length > 0 && (
                  <ul class='list-disc ml-5 mt-1 text-sm space-y-0.5'>
                    {div.highlights.map((h) => (
                      <li>{h}</li>
                    ))}
                  </ul>
                )}
                <div class='mt-2'>
                  <Tags tags={div.tags} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </li>
    ))}
  </ol>
)

const Projects = ({ items }: { items: Resume['projects'] }) => (
  <div class='space-y-6'>
    {items.map((p) => (
      <article class='card bg-base-200/60 border border-base-300'>
        <div class='card-body gap-3'>
          <div class='flex flex-wrap items-baseline justify-between gap-x-4'>
            <h3 class='card-title text-xl'>
              {p.url ? (
                <a class='link link-hover' href={p.url}>
                  {p.name}
                </a>
              ) : (
                p.name
              )}
            </h3>
            <span class='text-sm font-mono text-base-content/60'>
              {formatPeriod(p.period)}
            </span>
          </div>
          <p class='text-sm text-base-content/70 -mt-2'>
            {p.summary} ・ {p.category}
          </p>
          <Tags tags={p.techs} />
          <p class='text-xs text-base-content/60'>
            担当工程: {p.phases.join(' / ')}
          </p>
          <div class='space-y-3 leading-relaxed'>
            {p.body.map((para) => (
              <p>{para}</p>
            ))}
          </div>
        </div>
      </article>
    ))}
  </div>
)

const SideProjects = ({ items }: { items: Resume['sideProjects'] }) => (
  <ul class='space-y-2'>
    {items.map((p) => (
      <li>
        {p.url ? (
          <a class='link link-hover font-semibold' href={p.url}>
            {p.name}
          </a>
        ) : (
          <span class='font-semibold'>{p.name}</span>
        )}
        <span class='text-base-content/70'> — {p.summary}</span>
      </li>
    ))}
  </ul>
)

const Skills = ({ items }: { items: Resume['skills'] }) => (
  <ul class='grid sm:grid-cols-2 gap-x-10 gap-y-3'>
    {items.map((s) => (
      <li class='flex items-center justify-between gap-4'>
        <span>{s.name}</span>
        <SkillLevel level={s.level} />
      </li>
    ))}
  </ul>
)

const Talks = ({ items }: { items: Resume['talks'] }) => (
  <div class='space-y-8'>
    {groupTalksByYear(items).map(({ year, items }) => (
      <div class='grid sm:grid-cols-[4rem_1fr] gap-2 sm:gap-4'>
        <h3 class='font-mono font-bold text-base-content/60'>{year}</h3>
        <ul class='space-y-4'>
          {items.map((t) => (
            <li>
              <p class='font-semibold leading-snug'>
                {t.slideUrl ? (
                  <a class='link link-hover' href={t.slideUrl}>
                    {t.title}
                  </a>
                ) : (
                  t.title
                )}
              </p>
              <p class='text-sm text-base-content/60 mt-0.5'>
                <span class='font-mono'>
                  {t.date.slice(5).replace('-', '/')}
                </span>{' '}
                {t.eventUrl ? (
                  <a class='link link-hover' href={t.eventUrl}>
                    {t.event}
                  </a>
                ) : (
                  t.event
                )}
              </p>
            </li>
          ))}
        </ul>
      </div>
    ))}
  </div>
)

export const ResumeWeb = ({ resume }: Props) => (
  <div class='pb-16'>
    <Header profile={resume.profile} />
    <Section title='職務経歴'>
      <Experiences items={resume.experiences} />
    </Section>
    <Section title='プロジェクト'>
      <Projects items={resume.projects} />
    </Section>
    {resume.sideProjects.length > 0 && (
      <Section title='サイドプロジェクト'>
        <SideProjects items={resume.sideProjects} />
      </Section>
    )}
    <Section title='スキル'>
      <Skills items={resume.skills} />
    </Section>
    <Section title='登壇歴'>
      <Talks items={resume.talks} />
    </Section>
  </div>
)
