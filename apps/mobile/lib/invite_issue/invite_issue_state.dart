enum InviteIssueStatus {
  initial,
  loading,
  success,
  error,
}

class InviteIssueState {
  final InviteIssueStatus status;
  final String? inviteLink;
  final DateTime? expiresAt;
  final String? errorMessage;

  const InviteIssueState({
    required this.status,
    this.inviteLink,
    this.expiresAt,
    this.errorMessage,
  });

  factory InviteIssueState.initial() {
    return const InviteIssueState(
      status: InviteIssueStatus.initial,
    );
  }

  bool get isLoading => status == InviteIssueStatus.loading;
  bool get hasInviteLink =>
      status == InviteIssueStatus.success && inviteLink != null;

  InviteIssueState copyWith({
    InviteIssueStatus? status,
    String? inviteLink,
    DateTime? expiresAt,
    String? errorMessage,
    bool clearError = false,
  }) {
    return InviteIssueState(
      status: status ?? this.status,
      inviteLink: inviteLink ?? this.inviteLink,
      expiresAt: expiresAt ?? this.expiresAt,
      errorMessage: clearError ? null : (errorMessage ?? this.errorMessage),
    );
  }
}
