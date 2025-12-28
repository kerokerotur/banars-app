import { describe, it, expect } from "vitest"
import { executeEventListUseCase } from "@core/events/usecases/event_list/usecase.ts"
import { EventListError } from "@core/events/domain/errors/event_list_error.ts"
import type { IEventListRepository } from "@core/events/domain/irepository/event_list_repository.ts"
import type { IEventAttendanceRepository } from "@core/events/domain/irepository/event_attendance_repository.ts"

function createMockRepos(opts: {
  events?: any[]
  attendanceMap?: Map<string, any>
}) {
  const eventListRepository: IEventListRepository = {
    fetchRecent: async () => opts.events ?? [],
  }
  const eventAttendanceRepository: IEventAttendanceRepository = {
    findStatusesByUser: async () => opts.attendanceMap ?? new Map(),
  }
  return { eventListRepository, eventAttendanceRepository }
}

describe("executeEventListUseCase", () => {
  it("イベント一覧と出欠をマージして返す", async () => {
    const { eventListRepository, eventAttendanceRepository } = createMockRepos({
      events: [
        {
          id: "e1",
          title: "試合",
          eventTypeId: "type1",
          eventTypeName: "試合",
          startDatetime: new Date("2025-12-25T10:00:00Z"),
          meetingDatetime: new Date("2025-12-25T09:00:00Z"),
          responseDeadlineDatetime: new Date("2025-12-24T15:00:00Z"),
          eventPlaceId: "p1",
          eventPlaceName: "東京ドーム",
          eventPlaceGoogleMapsUrlNormalized: "https://maps.google.com/?q=tokyo-dome",
          notesMarkdown: "持ち物: ユニフォーム",
          createdAt: new Date("2025-12-01T00:00:00Z"),
          updatedAt: new Date("2025-12-10T00:00:00Z"),
        },
      ],
      attendanceMap: new Map([["e1", "participating"]]),
    })

    const result = await executeEventListUseCase(
      { userId: "user1" },
      { eventListRepository, eventAttendanceRepository },
    )

    expect(result).toHaveLength(1)
    expect(result[0].userAttendanceStatus).toBe("participating")
    expect(result[0].eventPlaceGoogleMapsUrlNormalized).toBe(
      "https://maps.google.com/?q=tokyo-dome",
    )
    expect(result[0].notesMarkdown).toBe("持ち物: ユニフォーム")
  })

  it("出欠が存在しない場合は unanswered を返す", async () => {
    const { eventListRepository, eventAttendanceRepository } = createMockRepos({
      events: [
        {
          id: "e2",
          title: "練習",
          eventTypeId: "type2",
          eventTypeName: "練習",
          startDatetime: null,
          meetingDatetime: null,
          responseDeadlineDatetime: null,
          eventPlaceId: null,
          eventPlaceName: null,
          eventPlaceGoogleMapsUrlNormalized: null,
          notesMarkdown: null,
          createdAt: new Date("2025-12-01T00:00:00Z"),
          updatedAt: new Date("2025-12-10T00:00:00Z"),
        },
      ],
    })

    const result = await executeEventListUseCase(
      { userId: "user1" },
      { eventListRepository, eventAttendanceRepository },
    )

    expect(result[0].userAttendanceStatus).toBe("unanswered")
  })

  it("limit が 0 以下の場合はエラーを投げる", async () => {
    const repos = createMockRepos({})
    await expect(
      executeEventListUseCase(
        { userId: "user1", limit: 0 },
        {
          eventListRepository: repos.eventListRepository,
          eventAttendanceRepository: repos.eventAttendanceRepository,
        },
      ),
    ).rejects.toBeInstanceOf(EventListError)
  })
})
