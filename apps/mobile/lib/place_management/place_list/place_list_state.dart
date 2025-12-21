import 'package:mobile/place_management/models/place.dart';

enum PlaceListStatus {
  initial,
  loading,
  loaded,
  deleting,
  error,
}

class PlaceListState {
  final PlaceListStatus status;
  final List<Place> places;
  final String? errorMessage;
  final String? deletingPlaceId;

  const PlaceListState({
    required this.status,
    required this.places,
    this.errorMessage,
    this.deletingPlaceId,
  });

  factory PlaceListState.initial() {
    return const PlaceListState(
      status: PlaceListStatus.initial,
      places: [],
    );
  }

  bool get isLoading => status == PlaceListStatus.loading;
  bool get isDeleting => status == PlaceListStatus.deleting;

  PlaceListState copyWith({
    PlaceListStatus? status,
    List<Place>? places,
    String? errorMessage,
    String? deletingPlaceId,
    bool clearError = false,
    bool clearDeletingPlaceId = false,
  }) {
    return PlaceListState(
      status: status ?? this.status,
      places: places ?? this.places,
      errorMessage: clearError ? null : (errorMessage ?? this.errorMessage),
      deletingPlaceId: clearDeletingPlaceId
          ? null
          : (deletingPlaceId ?? this.deletingPlaceId),
    );
  }
}
