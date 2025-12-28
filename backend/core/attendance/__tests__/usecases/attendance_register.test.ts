import { describe, expect, it } from "vitest"
import { executeAttendanceRegisterUseCase } from "@core/attendance/usecases/attendance_register/usecase.ts"
import { AttendanceRegisterError } from "@core/attendance/domain/errors/attendance_register_error.ts"
import type { IAttendanceRepository } from "@core/attendance/domain/irepository/attendance_repository.ts"
import type { AttendanceRegisterResponse } from "@core/attendance/usecases/attendance_register/types.ts"

function createMockRepository(opts: {
  eventExists?: boolean
  deadline?: Date | null
  upsertResult?: AttendanceRegisterResponse
}): IAttendanceRepository {
  return {
    findEventById: async () => {
      if (opts.eventExists === false) return null
      return {
        id: "event-1",
        responseDeadlineDatetime: opts.deadline ?? null,
      }
    },
    upsertAttendance: async () =>
      opts.upsertResult ?? {
        id: "att-1",
        eventId: "event-1",
        memberId: "user-1",
        status: "attending",
        comment: null,
        createdAt: new Date("2025-12-01T00:00:00Z"),
        updatedAt: new Date("2025-12-01T00:00:00Z"),
      },
  }
}

describe("executeAttendanceRegisterUseCase", () => {
  it("eventId が必須", async () => {
    const repo = createMockRepository({})
    // @ts-expect-error intentionally missing eventId
    await expect(
      executeAttendanceRegisterUseCase(
        { userId: "user-1", status: "attending" },
        { attendanceRepository: repo },
      ),
    ).rejects.toBeInstanceOf(AttendanceRegisterError)
  })

  it("status が不正なら validation_error", async () => {
    const repo = createMockRepository({})
    // @ts-expect-error intentionally invalid status
    await expect(
      executeAttendanceRegisterUseCase(
        { userId: "user-1", eventId: "event-1", status: "unknown" },
        { attendanceRepository: repo },
      ),
    ).rejects.toMatchObject({ code: "validation_error", status: 400 })
  })

  it("イベントが存在しない場合は 404", async () => {
    const repo = createMockRepository({ eventExists: false })
    await expect(
      executeAttendanceRegisterUseCase(
        { userId: "user-1", eventId: "event-1", status: "attending" },
        { attendanceRepository: repo },
      ),
    ).rejects.toMatchObject({ code: "event_not_found", status: 404 })
  })

  it("締切後は 403", async () => {
    const repo = createMockRepository({ deadline: new Date("2025-01-01T00:00:00Z") })
    const now = () => new Date("2025-02-01T00:00:00Z")

    await expect(
      executeAttendanceRegisterUseCase(
        { userId: "user-1", eventId: "event-1", status: "attending" },
        { attendanceRepository: repo, nowProvider: now },
      ),
    ).rejects.toMatchObject({ code: "forbidden_after_deadline", status: 403 })
  })

  it("正常系: upsert結果を返す", async () => {
    const upsertResult: AttendanceRegisterResponse = {
      id: "att-99",
      eventId: "event-1",
      memberId: "user-1",
      status: "not_attending",
      comment: "欠席です",
      createdAt: new Date("2025-12-02T00:00:00Z"),
      updatedAt: new Date("2025-12-03T00:00:00Z"),
    }
    const repo = createMockRepository({ upsertResult })

    const result = await executeAttendanceRegisterUseCase(
      { userId: "user-1", eventId: "event-1", status: "not_attending", comment: "欠席です" },
      { attendanceRepository: repo },
    )

    expect(result).toEqual(upsertResult)
  })
})
