import type { EventListItem } from "@core/events/usecases/event_list/types.ts"

export interface EventListResponse {
  events: EventListItem[]
}
