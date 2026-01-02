import 'package:mobile/event_list/models/event_list_item.dart';

/// スケジュール画面の状態
class ScheduleState {
  const ScheduleState({
    required this.focusedDay,
    required this.selectedDay,
    this.eventsMap = const {},
  });

  /// 初期状態
  factory ScheduleState.initial() {
    final now = DateTime.now();
    return ScheduleState(
      focusedDay: now,
      selectedDay: null,
    );
  }

  /// カレンダーで表示中の月
  final DateTime focusedDay;

  /// 選択中の日付
  final DateTime? selectedDay;

  /// 日付ごとのイベントマップ
  /// キーは日付（時刻を 00:00:00 に正規化）
  final Map<DateTime, List<EventListItem>> eventsMap;

  /// コピーを作成
  ScheduleState copyWith({
    DateTime? focusedDay,
    DateTime? selectedDay,
    Map<DateTime, List<EventListItem>>? eventsMap,
    bool clearSelectedDay = false,
  }) {
    return ScheduleState(
      focusedDay: focusedDay ?? this.focusedDay,
      selectedDay: clearSelectedDay ? null : (selectedDay ?? this.selectedDay),
      eventsMap: eventsMap ?? this.eventsMap,
    );
  }
}
