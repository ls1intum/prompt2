import { downloadFile, getFileMetadata } from '@/network/queries/getFile'

export const openFileDownload = async (fileId: string, fileName?: string): Promise<void> => {
  try {
    const metadata = await getFileMetadata(fileId)
    if (metadata?.downloadUrl) {
      window.open(metadata.downloadUrl, '_blank', 'noopener,noreferrer')
      return
    }
  } catch {
    // fall back to blob download
  }

  const blob = await downloadFile(fileId)
  const url = window.URL.createObjectURL(blob)
  const opened = window.open(url, '_blank', 'noopener,noreferrer')
  if (!opened) {
    const link = document.createElement('a')
    link.href = url
    link.download = fileName || 'download'
    document.body.appendChild(link)
    link.click()
    link.remove()
  }
  setTimeout(() => window.URL.revokeObjectURL(url), 30000)
}
