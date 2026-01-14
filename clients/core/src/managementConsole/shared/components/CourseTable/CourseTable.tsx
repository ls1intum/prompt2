import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ColumnDef } from '@tanstack/react-table'
import { PromptTable } from '@tumaet/prompt-ui-components'
import { Course, CourseTypeDetails } from '@tumaet/prompt-shared-state'
import DynamicIcon from '@/components/DynamicIcon'
import { formatDate } from '@core/utils/formatDate'
import { Archive, ArchiveRestore, ArrowRight } from 'lucide-react'
import { archiveCourses, unarchiveCourses } from '@core/network/mutations/updateCourseArchiveStatus'
import {
  RowAction,
  TableFilter,
} from '@tumaet/prompt-ui-components/dist/types/components/table/TableTypes'

interface CourseTableProps {
  courses: Course[]
}

export const CourseTable = ({ courses }: CourseTableProps): JSX.Element => {
  const navigate = useNavigate()

  const columns: ColumnDef<Course>[] = useMemo(
    () => [
      {
        id: 'icon',
        header: 'Icon',
        enableSorting: false,
        cell: ({ row }) => {
          const iconName = row.original.studentReadableData?.['icon'] || 'graduation-cap'
          const bgColor = row.original.studentReadableData?.['bg-color'] || 'bg-gray-50'
          return (
            <div
              className={`inline-flex items-center justify-center rounded-md ${bgColor}`}
              style={{ width: 24, height: 24 }}
            >
              <DynamicIcon name={iconName} className='h-4 w-4' />
            </div>
          )
        },
        size: 80,
      },
      {
        accessorKey: 'name',
        header: 'Name',
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: 'semesterTag',
        header: 'Semester',
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: 'courseType',
        header: 'Course Type',
        cell: (info) => CourseTypeDetails[info.getValue() as Course['courseType']].name,
        filterFn: 'arrIncludes',
      },
      {
        accessorKey: 'startDate',
        header: 'Start Date',
        cell: (info) => formatDate(info.getValue() as string | Date),
      },
      {
        accessorKey: 'endDate',
        header: 'End Date',
        cell: (info) => formatDate(info.getValue() as string | Date),
      },
      {
        accessorKey: 'ects',
        header: 'ECTS',
        cell: (info) => info.getValue(),
      },
      {
        id: 'status',
        header: 'Status',
        enableSorting: false,
        filterFn: 'arrIncludes',
        cell: ({ row }) => {
          if (row.original.template) return 'Template'
          if (row.original.archived) return `Archived on ${formatDate(row.original.archivedOn!)}`
          return 'Active'
        },
      },
    ],
    [],
  )

  const courseTableActions: RowAction<Course>[] = [
    {
      label: 'Archive',
      icon: <Archive />,
      onAction: async (cs) => {
        await archiveCourses(cs.filter((course) => !course.archived).map((course) => course.id))
      },
      hide: (rows) => rows.every((c) => c.archived),
      confirm: {
        title: 'Archive courses',
        description: (count) =>
          `Are you sure you want to archive ${count} course${count > 1 ? 's' : ''}?`,
        confirmLabel: 'Archive',
      },
    },

    {
      label: 'Unarchive',
      icon: <ArchiveRestore />,
      onAction: async (cs) => {
        await unarchiveCourses(cs.filter((course) => course.archived).map((course) => course.id))
      },
      hide: (rows) => rows.every((c) => !c.archived),
      confirm: {
        title: 'Unarchive courses',
        description: (count) =>
          `Are you sure you want to unarchive ${count} course${count > 1 ? 's' : ''}?`,
        confirmLabel: 'Unarchive',
      },
    },

    {
      label: 'Open course',
      icon: <ArrowRight />,
      hide: (rows) => rows.length !== 1,
      onAction: ([course]) => {
        navigate(`/management/course/${course.id}`)
      },
    },
  ]

  const courseTableFilters: TableFilter[] = [
    {
      type: 'select',
      id: 'courseType',
      label: 'Course Type',
      options: Object.keys(CourseTypeDetails),
      getDisplay: (value) => CourseTypeDetails[value as Course['courseType']].name,
    },
    {
      type: 'select',
      id: 'status',
      label: 'Status',
      options: ['Active', 'Archived', 'Template'],
    },
    {
      type: 'numericRange',
      id: 'ects',
      label: 'ECTS',
      noValueLabel: 'No ECTS',
    },
  ]

  const onRowClick = (course: Course) => navigate(`/management/course/${course.id}`)

  return (
    <PromptTable
      data={courses}
      columns={columns}
      onRowClick={onRowClick}
      actions={courseTableActions}
      filters={courseTableFilters}
    />
  )
}
