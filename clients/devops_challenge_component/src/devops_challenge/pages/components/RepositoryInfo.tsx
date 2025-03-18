import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Github, ExternalLink, Clock, Clipboard, Check } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

type RepositoryData = {
  repositoryUrl: string
  remainingAttempts: number
  lastAssessment: {
    status: "success" | "failed" | "pending" | null
    timestamp: string
    feedback: Array<{
      type: string
      message: string
    }>
  } | null
}

interface RepositoryInfoProps {
  repositoryData: RepositoryData
}

export function RepositoryInfo({ repositoryData }: RepositoryInfoProps) {
  const { toast } = useToast() // Assuming you have a toast hook
  const [copied, setCopied] = useState(false)

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)

    // Show feedback to the user (can be a toast or tooltip)
    toast({
      title: "URL Copied",
      description: "The repository URL has been copied to your clipboard.",
      variant: "default",
    })

    // Reset copied state after a short delay
    setTimeout(() => {
      setCopied(false)
    }, 2000) // Icon will revert after 2 seconds
  }

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case "success":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "failed":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100" // Better contrast for "Not Assessed"
    }
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl flex items-center">
          <Github className="mr-2 h-5 w-5" />
          Repository Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col space-y-1">
            <span className="text-sm text-muted-foreground">Your Repository URL</span>
            <div className="flex items-center">
              <a
                href={repositoryData.repositoryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary flex items-center hover:underline"
              >
                {repositoryData.repositoryUrl}
                <ExternalLink className="ml-1 h-3 w-3" />
              </a>
              {/* Clipboard or Check icon */}
              <button
                onClick={() => handleCopyToClipboard(repositoryData.repositoryUrl)}
                className="ml-2 p-1 rounded hover:bg-gray-100"
                title="Copy repository URL"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" /> // Green checkmark when copied
                ) : (
                  <Clipboard className="h-4 w-4" /> // Clipboard icon when not copied
                )}
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Badge
                variant="secondary"
                className={
                  repositoryData.lastAssessment
                    ? getStatusColor(repositoryData.lastAssessment.status)
                    : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100" // Improved contrast for Not Assessed
                }
              >
                {repositoryData.lastAssessment && repositoryData.lastAssessment.status
                  ? repositoryData.lastAssessment.status.charAt(0).toUpperCase() +
                    repositoryData.lastAssessment.status.slice(1)
                  : "Not Assessed"}
              </Badge>

              {repositoryData.lastAssessment && (
                <div className="flex items-center text-xs text-muted-foreground">
                  <Clock className="mr-1 h-3 w-3" />
                  {formatDistanceToNow(new Date(repositoryData.lastAssessment.timestamp), { addSuffix: true })}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default RepositoryInfo