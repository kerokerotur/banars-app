/**
 * OneSignal Player IDリポジトリのインターフェース
 */

export interface UpsertOneSignalPlayerParams {
  userId: string
  playerId: string
  updatedUser?: string
}

export interface IOneSignalPlayerRepository {
  /**
   * OneSignal Player IDを登録または更新する
   * @param params 登録/更新パラメータ
   */
  upsert(params: UpsertOneSignalPlayerParams): Promise<void>

  /**
   * ユーザーIDに紐づく有効なPlayer IDのリストを取得する
   * @param userId ユーザーID
   * @returns Player IDのリスト
   */
  findActivePlayerIdsByUserId(userId: string): Promise<string[]>

  /**
   * Player IDを無効化する
   * @param userId ユーザーID
   * @param playerId Player ID
   */
  deactivatePlayerId(userId: string, playerId: string): Promise<void>
}

