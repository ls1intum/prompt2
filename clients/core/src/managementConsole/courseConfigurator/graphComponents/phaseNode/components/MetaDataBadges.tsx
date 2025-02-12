import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { CoursePhaseTypeMetaDataItem } from '@tumaet/prompt-shared-state'
import { getMetaDataStatus } from './utils/getBadgeStatus'
import { renderBadgeTooltipContent } from './utils/renderBadgeTooltip'
import { RequiredInputDTO } from '@core/managementConsole/courseConfigurator/interfaces/requiredInputDto'
import { ProvidedOutputDTO } from '@core/managementConsole/courseConfigurator/interfaces/providedOutputDto'

interface MetaDataBadgesProps {
  DTOs: RequiredInputDTO[] | ProvidedOutputDTO[]
  icon: React.ReactNode
  label: string
  providedDTOs?: ProvidedOutputDTO[]
}

export const MetaDataBadges = ({
  DTOs,
  icon,
  label,
  providedDTOs,
}: MetaDataBadgesProps): JSX.Element => {
  return (
    <div className='flex items-start space-x-2 mb-2'>
      <div className='mt-1'>{icon}</div>
      <div>
        <div className='text-xs font-semibold text-secondary-foreground mb-1'>{label}</div>
        <div className='flex flex-wrap gap-1'>
          {DTOs.map((item: RequiredInputDTO | ProvidedOutputDTO, index) => {
            const {
              color,
              icon: statusIcon,
              tooltip: errorTooltip,
            } = getMetaDataStatus(item.dtoName, item.specification, [])
            return (
              <TooltipProvider key={index}>
                <Tooltip>
                  <TooltipTrigger>
                    <Badge
                      variant='secondary'
                      className={`text-xs font-normal ${color} flex items-center gap-1`}
                    >
                      {statusIcon}
                      {item.dtoName}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>TODO: This tooltip is in progress</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )
          })}
        </div>
      </div>
    </div>
  )
}
