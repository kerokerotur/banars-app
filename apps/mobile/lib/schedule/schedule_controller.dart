import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/event_list/models/event_list_item.dart';
import 'package:mobile/schedule/schedule_state.dart';

/// スケジュール画面のコントローラプロバイダー
final scheduleControllerProvider =
    StateNotifierProvider<ScheduleController, ScheduleState>(
  (ref) => ScheduleController(),
);

/// スケジュール画面のコントローラ
class ScheduleController extends StateNotifier<ScheduleState> {
  ScheduleController() : super(ScheduleState.initial());

  /// イベント一覧を日付ごとにマッピング
  void buildEventsMap(List<EventListItem> events) {
    final map = <DateTime, List<EventListItem>>{};
    for (final event in events) {
      // meetingDatetime 優先、null の場合は startDatetime を使用
      final dateTime = event.meetingDatetime ?? event.startDatetime;
      final key = _normalizeDate(dateTime);
      if (key != null) {
        map.putIfAbsent(key, () => []).add(event);
      }
    }
    state = state.copyWith(eventsMap: map);
  }

  /// 日付を正規化（時刻を 00:00:00 に統一）
  DateTime? _normalizeDate(DateTime? dateTime) {
    if (dateTime == null) return null;
    return DateTime(dateTime.year, dateTime.month, dateTime.day);
  }

  /// 表示月を変更
  void onFocusedDayChanged(DateTime focusedDay) {
    state = state.copyWith(focusedDay: focusedDay);
  }

  /// 日付を選択
  void onDaySelected(DateTime selectedDay) {
    state = state.copyWith(selectedDay: selectedDay);
  }

  /// 選択日をクリア
  void clearSelectedDay() {
    state = state.copyWith(clearSelectedDay: true);
  }

  /// 選択日のイベント一覧を取得
  List<EventListItem> getEventsForDay(DateTime day) {
    final key = _normalizeDate(day);
    return state.eventsMap[key] ?? [];
  }
}
