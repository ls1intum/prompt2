import { getStudents } from '@core/network/queries/getStudents'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table'
import { Student } from '@tumaet/prompt-shared-state'
import {
  Button,
  Input,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@tumaet/prompt-ui-components'
import { ArrowDown, ArrowUp, ArrowUpDown, MoreHorizontal, SearchIcon } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { TableCheckbox } from '../TableCheckbox'

export const StudentTable = () => {
  const [sorting, setSorting] = useState<SortingState>([{ id: 'name', desc: false }])
  const [globalFilter, setGlobalFilter] = useState('')
  const [rowSelection, setRowSelection] = useState({})

  const [students, setStudents] = useState<Array<Student>>([])

  useEffect(() => {
    const fetchStudents = async () => {
      const s = await getStudents()
      setStudents(s)
    }
    fetchStudents()
  }, [])

  const columns: ColumnDef<Student>[] = useMemo(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <TableCheckbox
            checked={table.getIsAllRowsSelected()}
            location='header'
            onToggle={(value) => table.toggleAllPageRowsSelected(!!value)}
          />
        ),
        cell: ({ row }) => (
          <TableCheckbox
            checked={row.getIsSelected()}
            location='row'
            onToggle={(value) => row.toggleSelected(!!value)}
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: 'firstName',
        header: 'First Name',
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: 'lastName',
        header: 'Last Name',
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: 'currentSemester',
        header: 'Semester',
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: 'studyProgram',
        header: 'Program',
        cell: (info) => info.getValue(),
      },
    ],
    [],
  )

  const table = useReactTable({
    data: students,
    columns,
    state: {
      sorting,
      globalFilter,
      rowSelection,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    enableRowSelection: true,
    getRowId: (row) => row.id!,
    getCoreRowModel: getCoreRowModel(),
  })

  const selectedCourses = table.getSelectedRowModel().rows.map((r) => r.original)
  const selectedCount = selectedCourses.length

  return (
    <div className='flex flex-col gap-3 w-full'>
      <div className='flex items-center justify-between gap-3 flex-wrap'>
        <div className='relative flex-1 min-w-0 overflow-hidden'>
          <Input
            placeholder='Search students...'
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className='pl-10 w-full min-w-0'
          />
          <SearchIcon className='absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500' />
        </div>

        <Button disabled={selectedCount === 0}>
          <MoreHorizontal className='h-4 w-4' />
          Actions
        </Button>
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
