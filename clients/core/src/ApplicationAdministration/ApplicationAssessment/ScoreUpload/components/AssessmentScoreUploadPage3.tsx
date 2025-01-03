import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ApplicationParticipation } from '@/interfaces/application_participations'
import translations from '@/lib/translations.json'

interface Page3Props {
  matchedCount: number
  unmatchedApplications: ApplicationParticipation[]
}

export const AssessmentScoreUploadPage3 = ({ matchedCount, unmatchedApplications }: Page3Props) => {
  return (
    <div className='space-y-6'>
      <div>
        <h3 className='text-lg font-medium'>Matching Results</h3>
        <p className='text-sm text-muted-foreground'>
          Successfully matched students: {matchedCount}
        </p>
      </div>

      {unmatchedApplications.length > 0 && (
        <div className='mt-4 h-[300px] sm:max-w-[850px] w-[85vw] overflow-hidden flex flex-col'>
          <h4 className='text-md font-medium mb-2'>Unmatched Applications</h4>
          <div className='overflow-x-auto overflow-y-auto'>
            <Table>
              <TableHeader className='min-w-[150px] bg-muted'>
                <TableRow>
                  <TableHead>First Name</TableHead>
                  <TableHead>Last Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Matriculation Number</TableHead>
                  <TableHead>{translations.university['login-name']}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {unmatchedApplications.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell>{app.student.first_name}</TableCell>
                    <TableCell>{app.student.last_name}</TableCell>
                    <TableCell>{app.student.email}</TableCell>
                    <TableCell>{app.student.matriculation_number || 'N/A'}</TableCell>
                    <TableCell>{app.student.university_login || 'N/A'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  )
}
