import type {
  AttendanceRemindRequest,
  AttendanceRemindResponse,
} from "./types.ts"
import type { IAttendanceRepository } from "@core/attendance/domain/irepository/attendance_repository.ts"
import type { IOneSignalPlayerRepository } from "@core/auth/domain/irepository/onesignal_player_repository.ts"
import type { IOneSignalNotificationService } from "@core/attendance/domain/service/ionesignal_notification_service.ts"

export interface AttendanceRemindDependencies {
  attendanceRepository: IAttendanceRepository
  onesignalPlayerRepository: IOneSignalPlayerRepository
  onesignalNotificationService: IOneSignalNotificationService
}

export async function executeAttendanceRemindUseCase(
  request: AttendanceRemindRequest,
  deps: AttendanceRemindDependencies,
): Promise<AttendanceRemindResponse> {
  const remindHoursBefore = request.remindHoursBefore ?? 24

  // 1. リマインド対象イベントを取得
  const targetEvents =
    await deps.attendanceRepository.findRemindTargetEvents(remindHoursBefore)

  const errors: Array<{
    eventId: string
    userId: string
    error: string
  }> = []
  let sentNotifications = 0

  // 2. 各イベントに対して処理
  for (const event of targetEvents) {
    // 2-1. 未回答ユーザーを取得
    const unrespondedUsers =
      await deps.attendanceRepository.findUnrespondedUsers(event.id)

    // 2-2. 各ユーザーのPlayer IDを取得
    for (const user of unrespondedUsers) {
      try {
        const playerIds =
          await deps.onesignalPlayerRepository.findActivePlayerIdsByUserId(
            user.userId,
          )

        if (playerIds.length === 0) {
          // Player IDが登録されていない場合はスキップ
          continue
        }

        // 2-3. 通知を送信
        const deadlineStr = event.responseDeadlineDatetime.toLocaleString("ja-JP")
        const sentPlayerIds = await deps.onesignalNotificationService.sendNotification(
          {
            playerIds,
            title: `${event.title}の出欠回答期限が迫っています`,
            body: `回答期限: ${deadlineStr}`,
            data: {
              eventId: event.id,
              type: "attendance_remind",
            },
          },
        )

        sentNotifications += sentPlayerIds.length

        // 送信に失敗したPlayer IDを無効化
        const failedPlayerIds = playerIds.filter(
          (id) => !sentPlayerIds.includes(id),
        )
        for (const playerId of failedPlayerIds) {
          try {
            await deps.onesignalPlayerRepository.deactivatePlayerId(
              user.userId,
              playerId,
            )
          } catch (error) {
            console.error(
              `Player ID無効化に失敗しました: ${user.userId}, ${playerId}`,
              error,
            )
          }
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error)
        errors.push({
          eventId: event.id,
          userId: user.userId,
          error: errorMessage,
        })
        console.error(
          `通知送信エラー: eventId=${event.id}, userId=${user.userId}`,
          error,
        )
      }
    }
  }

  return {
    processedEvents: targetEvents.length,
    sentNotifications,
    errors,
  }
}

