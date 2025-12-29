import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import 'package:mobile/config/app_env.dart';
import 'package:mobile/place_management/models/place.dart';
import 'package:mobile/place_management/place_list/place_list_state.dart';
import 'package:mobile/shared/services/supabase_function_service.dart';
import 'package:mobile/shared/services/supabase_function_error_handler.dart';

final placeListControllerProvider =
    NotifierProvider<PlaceListController, PlaceListState>(
  PlaceListController.new,
);

class PlaceListController extends Notifier<PlaceListState> {
  late final SupabaseClient _supabaseClient;

  @override
  PlaceListState build() {
    _supabaseClient = Supabase.instance.client;
    // 初回ロード
    Future.microtask(() => loadPlaces());
    return PlaceListState.initial();
  }

  // ========== Load Places ==========

  Future<void> loadPlaces() async {
    state = state.copyWith(
      status: PlaceListStatus.loading,
      clearError: true,
    );

    try {
      final response = await SupabaseFunctionService.invoke(
        client: _supabaseClient,
        functionName: AppEnv.placeListFunctionName,
      );

      final data = response.data;
      if (data is Map && data['places'] is List) {
        final places = (data['places'] as List)
            .map((json) => Place.fromJson(json as Map<String, dynamic>))
            .toList();

        state = state.copyWith(
          status: PlaceListStatus.loaded,
          places: places,
        );
      } else {
        throw Exception('Unexpected response format');
      }
    } on FunctionException catch (error) {
      state = state.copyWith(
        status: PlaceListStatus.error,
        errorMessage: SupabaseFunctionErrorHandler.extractErrorMessage(error.details) ??
            error.reasonPhrase ??
            '場所一覧の取得に失敗しました',
      );
    } catch (error) {
      state = state.copyWith(
        status: PlaceListStatus.error,
        errorMessage: '予期しないエラーが発生しました: $error',
      );
    }
  }

  // ========== Delete Place ==========

  Future<void> deletePlace(String placeId) async {
    state = state.copyWith(
      status: PlaceListStatus.deleting,
      deletingPlaceId: placeId,
      clearError: true,
    );

    try {
      final response = await SupabaseFunctionService.invoke(
        client: _supabaseClient,
        functionName: AppEnv.placeDeleteFunctionName,
        body: {'place_id': placeId},
      );

      final data = response.data;
      if (data is Map && data['success'] == true) {
        // 成功: リストから削除
        final updatedPlaces =
            state.places.where((p) => p.id != placeId).toList();

        state = state.copyWith(
          status: PlaceListStatus.loaded,
          places: updatedPlaces,
          clearDeletingPlaceId: true,
        );
      } else {
        throw Exception('削除に失敗しました');
      }
    } on FunctionException catch (error) {
      final errorCode = SupabaseFunctionErrorHandler.extractErrorCode(error.details);

      String message;
      if (errorCode == 'place_in_use') {
        message = 'この場所は既存のイベントで使用されているため削除できません';
      } else {
        message = SupabaseFunctionErrorHandler.extractErrorMessage(error.details) ?? '削除に失敗しました';
      }

      state = state.copyWith(
        status: PlaceListStatus.error,
        errorMessage: message,
        clearDeletingPlaceId: true,
      );
    } catch (error) {
      state = state.copyWith(
        status: PlaceListStatus.error,
        errorMessage: '予期しないエラーが発生しました: $error',
        clearDeletingPlaceId: true,
      );
    }
  }

}
