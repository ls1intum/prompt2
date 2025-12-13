import { Course } from '@tumaet/prompt-shared-state'
import { motion } from 'framer-motion'
import { CourseCard } from './CourseCard'

interface CourseCardsProps {
  courses: Course[]
}

export const CourseCards = ({ courses }: CourseCardsProps): JSX.Element => {
  return (
    <div
      className={`container mx-auto px-4 py-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 items-start justify-start`}
    >
      {courses.map((course) => {
        return (
          <motion.div
            key={course.id}
            whileHover={{ y: -5 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <CourseCard course={course} />
          </motion.div>
        )
      })}
    </div>
  )
}
