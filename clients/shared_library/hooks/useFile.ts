import { useMutation, useQuery, UseQueryResult, UseMutationResult } from '@tanstack/react-query'
import {
  getFileMetadata,
  downloadFile,
  deleteFile,
  getFilesByApplication,
  getFilesByCoursePhase,
} from '@/network/queries/getFile'
import { FileResponse } from '@/network/mutations/uploadFile'

export const useFileMetadata = (fileId: string): UseQueryResult<FileResponse, Error> => {
  return useQuery({
    queryKey: ['file', fileId],
    queryFn: () => getFileMetadata(fileId),
    enabled: !!fileId,
  })
}

export const useFileDownload = () => {
  return useMutation<Blob, Error, string>({
    mutationFn: downloadFile,
  })
}

export const useFileDelete = () => {
  return useMutation<void, Error, { fileId: string; hardDelete?: boolean }>({
    mutationFn: ({ fileId, hardDelete }) => deleteFile(fileId, hardDelete),
  })
}

export const useFilesByApplication = (applicationId: string): UseQueryResult<FileResponse[], Error> => {
  return useQuery({
    queryKey: ['files', 'application', applicationId],
    queryFn: () => getFilesByApplication(applicationId),
    enabled: !!applicationId,
  })
}

export const useFilesByCoursePhase = (coursePhaseId: string): UseQueryResult<FileResponse[], Error> => {
  return useQuery({
    queryKey: ['files', 'coursePhase', coursePhaseId],
    queryFn: () => getFilesByCoursePhase(coursePhaseId),
    enabled: !!coursePhaseId,
  })
}
