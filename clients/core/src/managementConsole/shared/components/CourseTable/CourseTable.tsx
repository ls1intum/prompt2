import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ColumnDef,
  SortingState,
  getFilteredRowModel,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Input,
  Button,
  Checkbox,
} from '@tumaet/prompt-ui-components'
import { ArrowDown, ArrowUp, ArrowUpDown, MoreHorizontal, SearchIcon } from 'lucide-react'
import { Course, CourseTypeDetails } from '@tumaet/prompt-shared-state'
import { CourseActionsMenu } from './CourseActionsMenu'
import DynamicIcon from '@/components/DynamicIcon'

interface CourseTableProps {
  courses: Course[]
}

const formatDate = (dateString?: string | Date): string => {
  if (!dateString) return 'N/A'
  const [year, month, day] = dateString.toString().split('-')
  if (!year || !month || !day) return 'N/A'
  return `${day}.${month}.${year}`
}

export const CourseTable = ({ courses }: CourseTableProps): JSX.Element => {
  const navigate = useNavigate()
  const [sorting, setSorting] = useState<SortingState>([{ id: 'name', desc: false }])
  const [globalFilter, setGlobalFilter] = useState('')
  const [rowSelection, setRowSelection] = useState({})

  const columns: ColumnDef<Course>[] = useMemo(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && 'indeterminate')
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label='Select all'
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label='Select row'
            onClick={(e) => e.stopPropagation()}
            onFocus={(e) => e.stopPropagation()}
          />
        ),
        enableSorting: false,
        enableHiding: false,
        size: 40,
      },
      {
        id: 'icon',
        header: 'Icon',
        enableSorting: false,
        cell: ({ row }) => {
          const iconName = row.original.studentReadableData?.['icon'] || 'graduation-cap'
          const bgColor = row.original.studentReadableData?.['bg-color'] || 'bg-gray-50'

          return (
            <div
              className={`inline-flex items-center justify-center rounded-md px-2 py-1 ${bgColor}`}
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
      },
      {
        accessorKey: 'startDate',
        header: 'Start Date',
        cell: (info) => formatDate(info.getValue() as string | Date | undefined),
      },
      {
        accessorKey: 'endDate',
        header: 'End Date',
        cell: (info) => formatDate(info.getValue() as string | Date | undefined),
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
        cell: ({ row }) => {
          if (row.original.template) return 'Template'
          if (row.original.archived) return 'Archived'
          return 'Active'
        },
      },
      {
        id: 'rowActions',
        header: '',
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => (
          <div onClick={(e) => e.stopPropagation()} className='flex justify-end'>
            <CourseActionsMenu
              selected={[row.original]}
              trigger={
                <div
                  className='h-4 w-4 transform scale-150 rounded-2xl hover:bg-gray-200 transition-all flex items-center justify-center'
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className='h-3 w-3' />
                </div>
              }
            />
          </div>
        ),
      },
    ],
    [],
  )

  const table = useReactTable({
    data: courses,
    columns,
    state: {
      sorting,
      globalFilter,
      rowSelection,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableRowSelection: true,
    getRowId: (row) => row.id,
    globalFilterFn: (row, _columnId, filterValue) => {
      const value = (filterValue as string).toLowerCase()
      const course = row.original
      const haystack = [
        course.name,
        course.semesterTag,
        CourseTypeDetails[course.courseType].name,
        course.startDate?.toString(),
        course.endDate?.toString(),
        course.ects?.toString(),
        course.archived ? 'archived' : 'active',
        course.template ? 'template' : '',
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return haystack.includes(value)
    },
  })

  const onRowClick = (courseId: string) => navigate(`/management/course/${courseId}`)

  const selectedCourses = table.getSelectedRowModel().rows.map((r) => r.original)
  const selectedCount = selectedCourses.length

  return (
    <div className='flex flex-col gap-3 w-full'>
      <div className='flex items-center justify-between gap-3 flex-wrap'>
        <div className='relative flex-1 min-w-0 overflow-hidden'>
          <Input
            placeholder='Search courses...'
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className='pl-10 w-full min-w-0'
          />
          <SearchIcon className='absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500' />
        </div>

        <CourseActionsMenu
          selected={selectedCourses}
          trigger={
            <Button disabled={selectedCount === 0}>
              <MoreHorizontal className='h-4 w-4' />
              Actions
            </Button>
          }
        />
      </div>

      <div className='flex gap-2 text-sm text-muted-foreground'>
        {selectedCount > 0 && <span className='text-foreground'>{selectedCount} selected</span>}
        <span>
          Showing {table.getFilteredRowModel().rows.length} of{' '}
          {table.getPrePaginationRowModel().rows.length} courses
        </span>
      </div>
      <div className='rounded-md border overflow-x-auto w-full'>
        <Table className='table-auto w-full relative'>
          <TableHeader className='bg-muted/100'>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className='whitespace-nowrap'>
                    {header.isPlaceholder ? null : (
                      <div
                        className={
                          header.column.getCanSort()
                            ? 'cursor-pointer select-none flex items-center'
                            : ''
                        }
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {typeof header.column.columnDef.header === 'string' &&
                          header.column.getCanSort() && (
                            <span className='ml-2'>
                              {{
                                asc: <ArrowUp className='h-4 w-4' />,
                                desc: <ArrowDown className='h-4 w-4' />,
                              }[header.column.getIsSorted() as string] ?? (
                                <ArrowUpDown className='h-4 w-4 text-muted-foreground' />
                              )}
                            </span>
                          )}
                      </div>
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() ? 'selected' : undefined}
                  onClick={() => onRowClick(row.original.id)}
                  className='cursor-pointer'
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className='whitespace-nowrap cursor-pointer'>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={table.getAllColumns().length} className='h-24 text-center'>
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
