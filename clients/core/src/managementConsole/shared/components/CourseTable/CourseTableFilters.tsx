import { Course, CourseTypeDetails } from '@tumaet/prompt-shared-state'
import { TableFilter } from '@tumaet/prompt-ui-components/dist/types/components/table/TableTypes'

export const CourseTableFilters: TableFilter[] = [
  {
    type: 'select',
    id: 'courseType',
    label: 'Course Type',
    options: Object.keys(CourseTypeDetails),
    getDisplay: (value) => CourseTypeDetails[value as Course['courseType']].name,
  },
  {
    type: 'numericRange',
    id: 'ects',
    label: 'ECTS',
    noValueLabel: 'No ECTS',
  },
]
