import * as z from 'zod'

export const instructorDevProfile = z.object({
  appleID: z.string().email('Invalid email address'),
  gitLabUsername: z.string(),
  hasMacBook: z.boolean(),
  // Preprocess empty strings to undefined before validating UUID
  iPhoneUUID: z.preprocess(
    (a) => (a === '' ? undefined : a),
    z.string().uuid('Invalid iPhone UUID').optional(),
  ),
  iPadUUID: z.preprocess(
    (a) => (a === '' ? undefined : a),
    z.string().uuid('Invalid iPad UUID').optional(),
  ),
  appleWatchUUID: z.preprocess(
    (a) => (a === '' ? undefined : a),
    z.string().uuid('Invalid Apple Watch UUID').optional(),
  ),
})

export type InstructorDeveloperFormValues = z.infer<typeof instructorDevProfile>
