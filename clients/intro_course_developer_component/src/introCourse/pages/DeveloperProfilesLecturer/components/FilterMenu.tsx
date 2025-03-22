import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Filter, Laptop, Smartphone, Tablet, Watch } from 'lucide-react'
import { DevProfileFilter } from '../interfaces/devProfileFilter'

interface FilterMenuProps {
  filters: DevProfileFilter
  setFilters: React.Dispatch<React.SetStateAction<DevProfileFilter>>
}

export const FilterMenu = ({ filters, setFilters }: FilterMenuProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='outline' size='sm' className='ml-auto'>
          <Filter className='mr-2 h-4 w-4' />
          Filters
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-56'>
        <DropdownMenuLabel>Survey Status</DropdownMenuLabel>
        <DropdownMenuCheckboxItem
          checked={filters.surveyStatus.completed}
          onCheckedChange={(checked) =>
            setFilters({
              ...filters,
              surveyStatus: { ...filters.surveyStatus, completed: checked },
            })
          }
        >
          Completed
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={filters.surveyStatus.notCompleted}
          onCheckedChange={(checked) =>
            setFilters({
              ...filters,
              surveyStatus: { ...filters.surveyStatus, notCompleted: checked },
            })
          }
        >
          Not Completed
        </DropdownMenuCheckboxItem>

        <DropdownMenuSeparator />

        <DropdownMenuLabel>Devices</DropdownMenuLabel>
        <DropdownMenuCheckboxItem
          checked={filters.devices.macBook}
          onClick={(e) => {
            e.preventDefault()
            setFilters((prevFilters) => ({
              ...prevFilters,
              devices: {
                ...prevFilters.devices,
                noDevices: false,
                macBook: !prevFilters.devices.macBook,
              },
            }))
          }}
        >
          <Laptop className='mr-2 h-4 w-4' />
          MacBook
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={filters.devices.iPhone}
          onClick={(e) => {
            e.preventDefault()
            setFilters((prevFilters) => ({
              ...prevFilters,
              devices: {
                ...prevFilters.devices,
                noDevices: false,
                iPhone: !prevFilters.devices.iPhone,
              },
            }))
          }}
        >
          <Smartphone className='mr-2 h-4 w-4' />
          iPhone
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={filters.devices.iPad}
          onClick={(e) => {
            e.preventDefault()
            setFilters((prevFilters) => ({
              ...prevFilters,
              devices: {
                ...prevFilters.devices,
                noDevices: false,
                iPad: !prevFilters.devices.iPad,
              },
            }))
          }}
        >
          <Tablet className='mr-2 h-4 w-4' />
          iPad
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={filters.devices.appleWatch}
          onClick={(e) => {
            e.preventDefault()
            setFilters((prevFilters) => ({
              ...prevFilters,
              devices: {
                ...prevFilters.devices,
                noDevices: false,
                appleWatch: !prevFilters.devices.appleWatch,
              },
            }))
          }}
        >
          <Watch className='mr-2 h-4 w-4' />
          Apple Watch
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={filters.devices.noDevices}
          onClick={(e) => {
            e.preventDefault()
            setFilters((prevFilters) => ({
              ...prevFilters,
              devices: {
                noDevices: !prevFilters.devices.noDevices,
                macBook: false,
                iPhone: false,
                iPad: false,
                appleWatch: false,
              },
            }))
          }}
        >
          No Devices
        </DropdownMenuCheckboxItem>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem
          checked={filters.gitlabNotCreated}
          onClick={(e) => {
            e.preventDefault()
            setFilters((prevFilters) => ({
              ...prevFilters,
              gitlabNotCreated: !prevFilters.gitlabNotCreated,
            }))
          }}
        >
          GitLab Not Setup
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
