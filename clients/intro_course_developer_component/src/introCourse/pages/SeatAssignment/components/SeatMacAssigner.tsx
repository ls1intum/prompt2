import { useState, useEffect } from 'react'
import type { Seat } from '../../../interfaces/Seat'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Laptop, ChevronUp, ChevronDown, SearchIcon } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { useUpdateSeats } from '../hooks/useUpdateSeats'

interface SeatMacAssignerProps {
  existingSeats: Seat[]
}

export const SeatMacAssigner = ({ existingSeats }: SeatMacAssignerProps) => {
  const [seats, setSeats] = useState<Seat[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterMac, setFilterMac] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // Collapse the card initially if any seat already has a Mac assigned.
  const [isCollapsed, setIsCollapsed] = useState(existingSeats.some((seat) => seat.hasMac))

  // Initialize seats and baseline from props
  useEffect(() => {
    setSeats(existingSeats)
  }, [existingSeats])

  const mutation = useUpdateSeats(setError)

  const handleToggleMac = (seatIndex: number, hasMac: boolean) => {
    const updatedSeats = [...seats]
    updatedSeats[seatIndex] = {
      ...updatedSeats[seatIndex],
      hasMac,
      // Clear deviceID if Mac is removed
      deviceID: hasMac ? updatedSeats[seatIndex].deviceID : null,
    }
    setSeats(updatedSeats)
  }

  const handleDeviceIdChange = (seatIndex: number, deviceID: string) => {
    const updatedSeats = [...seats]
    updatedSeats[seatIndex] = {
      ...updatedSeats[seatIndex],
      deviceID,
    }
    setSeats(updatedSeats)
  }

  // Filter seats based on search term and filterMac toggle
  const filteredSeats = seats.filter((seat) => {
    const matchesSearch =
      seat?.seatName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      seat?.deviceID?.toLowerCase().includes(searchTerm.toLowerCase())
    return filterMac ? matchesSearch && seat.hasMac : matchesSearch
  })

  // Count seats with Macs
  const macCount = seats.filter((seat) => seat.hasMac).length

  // Determine if there are unsaved changes by comparing the current seats with the saved baseline.
  const hasChanges = seats.some(
    (seat, index) =>
      seat.hasMac !== existingSeats[index].hasMac ||
      seat.deviceID !== existingSeats[index].deviceID,
  )

  // Auto-save changes after 1 second of inactivity if there are unsaved changes.
  useEffect(() => {
    if (hasChanges && !mutation.isPending) {
      const timer = setTimeout(() => {
        mutation.mutate(seats)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [seats, hasChanges, mutation, mutation.isPending])

  return (
    <Card>
      <CardHeader className='cursor-pointer' onClick={() => setIsCollapsed(!isCollapsed)}>
        <div className='flex items-center justify-between'>
          <div>
            <CardTitle>Step 2: Mac Assignment</CardTitle>
            <CardDescription>Assign Mac devices to seats and provide device IDs</CardDescription>
          </div>
          <div className='flex items-center gap-2'>
            <div className='flex items-center text-blue-600 bg-blue-50 px-3 py-1.5 rounded-md'>
              <Laptop className='h-5 w-5 mr-2' />
              <span className='text-sm font-medium'>{macCount} Macs Assigned</span>
            </div>
            {isCollapsed ? <ChevronDown className='h-4 w-4' /> : <ChevronUp className='h-4 w-4' />}
          </div>
        </div>
      </CardHeader>
      {!isCollapsed && (
        <>
          <CardContent>
            {error && (
              <Alert variant='destructive' className='mb-4'>
                <AlertCircle className='h-4 w-4' />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className='space-y-4'>
              <div className='flex gap-2'>
                <div className='relative flex-grow max-w-md w-full'>
                  <Input
                    type='search'
                    placeholder='Search seats or device IDs...'
                    className='pl-8'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <SearchIcon className='absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 dark:text-gray-400' />
                </div>
                <Button
                  onClick={() => setFilterMac(!filterMac)}
                  variant={filterMac ? 'default' : 'outline'}
                >
                  <Laptop className='mr-2 h-4 w-4' />
                  {filterMac ? 'Showing Only Macs' : 'Show Only Macs'}
                </Button>
              </div>
              <div className='border rounded-md max-h-[40vh] overflow-y-auto'>
                <Table>
                  <TableHeader className='z-10'>
                    <TableRow>
                      <TableHead>Seat</TableHead>
                      <TableHead>Has Mac</TableHead>
                      <TableHead>Device ID</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSeats.length > 0 ? (
                      filteredSeats.map((seat) => {
                        const originalIndex = seats.findIndex((s) => s.seatName === seat.seatName)
                        return (
                          <TableRow key={seat.seatName}>
                            <TableCell className='font-medium'>{seat.seatName}</TableCell>
                            <TableCell>
                              <Switch
                                checked={seat.hasMac}
                                onCheckedChange={(checked) =>
                                  handleToggleMac(originalIndex, checked)
                                }
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                placeholder='Enter device ID'
                                value={seat.deviceID ?? ''}
                                onChange={(e) =>
                                  handleDeviceIdChange(originalIndex, e.target.value)
                                }
                                disabled={!seat.hasMac}
                                className={!seat.hasMac ? 'opacity-50' : ''}
                              />
                            </TableCell>
                          </TableRow>
                        )
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} className='text-center py-4 text-muted-foreground'>
                          {searchTerm ? 'No seats match your search' : 'No seats available'}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
          <CardFooter className='flex justify-between border-t pt-4'>
            <p className='text-xs text-muted-foreground'>
              {macCount} of {seats.length} seats have Macs assigned
            </p>
          </CardFooter>
        </>
      )}
    </Card>
  )
}
