import DynamicIcon from '@/components/DynamicIcon'

interface CourseTemplateIconProps {
  iconName: string
  bgColor: string
}

export const CourseTemplateIcon = ({ iconName, bgColor }: CourseTemplateIconProps): JSX.Element => {
  return (
    <div
      className={`flex aspect-square items-center justify-center rounded-lg  text-gray-800 size-12 ${bgColor}`}
    >
      <DynamicIcon name={iconName} className='size-6' />
    </div>
  )
}
