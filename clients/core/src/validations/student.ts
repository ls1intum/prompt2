import * as z from 'zod'
import { Gender } from '@/interfaces/gender'
import translations from '@/lib/translations.json'

const universityLoginRegex = new RegExp(translations.university.universityLoginRegex)
const matriculationNumberRegex = new RegExp(translations.university.matriculationNumberRegex)

// Define the schema for a student form
export const studentBaseSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  gender: z.nativeEnum(Gender),
  has_university_account: z.literal(false), // Explicit literal for base case
})

// Define the schema for a university student form (extended)
export const studentUniversitySchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  gender: z.nativeEnum(Gender),
  has_university_account: z.literal(true), // Explicit literal for university case
  matriculation_number: z
    .string()
    .regex(
      matriculationNumberRegex,
      `Matriculation number must follow the pattern ${translations.university.matriculationExample}`,
    ),
  university_login: z
    .string()
    .regex(
      universityLoginRegex,
      `${translations.university.name} login should be of the format ${translations.university.universityLoginExample}`,
    ),
})

// Define the discriminated union based on `hasUniversityAccount`
export const studentSchema = z.discriminatedUnion('has_university_account', [
  studentBaseSchema,
  studentUniversitySchema,
])

export const questionConfigSchema = z.discriminatedUnion('has_university_account', [
  studentBaseSchema,
  studentUniversitySchema,
])

export type StudentFormValues = z.infer<typeof studentSchema>
export type StudentBaseFormValues = z.infer<typeof studentBaseSchema>
export type StudentUniversityFormValues = z.infer<typeof studentUniversitySchema>
