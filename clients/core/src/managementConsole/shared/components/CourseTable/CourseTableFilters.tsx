import { Course, CourseTypeDetails } from '@tumaet/prompt-shared-state'
import { TableFilter } from '@tumaet/prompt-ui-components/dist/types/components/table/TableTypes'

interface minMaxFilterType {
  noScore: boolean
  min: string
  max: string
}

export const CourseTableFilters: TableFilter[] = [
  {
    type: 'select',
    id: 'courseType',
    label: 'Course Type',
    options: Object.keys(CourseTypeDetails),
    optionLabel: (value) => CourseTypeDetails[value as Course['courseType']].name,
    badge: {
      label: 'Course Type',
      displayValue: (filtervalue) => `${filtervalue}`,
    },
  },
  {
    type: 'numericRange',
    id: 'ects',
    label: 'ECTS',
    noValueLabel: 'No ECTS',
    badge: {
      label: 'ECTS',
      displayValue: (filtervalue) => {
        const v = filtervalue as minMaxFilterType
        if (v.noScore) {
          return 'No ECTS'
        }
        if (v.min && v.max) {
          return `${v.min} - ${v.max}`
        }
        if (v.min) {
          return '≥ ' + v.min
        }
        if (v.max) {
          return '≤ ' + v.max
        }
        return ''
      },
    },
  },
]
