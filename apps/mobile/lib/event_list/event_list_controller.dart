import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:mobile/config/app_env.dart';
import 'package:mobile/shared/services/supabase_function_service.dart';
import 'package:mobile/shared/services/supabase_function_error_handler.dart';
import 'package:mobile/event_list/event_list_state.dart';
import 'package:mobile/event_list/models/event_list_item.dart';

/// イベント一覧コントローラのプロバイダー
final eventListControllerProvider =
    StateNotifierProvider<EventListController, EventListState>(
  (ref) => EventListController(),
);

/// イベント一覧のコントローラ
class EventListController extends StateNotifier<EventListState> {
  EventListController() : super(EventListState.initial()) {
    _supabaseClient = Supabase.instance.client;
    // 初期化時にイベントを取得
    fetchEvents();
  }

  late final SupabaseClient _supabaseClient;

  /// イベント一覧を取得
  Future<void> fetchEvents() async {
    state = state.copyWith(status: EventListStatus.loading, clearError: true);

    try {
      final response = await SupabaseFunctionService.invoke(
        client: _supabaseClient,
        functionName: AppEnv.eventListFunctionName,
        method: HttpMethod.get,
      );

      final data = response.data;
      if (data is! Map<String, dynamic>) {
        throw const EventListException('イベント一覧の取得に失敗しました');
      }

      final eventsData = data['events'];
      if (eventsData is! List) {
        throw const EventListException('イベント一覧のデータが不正です');
      }

      final events = eventsData
          .map((json) => EventListItem.fromJson(json as Map<String, dynamic>))
          .toList();

      state = state.copyWith(
        status: EventListStatus.loaded,
        events: events,
      );
    } on FunctionException catch (error) {
      state = state.copyWith(
        status: EventListStatus.error,
        errorMessage:
            SupabaseFunctionErrorHandler.extractErrorMessage(error.details) ??
                error.reasonPhrase ??
                'イベント一覧の取得に失敗しました',
      );
    } catch (error) {
      state = state.copyWith(
        status: EventListStatus.error,
        errorMessage: 'イベント一覧の取得に失敗しました: $error',
      );
    }
  }

  /// リフレッシュ
  Future<void> refresh() async {
    await fetchEvents();
  }
}

class EventListException implements Exception {
  const EventListException(this.message);
  final String message;
}
