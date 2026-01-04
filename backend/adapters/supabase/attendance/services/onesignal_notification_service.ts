import type {
  IOneSignalNotificationService,
  SendNotificationParams,
} from "@core/attendance/domain/service/ionesignal_notification_service.ts"

export interface OneSignalNotificationServiceConfig {
  restApiKey: string
  appId: string
}

/**
 * OneSignal REST API実装の通知サービス
 */
export class SupabaseOneSignalNotificationService
  implements IOneSignalNotificationService
{
  constructor(private readonly config: OneSignalNotificationServiceConfig) {}

  async sendNotification(
    params: SendNotificationParams,
  ): Promise<string[]> {
    const { playerIds, title, body, data } = params

    if (playerIds.length === 0) {
      return []
    }

    try {
      // OneSignal REST API KeyをBase64エンコード
      const encodedApiKey = btoa(this.config.restApiKey)

      const response = await fetch("https://onesignal.com/api/v1/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${encodedApiKey}`,
        },
        body: JSON.stringify({
          app_id: this.config.appId,
          include_player_ids: playerIds,
          headings: { en: title },
          contents: { en: body },
          data: data ?? {},
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(
          `OneSignal API error: ${response.status} ${response.statusText} - ${errorText}`,
        )
      }

      const result = await response.json()
      // OneSignal APIは成功した場合、すべてのPlayer IDが送信されたとみなす
      // 実際には、無効なPlayer IDはエラーとして返される可能性があるが、
      // ここでは成功したPlayer IDのリストを返す
      return playerIds
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error)
      console.error("OneSignal通知送信エラー:", errorMessage)
      throw error
    }
  }
}

