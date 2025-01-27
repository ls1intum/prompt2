import { useEffect, useState } from 'react'
import { useMatchingStore } from '../../../zustand/useMatchingStore'
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table'
import type { CoursePhaseParticipationWithStudent } from '@tumaet/prompt-shared-state'
import { Button } from '@/components/ui/button'
import { useDataDownload } from '../../../hooks/useDataDownload'

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

  const { generateAndDownloadFile } = useDataDownload()

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
            rank: matchedApp.prevMetaData.applicationScore,
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
        <h3>These students have been successfully matched by matriculation number.</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>First Name</TableHead>
              <TableHead>Last Name</TableHead>
              <TableHead>Matriculation Number</TableHead>
              <TableHead>Rank</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {matchedByMatriculation.map((student, index) => (
              <TableRow key={index}>
                <TableCell>{student.firstName}</TableCell>
                <TableCell>{student.lastName}</TableCell>
                <TableCell>{student.matriculationNumber}</TableCell>
                <TableCell>
                  {student.rank || <span className='text-destructive'>N/A</span>}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>

      <section>
        <h2 className='text-2xl font-bold mb-4'>Matched by Name</h2>
        <h3>
          These students could not been matched by matriculation number, but by first and last name.
        </h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>First Name</TableHead>
              <TableHead>Last Name</TableHead>
              <TableHead>Matriculation Number</TableHead>
              <TableHead>Rank</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {matchedByName.map((student, index) => (
              <TableRow key={index}>
                <TableCell>{student.firstName}</TableCell>
                <TableCell>{student.lastName}</TableCell>
                <TableCell>{student.matriculationNumber}</TableCell>
                <TableCell>
                  {student.rank || <span className='text-destructive'>N/A</span>}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>

      <section>
        <h2 className='text-2xl font-bold mb-4'>Umatched Accepted Application</h2>
        <h3>
          These students have an accepted application, but could not be matched with an entry in the
          uploaded file.
        </h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>First Name</TableHead>
              <TableHead>Last Name</TableHead>
              <TableHead>Matriculation Number</TableHead>
              <TableHead>Rank</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {unmatchedApplications.map((app, index) => (
              <TableRow key={index}>
                <TableCell>{app.student.firstName}</TableCell>
                <TableCell>{app.student.lastName}</TableCell>
                <TableCell>{app.student.matriculationNumber || 'N/A'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>

      <section>
        <h2 className='text-2xl font-bold mb-4'>Entires Without Applications</h2>
        <h3>
          These applications could not be matched to any application. They migth be students who
          have not applied, have been rejected or have a typo in their name or matriculation number.
        </h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>First Name</TableHead>
              <TableHead>Last Name</TableHead>
              <TableHead>Matriculation Number</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {unmatchedStudents.map((student, index) => (
              <TableRow key={index}>
                <TableCell>{student.firstName}</TableCell>
                <TableCell>{student.lastName}</TableCell>
                <TableCell>{student.matriculationNumber}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Button
          onClick={() => generateAndDownloadFile([...matchedByMatriculation, ...matchedByName])}
        >
          Download filled out Excel Sheet
        </Button>
      </section>
    </div>
  )
}
