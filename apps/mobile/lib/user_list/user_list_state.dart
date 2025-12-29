import 'package:mobile/user_list/models/user_list_item.dart';

enum UserListStatus {
  loading,
  loaded,
  error,
}

class UserListState {
  const UserListState({
    required this.status,
    this.users = const [],
    this.errorMessage,
  });

  factory UserListState.initial() => const UserListState(
        status: UserListStatus.loading,
      );

  final UserListStatus status;
  final List<UserListItem> users;
  final String? errorMessage;

  bool get isLoading => status == UserListStatus.loading;
  bool get isLoaded => status == UserListStatus.loaded;
  bool get hasError => status == UserListStatus.error;

  UserListState copyWith({
    UserListStatus? status,
    List<UserListItem>? users,
    String? errorMessage,
    bool clearError = false,
  }) {
    return UserListState(
      status: status ?? this.status,
      users: users ?? this.users,
      errorMessage: clearError ? null : (errorMessage ?? this.errorMessage),
    );
  }
}
