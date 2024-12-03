import React, { lazy, Suspense } from 'react'
import { LucideProps } from 'lucide-react'
import dynamicIconImports from 'lucide-react/dynamicIconImports'

const fallback = <div style={{ background: '#ddd', width: 24, height: 24 }}>?</div>

interface IconProps extends Omit<LucideProps, 'ref'> {
  name: string
}

const DynamicIcon = ({ name, ...props }: IconProps) => {
  if (!dynamicIconImports[name]) {
    console.error(`Icon "${name}" does not exist in dynamicIconImports`)
    return fallback
  }

  const LucideIcon = lazy(dynamicIconImports[name])

  return (
    <Suspense fallback={fallback}>
      <LucideIcon {...props} />
    </Suspense>
  )
}

export default DynamicIcon
