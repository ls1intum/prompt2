import axios from 'axios'
import { axiosInstance } from '@/network/configService'
import { FileResponse } from '@/network/mutations/uploadFile'

export const getFileMetadata = async (fileId: string): Promise<FileResponse> => {
  try {
    return (await axiosInstance.get(`/api/storage/files/${fileId}`)).data
  } catch (err) {
    console.error('Failed to get file metadata:', err)
    throw err
  }
}

export const downloadFile = async (fileId: string): Promise<Blob> => {
  try {
    const metadata = await getFileMetadata(fileId)
    if (!metadata?.downloadUrl) {
      throw new Error('No download URL available')
    }
    const response = await axios.get(metadata.downloadUrl, {
      responseType: 'blob',
    })
    return response.data
  } catch (err) {
    console.error('File download failed:', err)
    throw err
  }
}

export const deleteFile = async (fileId: string, hardDelete: boolean = false): Promise<void> => {
  try {
    await axiosInstance.delete(`/api/storage/files/${fileId}`, {
      params: { hard: hardDelete },
    })
  } catch (err) {
    console.error('File deletion failed:', err)
    throw err
  }
}

export const getFilesByApplication = async (applicationId: string): Promise<FileResponse[]> => {
  try {
    return (await axiosInstance.get(`/api/storage/applications/${applicationId}/files`)).data
  } catch (err) {
    console.error('Failed to get files by application:', err)
    throw err
  }
}

export const getFilesByCoursePhase = async (coursePhaseId: string): Promise<FileResponse[]> => {
  try {
    return (await axiosInstance.get(`/api/storage/course-phases/${coursePhaseId}/files`)).data
  } catch (err) {
    console.error('Failed to get files by course phase:', err)
    throw err
  }
}
