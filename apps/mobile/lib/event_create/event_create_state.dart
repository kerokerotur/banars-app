import 'package:mobile/event_create/models/event_place.dart';
import 'package:mobile/event_create/models/event_type.dart';
import 'package:mobile/event_create/models/nominatim_result.dart';

enum EventCreateStatus {
  initial,
  editing,
  validating,
  submitting,
  success,
  error,
}

enum VenueInputMode {
  nominatim,
  previousVenues,
  manual,
}

enum NominatimSearchStatus {
  idle,
  searching,
  success,
  error,
  rateLimited,
}

class EventCreateState {
  const EventCreateState({
    required this.status,
    required this.venueInputMode,
    required this.nominatimSearchStatus,
    this.eventTypes = const [],
    this.previousVenues = const [],
    this.title = '',
    this.selectedEventTypeId,
    this.startDatetime,
    this.meetingDatetime,
    this.responseDeadlineDatetime,
    this.venueName = '',
    this.venueAddress = '',
    this.venueLatitude,
    this.venueLongitude,
    this.venueOsmId,
    this.venueOsmType,
    this.notesMarkdown = '',
    this.nominatimSearchQuery = '',
    this.nominatimResults = const [],
    this.validationErrors = const {},
    this.errorMessage,
  });

  factory EventCreateState.initial() => const EventCreateState(
        status: EventCreateStatus.initial,
        venueInputMode: VenueInputMode.nominatim,
        nominatimSearchStatus: NominatimSearchStatus.idle,
      );

  // Status fields
  final EventCreateStatus status;
  final VenueInputMode venueInputMode;
  final NominatimSearchStatus nominatimSearchStatus;

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
  final String venueAddress;
  final double? venueLatitude;
  final double? venueLongitude;
  final int? venueOsmId;
  final String? venueOsmType;
  final String notesMarkdown;

  // Nominatim search
  final String nominatimSearchQuery;
  final List<NominatimResult> nominatimResults;

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
      venueAddress.isNotEmpty;
  bool get hasValidationErrors => validationErrors.isNotEmpty;
  bool get isSearching => nominatimSearchStatus == NominatimSearchStatus.searching;

  EventCreateState copyWith({
    EventCreateStatus? status,
    VenueInputMode? venueInputMode,
    NominatimSearchStatus? nominatimSearchStatus,
    List<EventType>? eventTypes,
    List<EventPlace>? previousVenues,
    String? title,
    String? selectedEventTypeId,
    DateTime? startDatetime,
    DateTime? meetingDatetime,
    DateTime? responseDeadlineDatetime,
    String? venueName,
    String? venueAddress,
    double? venueLatitude,
    double? venueLongitude,
    int? venueOsmId,
    String? venueOsmType,
    String? notesMarkdown,
    String? nominatimSearchQuery,
    List<NominatimResult>? nominatimResults,
    Map<String, String>? validationErrors,
    String? errorMessage,
    bool clearError = false,
    bool clearValidation = false,
    bool clearDateTimes = false,
    bool clearVenueCoordinates = false,
    bool clearVenueOsm = false,
    bool clearStartDatetime = false,
    bool clearMeetingDatetime = false,
    bool clearResponseDeadline = false,
  }) {
    return EventCreateState(
      status: status ?? this.status,
      venueInputMode: venueInputMode ?? this.venueInputMode,
      nominatimSearchStatus: nominatimSearchStatus ?? this.nominatimSearchStatus,
      eventTypes: eventTypes ?? this.eventTypes,
      previousVenues: previousVenues ?? this.previousVenues,
      title: title ?? this.title,
      selectedEventTypeId: selectedEventTypeId ?? this.selectedEventTypeId,
      startDatetime: clearStartDatetime || clearDateTimes
          ? null
          : (startDatetime ?? this.startDatetime),
      meetingDatetime: clearMeetingDatetime || clearDateTimes
          ? null
          : (meetingDatetime ?? this.meetingDatetime),
      responseDeadlineDatetime: clearResponseDeadline || clearDateTimes
          ? null
          : (responseDeadlineDatetime ?? this.responseDeadlineDatetime),
      venueName: venueName ?? this.venueName,
      venueAddress: venueAddress ?? this.venueAddress,
      venueLatitude: clearVenueCoordinates
          ? null
          : (venueLatitude ?? this.venueLatitude),
      venueLongitude: clearVenueCoordinates
          ? null
          : (venueLongitude ?? this.venueLongitude),
      venueOsmId: clearVenueOsm ? null : (venueOsmId ?? this.venueOsmId),
      venueOsmType: clearVenueOsm ? null : (venueOsmType ?? this.venueOsmType),
      notesMarkdown: notesMarkdown ?? this.notesMarkdown,
      nominatimSearchQuery: nominatimSearchQuery ?? this.nominatimSearchQuery,
      nominatimResults: nominatimResults ?? this.nominatimResults,
      validationErrors:
          clearValidation ? {} : (validationErrors ?? this.validationErrors),
      errorMessage: clearError ? null : (errorMessage ?? this.errorMessage),
    );
  }
}
