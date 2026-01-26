import { forwardRef, useEffect, useImperativeHandle, useState } from 'react'
import { FileUpload } from '@/components/FileUpload'
import { FileList } from '@/components/FileList'
import { ApplicationQuestionFileUpload } from '@core/interfaces/application/applicationQuestion/applicationQuestionFileUpload'
import { ApplicationAnswerFileUpload } from '@core/interfaces/application/applicationAnswer/fileUpload/applicationAnswerFileUpload'
import { CreateApplicationAnswerFileUpload } from '@core/interfaces/application/applicationAnswer/fileUpload/createApplicationAnswerFileUpload'
import { FileResponse } from '@/network/mutations/uploadFile'
import { deleteApplicationFile } from '@/network/mutations/deleteApplicationFile'
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
  coursePhaseId?: string
}

export const ApplicationQuestionFileUploadForm = forwardRef<
  QuestionFileUploadFormRef,
  ApplicationQuestionFileUploadFormProps
>(({ question, answer, isInstructorView = false, applicationId, coursePhaseId }, ref) => {
  const [uploadedFile, setUploadedFile] = useState<FileResponse | null>(null)
  const [existingAnswer, setExistingAnswer] = useState<ApplicationAnswerFileUpload | null>(
    answer ?? null,
  )
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setExistingAnswer(answer ?? null)
  }, [answer])

  useImperativeHandle(ref, () => ({
    validate: async () => {
      if (question.isRequired && !uploadedFile && !existingAnswer) {
        setError('This file upload is required')
        return false
      }
      setError(null)
      return true
    },
    getValues: () => ({
      applicationQuestionID: question.id,
      fileID: uploadedFile?.id || existingAnswer?.fileID || '',
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

  const handleDelete = async (fileId: string) => {
    if (!coursePhaseId) {
      setError('Course phase ID missing, cannot delete file.')
      return
    }

    try {
      await deleteApplicationFile(coursePhaseId, fileId)
      setUploadedFile(null)
      setExistingAnswer(null)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete file.'
      setError(message)
    }
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

      {!isInstructorView && !existingAnswer && (
        <FileUpload
          applicationId={applicationId}
          coursePhaseId={coursePhaseId}
          accept={question.allowedFileTypes}
          maxSizeMB={question.maxFileSizeMB || 50}
          onSuccess={handleUploadSuccess}
          onError={handleUploadError}
        />
      )}

      {uploadedFile && (
        <div className='mt-4'>
          <p className='text-sm font-medium mb-2'>Uploaded file:</p>
          <FileList
            files={[uploadedFile]}
            allowDelete={!isInstructorView && !!applicationId}
            onDelete={handleDelete}
          />
        </div>
      )}

      {existingAnswer && (
        <div className='mt-4'>
          <p className='text-sm font-medium mb-2'>Previously uploaded file:</p>
          <FileList
            files={[
              {
                id: existingAnswer.fileID,
                filename: existingAnswer.fileName,
                originalFilename: existingAnswer.fileName,
                contentType: '',
                sizeBytes: existingAnswer.fileSize,
                storageKey: '',
                downloadUrl: existingAnswer.downloadUrl,
                uploadedByUserId: '',
                createdAt: existingAnswer.uploadedAt,
                updatedAt: existingAnswer.uploadedAt,
              },
            ]}
            allowDelete={!isInstructorView && !!applicationId}
            onDelete={handleDelete}
          />
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
