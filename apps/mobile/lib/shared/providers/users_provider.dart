import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:mobile/config/app_env.dart';
import 'package:mobile/shared/services/supabase_function_service.dart';
import 'package:mobile/shared/models/user_info.dart';
import 'package:mobile/shared/providers/users_state.dart';

final usersProvider = NotifierProvider<UsersNotifier, UsersState>(
  () => UsersNotifier(),
);

class UsersNotifier extends Notifier<UsersState> {
  late final SupabaseClient _supabaseClient;

  @override
  UsersState build() {
    _supabaseClient = Supabase.instance.client;
    // アプリ起動時に自動的に取得
    Future.microtask(() => fetchUsers());
    return UsersState.initial();
  }

  Future<void> fetchUsers() async {
    if (state.isLoading) return;

    state = state.copyWith(status: UsersStatus.loading, clearError: true);

    try {
      final response = await SupabaseFunctionService.invoke(
        client: _supabaseClient,
        functionName: AppEnv.userListFunctionName,
        method: HttpMethod.get,
      );

      final data = response.data;
      if (data is! Map<String, dynamic>) {
        throw Exception('ユーザー一覧のレスポンスが不正です');
      }

      final usersData = data['users'];
      if (usersData is! List) {
        throw Exception('ユーザー一覧のデータが不正です');
      }

      final users = usersData
          .map((json) => UserInfo.fromJson(json as Map<String, dynamic>))
          .toList();

      // ListからMapに変換（userId をキーとする）
      final usersMap = <String, UserInfo>{};
      for (final user in users) {
        usersMap[user.userId] = user;
      }

      state = state.copyWith(
        status: UsersStatus.loaded,
        usersMap: usersMap,
        clearError: true,
      );
    } catch (error) {
      state = state.copyWith(
        status: UsersStatus.error,
        errorMessage: 'ユーザー情報の取得に失敗しました: $error',
      );
    }
  }
}
