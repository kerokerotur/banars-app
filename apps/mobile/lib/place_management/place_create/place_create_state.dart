enum PlaceCreateStatus {
  editing,
  submitting,
  success,
  existingSelected,
  error,
}

enum PlaceLookupStatus {
  idle,
  checking,
  available,
  duplicate,
  error,
}

class PlaceCreateState {
  final PlaceCreateStatus status;
  final String name;
  final String googleMapsUrl;
  final PlaceLookupStatus lookupStatus;
  final bool showPreview;
  final String? previewUrl;
  final Map<String, dynamic>? existingPlace;
  final Map<String, String> validationErrors;
  final String? errorMessage;

  const PlaceCreateState({
    required this.status,
    required this.name,
    required this.googleMapsUrl,
    required this.lookupStatus,
    required this.showPreview,
    this.previewUrl,
    this.existingPlace,
    required this.validationErrors,
    this.errorMessage,
  });

  factory PlaceCreateState.initial() {
    return const PlaceCreateState(
      status: PlaceCreateStatus.editing,
      name: '',
      googleMapsUrl: '',
      lookupStatus: PlaceLookupStatus.idle,
      showPreview: false,
      validationErrors: {},
    );
  }

  bool get canSubmit =>
      status != PlaceCreateStatus.submitting &&
      lookupStatus == PlaceLookupStatus.available &&
      name.isNotEmpty &&
      googleMapsUrl.isNotEmpty &&
      validationErrors.isEmpty;

  bool get canSelectExisting =>
      lookupStatus == PlaceLookupStatus.duplicate &&
      existingPlace != null &&
      status != PlaceCreateStatus.submitting;

  PlaceCreateState copyWith({
    PlaceCreateStatus? status,
    String? name,
    String? googleMapsUrl,
    PlaceLookupStatus? lookupStatus,
    bool? showPreview,
    String? previewUrl,
    Map<String, dynamic>? existingPlace,
    Map<String, String>? validationErrors,
    String? errorMessage,
    bool clearValidation = false,
    bool clearError = false,
    bool clearPreview = false,
    bool clearExistingPlace = false,
  }) {
    return PlaceCreateState(
      status: status ?? this.status,
      name: name ?? this.name,
      googleMapsUrl: googleMapsUrl ?? this.googleMapsUrl,
      lookupStatus: lookupStatus ?? this.lookupStatus,
      showPreview: clearPreview ? false : (showPreview ?? this.showPreview),
      previewUrl: clearPreview ? null : (previewUrl ?? this.previewUrl),
      existingPlace:
          clearExistingPlace ? null : (existingPlace ?? this.existingPlace),
      validationErrors:
          clearValidation ? {} : (validationErrors ?? this.validationErrors),
      errorMessage: clearError ? null : (errorMessage ?? this.errorMessage),
    );
  }
}
