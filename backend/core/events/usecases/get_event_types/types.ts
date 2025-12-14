/**
 * イベント種別
 */
export interface EventTypeDto {
  id: string
  name: string
  displayOrder: number
}

/**
 * イベント種別取得ユースケースのレスポンス
 */
export type GetEventTypesUseCaseResponse = EventTypeDto[]

/**
 * イベント種別取得ユースケースの依存関係
 */
export interface GetEventTypesDependencies {
  // 将来的にリポジトリが必要になった場合に追加
}
