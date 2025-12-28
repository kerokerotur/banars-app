import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:mobile/config/app_env.dart';
import 'package:mobile/event_detail/event_detail_state.dart';
import 'package:mobile/event_detail/models/event_attendance.dart';
import 'package:mobile/event_list/models/event_list_item.dart';

final eventDetailControllerProvider = StateNotifierProvider.autoDispose
    .family<EventDetailController, EventDetailState, EventListItem>((ref, event) {
  return EventDetailController(event: event);
});

class EventDetailController extends StateNotifier<EventDetailState> {
  EventDetailController({required EventListItem event})
      : super(EventDetailState.initial(event)) {
    _supabaseClient = Supabase.instance.client;
    fetchAttendance();
  }

  late final SupabaseClient _supabaseClient;

  Future<void> fetchAttendance() async {
    state = state.copyWith(status: EventDetailStatus.loading, clearError: true);

    try {
      final response = await _supabaseClient.functions.invoke(
        AppEnv.eventDetailFunctionName,
        method: HttpMethod.get,
        queryParameters: {
          'event_id': state.event.id,
        },
      );

      final data = response.data;
      if (data is! Map<String, dynamic>) {
        throw const EventDetailException('出欠データの取得に失敗しました');
      }

      final attendanceJson = data['attendance'];
      if (attendanceJson is! List) {
        throw const EventDetailException('出欠データの形式が不正です');
      }

      final attendance = attendanceJson
          .map((e) => EventAttendance.fromJson(e as Map<String, dynamic>))
          .toList();

      final myUserId = _supabaseClient.auth.currentUser?.id;
      final myAttendance = myUserId == null
          ? null
          : attendance.firstWhereOrNull((item) => item.memberId == myUserId);

      final myStatus = myAttendance?.status;
      final myComment = myAttendance?.comment;

      state = state.copyWith(
        status: EventDetailStatus.loaded,
        attendance: attendance,
        myStatus: myStatus,
        myComment: myComment,
      );
    } on FunctionException catch (error) {
      debugPrint('events_detail FunctionException: ${error.details}');
      state = state.copyWith(
        status: EventDetailStatus.error,
        errorMessage: _extractErrorMessage(error.details) ?? '出欠の取得に失敗しました',
      );
    } catch (error) {
      debugPrint('events_detail error: $error');
      state = state.copyWith(
        status: EventDetailStatus.error,
        errorMessage: '出欠の取得に失敗しました: $error',
      );
    }
  }

  void selectMyStatus(EventAttendanceStatus status) {
    if (isAfterDeadline) return;
    state = state.copyWith(myStatus: status, clearError: true);
  }

  void updateMyComment(String value) {
    state = state.copyWith(myComment: value, clearError: true);
  }

  bool get isAfterDeadline {
    final deadline = state.event.responseDeadlineDatetime;
    if (deadline == null) return false;
    return DateTime.now().isAfter(deadline);
  }

  Future<void> submitAttendance() async {
    final userId = _supabaseClient.auth.currentUser?.id;
    if (userId == null) return;

    if (isAfterDeadline) {
      state = state.copyWith(
        errorMessage: '締切後のため変更できません',
      );
      return;
    }

    if (state.myStatus == null) {
      state = state.copyWith(
        errorMessage: '回答ステータスを選択してください',
      );
      return;
    }

    state = state.copyWith(isSubmitting: true, clearError: true);
    try {
      final supabaseStatus = _mapStatusToDb(state.myStatus!);
      final comment = (state.myComment ?? '').trim();

      final response = await _supabaseClient.functions.invoke(
        AppEnv.attendanceRegisterFunctionName,
        method: HttpMethod.post,
        body: {
          'eventId': state.event.id,
          'status': supabaseStatus,
          'comment': comment.isEmpty ? null : comment,
        },
      );

      final data = response.data;
      if (data is! Map<String, dynamic>) {
        throw const EventDetailException('出欠登録のレスポンス形式が不正です');
      }

      final updated = _mapAttendanceFromResponse(data);

      // 既存リストに自分のレコードがあれば差し替え、なければ追加
      final attendance = [...state.attendance];
      final index = attendance.indexWhere((a) => a.memberId == userId);
      if (index >= 0) {
        attendance[index] = updated;
      } else {
        attendance.insert(0, updated);
      }

      state = state.copyWith(
        attendance: attendance,
        myStatus: updated.status,
        myComment: updated.comment,
      );
    } on FunctionException catch (error) {
      debugPrint('attendance_register FunctionException: ${error.details}');
      state = state.copyWith(
        errorMessage: _extractErrorMessage(error.details) ?? '出欠登録に失敗しました',
      );
    } catch (error) {
      debugPrint('submitAttendance error: $error');
      state = state.copyWith(
        errorMessage: '出欠の更新に失敗しました: $error',
      );
    } finally {
      state = state.copyWith(isSubmitting: false);
    }
  }

  String _mapStatusToDb(EventAttendanceStatus status) {
    switch (status) {
      case EventAttendanceStatus.attending:
        return 'attending';
      case EventAttendanceStatus.notAttending:
        return 'not_attending';
      case EventAttendanceStatus.pending:
        return 'pending';
    }
  }

  EventAttendance _mapAttendanceFromResponse(Map<String, dynamic> data) {
    final memberId = data['memberId'] as String? ?? '';
    final existing = state.attendance.firstWhereOrNull(
      (a) => a.memberId == memberId,
    );

    return EventAttendance(
      id: data['id'] as String,
      memberId: memberId,
      displayName: existing?.displayName,
      avatarUrl: existing?.avatarUrl,
      status: _statusFromString(data['status'] as String?),
      comment: data['comment'] as String?,
      updatedAt: DateTime.parse(data['updatedAt'] as String),
    );
  }

  EventAttendanceStatus _statusFromString(String? value) {
    switch (value) {
      case 'attending':
        return EventAttendanceStatus.attending;
      case 'not_attending':
        return EventAttendanceStatus.notAttending;
      case 'pending':
      default:
        return EventAttendanceStatus.pending;
    }
  }

  String? _extractErrorMessage(dynamic details) {
    if (details == null) return null;
    if (details is String) return details;
    if (details is Map<String, dynamic>) {
      final message = details['message'];
      if (message is String) return message;
      final error = details['error'];
      if (error is Map<String, dynamic>) {
        final errorMessage = error['message'];
        if (errorMessage is String) return errorMessage;
      }
    }
    return details.toString();
  }
}

extension<T> on T {
  R let<R>(R Function(T) op) => op(this);
}

extension IterableX<T> on Iterable<T> {
  T? firstWhereOrNull(bool Function(T element) test) {
    for (final element in this) {
      if (test(element)) return element;
    }
    return null;
  }
}

class EventDetailException implements Exception {
  const EventDetailException(this.message);
  final String message;
}
