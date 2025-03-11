import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, MoreHorizontal, Mail, UserMinus } from "lucide-react"

interface Tutor {
  id: string
  name: string
  email: string
  coursePhase: string
  importedFrom: string
  dateAdded: string
}

export function TutorTable() {
  const [tutors, setTutors] = useState<Tutor[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate fetching tutors
    const fetchTutors = async () => {
      try {
        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Mock data
        const mockTutors: Tutor[] = [
          {
            id: "1",
            name: "Jane Smith",
            email: "jane.smith@example.com",
            coursePhase: "Development",
            importedFrom: "Introduction to Programming",
            dateAdded: "2023-10-15",
          },
          {
            id: "2",
            name: "John Doe",
            email: "john.doe@example.com",
            coursePhase: "Design",
            importedFrom: "UI/UX Fundamentals",
            dateAdded: "2023-09-22",
          },
          {
            id: "3",
            name: "Alice Johnson",
            email: "alice.johnson@example.com",
            coursePhase: "Testing",
            importedFrom: "Software Testing Basics",
            dateAdded: "2023-11-05",
          },
        ]

        setTutors(mockTutors)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTutors()
  }, [])

  const filteredTutors = tutors.filter(
    (tutor) =>
      tutor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tutor.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tutor.coursePhase.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tutor.importedFrom.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search tutors..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Course Phase</TableHead>
              <TableHead>Imported From</TableHead>
              <TableHead>Date Added</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <TableRow key={index}>
                  {Array.from({ length: 6 }).map((_, cellIndex) => (
                    <TableCell key={cellIndex}>
                      <div className="h-5 w-full animate-pulse rounded bg-muted" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : filteredTutors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No tutors found.
                </TableCell>
              </TableRow>
            ) : (
              filteredTutors.map((tutor) => (
                <TableRow key={tutor.id}>
                  <TableCell className="font-medium">{tutor.name}</TableCell>
                  <TableCell>{tutor.email}</TableCell>
                  <TableCell>{tutor.coursePhase}</TableCell>
                  <TableCell>{tutor.importedFrom}</TableCell>
                  <TableCell>{new Date(tutor.dateAdded).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Mail className="mr-2 h-4 w-4" />
                          <span>Email</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <UserMinus className="mr-2 h-4 w-4" />
                          <span>Remove</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
