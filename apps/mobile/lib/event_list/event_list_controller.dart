import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/event_list/event_list_state.dart';

/// イベント一覧コントローラのプロバイダー
final eventListControllerProvider =
    StateNotifierProvider<EventListController, EventListState>(
  (ref) => EventListController(),
);

/// イベント一覧のコントローラ
class EventListController extends StateNotifier<EventListState> {
  EventListController() : super(EventListState.initial()) {
    // 初期化時にイベントを取得
    fetchEvents();
  }

  /// イベント一覧を取得
  Future<void> fetchEvents() async {
    state = state.copyWith(status: EventListStatus.loading, clearError: true);

    try {
      // TODO: Supabaseからイベント一覧を取得する実装を追加
      // 現在は空のリストを返す
      await Future.delayed(const Duration(milliseconds: 500));

      state = state.copyWith(
        status: EventListStatus.loaded,
        events: [],
      );
    } catch (e) {
      state = state.copyWith(
        status: EventListStatus.error,
        errorMessage: 'イベントの取得に失敗しました: $e',
      );
    }
  }

  /// リフレッシュ
  Future<void> refresh() async {
    await fetchEvents();
  }
}
