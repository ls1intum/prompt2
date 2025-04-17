import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { getAllTeaseStudents } from '../../../network/queries/getAllTeaseStudents'
import { TeaseStudent } from 'src/team_allocation/interfaces/tease/student'
import StudentDataCheck from './StudentDataCheck'

export const StudentInfo = (): JSX.Element => {
  const { phaseId } = useParams<{ phaseId: string }>()

  const {
    data: fetchedStudents,
    isPending: isStudentsPending,
    isError: isStudentsError,
    refetch: refetchStudents,
  } = useQuery<TeaseStudent[]>({
    queryKey: ['tease_students', phaseId],
    queryFn: () => getAllTeaseStudents(phaseId ?? ''),
  })

  return (
    <div>
      {isStudentsPending && <p>Loading students...</p>}
      {isStudentsError && (
        <div>
          <p>Error fetching students</p>
          <button onClick={() => refetchStudents()}>Retry</button>
        </div>
      )}
      {fetchedStudents && (
        <div>
          <StudentDataCheck students={fetchedStudents} />
        </div>
      )}
    </div>
  )
}
