import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { type ReactNode, useRef, useState } from 'react'
import { UploadCloud } from 'lucide-react'

interface UploadButtonProps {
  title: string
  description: string
  icon: ReactNode
  onUpload: (file: File) => void
  acceptedFileTypes: string[]
}

export const UploadButton = ({
  title,
  description,
  icon,
  onUpload,
  acceptedFileTypes,
}: UploadButtonProps): JSX.Element => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onUpload(e.dataTransfer.files[0])
    }
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      onUpload(file)
    }
  }

  return (
    <Card
      className={`hover:shadow-lg transition-all duration-300 ${dragActive ? 'border-primary' : ''}`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <CardHeader>
        <CardTitle className='flex items-center text-2xl'>
          {icon}
          <span className='ml-3'>{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className='mb-6 text-muted-foreground'>{description}</p>
        <div className='border-2 border-dashed border-muted-foreground rounded-lg p-8 text-center'>
          <UploadCloud className='mx-auto h-12 w-12 text-muted-foreground mb-4 mt-4' />
          <p className='text-sm text-muted-foreground mb-2'>
            Drag and drop your file here, or click to select
          </p>
          <p className='text-xs text-muted-foreground mb-4'>
            Supported file types: {acceptedFileTypes.join(', ')}
          </p>
          <Button onClick={() => fileInputRef.current?.click()} className='text-lg py-6 mb-4'>
            Select File
          </Button>
        </div>
        <input
          type='file'
          ref={fileInputRef}
          onChange={handleChange}
          className='hidden'
          accept={acceptedFileTypes.join(',')}
        />
      </CardContent>
    </Card>
  )
}
