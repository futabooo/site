import { ResumePrint } from '@components/resume/ResumePrint'
import { createRoute } from 'honox/factory'
import { SITE_URL } from '../../consts'
import { resume } from '../../lib/resume'

export default createRoute((c) => {
  return c.render(<ResumePrint resume={resume} />, {
    title: `職務経歴書 - ${resume.profile.name}`,
    description: `${resume.profile.name} (${resume.profile.nameEn}) の職務経歴書`,
    canonicalURL: new URL(new URL(c.req.url).pathname, SITE_URL),
  })
})
