import { SkillCounts } from '../../interfaces/StatisticalDataPoint'

export function StatisticalTooltipContent(props: any) {
  if (!props.active || !props.payload || !props.payload[0]) {
    return null
  }

  const data = props.payload[0].payload
  const counts: SkillCounts = data.counts
  const total = counts.novice + counts.intermediate + counts.advanced + counts.expert

  return (
    <div className='rounded-lg border bg-background p-2 shadow-md'>
      <div className='font-medium mb-2'>{data.name}</div>
      <div className='space-y-1 text-sm'>
        <div className='grid grid-cols-2 gap-x-3'>
          <span className='text-muted-foreground'>Average:</span>
          <span className='font-medium'>{data.average.toFixed(1)}</span>
        </div>
        <div className='grid grid-cols-2 gap-x-3'>
          <span className='text-muted-foreground'>Median:</span>
          <span className='font-medium'>
            {data.median.charAt(0).toUpperCase() + data.median.slice(1)}
          </span>
        </div>
        <div className='grid grid-cols-2 gap-x-3'>
          <span className='text-muted-foreground'>Lower Quartile:</span>
          <span className='font-medium'>{data.lowerQuartile.toFixed(1)}</span>
        </div>
        <div className='grid grid-cols-2 gap-x-3'>
          <span className='text-muted-foreground'>Upper Quartile:</span>
          <span className='font-medium'>{data.upperQuartile.toFixed(1)}</span>
        </div>
        <div className='h-px bg-border my-2'></div>
        <div className='font-medium'>Distribution</div>
        <div className='grid grid-cols-2 gap-x-3'>
          <span className='text-muted-foreground'>Novice:</span>
          <span className='font-medium'>
            {counts.novice} ({((counts.novice / total) * 100).toFixed(0)}%)
          </span>
        </div>
        <div className='grid grid-cols-2 gap-x-3'>
          <span className='text-muted-foreground'>Intermediate:</span>
          <span className='font-medium'>
            {counts.intermediate} ({((counts.intermediate / total) * 100).toFixed(0)}%)
          </span>
        </div>
        <div className='grid grid-cols-2 gap-x-3'>
          <span className='text-muted-foreground'>Advanced:</span>
          <span className='font-medium'>
            {counts.advanced} ({((counts.advanced / total) * 100).toFixed(0)}%)
          </span>
        </div>
        <div className='grid grid-cols-2 gap-x-3'>
          <span className='text-muted-foreground'>Expert:</span>
          <span className='font-medium'>
            {counts.expert} ({((counts.expert / total) * 100).toFixed(0)}%)
          </span>
        </div>
      </div>
    </div>
  )
}
