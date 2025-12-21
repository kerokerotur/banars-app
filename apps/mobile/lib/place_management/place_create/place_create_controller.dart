import 'dart:async';
import 'dart:io';

import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import 'package:mobile/config/app_env.dart';
import 'package:mobile/place_management/place_create/place_create_state.dart';
import 'package:mobile/place_management/shared/validators/google_maps_url_validator.dart';

final placeCreateControllerProvider =
    NotifierProvider<PlaceCreateController, PlaceCreateState>(
  PlaceCreateController.new,
);

class PlaceCreateController extends Notifier<PlaceCreateState> {
  late final SupabaseClient _supabaseClient;

  @override
  PlaceCreateState build() {
    _supabaseClient = Supabase.instance.client;
    return PlaceCreateState.initial();
  }

  // ========== Form Field Updates ==========

  void updateName(String value) {
    state = state.copyWith(
      name: value,
      status: PlaceCreateStatus.editing,
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
      status: PlaceCreateStatus.editing,
      validationErrors: newValidationErrors,
      showPreview: error == null,
      previewUrl: error == null ? trimmed : null,
    );
  }

  // ========== Form Submission ==========

  Future<void> submitPlace() async {
    if (!_validateForm()) return;

    state = state.copyWith(
      status: PlaceCreateStatus.submitting,
      clearError: true,
    );

    try {
      final response = await _supabaseClient.functions
          .invoke(
            AppEnv.placeCreateFunctionName,
            body: {
              'name': state.name.trim(),
              'google_maps_url': state.googleMapsUrl.trim(),
            },
          )
          .timeout(
            const Duration(seconds: 30),
            onTimeout: () => throw TimeoutException('リクエストがタイムアウトしました'),
          );

      final data = response.data;
      if (data is Map && data['success'] == true) {
        state = state.copyWith(status: PlaceCreateStatus.success);
      } else {
        throw Exception('場所の登録に失敗しました');
      }
    } on TimeoutException catch (_) {
      state = state.copyWith(
        status: PlaceCreateStatus.error,
        errorMessage: '通信がタイムアウトしました。ネットワーク接続を確認してください。',
      );
    } on SocketException catch (_) {
      state = state.copyWith(
        status: PlaceCreateStatus.error,
        errorMessage: 'ネットワークに接続できません。インターネット接続を確認してください。',
      );
    } on FunctionException catch (error) {
      debugPrint('place_create error: $error');
      final errorMessage = _extractErrorMessage(error.details) ??
          error.reasonPhrase ??
          '場所の登録に失敗しました';

      state = state.copyWith(
        status: PlaceCreateStatus.error,
        errorMessage: errorMessage,
      );
    } catch (error) {
      debugPrint('place_create error: $error');
      state = state.copyWith(
        status: PlaceCreateStatus.error,
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

  // ========== Helper Methods ==========

  String? _extractErrorMessage(dynamic details) {
    if (details is Map) {
      if (details['error'] is Map) {
        return details['error']['message'] as String?;
      }
      return details['message'] as String?;
    }
    return null;
  }
}
