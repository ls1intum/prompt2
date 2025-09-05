import { Rectangle } from 'recharts'
import { getGradeColor } from '../../../../utils/gradeConfig'

interface GradeDistributionBarProps {
  x?: number
  y?: number
  width?: number
  height?: number
  payload?: {
    name: string
    average: number
    median: number
    lowerQuartile: number
    upperQuartile: number
    counts: Record<string, number>
  }
}

export const GradeDistributionBar = (props: GradeDistributionBarProps) => {
  const { x = 0, y = 0, width = 0, height = 0, payload } = props
  if (!payload || payload.lowerQuartile < 1 || payload.upperQuartile < 1) return undefined

  const scale = height / 4.0 // Range from 1.0 to 5.0 (total range of 4.0)
  const barColor = getGradeColor(payload.average) // Round to nearest 0.1
  const upperQuartileY = y + height - (payload.upperQuartile - 1) * scale

  const minHeight = 6
  if (payload.upperQuartile - payload.lowerQuartile <= 0) {
    return (
      <Rectangle
        x={x}
        y={upperQuartileY - minHeight / 2}
        width={width}
        height={minHeight}
        fill={barColor}
        radius={[4, 4, 4, 4]}
      />
    )
  }

  const lowerQuartileY = y + height - (payload.lowerQuartile - 1) * scale
  const averageY = y + height - (payload.average - 1) * scale
  const rectHeight = lowerQuartileY - upperQuartileY

  return (
    <g>
      <Rectangle
        x={x}
        y={upperQuartileY}
        width={width}
        height={rectHeight}
        fill={barColor}
        radius={[4, 4, 4, 4]}
      />
      <line
        x1={x}
        y1={averageY}
        x2={x + width}
        y2={averageY}
        stroke='#ffffff'
        strokeWidth={2}
        strokeOpacity={0.8}
      />
    </g>
  )
}
