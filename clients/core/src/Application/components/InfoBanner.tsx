import React from 'react'
import { AlertCircle, Info } from 'lucide-react'

interface InfoBannerProps {
  status: 'not_applied' | 'new_user' | 'applied' | string
}

export const InfoBanner: React.FC<InfoBannerProps> = ({ status }) => {
  const getBannerMessage = () => {
    if (status === 'not_applied' || status === 'new_user') {
      return 'Your changes are not saved until you submit. You can resubmit as often as you want until the deadline.'
    } else if (status === 'applied') {
      return 'You have already successfully submitted. You can resubmit as often as you want until the deadline, but your old answers will be overwritten.'
    }
    return ''
  }

  const message = getBannerMessage()

  if (!message) return null

  const isApplied = status === 'applied'

  return (
    <div
      className={`border-l-4 p-4 mb-4 ${
        isApplied
          ? 'bg-yellow-100 border-yellow-500 text-yellow-700'
          : 'bg-gray-50 border-gray-200 text-gray-600'
      }`}
      role='alert'
    >
      <div className='flex items-center'>
        {isApplied ? <AlertCircle className='h-5 w-5 mr-2' /> : <Info className='h-5 w-5 mr-2' />}
        <p className={isApplied ? 'font-medium' : 'font-normal'}>{message}</p>
      </div>
    </div>
  )
}
