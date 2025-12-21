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
  int _lookupRequestId = 0;

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
      lookupStatus:
          error == null ? PlaceLookupStatus.checking : PlaceLookupStatus.idle,
      clearExistingPlace: true,
      clearError: true,
    );

    if (error == null) {
      _lookupGoogleMapsUrl(trimmed);
    }
  }

  // ========== Form Submission ==========

  Future<void> submitPlace() async {
    if (!_validateForm()) return;
    if (state.lookupStatus != PlaceLookupStatus.available) {
      return;
    }

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
      final errorCode = _extractErrorCode(error.details);

      // サーバー側で重複検知された場合も既存会場を提示
      if (errorCode == 'duplicate_google_maps_url') {
        final existingPlace = _extractExistingPlace(error.details);
        state = state.copyWith(
          status: PlaceCreateStatus.editing,
          lookupStatus: PlaceLookupStatus.duplicate,
          existingPlace: existingPlace,
          errorMessage: _extractErrorMessage(error.details) ??
              'この Google Maps URL は既に登録されています',
        );
        return;
      }

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

    if (state.lookupStatus != PlaceLookupStatus.available) {
      errors.putIfAbsent(
        'google_maps_url',
        () => 'Google Maps URLの重複チェックを完了してください',
      );
    }

    if (errors.isNotEmpty) {
      state = state.copyWith(validationErrors: errors);
      return false;
    }

    return true;
  }

  // ========== Helper Methods ==========

  Future<void> _lookupGoogleMapsUrl(String url) async {
    final currentId = ++_lookupRequestId;

    try {
      final response = await _supabaseClient.functions.invoke(
        '${AppEnv.placeLookupFunctionName}?google_maps_url=${Uri.encodeComponent(url)}',
        method: HttpMethod.get,
      );

      if (currentId != _lookupRequestId) return; // 最新でなければ破棄

      final data = response.data;
      if (data is Map && data['exists'] == true && data['place'] is Map) {
        state = state.copyWith(
          lookupStatus: PlaceLookupStatus.duplicate,
          existingPlace: data['place'] as Map<String, dynamic>,
          clearValidation: true,
          status: PlaceCreateStatus.editing,
        );
        return;
      }

      if (data is Map && data['exists'] == false) {
        state = state.copyWith(
          lookupStatus: PlaceLookupStatus.available,
          clearExistingPlace: true,
          status: PlaceCreateStatus.editing,
        );
        return;
      }

      throw Exception('Unexpected response');
    } on FunctionException catch (error) {
      if (currentId != _lookupRequestId) return;

      final message = _extractErrorMessage(error.details) ??
          error.reasonPhrase ??
          '重複チェックに失敗しました';

      final newValidationErrors = Map<String, String>.from(state.validationErrors);
      newValidationErrors['google_maps_url'] = message;

      state = state.copyWith(
        lookupStatus: PlaceLookupStatus.error,
        validationErrors: newValidationErrors,
        errorMessage: message,
        clearExistingPlace: true,
      );
    } catch (error) {
      if (currentId != _lookupRequestId) return;
      state = state.copyWith(
        lookupStatus: PlaceLookupStatus.error,
        errorMessage: '重複チェックに失敗しました: $error',
        clearExistingPlace: true,
      );
    }
  }

  void selectExistingPlace() {
    if (!state.canSelectExisting) return;
    state = state.copyWith(status: PlaceCreateStatus.existingSelected);
  }

  String? _extractErrorMessage(dynamic details) {
    if (details is Map) {
      if (details['error'] is Map) {
        return details['error']['message'] as String?;
      }
      return details['message'] as String?;
    }
    return null;
  }

  String? _extractErrorCode(dynamic details) {
    if (details is Map) {
      if (details['error'] is Map) {
        return details['error']['code'] as String?;
      }
      return details['code'] as String?;
    }
    return null;
  }

  Map<String, dynamic>? _extractExistingPlace(dynamic details) {
    if (details is Map) {
      if (details['existing_place'] is Map) {
        return details['existing_place'] as Map<String, dynamic>;
      }
      if (details['error'] is Map && details['error']['existing_place'] is Map) {
        return details['error']['existing_place'] as Map<String, dynamic>;
      }
    }
    return null;
  }
}
