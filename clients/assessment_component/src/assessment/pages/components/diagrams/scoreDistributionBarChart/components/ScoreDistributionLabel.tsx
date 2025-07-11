import { ScoreLevel } from '../../../../../interfaces/scoreLevel'

interface ScoreDistributionLabelProps {
  x?: number
  y?: number
  width?: number
  height?: number
  value?: number
}

export const ScoreDistributionLabel = (props: ScoreDistributionLabelProps) => {
  const { x = 0, y = 0, width = 0, height = 0, value = 0 } = props
  if (value === 0) return undefined
  const scale = height / (Object.keys(ScoreLevel).length - 1)
  const averageY = y + height - (value - 1) * scale
  return (
    <text x={x + width / 2} y={averageY - 6} textAnchor='middle' fontSize={12} fill='#a3a3a3'>
      ⌀ {Number(value).toFixed(1)}
    </text>
  )
}
