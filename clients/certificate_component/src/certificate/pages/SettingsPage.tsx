import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2, Upload, FileText, CheckCircle2 } from 'lucide-react'

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Textarea,
  ManagementPageHeader,
  ErrorPage,
  useToast,
} from '@tumaet/prompt-ui-components'

import { getConfig, updateConfig } from '../network/queries/getConfig'

export const SettingsPage = () => {
  const { phaseId } = useParams<{ phaseId: string }>()
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [templateContent, setTemplateContent] = useState('')
  const [hasChanges, setHasChanges] = useState(false)

  const {
    data: config,
    isPending,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['config', phaseId],
    queryFn: () => getConfig(phaseId ?? ''),
    enabled: !!phaseId,
  })

  const updateMutation = useMutation({
    mutationFn: (content: string) => updateConfig(phaseId ?? '', content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['config', phaseId] })
      toast({
        title: 'Success',
        description: 'Certificate template updated successfully',
      })
      setHasChanges(false)
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update certificate template',
        variant: 'destructive',
      })
    },
  })

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith('.typ')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload a Typst (.typ) file',
        variant: 'destructive',
      })
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      setTemplateContent(content)
      setHasChanges(true)
    }
    reader.readAsText(file)
  }

  const handleSave = () => {
    if (templateContent) {
      updateMutation.mutate(templateContent)
    }
  }

  // Initialize template content from config
  if (config?.templateContent && !templateContent && !hasChanges) {
    setTemplateContent(config.templateContent)
  }

  if (isError) {
    return <ErrorPage message='Error loading configuration' onRetry={refetch} />
  }

  if (isPending) {
    return (
      <div className='flex justify-center items-center h-64'>
        <Loader2 className='h-12 w-12 animate-spin text-primary' />
      </div>
    )
  }

  return (
    <div className='flex flex-col'>
      <ManagementPageHeader>Certificate Settings</ManagementPageHeader>
      <p className='text-sm text-muted-foreground mb-6'>
        Configure the certificate template for this course phase.
      </p>

      <div className='grid gap-6 max-w-4xl'>
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <FileText className='h-5 w-5' />
              Template Status
            </CardTitle>
            <CardDescription>
              {config?.hasTemplate ? (
                <span className='flex items-center gap-2 text-green-600'>
                  <CheckCircle2 className='h-4 w-4' />
                  Template configured
                </span>
              ) : (
                'No template configured yet'
              )}
            </CardDescription>
          </CardHeader>
          {config?.hasTemplate && config.updatedAt && (
            <CardContent>
              <p className='text-sm text-muted-foreground'>
                Last updated: {new Date(config.updatedAt).toLocaleDateString()}
              </p>
            </CardContent>
          )}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upload Template</CardTitle>
            <CardDescription>
              Upload a Typst (.typ) file or paste the template content directly.
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex items-center gap-4'>
              <Button variant='outline' asChild>
                <label className='cursor-pointer'>
                  <Upload className='mr-2 h-4 w-4' />
                  Upload .typ file
                  <input
                    type='file'
                    accept='.typ'
                    onChange={handleFileUpload}
                    className='hidden'
                  />
                </label>
              </Button>
              <span className='text-sm text-muted-foreground'>or paste content below</span>
            </div>

            <Textarea
              placeholder='Paste your Typst template content here...'
              value={templateContent}
              onChange={(e) => {
                setTemplateContent(e.target.value)
                setHasChanges(true)
              }}
              rows={15}
              className='font-mono text-sm'
            />

            <Button onClick={handleSave} disabled={!hasChanges || updateMutation.isPending}>
              {updateMutation.isPending ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Saving...
                </>
              ) : (
                'Save Template'
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Template Requirements</CardTitle>
            <CardDescription>
              Your Typst template should follow these requirements:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className='list-disc pl-6 space-y-2 text-sm'>
              <li>File must be a valid Typst (.typ) file</li>
              <li>
                Use <code className='bg-muted px-1 rounded'>json("data.json")</code> to access
                certificate data
              </li>
              <li>
                Available fields: <code className='bg-muted px-1 rounded'>studentName</code>,{' '}
                <code className='bg-muted px-1 rounded'>courseName</code>,{' '}
                <code className='bg-muted px-1 rounded'>date</code>
              </li>
              <li>Template should be in A4 format</li>
              <li>Ensure all used fonts are included or are system fonts</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
