import React from 'react'
import { cn } from '@/lib/utils'

export type QuestionStatus = 'new' | 'modified' | 'saved'

interface QuestionStatusBadgeProps {
  status: QuestionStatus
  className?: string
}

export function QuestionStatusBadge({ status, className }: QuestionStatusBadgeProps) {
  const baseClasses = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold'

  const statusClasses = {
    new: 'bg-blue-100 text-blue-800',
    modified: 'bg-orange-100 text-orange-800',
    saved: 'bg-green-100 text-green-800',
  }

  return <span className={cn(baseClasses, statusClasses[status], className)}>{status}</span>
}
