/**
 * イベント種別リポジトリインターフェース
 */
export interface IEventTypeRepository {
  /**
   * イベント種別が存在するか確認する
   */
  exists(eventTypeId: string): Promise<boolean>
}
