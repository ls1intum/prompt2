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
    try {
      // Escape function for CSV values
      const escapeCsv = (value: string) => {
        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
          return `"${value.replace(/"/g, '""')}"`
        }
        return value
      }

      const header = 'First Name,Last Name,Apple ID,MacBook,iPhone,iPad,Apple Watch\n'
      const rows = participants
        .map(({ participation, devProfile }) => {
          const firstName = escapeCsv(participation.student.firstName)
          const lastName = escapeCsv(participation.student.lastName)
          const tumID = escapeCsv(participation.student.tumId)
          const matriculationNumber = escapeCsv(participation.student.matriculationNumber)
          const appleID = escapeCsv(devProfile?.appleID || '')
          const macBook = devProfile?.hasMacBook ? 'true' : 'false'
          const iPhone = escapeCsv(devProfile?.iPhoneUDID || '')
          const iPad = escapeCsv(devProfile?.iPadUDID || '')
          const appleWatch = escapeCsv(devProfile?.appleWatchUDID || '')
          return `${firstName},${lastName},${appleID},${macBook},${iPhone},${iPad},${appleWatch}`
        })
        .join('\n')
      const csvContent = header + rows
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)

      try {
        const link = document.createElement('a')
        link.setAttribute('href', url)
        link.setAttribute('download', 'developer_profiles.csv')
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } finally {
        // Clean up by revoking the object URL to prevent memory leaks
        URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Failed to download developer profiles:', error)
    }
  }, [])
}
