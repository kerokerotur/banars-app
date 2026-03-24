import { RegistrationApplicationError } from "@core/auth/domain/errors/registration_application_error.ts"
import type {
  RegistrationApproveDependencies,
  RegistrationApproveRequest,
  RegistrationApproveResponse,
} from "./types.ts"

const APPROVE_MESSAGE =
  "登録申請が承認されました。アプリよりログインしてください。"

export async function executeRegistrationApproveUseCase(
  request: RegistrationApproveRequest,
  deps: RegistrationApproveDependencies,
): Promise<RegistrationApproveResponse> {
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

  // 重複登録チェック
  const existingUser = await deps.userRepository.findByLineId(
    application.lineUserId,
  )
  if (existingUser) {
    throw new RegistrationApplicationError(
      "already_registered",
      "このLINEアカウントは既に登録済みです。",
      409,
    )
  }

  // ユーザーを作成（user + user_detail）
  const userId = crypto.randomUUID()
  await deps.userRepository.upsert({
    id: userId,
    lineUserId: application.lineUserId,
    status: "active",
  })
  await deps.userDetailRepository.upsert({
    userId,
    displayName: application.displayName,
    avatarUrl: application.avatarUrl,
  })

  // 申請ステータスを approved に更新
  await deps.registrationApplicationRepository.updateStatus(
    request.applicationId,
    "approved",
    request.approverId,
  )

  // LINE Push 通知（失敗してもユーザー作成は成功扱い）
  try {
    await deps.lineMessagingService.pushMessage(
      application.lineUserId,
      APPROVE_MESSAGE,
    )
  } catch (err) {
    console.error("[registration_approve] LINE通知の送信に失敗しました:", err)
  }

  return { userId }
}
