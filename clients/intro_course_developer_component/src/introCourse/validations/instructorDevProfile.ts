import * as z from 'zod'

export const instructorDevProfile = z.object({
  appleID: z.string().email('Invalid email address'),
  gitLabUsername: z.string(),
  hasMacBook: z.boolean(),
  // Preprocess empty strings to undefined before validating UDID
  iPhoneUDID: z.preprocess(
    (a) => (a === '' ? undefined : a),
    z
      .string()
      .regex(/^[0-9A-Fa-f]{8}-[0-9A-Fa-f]{16}$/, 'Invalid iPhone UDID')
      .optional(),
  ),
  iPadUDID: z.preprocess(
    (a) => (a === '' ? undefined : a),
    z
      .string()
      .regex(/^[0-9A-Fa-f]{8}-[0-9A-Fa-f]{16}$/, 'Invalid iPad UDID')
      .optional(),
  ),
  appleWatchUDID: z.preprocess(
    (a) => (a === '' ? undefined : a),
    z
      .string()
      .regex(/^[0-9A-Fa-f]{8}-[0-9A-Fa-f]{16}$/, 'Invalid Apple Watch UDID')
      .optional(),
  ),
})

export type InstructorDeveloperFormValues = z.infer<typeof instructorDevProfile>
