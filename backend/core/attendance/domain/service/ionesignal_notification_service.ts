/**
 * OneSignal通知サービスインターフェース
 */
export interface SendNotificationParams {
  playerIds: string[]
  title: string
  body: string
  data?: Record<string, unknown>
}

export interface IOneSignalNotificationService {
  /**
   * OneSignal REST APIを使用して通知を送信する
   * @param params 通知送信パラメータ
   * @returns 送信に成功したPlayer IDのリスト
   */
  sendNotification(params: SendNotificationParams): Promise<string[]>
}

