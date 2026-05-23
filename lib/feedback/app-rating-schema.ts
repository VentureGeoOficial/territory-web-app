import { z } from 'zod'

export const APP_RATING_MAX_COMMENT = 250

export const appRatingSubmitSchema = z.object({
  stars: z.number().int().min(1).max(5),
  comment: z
    .string()
    .max(APP_RATING_MAX_COMMENT)
    .optional()
    .transform((v) => (v === undefined ? undefined : v.trim())),
})

export type AppRatingSubmitInput = z.infer<typeof appRatingSubmitSchema>
