export enum CourseType {
  LECTURE = 'lecture',
  SEMINAR = 'seminar',
  PRACTICAL = 'practical course',
}

export const CourseTypeDetails: {
  [key in CourseType]: { name: string; ects?: number }
} = {
  [CourseType.LECTURE]: { name: 'Lecture' },
  [CourseType.SEMINAR]: { name: 'Seminar', ects: 5 },
  [CourseType.PRACTICAL]: { name: 'Practical Course', ects: 10 },
}
