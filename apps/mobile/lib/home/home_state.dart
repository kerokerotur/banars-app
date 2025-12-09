enum HomeStatus {
  loading,
  loaded,
  error,
}

class UserProfile {
  const UserProfile({
    required this.userId,
    required this.displayName,
    this.avatarUrl,
    this.role,
  });

  final String userId;
  final String displayName;
  final String? avatarUrl;
  final String? role;
}

class HomeState {
  const HomeState({
    required this.status,
    this.userProfile,
    this.errorMessage,
  });

  factory HomeState.initial() => const HomeState(
        status: HomeStatus.loading,
      );

  final HomeStatus status;
  final UserProfile? userProfile;
  final String? errorMessage;

  bool get isLoading => status == HomeStatus.loading;
  bool get isLoaded => status == HomeStatus.loaded;
  bool get hasError => status == HomeStatus.error;

  HomeState copyWith({
    HomeStatus? status,
    UserProfile? userProfile,
    String? errorMessage,
    bool clearError = false,
    bool clearProfile = false,
  }) {
    return HomeState(
      status: status ?? this.status,
      userProfile: clearProfile ? null : (userProfile ?? this.userProfile),
      errorMessage: clearError ? null : (errorMessage ?? this.errorMessage),
    );
  }
}

