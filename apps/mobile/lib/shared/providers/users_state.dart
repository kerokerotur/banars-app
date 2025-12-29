import 'package:mobile/shared/models/user_info.dart';

enum UsersStatus {
  initial,
  loading,
  loaded,
  error,
}

class UsersState {
  const UsersState({
    required this.status,
    this.usersMap = const {},
    this.errorMessage,
  });

  factory UsersState.initial() => const UsersState(
        status: UsersStatus.initial,
      );

  final UsersStatus status;
  final Map<String, UserInfo> usersMap;
  final String? errorMessage;

  bool get isLoading => status == UsersStatus.loading;
  bool get isLoaded => status == UsersStatus.loaded;
  bool get hasError => status == UsersStatus.error;

  /// userId から UserInfo を取得（O(1)の高速検索）
  UserInfo? getUserById(String userId) {
    return usersMap[userId];
  }

  /// 全ユーザーをリストで取得（表示用）
  List<UserInfo> getAllUsers() {
    return usersMap.values.toList();
  }

  UsersState copyWith({
    UsersStatus? status,
    Map<String, UserInfo>? usersMap,
    String? errorMessage,
    bool clearError = false,
  }) {
    return UsersState(
      status: status ?? this.status,
      usersMap: usersMap ?? this.usersMap,
      errorMessage: clearError ? null : errorMessage ?? this.errorMessage,
    );
  }
}
