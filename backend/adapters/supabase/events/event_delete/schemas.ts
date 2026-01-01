import { z } from "zod"

/**
 * event_delete API のリクエストボディスキーマ
 */
export const eventDeleteRequestSchema = z.object({
  event_id: z.string().uuid("不正なイベントIDです"),
})

export type EventDeleteRequest = z.infer<typeof eventDeleteRequestSchema>
