import { Badge } from '@/components/ui/badge'

interface MetaDataBadgesProps {
  metaData: string[]
  icon: React.ReactNode
  label: string
}

export const MetaDataBadges = ({ metaData, icon, label }: MetaDataBadgesProps): JSX.Element => (
  <div className='flex items-start space-x-2 mb-2'>
    <div className='mt-1'>{icon}</div>
    <div>
      <div className='text-xs font-semibold text-gray-600 mb-1'>{label}</div>
      <div className='flex flex-wrap gap-1'>
        {metaData.map((item, index) => (
          <Badge key={index} variant='secondary' className='text-xs font-normal'>
            {item}
          </Badge>
        ))}
      </div>
    </div>
  </div>
)
