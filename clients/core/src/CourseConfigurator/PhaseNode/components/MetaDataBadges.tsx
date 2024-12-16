import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { CheckCircle, AlertCircle, AlertTriangle } from 'lucide-react'
import { MetaDataItem } from '@/interfaces/course_phase_type'

interface MetaDataBadgesProps {
  metaData: MetaDataItem[]
  icon: React.ReactNode
  label: string
  providedMetaData?: MetaDataItem[]
}

export const MetaDataBadges = ({
  metaData,
  icon,
  label,
  providedMetaData,
}: MetaDataBadgesProps): JSX.Element => {
  const getMetaDataStatus = (
    name: string,
    type: string,
  ): { color: string; icon: React.ReactNode; tooltip?: string } => {
    if (!providedMetaData) return { color: 'bg-secondary', icon: null }

    const matchingItems = providedMetaData.filter(
      (meta) => meta.name === name && meta.type === type,
    )

    const wrongType = providedMetaData.filter((meta) => meta.name === name && meta.type !== type)

    if (wrongType.length > 0) {
      return {
        color: 'bg-yellow-200 text-yellow-800',
        icon: <AlertCircle className='w-3 h-3' />,
        tooltip: 'Conflict (Wrong type): expecting type: ' + type,
      }
    }
    if (matchingItems.length === 0)
      return {
        color: 'bg-red-200 text-red-800',
        icon: <AlertCircle className='w-3 h-3' />,
        tooltip: 'Missing meta data with name: ' + name + ' and type: ' + type,
      }
    if (matchingItems.length === 1)
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
        <div className='text-xs font-semibold text-secondary-foreground mb-1'>{label}</div>
        <div className='flex flex-wrap gap-1'>
          {metaData.map((item, index) => {
            const { color, icon: statusIcon, tooltip } = getMetaDataStatus(item.name, item.type)
            return (
              <TooltipProvider key={index}>
                <Tooltip>
                  <TooltipTrigger>
                    <Badge
                      key={index}
                      variant='secondary'
                      className={`text-xs font-normal ${color} flex items-center gap-1`}
                    >
                      {statusIcon}
                      {item.name}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{tooltip || `Name: ${item.name}, Type: ${item.type}`}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )
          })}
        </div>
      </div>
    </div>
  )
}
