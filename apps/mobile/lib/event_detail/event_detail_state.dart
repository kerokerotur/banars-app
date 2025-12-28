import 'package:mobile/event_list/models/event_list_item.dart';
import 'package:mobile/event_detail/models/event_attendance.dart';

enum EventDetailStatus {
  initial,
  loading,
  loaded,
  error,
}

class EventDetailState {
  const EventDetailState({
    required this.status,
    required this.event,
    required this.attendance,
    this.errorMessage,
    this.myStatus,
    this.myComment,
    this.isSubmitting = false,
  });

  factory EventDetailState.initial(EventListItem event) => EventDetailState(
        status: EventDetailStatus.initial,
        event: event,
        attendance: const [],
      );

  final EventDetailStatus status;
  final EventListItem event;
  final List<EventAttendance> attendance;
  final String? errorMessage;
  final EventAttendanceStatus? myStatus;
  final String? myComment;
  final bool isSubmitting;

  EventDetailState copyWith({
    EventDetailStatus? status,
    List<EventAttendance>? attendance,
    String? errorMessage,
    bool clearError = false,
    EventAttendanceStatus? myStatus,
    String? myComment,
    bool? isSubmitting,
  }) {
    return EventDetailState(
      status: status ?? this.status,
      event: event,
      attendance: attendance ?? this.attendance,
      errorMessage: clearError ? null : errorMessage ?? this.errorMessage,
      myStatus: myStatus ?? this.myStatus,
      myComment: myComment ?? this.myComment,
      isSubmitting: isSubmitting ?? this.isSubmitting,
    );
  }
}
