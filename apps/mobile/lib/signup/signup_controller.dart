import 'dart:async';

import 'package:app_links/app_links.dart';
import 'package:flutter/services.dart';
import 'package:flutter_line_sdk/flutter_line_sdk.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import 'package:mobile/config/app_env.dart';
import 'package:mobile/signup/signup_state.dart';
import 'package:mobile/shared/services/supabase_function_service.dart';
import 'package:mobile/shared/services/supabase_function_error_handler.dart';

final signupControllerProvider =
    NotifierProvider<SignupController, SignupState>(SignupController.new);

class SignupController extends Notifier<SignupState> {
  StreamSubscription<Uri>? _linkSubscription;
  late final AppLinks _appLinks;
  late final SupabaseClient _supabaseClient;

  @override
  SignupState build() {
    _supabaseClient = Supabase.instance.client;
    _appLinks = AppLinks();
    unawaited(_initInviteLinkListener());
    ref.onDispose(() {
      _linkSubscription?.cancel();
    });
    return SignupState.initial();
  }

  Future<void> _initInviteLinkListener() async {
    try {
      final initialUri = await _appLinks.getInitialLink();
      _handleUri(initialUri);
    } on PlatformException {
      // Ignore PlatformException
    } on FormatException {
      // Ignore FormatException
    }

    _linkSubscription = _appLinks.uriLinkStream.listen(
      (Uri uri) => _handleUri(uri),
      onError: (Object error) {
        // Ignore deep link errors
      },
    );
  }

  void _handleUri(Uri? uri) {
    if (uri == null) {
      return;
    }
    final matchesScheme = uri.scheme == AppEnv.inviteLinkScheme;
    final matchesHost = uri.host == AppEnv.inviteLinkHost;
    if (!matchesScheme || !matchesHost) {
      return;
    }
    final token = uri.queryParameters[AppEnv.inviteTokenQueryParam];
    if (token == null || token.isEmpty) {
      return;
    }
    updateInviteToken(token);
  }

  void updateInviteToken(String? rawToken) {
    final normalized = rawToken?.trim() ?? '';
    final nextStatus =
        normalized.isEmpty ? SignupStatus.waitingInvite : SignupStatus.ready;
    state = state.copyWith(
      inviteToken: normalized,
      status: nextStatus,
      clearError: true,
    );
  }

  Future<void> startSignup() async {
    final token = state.inviteToken.trim();
    if (token.isEmpty) {
      state = state.copyWith(
        status: SignupStatus.waitingInvite,
        errorMessage: '招待トークンが見つかりません。リンクを再度ご確認ください。',
      );
      return;
    }

    try {
      state = state.copyWith(
          status: SignupStatus.authorizingLine, clearError: true);
      final loginResult = await LineSDK.instance.login(
        scopes: const ['profile', 'openid', 'email'],
      );

      final idToken = loginResult.accessToken.idTokenRaw;
      if (idToken == null) {
        throw const SignupFlowException('LINE ID Token を取得できませんでした。');
      }

      UserProfile? lineProfile = loginResult.userProfile;
      if (lineProfile == null) {
        try {
          lineProfile = await LineSDK.instance.getProfile();
        } catch (_) {
          lineProfile = null;
        }
      }
      if (lineProfile == null) {
        throw const SignupFlowException('LINE プロフィール取得に失敗しました。');
      }

      state = state.copyWith(
        status: SignupStatus.registering,
        clearError: true,
      );

      final response = await _invokeInitialSignup(
        inviteToken: token,
        idToken: idToken,
        accessToken: loginResult.accessToken.value,
        profile: lineProfile,
      );

      if (response.sessionTransferToken == null ||
          response.sessionTransferToken!.isEmpty) {
        state = state.copyWith(status: SignupStatus.alreadyRegistered);
        return;
      }

      await _exchangeSession(response.sessionTransferToken!);

      state = state.copyWith(
        status: SignupStatus.success,
        inviteToken: '',
        clearError: true,
      );
    } on SignupFlowException catch (error) {
      state = state.copyWith(
          status: SignupStatus.error, errorMessage: error.message);
    } on PlatformException catch (error) {
      final isCanceled = error.code.toUpperCase() == 'CANCELED';
      final message = isCanceled
          ? 'LINE ログインをキャンセルしました。'
          : 'LINE ログインに失敗しました: ${error.message ?? error.code}';
      state = state.copyWith(
        status: isCanceled ? SignupStatus.ready : SignupStatus.error,
        errorMessage: message,
      );
    } on FunctionException catch (error) {
      final errorCode = SupabaseFunctionErrorHandler.extractErrorCode(error.details);
      final alreadyRegistered = errorCode == 'already_registered';
      final fallbackMessage =
          error.reasonPhrase ?? 'Edge Function でエラーが発生しました。';
      state = state.copyWith(
        status: alreadyRegistered
            ? SignupStatus.alreadyRegistered
            : SignupStatus.error,
        errorMessage: alreadyRegistered
            ? 'すでに登録済みのアカウントとして検出されました。'
            : (SupabaseFunctionErrorHandler.extractErrorMessage(error.details) ?? fallbackMessage),
      );
    } on AuthException catch (error) {
      state = state.copyWith(
          status: SignupStatus.error, errorMessage: error.message);
    } catch (error) {
      state = state.copyWith(
        status: SignupStatus.error,
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

  Future<_InitialSignupResponse> _invokeInitialSignup({
    required String inviteToken,
    required String idToken,
    required String accessToken,
    required UserProfile profile,
  }) async {
    final response = await SupabaseFunctionService.invoke(
      client: _supabaseClient,
      functionName: AppEnv.initialSignupFunctionName,
      body: {
        'inviteToken': inviteToken,
        'lineTokens': {
          'idToken': idToken,
          'accessToken': accessToken,
        },
        'lineProfile': {
          'lineUserId': profile.userId,
          'displayName': profile.displayName,
          'avatarUrl': profile.pictureUrl,
        },
      },
    );

    final data = response.data;
    if (data is! Map<String, dynamic>) {
      throw const SignupFlowException('Edge Function からのレスポンスが不正です。');
    }

    return _InitialSignupResponse.fromJson(data);
  }
}

class _InitialSignupResponse {
  _InitialSignupResponse({
    required this.userId,
    this.sessionTransferToken,
  });

  factory _InitialSignupResponse.fromJson(Map<String, dynamic> json) {
    return _InitialSignupResponse(
      userId: json['userId'] as String? ?? '',
      sessionTransferToken: json['sessionTransferToken'] as String?,
    );
  }

  final String userId;
  final String? sessionTransferToken;
}

class SignupFlowException implements Exception {
  const SignupFlowException(this.message);
  final String message;
}
