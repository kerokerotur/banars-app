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
  });

  factory EventListState.initial() => const EventListState(
        status: EventListStatus.loading,
      );

  final EventListStatus status;
  final List<dynamic> events;
  final String? errorMessage;

  bool get isLoading => status == EventListStatus.loading;
  bool get isLoaded => status == EventListStatus.loaded;
  bool get hasError => status == EventListStatus.error;

  EventListState copyWith({
    EventListStatus? status,
    List<dynamic>? events,
    String? errorMessage,
    bool clearError = false,
  }) {
    return EventListState(
      status: status ?? this.status,
      events: events ?? this.events,
      errorMessage: clearError ? null : (errorMessage ?? this.errorMessage),
    );
  }
}
