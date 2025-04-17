import { ManagementPageHeader } from '@/components/ManagementPageHeader'
import { StudentDataCheck } from './components/StudentDataCheck'

export const TeaseConfigPage = (): JSX.Element => {
  return (
    <>
      <ManagementPageHeader>Tease Config</ManagementPageHeader>
      <p>
        TEASE is a team matching tool that matches students to projects based on their preferences
        and skills. This page offers functionality for you to check if all data for your students is
        present in order for TEASE to be able to match the students. The TEASE algorithm requires
        the following data:
      </p>
      <StudentDataCheck />
    </>
  )
}
