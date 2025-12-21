enum PlaceCreateStatus {
  editing,
  submitting,
  success,
  error,
}

class PlaceCreateState {
  final PlaceCreateStatus status;
  final String name;
  final String googleMapsUrl;
  final bool showPreview;
  final String? previewUrl;
  final Map<String, String> validationErrors;
  final String? errorMessage;

  const PlaceCreateState({
    required this.status,
    required this.name,
    required this.googleMapsUrl,
    required this.showPreview,
    this.previewUrl,
    required this.validationErrors,
    this.errorMessage,
  });

  factory PlaceCreateState.initial() {
    return const PlaceCreateState(
      status: PlaceCreateStatus.editing,
      name: '',
      googleMapsUrl: '',
      showPreview: false,
      validationErrors: {},
    );
  }

  bool get canSubmit =>
      status != PlaceCreateStatus.submitting &&
      name.isNotEmpty &&
      googleMapsUrl.isNotEmpty &&
      validationErrors.isEmpty;

  PlaceCreateState copyWith({
    PlaceCreateStatus? status,
    String? name,
    String? googleMapsUrl,
    bool? showPreview,
    String? previewUrl,
    Map<String, String>? validationErrors,
    String? errorMessage,
    bool clearValidation = false,
    bool clearError = false,
    bool clearPreview = false,
  }) {
    return PlaceCreateState(
      status: status ?? this.status,
      name: name ?? this.name,
      googleMapsUrl: googleMapsUrl ?? this.googleMapsUrl,
      showPreview: clearPreview ? false : (showPreview ?? this.showPreview),
      previewUrl: clearPreview ? null : (previewUrl ?? this.previewUrl),
      validationErrors:
          clearValidation ? {} : (validationErrors ?? this.validationErrors),
      errorMessage: clearError ? null : (errorMessage ?? this.errorMessage),
    );
  }
}
