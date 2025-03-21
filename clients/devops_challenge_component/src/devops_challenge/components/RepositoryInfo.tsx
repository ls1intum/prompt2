import { CheckCircle } from "lucide-react"

interface RepositoryInfoProps {
  repoUrl: string
}

export function RepositoryInfo({ repoUrl }: RepositoryInfoProps) {
  return (
    <div className="flex flex-col space-y-2 bg-muted/30 p-4 rounded-lg">
      <div className="text-sm font-medium text-muted-foreground">Repository URL</div>
      <div className="flex items-center">
        <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
        <a
          href={repoUrl}
          className="text-primary underline hover:text-primary/80 transition-colors break-all"
          target="_blank"
          rel="noopener noreferrer"
        >
          {repoUrl}
        </a>
      </div>
    </div>
  )
}

