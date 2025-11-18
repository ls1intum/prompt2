export const DEFAULT_COURSE_COLOR = 'bg-gray-100'
export const DEFAULT_COURSE_ICON = 'graduation-cap'

export const courseAppearanceColors = [
  DEFAULT_COURSE_COLOR,
  'bg-gray-50',
  'bg-red-100',
  'bg-yellow-100',
  'bg-green-100',
  'bg-blue-100',
  'bg-indigo-100',
  'bg-purple-100',
  'bg-pink-100',
  'bg-orange-100',
  'bg-teal-100',
  'bg-cyan-100',
] as const

export type CourseAppearanceColor = (typeof courseAppearanceColors)[number]
