import { FileText, Laptop, MessageSquare, Star, Languages, BarChart3 } from 'lucide-react'
import type { StudentCheck } from '../../../interfaces/studentCheck'

export const checksConfig: StudentCheck[] = [
  // Data from previous phases
  {
    label: 'First Name',
    extractor: (s) => s.firstName,
    isEmpty: (v) => !v,
    missingMessage: 'first names',
    userHint: 'This data should be forwarded from previous phases.',
    category: 'previous',
    highLevelCategory: 'previous',
    icon: <FileText className='h-4 w-4' />,
  },
  {
    label: 'Last Name',
    extractor: (s) => s.lastName,
    isEmpty: (v) => !v,
    missingMessage: 'last names',
    userHint: 'This data should be forwarded from previous phases.',
    category: 'previous',
    highLevelCategory: 'previous',
    icon: <FileText className='h-4 w-4' />,
  },
  {
    label: 'Gender',
    extractor: (s) => s.gender,
    isEmpty: (v) => !v,
    missingMessage: 'gender info',
    userHint: 'This data should be forwarded from previous phases.',
    category: 'previous',
    highLevelCategory: 'previous',
    icon: <FileText className='h-4 w-4' />,
  },
  {
    label: 'Nationality',
    extractor: (s) => s.nationality,
    isEmpty: (v) => !v,
    missingMessage: 'nationality info',
    userHint: 'This data should be forwarded from previous phases.',
    category: 'previous',
    highLevelCategory: 'previous',
    icon: <FileText className='h-4 w-4' />,
  },
  {
    label: 'Study Degree',
    extractor: (s) => s.studyDegree,
    isEmpty: (v) => !v,
    missingMessage: 'study degree info',
    userHint: 'This data should be forwarded from previous phases.',
    category: 'previous',
    highLevelCategory: 'previous',
    icon: <FileText className='h-4 w-4' />,
  },
  {
    label: 'Study Program',
    extractor: (s) => s.studyProgram,
    isEmpty: (v) => !v,
    missingMessage: 'study program info',
    userHint: 'This data should be forwarded from previous phases.',
    category: 'previous',
    highLevelCategory: 'previous',
    icon: <FileText className='h-4 w-4' />,
  },
  {
    label: 'Semester',
    extractor: (s) => s.semester,
    isEmpty: (v) => v === 0,
    missingMessage: 'semester info',
    userHint: 'This data should be forwarded from previous phases.',
    category: 'previous',
    highLevelCategory: 'previous',
    icon: <FileText className='h-4 w-4' />,
  },

  // Devices
  {
    label: 'Devices',
    extractor: (s) => s.devices,
    isEmpty: (arr) => arr.length === 0,
    missingMessage: 'devices information',
    userHint:
      'Include a question about what kind of devices (laptop, tablet) students can use during the course.',
    category: 'devices',
    highLevelCategory: 'previous',
    icon: <Laptop className='h-4 w-4' />,
  },

  // Comments
  {
    label: 'Tutor Comments',
    extractor: (s) => s.tutorComments,
    isEmpty: (arr) => !arr || arr.length === 0,
    missingMessage: 'tutor comments',
    userHint: 'Ensure tutors can provide comments on student performance.',
    category: 'comments',
    highLevelCategory: 'previous',
    icon: <MessageSquare className='h-4 w-4' />,
  },
  {
    label: 'Student Comments',
    extractor: (s) => s.studentComments,
    isEmpty: (arr) => !arr || arr.length === 0,
    missingMessage: 'student comments',
    userHint: 'Allow students to provide feedback or comments.',
    category: 'comments',
    highLevelCategory: 'previous',
    icon: <MessageSquare className='h-4 w-4' />,
  },

  // ScoreLevel
  {
    label: 'Score Level',
    extractor: (s) => s.introCourseProficiency,
    isEmpty: (v) => v === undefined || v === null,
    missingMessage: 'score level information',
    userHint: 'Ensure score levels are assigned to students.',
    category: 'score',
    highLevelCategory: 'previous',
    icon: <Star className='h-4 w-4' />,
  },

  // Language Proficiency
  {
    label: 'English Proficiency',
    extractor: (s) => s.languages?.find((l) => l.language === 'English')?.proficiency,
    isEmpty: (v) => !v,
    missingMessage: 'English proficiency levels',
    userHint:
      'Add application question with possible answers "A1/A2, B1/B2, C1/C2, Native" and export with access key "language_proficiency_english".',
    category: 'language',
    highLevelCategory: 'previous',
    icon: <Languages className='h-4 w-4' />,
  },
  {
    label: 'German Proficiency',
    extractor: (s) => s.languages?.find((l) => l.language === 'German')?.proficiency,
    isEmpty: (v) => !v,
    missingMessage: 'German proficiency levels',
    userHint:
      'Add application question with possible answers "A1/A2, B1/B2, C1/C2, Native" and export with access key "language_proficiency_german".',
    category: 'language',
    highLevelCategory: 'previous',
    icon: <Languages className='h-4 w-4' />,
  },

  // Survey Results
  {
    label: 'Survey Submission',
    extractor: (s) => s.projectPreferences,
    isEmpty: (arr) => arr.length === 0,
    missingMessage: 'survey submissions',
    userHint: 'Track whether students have submitted the required survey.',
    category: 'survey',
    highLevelCategory: 'survey',
    icon: <BarChart3 className='h-4 w-4' />,
  },
]
