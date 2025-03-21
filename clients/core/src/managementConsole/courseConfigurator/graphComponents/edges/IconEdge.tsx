import React from 'react'
import { BaseEdge, EdgeLabelRenderer, getBezierPath, type EdgeProps } from '@xyflow/react'

export function IconEdge({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  label,
  selected,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  const highlightColor = '#8B5CF6'

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          stroke: selected ? highlightColor : style.stroke || '#000',
          strokeWidth: selected ? 4 : style.strokeWidth || 2,
        }}
      />
      <EdgeLabelRenderer>
        <div
          className='absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto nodrag nopan'
          style={{
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
          }}
        >
          <div className='flex items-center justify-center w-8 h-8 bg-white rounded-full shadow-md'>
            {label}
          </div>
        </div>
      </EdgeLabelRenderer>
    </>
  )
}
