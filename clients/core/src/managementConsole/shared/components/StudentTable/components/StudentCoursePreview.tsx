import { CourseAvatar } from '@core/managementConsole/layout/Sidebar/CourseSwitchSidebar/components/CourseAvatar'
import { StudentCourseParticipation } from '@core/network/queries/getStudentsWithCourses'

export const StudentCoursePreview = ({
  studentCourseParticipation,
}: {
  studentCourseParticipation: StudentCourseParticipation
}) => {
  return (
    <div
      className={`flex items-center ${studentCourseParticipation.studentReadableData['bg-color']} rounded-lg gap-1 pr-2 font-semibold`}
    >
      <CourseAvatar
        bgColor={studentCourseParticipation.studentReadableData['bg-color']}
        iconName={studentCourseParticipation.studentReadableData['icon']}
        className='size-8'
      />
      {studentCourseParticipation.courseName}
    </div>
  )
}
