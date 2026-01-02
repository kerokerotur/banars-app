import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:mobile/config/app_env.dart';
import 'package:mobile/shared/services/supabase_function_service.dart';
import 'package:mobile/shared/services/supabase_function_error_handler.dart';
import 'package:mobile/event_list/event_list_state.dart';
import 'package:mobile/event_list/models/event_list_item.dart';
import 'package:mobile/event_list/models/attendance_summary.dart';

/// イベント一覧コントローラのプロバイダー
final eventListControllerProvider =
    NotifierProvider<EventListController, EventListState>(
  EventListController.new,
);

/// イベント一覧のコントローラ
class EventListController extends Notifier<EventListState> {
  late final SupabaseClient _supabaseClient;

  @override
  EventListState build() {
    _supabaseClient = Supabase.instance.client;
    // 初期化時にイベントを取得
    Future.microtask(() => fetchEvents());
    return EventListState.initial();
  }

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

      // イベント取得成功後、出欠情報を取得
      if (state.events.isNotEmpty) {
        _fetchAttendanceAvatars();
      }
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

  /// 出欠者アバター情報を取得
  Future<void> _fetchAttendanceAvatars() async {
    state = state.copyWith(isLoadingAttendances: true);

    try {
      final eventIds = state.events.map((e) => e.id).toList();

      final response = await SupabaseFunctionService.invoke(
        client: _supabaseClient,
        functionName: AppEnv.eventAttendancesSummaryFunctionName,
        method: HttpMethod.get,
        queryParameters: {
          'event_ids': eventIds.join(','),
        },
      );

      final data = response.data;
      if (data is! Map<String, dynamic>) {
        throw const EventListException('出欠情報のレスポンスが不正です');
      }

      final attendancesData = data['attendances'];
      if (attendancesData is! Map<String, dynamic>) {
        throw const EventListException('出欠情報のデータが不正です');
      }

      // レスポンスをパース（userId と status のみ）
      final summariesMap = <String, List<AttendanceSummary>>{};

      for (final entry in attendancesData.entries) {
        final eventId = entry.key;
        final summariesJson = entry.value as List;
        final summaries = summariesJson
            .map((json) =>
                AttendanceSummary.fromJson(json as Map<String, dynamic>))
            .toList();
        summariesMap[eventId] = summaries;
      }

      state = state.copyWith(
        attendanceSummaries: summariesMap,
        isLoadingAttendances: false,
        clearAttendanceError: true,
      );
    } catch (error) {
      state = state.copyWith(
        isLoadingAttendances: false,
        attendanceErrorMessage: '出欠情報の取得に失敗しました: $error',
      );
    }
  }
}

class EventListException implements Exception {
  const EventListException(this.message);
  final String message;
}
