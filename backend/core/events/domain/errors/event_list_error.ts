/**
 * イベント一覧取得時のドメインエラー
 */
export class EventListError extends Error {
  constructor(
    public readonly code: "internal_error",
    message: string,
    public readonly status: number = 500,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message)
    this.name = "EventListError"
  }
}
