import { describe, it, expect } from "vitest"
import { executeEventDetailUseCase } from "@core/events/usecases/event_detail/usecase.ts"
import type { IEventAttendanceRepository } from "@core/events/domain/irepository/event_attendance_repository.ts"
import { EventDetailError } from "@core/events/domain/errors/event_detail_error.ts"

function createMockRepo(rows: any[]): IEventAttendanceRepository {
  return {
    findStatusesByUser: async () => new Map(),
    findByEventId: async () => rows,
  }
}

describe("executeEventDetailUseCase", () => {
  it("eventId が必須であること", async () => {
    const repo = createMockRepo([])
    await expect(
      // @ts-expect-error intentionally missing eventId
      executeEventDetailUseCase({}, { eventAttendanceRepository: repo }),
    ).rejects.toBeInstanceOf(EventDetailError)
  })

  it("出欠一覧をそのまま返す", async () => {
    const repo = createMockRepo([
      {
        id: "a1",
        memberId: "u1",
        status: "attending",
        comment: "OK",
        updatedAt: new Date("2025-12-01T00:00:00Z"),
      },
    ])

    const result = await executeEventDetailUseCase(
      { eventId: "event-1" },
      { eventAttendanceRepository: repo },
    )

    expect(result).toHaveLength(1)
    expect(result[0].memberId).toBe("u1")
    expect(result[0].status).toBe("attending")
  })
})
