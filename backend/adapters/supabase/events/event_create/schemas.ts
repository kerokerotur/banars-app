import { z } from "zod"

/**
 * event_create APIのリクエストボディスキーマ
 */
export const eventCreateRequestSchema = z.object({
  title: z.string().min(1, "タイトルは必須です"),
  eventTypeId: z.string().uuid("イベント種別IDが不正です"),
  startDatetime: z
    .union([
      z.string().datetime({ offset: true }).transform((val) => new Date(val)),
      z.null(),
    ])
    .optional(),
  meetingDatetime: z
    .union([
      z.string().datetime({ offset: true }).transform((val) => new Date(val)),
      z.null(),
    ])
    .optional(),
  responseDeadlineDatetime: z
    .union([
      z.string().datetime({ offset: true }).transform((val) => new Date(val)),
      z.null(),
    ])
    .optional(),
  place: z.object({
    name: z.string().min(1, "会場名は必須です"),
    googleMapsUrl: z.string().url("Google Maps URLが不正です").min(1, "Google Maps URLは必須です"),
  }),
  notesMarkdown: z.string().optional(),
})

export type EventCreateRequest = z.infer<typeof eventCreateRequestSchema>
