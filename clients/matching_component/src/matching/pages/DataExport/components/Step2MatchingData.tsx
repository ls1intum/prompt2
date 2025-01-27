import { useEffect, useState } from 'react'
import { useMatchingStore } from '../../../zustand/useMatchingStore'
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from '@/components/ui/table'
import { CoursePhaseParticipationWithStudent } from '@tumaet/prompt-shared-state'

interface MatchingStepProps {
  unrankedOption: 'no-rank' | 'unacceptable'
}

interface UploadedStudent {
  firstName: string
  lastName: string
  matriculationNumber: string
  rank?: string
}

export const Step2MatchingData = ({ unrankedOption }: MatchingStepProps): JSX.Element => {
  const { participations, uploadedData } = useMatchingStore()
  const [matchedByMatriculation, setMatchedByMatriculation] = useState<UploadedStudent[]>([])
  const [matchedByName, setMatchedByName] = useState<UploadedStudent[]>([])
  const [unmatchedApplications, setUnmatchedApplications] = useState<
    CoursePhaseParticipationWithStudent[]
  >([])
  const [unmatchedStudents, setUnmatchedStudents] = useState<UploadedStudent[]>([])

  useEffect(() => {
    if (uploadedData?.length > 0 && participations) {
      const students: UploadedStudent[] = uploadedData
      const applications: CoursePhaseParticipationWithStudent[] = participations

      const matched: UploadedStudent[] = []
      const matchedByNameTemp: UploadedStudent[] = []
      const unmatchedApps: CoursePhaseParticipationWithStudent[] = []
      const unmatchedStuds: UploadedStudent[] = []

      students.forEach((student) => {
        const matchedApp = applications.find(
          (app) => app.student.matriculationNumber === student.matriculationNumber,
        )
        if (matchedApp) {
          matched.push({
            ...student,
            rank: matchedApp.metaData.applicationScore,
          })
        } else {
          const nameMatch = applications.find(
            (app) =>
              app.student.firstName.toLowerCase() === student.firstName.toLowerCase() &&
              app.student.lastName.toLowerCase() === student.lastName.toLowerCase(),
          )
          if (nameMatch) {
            matchedByNameTemp.push(student)
          } else {
            unmatchedStuds.push(student)
          }
        }
      })

      applications.forEach((app) => {
        if (
          !matched.some((s) => s.matriculationNumber === app.student.matriculationNumber) &&
          !matchedByNameTemp.some(
            (s) =>
              s.firstName.toLowerCase() === app.student.firstName.toLowerCase() &&
              s.lastName.toLowerCase() === app.student.lastName.toLowerCase(),
          )
        ) {
          unmatchedApps.push(app)
        }
      })

      setMatchedByMatriculation(matched)
      setMatchedByName(matchedByNameTemp)
      setUnmatchedApplications(unmatchedApps)
      setUnmatchedStudents(unmatchedStuds)
    }
  }, [uploadedData, participations])

  return (
    <div className='space-y-8'>
      <section>
        <h2 className='text-2xl font-bold mb-4'>Matched by Matriculation Number</h2>
        <Table>
          <thead>
            <tr>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Matriculation Number</th>
              <th>Rank</th>
            </tr>
          </thead>
          <tbody>
            {matchedByMatriculation.map((student, index) => (
              <tr key={index}>
                <td>{student.firstName}</td>
                <td>{student.lastName}</td>
                <td>{student.matriculationNumber}</td>
                <td>{student.rank || 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </section>

      <section>
        <h2 className='text-2xl font-bold mb-4'>Matched by Name</h2>
        <Table>
          <thead>
            <tr>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Matriculation Number</th>
              <th>Rank</th>
            </tr>
          </thead>
          <tbody>
            {matchedByName.map((student, index) => (
              <tr key={index}>
                <td>{student.firstName}</td>
                <td>{student.lastName}</td>
                <td>{student.matriculationNumber}</td>
                <td>{student.rank || 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </section>

      <section>
        <h2 className='text-2xl font-bold mb-4'>Unmatched Applications</h2>
        <Table>
          <thead>
            <tr>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Matriculation Number</th>
              <th>Rank</th>
            </tr>
          </thead>
          <tbody>
            {unmatchedApplications.map((app, index) => (
              <tr key={index}>
                <td>{app.student.firstName}</td>
                <td>{app.student.lastName}</td>
                <td>{app.student.matriculationNumber || 'N/A'}</td>
                <td>{unrankedOption === 'unacceptable' ? 'Unacceptable (-)' : 'No Rank'}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </section>

      <section>
        <h2 className='text-2xl font-bold mb-4'>Students Without Applications</h2>
        <Table>
          <thead>
            <tr>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Matriculation Number</th>
            </tr>
          </thead>
          <tbody>
            {unmatchedStudents.map((student, index) => (
              <tr key={index}>
                <td>{student.firstName}</td>
                <td>{student.lastName}</td>
                <td>{student.matriculationNumber}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </section>
    </div>
  )
}
