import { forwardRef, useImperativeHandle, useState } from 'react'
import { FileUpload } from '@/components/FileUpload'
import { FileList } from '@/components/FileList'
import { ApplicationQuestionFileUpload } from '@core/interfaces/application/applicationQuestion/applicationQuestionFileUpload'
import { ApplicationAnswerFileUpload } from '@core/interfaces/application/applicationAnswer/fileUpload/applicationAnswerFileUpload'
import { CreateApplicationAnswerFileUpload } from '@core/interfaces/application/applicationAnswer/fileUpload/createApplicationAnswerFileUpload'
import { FileResponse } from '@/network/mutations/uploadFile'
import { Alert, AlertDescription, CardDescription, CardTitle } from '@tumaet/prompt-ui-components'

export interface QuestionFileUploadFormRef {
  validate: () => Promise<boolean>
  getValues: () => CreateApplicationAnswerFileUpload
  rerender: (answer?: ApplicationAnswerFileUpload) => void
}

interface ApplicationQuestionFileUploadFormProps {
  question: ApplicationQuestionFileUpload
  answer?: ApplicationAnswerFileUpload
  isInstructorView?: boolean
  applicationId?: string
}

export const ApplicationQuestionFileUploadForm = forwardRef<
  QuestionFileUploadFormRef,
  ApplicationQuestionFileUploadFormProps
>(({ question, answer, isInstructorView = false, applicationId }, ref) => {
  const [uploadedFile, setUploadedFile] = useState<FileResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  useImperativeHandle(ref, () => ({
    validate: async () => {
      if (question.isRequired && !uploadedFile && !answer) {
        setError('This file upload is required')
        return false
      }
      setError(null)
      return true
    },
    getValues: () => ({
      questionID: question.id,
      fileID: uploadedFile?.id || answer?.fileID || '',
    }),
    rerender: (_newAnswer?: ApplicationAnswerFileUpload) => {
      // If we have a new answer, we don't need to do anything as the file is already uploaded
      // The FileList component will show the uploaded files
    },
  }))

  const handleUploadSuccess = (file: FileResponse) => {
    setUploadedFile(file)
    setError(null)
  }

  const handleUploadError = (err: Error) => {
    setError(err.message)
  }

  return (
    <div className='space-y-4'>
      <div>
        <CardTitle className='text-lg'>{question.title}</CardTitle>
        {question.description && (
          <CardDescription className='mt-1'>{question.description}</CardDescription>
        )}
        {question.isRequired && <span className='text-red-500 ml-1'>*</span>}
      </div>

      {!isInstructorView && !answer && (
        <FileUpload
          applicationId={applicationId}
          accept={question.allowedFileTypes}
          maxSizeMB={question.maxFileSizeMB || 50}
          onSuccess={handleUploadSuccess}
          onError={handleUploadError}
        />
      )}

      {uploadedFile && (
        <div className='mt-4'>
          <p className='text-sm font-medium mb-2'>Uploaded file:</p>
          <FileList files={[uploadedFile]} allowDelete={!isInstructorView} />
        </div>
      )}

      {answer && (
        <div className='mt-4'>
          <p className='text-sm font-medium mb-2'>Previously uploaded file:</p>
          <Alert>
            <AlertDescription>
              File: {answer.fileName} ({Math.round(answer.fileSize / 1024)} KB)
            </AlertDescription>
          </Alert>
        </div>
      )}

      {error && (
        <Alert variant='destructive'>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
})

ApplicationQuestionFileUploadForm.displayName = 'ApplicationQuestionFileUploadForm'
