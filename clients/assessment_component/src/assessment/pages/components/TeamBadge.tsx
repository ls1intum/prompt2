import { cn, Badge } from '@tumaet/prompt-ui-components'

export const TeamBadge = ({ teamName }: { teamName: string }): JSX.Element => {
  return (
    <Badge
      className={cn(
        'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200',
        'dark:bg-gray-100 dark:text-gray-800 dark:border-gray-200 dark:hover:bg-gray-200',
      )}
    >
      Team {teamName}
    </Badge>
  )
}
