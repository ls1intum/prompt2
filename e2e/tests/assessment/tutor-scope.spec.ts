import { expect, test } from '../../src/fixtures/auth'
import { AssessmentPage } from '../../src/pages/AssessmentPage'
import {
  ASSESSMENT_FIXTURE_PHASES,
  SEEDED_COURSES,
  TUTOR_SCOPE_PARTICIPANTS,
} from '../../src/data/constants'
import { apiAsRole, assessmentUrl } from './helpers'

const PHASE_ID = ASSESSMENT_FIXTURE_PHASES.tutorScope
const { ownTeam, hidden } = TUTOR_SCOPE_PARTICIPANTS
const everyone = [...ownTeam, ...hidden]

async function participationIds(role: 'course-editor' | 'lecturer'): Promise<string[]> {
  const api = await apiAsRole(role)
  try {
    const res = await api.get(assessmentUrl(PHASE_ID, 'config/participations'))
    expect(res.status()).toBe(200)
    const participations = (await res.json()) as { courseParticipationID: string }[]
    return participations.map((p) => p.courseParticipationID).sort()
  } finally {
    await api.dispose()
  }
}

test.use({ role: 'course-editor' })

test.describe('assessment: tutors only reach their own team', () => {
  test('lists only the tutor team to the editor and everyone to the lecturer', async () => {
    expect(await participationIds('course-editor')).toEqual(
      ownTeam.map((p) => p.courseParticipationId).sort(),
    )
    expect(await participationIds('lecturer')).toEqual(
      everyone.map((p) => p.courseParticipationId).sort(),
    )
  })

  test('rejects reads and writes outside the tutor team', async () => {
    const editor = await apiAsRole('course-editor')
    try {
      const assessmentOf = (id: string) =>
        editor.get(assessmentUrl(PHASE_ID, `student-assessment/course-participation/${id}`))

      expect((await assessmentOf(ownTeam[0].courseParticipationId)).status()).toBe(200)
      for (const participant of hidden) {
        expect((await assessmentOf(participant.courseParticipationId)).status()).toBe(403)
      }

      const batch = await editor.post(
        assessmentUrl(PHASE_ID, 'student-assessment/completed/mark-complete/batch'),
        {
          data: {
            courseParticipationIDs: [
              ownTeam[0].courseParticipationId,
              hidden[0].courseParticipationId,
            ],
          },
        },
      )
      expect(batch.status()).toBe(403)
    } finally {
      await editor.dispose()
    }
  })

  test('shows only the tutor team on the participants page', async ({ page }) => {
    const phase = new AssessmentPage(page)
    await phase.goto(SEEDED_COURSES.fullCourse.id, PHASE_ID, '/participants')
    await phase.expectParticipantsLoaded()

    for (const participant of ownTeam) {
      await expect(page.getByRole('row', { name: new RegExp(participant.name) })).toContainText(
        'Team Lovelace',
      )
    }
    for (const participant of hidden) {
      await expect(page.getByRole('row', { name: new RegExp(participant.name) })).toHaveCount(0)
    }
  })
})
