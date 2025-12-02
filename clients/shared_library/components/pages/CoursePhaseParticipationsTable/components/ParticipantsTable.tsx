import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@tumaet/prompt-ui-components'
import { flexRender } from '@tanstack/react-table'
import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react'

interface Props {
  table: any
  onClickRowAction?: (row: any) => void
}

export const ParticipantsTable = ({ table, onClickRowAction }: Props) => {
  return (
    <div className='rounded-md border overflow-x-scroll w-full'>
      <Table className='table-auto w-full relative'>
        {/* HEADER */}
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

        {/* BODY */}
        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() ? 'selected' : undefined}
                onClick={() => onClickRowAction?.(row.original)}
                className={onClickRowAction ? 'cursor-pointer' : ''}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className={`whitespace-nowrap ${onClickRowAction ? 'cursor-pointer' : ''}`}
                  >
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
  )
}
