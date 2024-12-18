// Define the enum for roles
export enum Role {
  PROMPT_ADMIN = 'PROMPT_Admin',
  PROMPT_LECTURER = 'PROMPT_Lecturer',
  COURSE_LECTURER = 'Lecturer',
  COURSE_EDITOR = 'Editor',
  COURSE_STUDENT = 'Student',
}

// Function to get the permission string
export const getPermissionString = (
  role: Role,
  courseName?: string,
  courseSemesterTag?: string,
): string => {
  if (role === Role.PROMPT_ADMIN || role === Role.PROMPT_LECTURER) {
    return role
  }

  return `${courseName}-${courseSemesterTag}-${role}`
}
