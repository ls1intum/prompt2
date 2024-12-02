export enum CourseType {
  LECTURE = 'LECTURE',
  SEMINAR = 'SEMINAR',
  PROJECT = 'PROJECT',
}

export const CourseTypeDetails: { [key in CourseType]: { name: string; ects?: number } } = {
  [CourseType.LECTURE]: { name: 'Lecture' },
  [CourseType.SEMINAR]: { name: 'Seminar', ects: 5 },
  [CourseType.PROJECT]: { name: 'Practical Course', ects: 10 },
}
