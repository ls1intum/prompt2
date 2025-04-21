import { Laptop, MessageSquare, Star, Languages, BarChart3 } from 'lucide-react'
import type { StudentCheck } from '../../../interfaces/studentCheck'

export const checksConfig: StudentCheck[] = [
  // Devices
  {
    label: 'Devices',
    extractor: (s) => s.devices,
    isEmpty: (arr) => arr.length === 0,
    missingMessage: 'devices information',
    problemDescription:
      'No students have information on which devices they have. Please check if your previous course phases ' +
      '(e.g. application) forward information on available devices to this phase.',
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
    problemDescription:
      'No students have comments from tutors. Please check if your previous course phases forward ' +
      'information on tutor comments to this phase.',
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
    problemDescription:
      'No students have comments from students. Please check if your previous course phases forward ' +
      'information on student comments to this phase.',
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
    problemDescription:
      'No students have score levels. Please check if your previous course phases forward ' +
      'information on score levels to this phase.',
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
    problemDescription:
      'No students have English proficiency levels. Please check if your previous course phases forward ' +
      'information on English proficiency levels to this phase.',
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
    problemDescription:
      'No students have German proficiency levels. Please check if your previous course phases forward ' +
      'information on German proficiency levels to this phase.',
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
    problemDescription: 'No students have submitted the required survey.',
    userHint: 'Track whether students have submitted the required survey.',
    category: 'survey',
    highLevelCategory: 'survey',
    icon: <BarChart3 className='h-4 w-4' />,
  },
]
