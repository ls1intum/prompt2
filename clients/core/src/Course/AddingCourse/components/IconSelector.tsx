import { SelectContent, SelectItem } from '@/components/ui/select'
import {
  Calendar,
  Cpu,
  Folder,
  Gamepad2Icon,
  GraduationCap,
  Monitor,
  School,
  Smartphone,
} from 'lucide-react'

const iconList = [
  { name: 'Monitor', icon: Monitor, lucideName: 'monitor' },
  { name: 'Graduation Cap', icon: GraduationCap, lucideName: 'graduation-cap' },
  { name: 'Book', icon: Calendar, lucideName: 'book-open-text' },
  { name: 'Smartphone', icon: Smartphone, lucideName: 'smartphone' },
  { name: 'Gamepad', icon: Gamepad2Icon, lucideName: 'gamepad-2' },
  { name: 'Folder', icon: Folder, lucideName: 'folder' },
  { name: 'CPU', icon: Cpu, lucideName: 'cpu' },
  { name: 'School', icon: School, lucideName: 'school' },
]

// TODO update this is near future
export const IconSelector = () => {
  return (
    <SelectContent>
      {iconList.map(({ name, icon: Icon, lucideName }) => (
        <SelectItem key={name} value={lucideName}>
          <div className='flex items-center'>
            <Icon className='mr-2 h-4 w-4' />
            <span>{name}</span>
          </div>
        </SelectItem>
      ))}
    </SelectContent>
  )
}
