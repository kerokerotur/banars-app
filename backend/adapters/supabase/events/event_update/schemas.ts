import { z } from "zod"

/**
 * event_update API のリクエストボディスキーマ
 */
export const eventUpdateRequestSchema = z.object({
  eventId: z.string().uuid("eventId が不正です"),
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
  eventPlaceId: z
    .union([z.string().uuid("会場IDが不正です"), z.null()])
    .optional(),
  notesMarkdown: z.string().optional(),
})

export type EventUpdateRequest = z.infer<typeof eventUpdateRequestSchema>
