enum PlaceUpdateStatus {
  editing,
  submitting,
  success,
  error,
}

class PlaceUpdateState {
  final PlaceUpdateStatus status;
  final String placeId;
  final String initialName;
  final String initialGoogleMapsUrl;
  final String name;
  final String googleMapsUrl;
  final bool showPreview;
  final String? previewUrl;
  final Map<String, String> validationErrors;
  final String? errorMessage;

  const PlaceUpdateState({
    required this.status,
    required this.placeId,
    required this.initialName,
    required this.initialGoogleMapsUrl,
    required this.name,
    required this.googleMapsUrl,
    required this.showPreview,
    this.previewUrl,
    required this.validationErrors,
    this.errorMessage,
  });

  factory PlaceUpdateState.initial(String placeId, String name, String googleMapsUrl) {
    return PlaceUpdateState(
      status: PlaceUpdateStatus.editing,
      placeId: placeId,
      initialName: name,
      initialGoogleMapsUrl: googleMapsUrl,
      name: name,
      googleMapsUrl: googleMapsUrl,
      showPreview: true,
      previewUrl: googleMapsUrl,
      validationErrors: const {},
    );
  }

  bool get hasChanges =>
      name != initialName || googleMapsUrl != initialGoogleMapsUrl;

  bool get canSubmit =>
      status != PlaceUpdateStatus.submitting &&
      hasChanges &&
      name.isNotEmpty &&
      googleMapsUrl.isNotEmpty &&
      validationErrors.isEmpty;

  PlaceUpdateState copyWith({
    PlaceUpdateStatus? status,
    String? placeId,
    String? initialName,
    String? initialGoogleMapsUrl,
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
    return PlaceUpdateState(
      status: status ?? this.status,
      placeId: placeId ?? this.placeId,
      initialName: initialName ?? this.initialName,
      initialGoogleMapsUrl: initialGoogleMapsUrl ?? this.initialGoogleMapsUrl,
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
