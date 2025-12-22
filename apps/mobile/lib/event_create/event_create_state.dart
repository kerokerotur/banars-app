import 'package:mobile/event_create/models/event_place.dart';
import 'package:mobile/event_create/models/event_type.dart';

enum EventCreateStatus {
  initial,
  editing,
  validating,
  submitting,
  success,
  error,
}

enum VenueInputMode {
  previousVenues,
  manual,
}

class EventCreateState {
  const EventCreateState({
    required this.status,
    required this.venueInputMode,
    this.eventTypes = const [],
    this.previousVenues = const [],
    this.title = '',
    this.selectedEventTypeId,
    this.startDatetime,
    this.meetingDatetime,
    this.responseDeadlineDatetime,
    this.venueName = '',
    this.venueGoogleMapsUrl = '',
    this.notesMarkdown = '',
    this.validationErrors = const {},
    this.errorMessage,
  });

  factory EventCreateState.initial() => const EventCreateState(
        status: EventCreateStatus.initial,
        venueInputMode: VenueInputMode.previousVenues,
      );

  // Status fields
  final EventCreateStatus status;
  final VenueInputMode venueInputMode;

  // Cache data
  final List<EventType> eventTypes;
  final List<EventPlace> previousVenues;

  // Form fields
  final String title;
  final String? selectedEventTypeId;
  final DateTime? startDatetime;
  final DateTime? meetingDatetime;
  final DateTime? responseDeadlineDatetime;
  final String venueName;
  final String venueGoogleMapsUrl;
  final String notesMarkdown;

  // Validation
  final Map<String, String> validationErrors;

  // Error handling
  final String? errorMessage;

  // Computed properties
  bool get isSubmitting => status == EventCreateStatus.submitting;
  bool get canSubmit =>
      status != EventCreateStatus.submitting &&
      title.isNotEmpty &&
      selectedEventTypeId != null &&
      venueName.isNotEmpty &&
      venueGoogleMapsUrl.isNotEmpty;
  bool get hasValidationErrors => validationErrors.isNotEmpty;

  EventCreateState copyWith({
    EventCreateStatus? status,
    VenueInputMode? venueInputMode,
    List<EventType>? eventTypes,
    List<EventPlace>? previousVenues,
    String? title,
    String? selectedEventTypeId,
    DateTime? startDatetime,
    DateTime? meetingDatetime,
    DateTime? responseDeadlineDatetime,
    String? venueName,
    String? venueGoogleMapsUrl,
    String? notesMarkdown,
    Map<String, String>? validationErrors,
    String? errorMessage,
    bool clearError = false,
    bool clearValidation = false,
    bool clearStartDatetime = false,
    bool clearMeetingDatetime = false,
    bool clearResponseDeadline = false,
  }) {
    return EventCreateState(
      status: status ?? this.status,
      venueInputMode: venueInputMode ?? this.venueInputMode,
      eventTypes: eventTypes ?? this.eventTypes,
      previousVenues: previousVenues ?? this.previousVenues,
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
      venueName: venueName ?? this.venueName,
      venueGoogleMapsUrl: venueGoogleMapsUrl ?? this.venueGoogleMapsUrl,
      notesMarkdown: notesMarkdown ?? this.notesMarkdown,
      validationErrors:
          clearValidation ? {} : (validationErrors ?? this.validationErrors),
      errorMessage: clearError ? null : (errorMessage ?? this.errorMessage),
    );
  }
}
