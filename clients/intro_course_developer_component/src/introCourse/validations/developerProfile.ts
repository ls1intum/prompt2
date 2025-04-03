import * as z from 'zod'

const udidSchema = z
  .union([
    z.string().regex(/^[0-9A-Fa-f]{8}-[0-9A-Fa-f]{16}$/, 'Invalid UDID format'),
    z.literal(''),
  ])
  .optional()

export const developerFormSchema = z
  .object({
    appleID: z.string().email('Apple ID must be a valid email address'),
    gitLabUsername: z.string().min(1, 'GitLab username is required'),
    hasMacBook: z.boolean(),
    hasIPhone: z.boolean(),
    iPhoneUDID: udidSchema,
    hasIPad: z.boolean(),
    iPadUDID: udidSchema,
    hasAppleWatch: z.boolean(),
    appleWatchUDID: udidSchema,
  })
  .superRefine((values, ctx) => {
    if (values.hasIPhone && (!values.iPhoneUDID || values.iPhoneUDID === '')) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'iPhone UDID is required when you have an iPhone',
        path: ['iPhoneUDID'],
      })
    }
    if (values.hasIPad && (!values.iPadUDID || values.iPadUDID === '')) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'iPad UDID is required when you have an iPad',
        path: ['iPadUDID'],
      })
    }
    if (values.hasAppleWatch && (!values.appleWatchUDID || values.appleWatchUDID === '')) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Apple Watch UDID is required when you have an Apple Watch',
        path: ['appleWatchUDID'],
      })
    }
  })

export type DeveloperFormValues = z.infer<typeof developerFormSchema>
