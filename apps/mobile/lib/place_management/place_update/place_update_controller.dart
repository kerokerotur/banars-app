import 'dart:async';
import 'dart:io';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import 'package:mobile/config/app_env.dart';
import 'package:mobile/place_management/place_update/place_update_state.dart';
import 'package:mobile/place_management/shared/validators/google_maps_url_validator.dart';
import 'package:mobile/shared/services/supabase_function_service.dart';
import 'package:mobile/shared/services/supabase_function_error_handler.dart';

final placeUpdateControllerProvider = StateNotifierProvider.autoDispose
    .family<PlaceUpdateController, PlaceUpdateState, (String, String, String)>(
  (ref, args) => PlaceUpdateController(args.$1, args.$2, args.$3),
);

class PlaceUpdateController extends StateNotifier<PlaceUpdateState> {
  final SupabaseClient _supabaseClient = Supabase.instance.client;

  PlaceUpdateController(String placeId, String name, String googleMapsUrl)
      : super(PlaceUpdateState.initial(placeId, name, googleMapsUrl));

  // ========== Form Field Updates ==========

  void updateName(String value) {
    state = state.copyWith(
      name: value,
      status: PlaceUpdateStatus.editing,
      clearValidation: true,
    );
  }

  void updateGoogleMapsUrl(String value) {
    final trimmed = value.trim();

    // バリデーション実行
    final error = GoogleMapsUrlValidator.validateGoogleMapsUrl(trimmed);

    final newValidationErrors = Map<String, String>.from(state.validationErrors);
    if (error != null) {
      newValidationErrors['google_maps_url'] = error;
    } else {
      newValidationErrors.remove('google_maps_url');
    }

    state = state.copyWith(
      googleMapsUrl: value,
      status: PlaceUpdateStatus.editing,
      validationErrors: newValidationErrors,
      showPreview: error == null,
      previewUrl: error == null ? trimmed : null,
    );
  }

  // ========== Form Submission ==========

  Future<void> submitPlace() async {
    if (!_validateForm()) return;

    state = state.copyWith(
      status: PlaceUpdateStatus.submitting,
      clearError: true,
    );

    try {
      final response = await SupabaseFunctionService.invoke(
        client: _supabaseClient,
        functionName: AppEnv.placeUpdateFunctionName,
        body: {
          'place_id': state.placeId,
          'name': state.name.trim(),
          'google_maps_url': state.googleMapsUrl.trim(),
        },
      ).timeout(
        const Duration(seconds: 30),
        onTimeout: () => throw TimeoutException('リクエストがタイムアウトしました'),
      );

      final data = response.data;
      if (data is Map && data['success'] == true) {
        state = state.copyWith(status: PlaceUpdateStatus.success);
      } else {
        throw Exception('場所の更新に失敗しました');
      }
    } on TimeoutException catch (_) {
      state = state.copyWith(
        status: PlaceUpdateStatus.error,
        errorMessage: '通信がタイムアウトしました。ネットワーク接続を確認してください。',
      );
    } on SocketException catch (_) {
      state = state.copyWith(
        status: PlaceUpdateStatus.error,
        errorMessage: 'ネットワークに接続できません。インターネット接続を確認してください。',
      );
    } on FunctionException catch (error) {
      final errorCode = SupabaseFunctionErrorHandler.extractErrorCode(error.details);

      if (errorCode == 'duplicate_google_maps_url') {
        state = state.copyWith(
          status: PlaceUpdateStatus.error,
          errorMessage: SupabaseFunctionErrorHandler.extractErrorMessage(error.details) ??
              'この Google Maps URL は既に登録されています',
        );
        return;
      }

      final errorMessage = SupabaseFunctionErrorHandler.extractErrorMessage(error.details) ??
          error.reasonPhrase ??
          '場所の更新に失敗しました';

      state = state.copyWith(
        status: PlaceUpdateStatus.error,
        errorMessage: errorMessage,
      );
    } catch (error) {
      state = state.copyWith(
        status: PlaceUpdateStatus.error,
        errorMessage: '予期しないエラーが発生しました: $error',
      );
    }
  }

  // ========== Validation ==========

  bool _validateForm() {
    final errors = <String, String>{};

    // 場所名バリデーション
    final nameError = GoogleMapsUrlValidator.validateName(state.name);
    if (nameError != null) {
      errors['name'] = nameError;
    }

    // Google Maps URLバリデーション
    final urlError =
        GoogleMapsUrlValidator.validateGoogleMapsUrl(state.googleMapsUrl);
    if (urlError != null) {
      errors['google_maps_url'] = urlError;
    }

    if (errors.isNotEmpty) {
      state = state.copyWith(validationErrors: errors);
      return false;
    }

    return true;
  }
}
