import axios from 'axios'
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
  const contentType = params.file.type || 'application/octet-stream'

  try {
    const presignResponse = await axiosInstance.post('/api/storage/presign-upload', {
      filename: params.file.name,
      contentType,
      coursePhaseId: params.coursePhaseId,
      description: params.description,
      tags: params.tags,
    })

    const { uploadUrl, storageKey } = presignResponse.data

    await axios.put(uploadUrl, params.file, {
      headers: {
        'Content-Type': contentType,
      },
      onUploadProgress: params.onUploadProgress,
    })

    const completeResponse = await axiosInstance.post('/api/storage/complete-upload', {
      storageKey,
      originalFilename: params.file.name,
      contentType,
      coursePhaseId: params.coursePhaseId,
      description: params.description,
      tags: params.tags,
    })

    return completeResponse.data
  } catch (err) {
    console.error('File upload failed:', err)
    throw err
  }
}
