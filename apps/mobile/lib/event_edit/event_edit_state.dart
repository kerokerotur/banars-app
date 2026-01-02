import 'package:mobile/event_create/models/event_place.dart';
import 'package:mobile/event_create/models/event_type.dart';
import 'package:mobile/event_list/models/event_list_item.dart';

enum EventEditStatus {
  initial,
  editing,
  validating,
  submitting,
  success,
  error,
}

class EventEditState {
  const EventEditState({
    required this.status,
    required this.eventId,
    this.eventTypes = const [],
    this.eventPlaces = const [],
    this.title = '',
    this.selectedEventTypeId,
    this.startDatetime,
    this.meetingDatetime,
    this.responseDeadlineDatetime,
    this.selectedEventPlaceId,
    this.notesMarkdown = '',
    this.validationErrors = const {},
    this.errorMessage,
  });

  factory EventEditState.initial(String eventId) => EventEditState(
        status: EventEditStatus.initial,
        eventId: eventId,
      );

  factory EventEditState.fromEvent(EventListItem event) => EventEditState(
        status: EventEditStatus.initial,
        eventId: event.id,
        title: event.title,
        selectedEventTypeId: event.eventTypeId,
        startDatetime: event.startDatetime,
        meetingDatetime: event.meetingDatetime,
        responseDeadlineDatetime: event.responseDeadlineDatetime,
        selectedEventPlaceId: event.eventPlaceId,
        notesMarkdown: event.notesMarkdown ?? '',
      );

  // Status fields
  final EventEditStatus status;
  final String eventId;

  // Cache data
  final List<EventType> eventTypes;
  final List<EventPlace> eventPlaces;

  // Form fields
  final String title;
  final String? selectedEventTypeId;
  final DateTime? startDatetime;
  final DateTime? meetingDatetime;
  final DateTime? responseDeadlineDatetime;
  final String? selectedEventPlaceId;
  final String notesMarkdown;

  // Validation
  final Map<String, String> validationErrors;

  // Error handling
  final String? errorMessage;

  // Computed properties
  bool get isSubmitting => status == EventEditStatus.submitting;
  bool get canSubmit =>
      status != EventEditStatus.submitting &&
      title.isNotEmpty &&
      selectedEventTypeId != null;
  bool get hasValidationErrors => validationErrors.isNotEmpty;

  EventEditState copyWith({
    EventEditStatus? status,
    String? eventId,
    List<EventType>? eventTypes,
    List<EventPlace>? eventPlaces,
    String? title,
    String? selectedEventTypeId,
    DateTime? startDatetime,
    DateTime? meetingDatetime,
    DateTime? responseDeadlineDatetime,
    String? selectedEventPlaceId,
    String? notesMarkdown,
    Map<String, String>? validationErrors,
    String? errorMessage,
    bool clearError = false,
    bool clearValidation = false,
    bool clearStartDatetime = false,
    bool clearMeetingDatetime = false,
    bool clearResponseDeadline = false,
    bool clearEventPlaceId = false,
  }) {
    return EventEditState(
      status: status ?? this.status,
      eventId: eventId ?? this.eventId,
      eventTypes: eventTypes ?? this.eventTypes,
      eventPlaces: eventPlaces ?? this.eventPlaces,
      title: title ?? this.title,
      selectedEventTypeId: selectedEventTypeId ?? this.selectedEventTypeId,
      startDatetime: clearStartDatetime
          ? null
          : (startDatetime ?? this.startDatetime),
      meetingDatetime: clearMeetingDatetime
          ? null
          : (meetingDatetime ?? this.meetingDatetime),
      responseDeadlineDatetime: clearResponseDeadline
          ? null
          : (responseDeadlineDatetime ?? this.responseDeadlineDatetime),
      selectedEventPlaceId: clearEventPlaceId
          ? null
          : (selectedEventPlaceId ?? this.selectedEventPlaceId),
      notesMarkdown: notesMarkdown ?? this.notesMarkdown,
      validationErrors:
          clearValidation ? {} : (validationErrors ?? this.validationErrors),
      errorMessage: clearError ? null : (errorMessage ?? this.errorMessage),
    );
  }
}
