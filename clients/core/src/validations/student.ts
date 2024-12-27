import * as z from 'zod'
import { Gender } from '@/interfaces/gender'

// Define the schema for a student form
export const studentBaseSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  gender: z.nativeEnum(Gender),
  hasUniversityAccount: z.literal(false), // Explicit literal for base case
})

// Define the schema for a university student form (extended)
export const studentUniversitySchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  gender: z.nativeEnum(Gender),
  hasUniversityAccount: z.literal(true), // Explicit literal for university case
  matriculationNumber: z.string().min(1, 'Matriculation number is required'),
  universityLogin: z.string().min(1, 'University login is required'),
})

// Define the discriminated union based on `hasUniversityAccount`
export const studentSchema = z.discriminatedUnion('hasUniversityAccount', [
  studentBaseSchema,
  studentUniversitySchema,
])

export const questionConfigSchema = z.discriminatedUnion('hasUniversityAccount', [
  studentBaseSchema,
  studentUniversitySchema,
])

export type StudentFormValues = z.infer<typeof studentSchema>
export type StudentBaseFormValues = z.infer<typeof studentBaseSchema>
export type StudentUniversityFormValues = z.infer<typeof studentUniversitySchema>
