import 'package:flutter/services.dart';
import 'package:flutter_line_sdk/flutter_line_sdk.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import 'package:mobile/config/app_env.dart';
import 'package:mobile/login/login_state.dart';

final loginControllerProvider =
    NotifierProvider<LoginController, LoginState>(LoginController.new);

class LoginController extends Notifier<LoginState> {
  late final SupabaseClient _supabaseClient;

  @override
  LoginState build() {
    _supabaseClient = Supabase.instance.client;
    return LoginState.initial();
  }

  Future<void> startLogin() async {
    if (!state.canStartLogin) {
      return;
    }

    try {
      state = state.copyWith(
        status: LoginStatus.authenticating,
        clearError: true,
      );

      // LINE認証を実行
      final loginResult = await LineSDK.instance.login(
        scopes: const ['profile', 'openid', 'email'],
      );

      final idToken = loginResult.accessToken.idTokenRaw;
      if (idToken == null) {
        throw const LoginFlowException('LINE ID Token を取得できませんでした。');
      }

      // Edge Function を呼び出し
      final response = await _invokeLineLogin(idToken: idToken);

      // セッションを交換
      await _exchangeSession(response.sessionTransferToken);

      state = state.copyWith(
        status: LoginStatus.success,
        clearError: true,
      );
    } on LoginFlowException catch (error) {
      state = state.copyWith(
        status: LoginStatus.error,
        errorMessage: error.message,
      );
    } on PlatformException catch (error) {
      final isCanceled = error.code.toUpperCase() == 'CANCELED';
      final message = isCanceled
          ? 'LINE ログインをキャンセルしました。'
          : 'LINE ログインに失敗しました: ${error.message ?? error.code}';
      state = state.copyWith(
        status: isCanceled ? LoginStatus.idle : LoginStatus.error,
        errorMessage: message,
      );
    } on FunctionException catch (error) {
      final errorCode = _extractFunctionErrorCode(error.details);
      final isUserNotFound = errorCode == 'user_not_found';
      final fallbackMessage =
          error.reasonPhrase ?? 'Edge Function でエラーが発生しました。';
      state = state.copyWith(
        status: isUserNotFound ? LoginStatus.userNotFound : LoginStatus.error,
        errorMessage: isUserNotFound
            ? '登録されていないユーザーです。招待リンクから初回登録を行ってください。'
            : (_stringifyDetails(error.details) ?? fallbackMessage),
      );
    } on AuthException catch (error) {
      state = state.copyWith(
        status: LoginStatus.error,
        errorMessage: error.message,
      );
    } catch (error) {
      state = state.copyWith(
        status: LoginStatus.error,
        errorMessage: '不明なエラーが発生しました: $error',
      );
    }
  }

  Future<void> _exchangeSession(String sessionTransferToken) async {
    try {
      await _supabaseClient.auth.verifyOTP(
        tokenHash: sessionTransferToken,
        type: OtpType.magiclink,
      );
    } on AuthException {
      await _supabaseClient.auth.exchangeCodeForSession(sessionTransferToken);
    }
  }

  Future<_LineLoginResponse> _invokeLineLogin({
    required String idToken,
  }) async {
    final response = await _supabaseClient.functions.invoke(
      AppEnv.lineLoginFunctionName,
      body: {
        'idToken': idToken,
      },
    );

    final data = response.data;
    if (data is! Map<String, dynamic>) {
      throw const LoginFlowException('Edge Function からのレスポンスが不正です。');
    }

    return _LineLoginResponse.fromJson(data);
  }

  void reset() {
    state = LoginState.initial();
  }
}

class _LineLoginResponse {
  _LineLoginResponse({
    required this.sessionTransferToken,
  });

  factory _LineLoginResponse.fromJson(Map<String, dynamic> json) {
    final token = json['sessionTransferToken'] as String?;
    if (token == null || token.isEmpty) {
      throw const LoginFlowException('セッショントークンが取得できませんでした。');
    }
    return _LineLoginResponse(
      sessionTransferToken: token,
    );
  }

  final String sessionTransferToken;
}

class LoginFlowException implements Exception {
  const LoginFlowException(this.message);
  final String message;
}

String? _extractFunctionErrorCode(dynamic details) {
  if (details is Map<String, dynamic>) {
    final code = details['code'];
    if (code is String) {
      return code;
    }
  }
  if (details is String) {
    return details;
  }
  return null;
}

String? _stringifyDetails(dynamic details) {
  if (details == null) {
    return null;
  }
  if (details is String) {
    return details;
  }
  return details.toString();
}

