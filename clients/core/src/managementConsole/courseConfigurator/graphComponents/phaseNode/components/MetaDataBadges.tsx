import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { CoursePhaseTypeMetaDataItem } from '@tumaet/prompt-shared-state'
import { getMetaDataStatus } from './utils/getBadgeStatus'
import { renderBadgeTooltipContent } from './utils/renderBadgeTooltip'

interface MetaDataBadgesProps {
  metaData: CoursePhaseTypeMetaDataItem[]
  icon: React.ReactNode
  label: string
  providedMetaData?: CoursePhaseTypeMetaDataItem[]
}

export const MetaDataBadges = ({
  metaData,
  icon,
  label,
  providedMetaData,
}: MetaDataBadgesProps): JSX.Element => {
  return (
    <div className='flex items-start space-x-2 mb-2'>
      <div className='mt-1'>{icon}</div>
      <div>
        <div className='text-xs font-semibold text-secondary-foreground mb-1'>{label}</div>
        <div className='flex flex-wrap gap-1'>
          {metaData.map((item, index) => {
            const {
              color,
              icon: statusIcon,
              tooltip: errorTooltip,
            } = getMetaDataStatus(item.name, item.type, providedMetaData)
            return (
              <TooltipProvider key={index}>
                <Tooltip>
                  <TooltipTrigger>
                    <Badge
                      variant='secondary'
                      className={`text-xs font-normal ${color} flex items-center gap-1`}
                    >
                      {statusIcon}
                      {item.name}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    {renderBadgeTooltipContent(item, providedMetaData, errorTooltip)}
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
