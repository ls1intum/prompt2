import { axiosInstance } from '@/network/configService'

export interface FileUploadParams {
  file: File
  applicationId?: string
  coursePhaseId?: string
  description?: string
  tags?: string
  onUploadProgress?: (progressEvent: any) => void
}

export interface FileResponse {
  id: string
  filename: string
  originalFilename: string
  contentType: string
  sizeBytes: number
  storageKey: string
  downloadUrl: string
  uploadedByUserId: string
  uploadedByEmail?: string
  applicationId?: string
  coursePhaseId?: string
  description?: string
  tags?: string[]
  createdAt: string
  updatedAt: string
}

export const uploadFile = async (params: FileUploadParams): Promise<FileResponse> => {
  const formData = new FormData()
  formData.append('file', params.file)

  if (params.applicationId) {
    formData.append('applicationId', params.applicationId)
  }

  if (params.coursePhaseId) {
    formData.append('coursePhaseId', params.coursePhaseId)
  }

  if (params.description) {
    formData.append('description', params.description)
  }

  if (params.tags) {
    formData.append('tags', params.tags)
  }

  try {
    const response = await axiosInstance.post('/api/storage/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: params.onUploadProgress,
    })
    return response.data
  } catch (err) {
    console.error('File upload failed:', err)
    throw err
  }
}
