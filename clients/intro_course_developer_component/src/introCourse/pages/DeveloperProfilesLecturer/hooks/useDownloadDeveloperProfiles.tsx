import { useCallback } from 'react'
import type { CoursePhaseParticipationWithStudent } from '@tumaet/prompt-shared-state'
import type { DeveloperProfile } from '../../../interfaces/DeveloperProfile'
import { GitlabStatus } from '../../../interfaces/GitlabStatus'

export type ParticipantWithProfile = {
  participation: CoursePhaseParticipationWithStudent
  devProfile: DeveloperProfile | undefined
  gitlabStatus: GitlabStatus | undefined
}

export const useDownloadDeveloperProfiles = () => {
  return useCallback((participants: ParticipantWithProfile[]) => {
    const header = 'First Name,Last Name,Apple ID,MacBook,iPhone,iPad,Apple Watch\n'
    const rows = participants
      .map(({ participation, devProfile }) => {
        const firstName = participation.student.firstName
        const lastName = participation.student.lastName
        const appleID = devProfile?.appleID || ''
        const macBook = devProfile?.hasMacBook ? 'true' : 'false'
        const iPhone = devProfile?.iPhoneUDID || ''
        const iPad = devProfile?.iPadUDID || ''
        const appleWatch = devProfile?.appleWatchUDID || ''
        return `${firstName},${lastName},${appleID},${macBook},${iPhone},${iPad},${appleWatch}`
      })
      .join('\n')

    const csvContent = header + rows
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', 'developer_profiles.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [])
}
