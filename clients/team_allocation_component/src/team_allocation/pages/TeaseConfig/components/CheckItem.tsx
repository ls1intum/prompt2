import { CheckCircle, AlertCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { ValidationResult } from '../../../interfaces/validationResult'

export const CheckItem = ({ check }: { check: ValidationResult }) => {
  return (
    <Card className={`border-l-4 ${check.isValid ? 'border-l-green-500' : 'border-l-yellow-500'}`}>
      <CardContent className='flex items-center gap-4 p-4'>
        <div className='flex-shrink-0'>
          {check.isValid ? (
            <CheckCircle className='h-6 w-6 text-green-500' />
          ) : (
            <AlertCircle className='h-6 w-6 text-yellow-500' />
          )}
        </div>
        <div className='flex-grow'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              {check.icon}
              <h3 className='font-medium'>{check.label}</h3>
            </div>
          </div>
          <p className='mt-1 text-sm text-muted-foreground'>
            {check.details || 'All students have provided this information.'}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
