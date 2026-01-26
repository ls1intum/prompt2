type OpenFileDownloadParams = {
  downloadUrl: string
  fileName?: string
}

export const openFileDownload = async ({
  downloadUrl,
  fileName,
}: OpenFileDownloadParams): Promise<void> => {
  if (!downloadUrl) {
    console.error('No download URL available for this file.')
    return
  }

  const opened = window.open(downloadUrl, '_blank', 'noopener,noreferrer')
  if (!opened) {
    const link = document.createElement('a')
    link.href = downloadUrl
    if (fileName) {
      link.download = fileName
    }
    document.body.appendChild(link)
    link.click()
    link.remove()
  }
}
