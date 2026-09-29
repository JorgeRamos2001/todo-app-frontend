import { z } from 'zod'

export const boardFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Title is required')
    .max(255, 'Title must be at most 255 characters'),
  description: z.string(),
  type: z.enum(['PERSONAL', 'COLLABORATIVE']),
})

export type BoardFormValues = z.infer<typeof boardFormSchema>
