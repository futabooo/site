import { ResumeWeb } from '@components/resume/ResumeWeb'
import { createRoute } from 'honox/factory'
import { SITE_URL } from '../consts'
import { resume } from '../lib/resume'

export default createRoute((c) => {
  return c.render(<ResumeWeb resume={resume} />, {
    title: 'About - futabooo.com',
    description: `${resume.profile.name} (${resume.profile.nameEn}) の職務経歴`,
    canonicalURL: new URL(new URL(c.req.url).pathname, SITE_URL),
  })
})
