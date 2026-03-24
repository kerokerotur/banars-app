import type { ILineMessagingService } from "@core/auth/usecases/registration_approve/types.ts"

export class LineMessagingService implements ILineMessagingService {
  constructor(private readonly channelAccessToken: string) {}

  async pushMessage(lineUserId: string, text: string): Promise<void> {
    const response = await fetch("https://api.line.me/v2/bot/message/push", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.channelAccessToken}`,
      },
      body: JSON.stringify({
        to: lineUserId,
        messages: [{ type: "text", text }],
      }),
    })

    if (!response.ok) {
      const body = await response.text()
      throw new Error(
        `LINE push failed: ${response.status} ${response.statusText} - ${body}`,
      )
    }
  }
}
