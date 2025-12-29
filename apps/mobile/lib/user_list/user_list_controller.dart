import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:mobile/config/app_env.dart';
import 'package:mobile/user_list/user_list_state.dart';
import 'package:mobile/user_list/models/user_list_item.dart';

/// ユーザ一覧コントローラのプロバイダー
final userListControllerProvider =
    StateNotifierProvider<UserListController, UserListState>(
  (ref) => UserListController(),
);

/// ユーザ一覧のコントローラ
class UserListController extends StateNotifier<UserListState> {
  UserListController() : super(UserListState.initial()) {
    _supabaseClient = Supabase.instance.client;
    // 初期化時にユーザー一覧を取得
    fetchUsers();
  }

  late final SupabaseClient _supabaseClient;

  /// ユーザ一覧を取得
  Future<void> fetchUsers() async {
    state = state.copyWith(status: UserListStatus.loading, clearError: true);

    try {
      final response = await _supabaseClient.functions.invoke(
        AppEnv.userListFunctionName,
        method: HttpMethod.get,
      );

      final data = response.data;
      if (data is! Map<String, dynamic>) {
        throw const UserListException('ユーザー一覧の取得に失敗しました');
      }

      final usersData = data['users'];
      if (usersData is! List) {
        throw const UserListException('ユーザー一覧のデータが不正です');
      }

      final users = usersData
          .map((json) => UserListItem.fromJson(json as Map<String, dynamic>))
          .toList();

      state = state.copyWith(
        status: UserListStatus.loaded,
        users: users,
      );
    } on FunctionException catch (error) {
      debugPrint('user_list FunctionException: ${error.details}');
      state = state.copyWith(
        status: UserListStatus.error,
        errorMessage: _extractErrorMessage(error.details) ??
            error.reasonPhrase ??
            'ユーザー一覧の取得に失敗しました',
      );
    } catch (error) {
      debugPrint('user_list error: $error');
      state = state.copyWith(
        status: UserListStatus.error,
        errorMessage: 'ユーザー一覧の取得に失敗しました: $error',
      );
    }
  }

  String? _extractErrorMessage(dynamic details) {
    if (details == null) return null;
    if (details is String) return details;
    if (details is Map<String, dynamic>) {
      final message = details['message'];
      if (message is String) return message;
      final error = details['error'];
      if (error is Map<String, dynamic>) {
        final errorMessage = error['message'];
        if (errorMessage is String) return errorMessage;
      }
    }
    return details.toString();
  }

  /// リフレッシュ
  Future<void> refresh() async {
    await fetchUsers();
  }
}

class UserListException implements Exception {
  const UserListException(this.message);
  final String message;
}
