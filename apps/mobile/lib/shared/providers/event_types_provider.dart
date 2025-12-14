import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import 'package:mobile/config/app_env.dart';
import 'package:mobile/event_create/models/event_type.dart';

/// イベント種別のキャッシュ状態
enum EventTypesStatus {
  initial,
  loading,
  loaded,
  error,
}

/// イベント種別のキャッシュState
class EventTypesState {
  const EventTypesState({
    required this.status,
    this.eventTypes = const [],
    this.errorMessage,
  });

  factory EventTypesState.initial() => const EventTypesState(
        status: EventTypesStatus.initial,
      );

  final EventTypesStatus status;
  final List<EventType> eventTypes;
  final String? errorMessage;

  bool get isLoading => status == EventTypesStatus.loading;
  bool get isLoaded => status == EventTypesStatus.loaded;
  bool get hasError => status == EventTypesStatus.error;

  EventTypesState copyWith({
    EventTypesStatus? status,
    List<EventType>? eventTypes,
    String? errorMessage,
    bool clearError = false,
  }) {
    return EventTypesState(
      status: status ?? this.status,
      eventTypes: eventTypes ?? this.eventTypes,
      errorMessage: clearError ? null : (errorMessage ?? this.errorMessage),
    );
  }
}

/// イベント種別のキャッシュController
class EventTypesNotifier extends Notifier<EventTypesState> {
  late final SupabaseClient _supabaseClient;

  @override
  EventTypesState build() {
    _supabaseClient = Supabase.instance.client;
    // アプリ起動時に自動的に取得
    Future.microtask(() => fetchEventTypes());
    return EventTypesState.initial();
  }

  /// イベント種別を取得してキャッシュ
  Future<void> fetchEventTypes() async {
    if (state.isLoading) return;

    state = state.copyWith(
      status: EventTypesStatus.loading,
      clearError: true,
    );

    try {
      final response = await _supabaseClient.functions.invoke(
        AppEnv.getEventTypesFunctionName,
        method: HttpMethod.get,
      );

      final data = response.data;
      if (data is! List) {
        throw Exception('Invalid response format');
      }

      final eventTypes = data
          .map((json) => EventType.fromJson(json as Map<String, dynamic>))
          .toList();

      state = state.copyWith(
        status: EventTypesStatus.loaded,
        eventTypes: eventTypes,
        clearError: true,
      );
    } on FunctionException catch (error) {
      debugPrint('Failed to fetch event types: ${error.details}');
      state = state.copyWith(
        status: EventTypesStatus.error,
        errorMessage: error.reasonPhrase ?? 'イベント種別の取得に失敗しました',
      );
    } catch (error) {
      debugPrint('Failed to fetch event types: $error');
      state = state.copyWith(
        status: EventTypesStatus.error,
        errorMessage: 'イベント種別の取得に失敗しました: $error',
      );
    }
  }
}

/// イベント種別のキャッシュProvider
final eventTypesProvider =
    NotifierProvider<EventTypesNotifier, EventTypesState>(
  EventTypesNotifier.new,
);
