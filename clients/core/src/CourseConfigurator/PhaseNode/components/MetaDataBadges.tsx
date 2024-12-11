import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { CheckCircle, AlertCircle, AlertTriangle } from 'lucide-react'

interface MetaDataBadgesProps {
  metaData: string[]
  icon: React.ReactNode
  label: string
  providedMetaData?: string[]
}

export const MetaDataBadges = ({
  metaData,
  icon,
  label,
  providedMetaData,
}: MetaDataBadgesProps): JSX.Element => {
  const getMetaDataStatus = (
    item: string,
  ): { color: string; icon: React.ReactNode; tooltip?: string } => {
    if (!providedMetaData) return { color: 'bg-secondary', icon: null }

    const count = providedMetaData.filter((meta) => meta === item).length

    if (count === 0)
      return {
        color: 'bg-red-200 text-red-800',
        icon: <AlertCircle className='w-3 h-3' />,
        tooltip: 'Missing metadata',
      }
    if (count === 1)
      return { color: 'bg-green-200 text-green-800', icon: <CheckCircle className='w-3 h-3' /> }
    return {
      color: 'bg-yellow-200 text-yellow-800',
      icon: <AlertTriangle className='w-3 h-3' />,
      tooltip: 'Conflict: metadata provided multiple times',
    }
  }

  return (
    <div className='flex items-start space-x-2 mb-2'>
      <div className='mt-1'>{icon}</div>
      <div>
        <div className='text-xs font-semibold text-gray-600 mb-1'>{label}</div>
        <div className='flex flex-wrap gap-1'>
          {metaData.map((item, index) => {
            const { color, icon: statusIcon, tooltip } = getMetaDataStatus(item)
            const BadgeContent = (
              <Badge
                key={index}
                variant='secondary'
                className={`text-xs font-normal ${color} flex items-center gap-1`}
              >
                {statusIcon}
                {item}
              </Badge>
            )

            return tooltip ? (
              <TooltipProvider key={index}>
                <Tooltip>
                  <TooltipTrigger asChild>{BadgeContent}</TooltipTrigger>
                  <TooltipContent>
                    <p>{tooltip}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              BadgeContent
            )
          })}
        </div>
      </div>
    </div>
  )
}
