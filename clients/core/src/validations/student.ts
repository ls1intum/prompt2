import * as z from 'zod'
import { Gender } from '@/interfaces/gender'

// TODO refine with acutal tum identifiers.
export const studentSchema = z
  .object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Invalid email address'),
    matriculationNumber: z.string().optional(),
    universityLogin: z.string().optional(),
    hasUniversityAccount: z.boolean(),
    gender: z.nativeEnum(Gender),
  })
  .refine(
    (data) => {
      if (data.hasUniversityAccount) {
        return (
          data.matriculationNumber &&
          data.matriculationNumber.length > 0 &&
          data.universityLogin &&
          data.universityLogin.length > 0
        )
      }
      return true
    },
    {
      message:
        'Matriculation number and university login are required when the student has a university account',
      path: ['matriculationNumber', 'universityLogin'],
    },
  )

export type StudentFormValues = z.infer<typeof studentSchema>
