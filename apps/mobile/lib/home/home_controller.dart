import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import 'package:mobile/config/app_env.dart';
import 'package:mobile/shared/services/supabase_function_service.dart';
import 'package:mobile/shared/services/supabase_function_error_handler.dart';
import 'package:mobile/home/home_state.dart';

final homeControllerProvider =
    NotifierProvider<HomeController, HomeState>(HomeController.new);

class HomeController extends Notifier<HomeState> {
  late final SupabaseClient _supabaseClient;

  @override
  HomeState build() {
    _supabaseClient = Supabase.instance.client;
    // 初回ビルド時にユーザー情報を取得
    Future.microtask(() => fetchUserProfile());
    return HomeState.initial();
  }

  Future<void> fetchUserProfile() async {
    state = state.copyWith(
      status: HomeStatus.loading,
      clearError: true,
    );

    try {
      final response = await SupabaseFunctionService.invoke(
        client: _supabaseClient,
        functionName: AppEnv.getMeFunctionName,
        method: HttpMethod.get,
      );

      final data = response.data;
      if (data is! Map<String, dynamic>) {
        throw const HomeException('ユーザー情報の取得に失敗しました。');
      }

      final userProfile = UserProfile(
        userId: data['userId'] as String? ?? '',
        displayName: data['displayName'] as String? ?? '名前未設定',
        avatarUrl: data['avatarUrl'] as String?,
        role: data['role'] as String?,
      );

      state = state.copyWith(
        status: HomeStatus.loaded,
        userProfile: userProfile,
        clearError: true,
      );
    } on FunctionException catch (error) {
      state = state.copyWith(
        status: HomeStatus.error,
        errorMessage:
            SupabaseFunctionErrorHandler.extractErrorMessage(error.details) ??
                error.reasonPhrase ??
                'ユーザー情報の取得に失敗しました。',
      );
    } catch (error) {
      state = state.copyWith(
        status: HomeStatus.error,
        errorMessage: 'ユーザー情報の取得に失敗しました: $error',
      );
    }
  }
}

class HomeException implements Exception {
  const HomeException(this.message);
  final String message;
}

