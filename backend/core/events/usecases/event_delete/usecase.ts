import { EventDeleteError } from "@core/events/domain/errors/event_delete_error.ts"
import type {
  EventDeleteDependencies,
  EventDeleteRequest,
  EventDeleteResponse,
} from "./types.ts"

export async function executeEventDeleteUseCase(
  request: EventDeleteRequest,
  deps: EventDeleteDependencies,
): Promise<EventDeleteResponse> {
  if (!request.eventId) {
    throw new EventDeleteError("validation_error", "eventId は必須です", 400)
  }

  // 1. 対象イベントの存在確認
  const event = await deps.eventRepository.findById(request.eventId)
  if (!event) {
    throw new EventDeleteError("not_found", "イベントが見つかりません", 404)
  }

  // 2. 関連出欠を先に削除
  await deps.eventAttendanceRepository.deleteByEventId(request.eventId)

  // 3. イベント本体を削除
  await deps.eventRepository.delete(request.eventId)

  return { success: true }
}
