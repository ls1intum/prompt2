// Define the enum for roles
export enum Role {
  PROMPT_ADMIN = 'PROMPT_ADMIN',
  PROMPT_LECTURER = 'PROMPT_LECTURER',
  COURSE_LECTURER = 'LECTURER',
  COURSE_EDITOR = 'EDITOR',
  COURSE_STUDENT = 'STUDENT',
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
