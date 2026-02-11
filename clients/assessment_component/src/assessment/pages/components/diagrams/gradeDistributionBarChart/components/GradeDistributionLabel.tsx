interface GradeDistributionLabelProps {
  x?: number
  y?: number
  width?: number
  height?: number
  value?: number
}

export const GradeDistributionLabel = (props: GradeDistributionLabelProps) => {
  const { x = 0, y = 0, width = 0, height = 0, value = 0 } = props
  if (value === 0) return undefined

  // Grade scale: 1.0 to 5.0 (range of 4.0)
  const scale = height / 4.0
  const averageY = y + height - (value - 1.0) * scale

  return (
    <text x={x + width / 2} y={averageY - 6} textAnchor='middle' fontSize={12} fill='#a3a3a3'>
      ⌀ {Number(value).toFixed(1)}
    </text>
  )
}
