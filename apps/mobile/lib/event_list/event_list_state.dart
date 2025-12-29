import 'package:mobile/event_list/models/event_list_item.dart';
import 'package:mobile/event_list/models/attendance_summary.dart';

enum EventListStatus {
  loading,
  loaded,
  error,
}

class EventListState {
  const EventListState({
    required this.status,
    this.events = const [],
    this.errorMessage,
    this.attendanceSummaries = const {},
    this.isLoadingAttendances = false,
    this.attendanceErrorMessage,
  });

  factory EventListState.initial() => const EventListState(
        status: EventListStatus.loading,
      );

  final EventListStatus status;
  final List<EventListItem> events;
  final String? errorMessage;

  // 出欠情報関連
  final Map<String, List<AttendanceSummary>> attendanceSummaries;
  final bool isLoadingAttendances;
  final String? attendanceErrorMessage;

  bool get isLoading => status == EventListStatus.loading;
  bool get isLoaded => status == EventListStatus.loaded;
  bool get hasError => status == EventListStatus.error;

  EventListState copyWith({
    EventListStatus? status,
    List<EventListItem>? events,
    String? errorMessage,
    bool clearError = false,
    Map<String, List<AttendanceSummary>>? attendanceSummaries,
    bool? isLoadingAttendances,
    String? attendanceErrorMessage,
    bool clearAttendanceError = false,
  }) {
    return EventListState(
      status: status ?? this.status,
      events: events ?? this.events,
      errorMessage: clearError ? null : (errorMessage ?? this.errorMessage),
      attendanceSummaries: attendanceSummaries ?? this.attendanceSummaries,
      isLoadingAttendances: isLoadingAttendances ?? this.isLoadingAttendances,
      attendanceErrorMessage: clearAttendanceError
          ? null
          : (attendanceErrorMessage ?? this.attendanceErrorMessage),
    );
  }
}
