enum SignupStatus {
  waitingInvite,
  ready,
  authorizingLine,
  registering,
  success,
  alreadyRegistered,
  error,
}

class SignupState {
  const SignupState({
    required this.inviteToken,
    required this.status,
    this.errorMessage,
  });

  factory SignupState.initial() => const SignupState(
        inviteToken: '',
        status: SignupStatus.waitingInvite,
      );

  final String inviteToken;
  final SignupStatus status;
  final String? errorMessage;

  bool get hasInviteToken => inviteToken.isNotEmpty;

  bool get isBusy =>
      status == SignupStatus.authorizingLine ||
      status == SignupStatus.registering;

  bool get canStartSignup =>
      hasInviteToken &&
      (status == SignupStatus.ready ||
          status == SignupStatus.error ||
          status == SignupStatus.alreadyRegistered ||
          status == SignupStatus.waitingInvite);

  SignupState copyWith({
    String? inviteToken,
    SignupStatus? status,
    String? errorMessage,
    bool clearError = false,
  }) {
    return SignupState(
      inviteToken: inviteToken ?? this.inviteToken,
      status: status ?? this.status,
      errorMessage: clearError ? null : (errorMessage ?? this.errorMessage),
    );
  }

  String statusLabel() {
    switch (status) {
      case SignupStatus.waitingInvite:
        return '招待リンクを待機しています';
      case SignupStatus.ready:
        return 'LINE ログインの準備完了';
      case SignupStatus.authorizingLine:
        return 'LINE ログイン処理中';
      case SignupStatus.registering:
        return 'Supabase 登録処理中';
      case SignupStatus.success:
        return '登録が完了しました';
      case SignupStatus.alreadyRegistered:
        return 'すでに登録済みのアカウントです';
      case SignupStatus.error:
        return 'エラーが発生しました';
    }
  }
}
