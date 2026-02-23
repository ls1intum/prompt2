export interface NoteVersion {
  id: string
  content: string
  dateCreated: string
  versionNumber: number
}

export interface InstructorNote {
  id: string
  author: string
  authorName: string
  authorEmail: string
  forStudent: string
  dateCreated: string
  dateDeleted: string | null
  deletedBy: string | null
  versions: NoteVersion[]
}

export interface CreateInstructorNote {
  content: string
  new: boolean
  forNote?: string
}
