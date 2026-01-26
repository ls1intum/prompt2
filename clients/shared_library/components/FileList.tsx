import * as React from 'react'
import { Download, Trash2, File, Loader2 } from 'lucide-react'
import { useFileDownload, useFileDelete } from '@/hooks/useFile'
import { FileResponse } from '@/network/mutations/uploadFile'
import { Button, Card, CardContent } from '@tumaet/prompt-ui-components'
import { cn } from '../utils/cn'

export interface FileListProps {
  files: FileResponse[]
  onDelete?: (fileId: string) => void
  allowDelete?: boolean
  className?: string
}

export const FileList: React.FC<FileListProps> = ({
  files,
  onDelete,
  allowDelete = false,
  className,
}) => {
  const downloadMutation = useFileDownload()
  const deleteMutation = useFileDelete()

  const handleDownload = async (file: FileResponse) => {
    try {
      const blob = await downloadMutation.mutateAsync(file.id)

      // Create a download link and trigger it
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = file.originalFilename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Download failed:', error)
    }
  }

  const handleDelete = async (fileId: string) => {
    if (!confirm('Are you sure you want to delete this file?')) {
      return
    }

    try {
      await deleteMutation.mutateAsync({ fileId, hardDelete: false })
      onDelete?.(fileId)
    } catch (error) {
      console.error('Delete failed:', error)
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
  }

  if (!files || files.length === 0) {
    return (
      <div className={cn('text-center py-8 text-gray-500', className)}>
        <File className='h-12 w-12 mx-auto mb-2 opacity-50' />
        <p className='text-sm'>No files uploaded yet</p>
      </div>
    )
  }

  return (
    <div className={cn('space-y-2', className)}>
      {files.map((file) => (
        <Card key={file.id}>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-3 flex-1 min-w-0'>
                <div className='p-2 bg-primary/10 rounded'>
                  <File className='h-5 w-5 text-primary' />
                </div>
                <div className='flex-1 min-w-0'>
                  <p className='text-sm font-medium truncate'>{file.originalFilename}</p>
                  <div className='flex items-center gap-2 text-xs text-gray-500'>
                    <span>{formatFileSize(file.sizeBytes)}</span>
                    <span>•</span>
                    <span>{formatDate(file.createdAt)}</span>
                  </div>
                  {file.description && (
                    <p className='text-xs text-gray-600 mt-1'>{file.description}</p>
                  )}
                </div>
              </div>

              <div className='flex items-center gap-2'>
                <Button
                  type='button'
                  size='sm'
                  variant='outline'
                  onClick={() => handleDownload(file)}
                  disabled={downloadMutation.isPending}
                >
                  {downloadMutation.isPending ? (
                    <Loader2 className='h-4 w-4 animate-spin' />
                  ) : (
                    <Download className='h-4 w-4' />
                  )}
                </Button>

                {allowDelete && (
                  <Button
                    type='button'
                    size='sm'
                    variant='outline'
                    onClick={() => handleDelete(file.id)}
                    disabled={deleteMutation.isPending}
                  >
                    {deleteMutation.isPending ? (
                      <Loader2 className='h-4 w-4 animate-spin' />
                    ) : (
                      <Trash2 className='h-4 w-4' />
                    )}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
