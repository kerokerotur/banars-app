enum LoginStatus {
  idle,
  authenticating,
  success,
  userNotFound,
  error,
}

class LoginState {
  const LoginState({
    required this.status,
    this.errorMessage,
  });

  factory LoginState.initial() => const LoginState(
        status: LoginStatus.idle,
      );

  final LoginStatus status;
  final String? errorMessage;

  bool get isBusy => status == LoginStatus.authenticating;

  bool get canStartLogin =>
      status == LoginStatus.idle ||
      status == LoginStatus.error ||
      status == LoginStatus.userNotFound;

  LoginState copyWith({
    LoginStatus? status,
    String? errorMessage,
    bool clearError = false,
  }) {
    return LoginState(
      status: status ?? this.status,
      errorMessage: clearError ? null : (errorMessage ?? this.errorMessage),
    );
  }

  String statusLabel() {
    switch (status) {
      case LoginStatus.idle:
        return 'ログイン準備完了';
      case LoginStatus.authenticating:
        return 'ログイン処理中...';
      case LoginStatus.success:
        return 'ログインが完了しました';
      case LoginStatus.userNotFound:
        return '未登録のユーザーです';
      case LoginStatus.error:
        return 'エラーが発生しました';
    }
  }
}

