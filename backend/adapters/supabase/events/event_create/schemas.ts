import { z } from "zod"

/**
 * event_create APIのリクエストボディスキーマ
 */
export const eventCreateRequestSchema = z.object({
  title: z.string().min(1, "タイトルは必須です"),
  eventTypeId: z.string().uuid("イベント種別IDが不正です"),
  startDatetime: z
    .string()
    .datetime()
    .nullable()
    .optional()
    .transform((val) => (val ? new Date(val) : null)),
  meetingDatetime: z
    .string()
    .datetime()
    .nullable()
    .optional()
    .transform((val) => (val ? new Date(val) : null)),
  responseDeadlineDatetime: z
    .string()
    .datetime()
    .nullable()
    .optional()
    .transform((val) => (val ? new Date(val) : null)),
  place: z.object({
    name: z.string().min(1, "会場名は必須です"),
    address: z.string().min(1, "住所は必須です"),
    latitude: z.number().nullable().optional(),
    longitude: z.number().nullable().optional(),
    osmId: z.number().int().nullable().optional(),
    osmType: z.string().nullable().optional(),
  }),
  notesMarkdown: z.string().nullable().optional(),
})

export type EventCreateRequest = z.infer<typeof eventCreateRequestSchema>
