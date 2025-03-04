import * as z from 'zod'

export const developerFormSchema = z
  .object({
    appleID: z.string().email('Apple ID must be a valid email address'),
    gitLabUsername: z.string().min(1, 'GitLab username is required'),
    hasMacBook: z.boolean(),
    hasIPhone: z.boolean(),
    iPhoneUUID: z.union([z.string().uuid('Invalid UUID'), z.literal('')]).optional(),
    hasIPad: z.boolean(),
    iPadUUID: z.union([z.string().uuid('Invalid UUID'), z.literal('')]).optional(),
    hasAppleWatch: z.boolean(),
    appleWatchUUID: z.union([z.string().uuid('Invalid UUID'), z.literal('')]).optional(),
  })
  .superRefine((values, ctx) => {
    // If the user answered "yes", then require a UUID.
    if (values.hasIPhone && (!values.iPhoneUUID || values.iPhoneUUID === '')) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'iPhone UUID is required when you have an iPhone',
        path: ['iPhoneUUID'],
      })
    }
    if (values.hasIPad && (!values.iPadUUID || values.iPadUUID === '')) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'iPad UUID is required when you have an iPad',
        path: ['iPadUUID'],
      })
    }
    if (values.hasAppleWatch && (!values.appleWatchUUID || values.appleWatchUUID === '')) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Apple Watch UUID is required when you have an Apple Watch',
        path: ['appleWatchUUID'],
      })
    }
  })

export type DeveloperFormValues = z.infer<typeof developerFormSchema>
