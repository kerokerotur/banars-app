import { RegistrationApplicationError } from "@core/auth/domain/errors/registration_application_error.ts"
import type {
  RegistrationRejectDependencies,
  RegistrationRejectRequest,
  RegistrationRejectResponse,
} from "./types.ts"

const REJECT_MESSAGE =
  "登録申請が承認されませんでした。詳細はお問い合わせください。"

export async function executeRegistrationRejectUseCase(
  request: RegistrationRejectRequest,
  deps: RegistrationRejectDependencies,
): Promise<RegistrationRejectResponse> {
  // 申請を取得
  const application =
    await deps.registrationApplicationRepository.findById(request.applicationId)
  if (!application) {
    throw new RegistrationApplicationError(
      "application_not_found",
      "申請が見つかりません。",
      404,
    )
  }

  if (application.status !== "pending") {
    throw new RegistrationApplicationError(
      "invalid_status",
      "この申請は既に処理済みです。",
      409,
    )
  }

  // 申請ステータスを rejected に更新
  await deps.registrationApplicationRepository.updateStatus(
    request.applicationId,
    "rejected",
    request.rejecterId,
  )

  // LINE Push 通知（失敗してもステータス更新は成功扱い）
  try {
    await deps.lineMessagingService.pushMessage(
      application.lineUserId,
      REJECT_MESSAGE,
    )
  } catch (err) {
    console.error("[registration_reject] LINE通知の送信に失敗しました:", err)
  }

  return { applicationId: request.applicationId }
}
