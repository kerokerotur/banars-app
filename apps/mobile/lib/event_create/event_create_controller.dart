import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import 'package:mobile/config/app_env.dart';
import 'package:mobile/event_create/event_create_state.dart';
import 'package:mobile/event_create/models/event_place.dart';
import 'package:mobile/shared/providers/event_types_provider.dart';
import 'package:mobile/shared/services/supabase_function_service.dart';
import 'package:mobile/shared/services/supabase_function_error_handler.dart';

final eventCreateControllerProvider =
    NotifierProvider<EventCreateController, EventCreateState>(
  EventCreateController.new,
);

class EventCreateController extends Notifier<EventCreateState> {
  late final SupabaseClient _supabaseClient;

  @override
  EventCreateState build() {
    _supabaseClient = Supabase.instance.client;
    // Load cache data on init
    Future.microtask(() => _loadCacheData());
    return EventCreateState.initial();
  }

  // ========== Initialization ==========

  Future<void> _loadCacheData() async {
    try {
      // Load event types from global cache
      final eventTypesState = ref.read(eventTypesProvider);
      final eventTypes = eventTypesState.eventTypes;

      // Load previous venues
      final placesResponse = await _supabaseClient
          .from('event_places')
          .select()
          .order('created_at', ascending: false)
          .limit(50) as List<dynamic>;

      final previousVenues = placesResponse
          .map((json) => EventPlace.fromJson(json as Map<String, dynamic>))
          .toList();

      state = state.copyWith(
        eventTypes: eventTypes,
        previousVenues: previousVenues,
        status: EventCreateStatus.editing,
      );
    } catch (error) {
      state = state.copyWith(
        status: EventCreateStatus.error,
        errorMessage: 'イベント種別・会場情報の読み込みに失敗しました',
      );
    }
  }

  // ========== Form Field Updates ==========

  void updateTitle(String value) {
    state = state.copyWith(
      title: value,
      status: EventCreateStatus.editing,
      clearValidation: true,
    );
  }

  void updateEventType(String? eventTypeId) {
    state = state.copyWith(
      selectedEventTypeId: eventTypeId,
      status: EventCreateStatus.editing,
      clearValidation: true,
    );
  }

  void updateStartDatetime(DateTime? datetime) {
    state = state.copyWith(
      startDatetime: datetime,
      status: EventCreateStatus.editing,
    );
  }

  void clearStartDatetime() {
    state = state.copyWith(
      clearStartDatetime: true,
      status: EventCreateStatus.editing,
    );
  }

  void updateMeetingDatetime(DateTime? datetime) {
    state = state.copyWith(
      meetingDatetime: datetime,
      status: EventCreateStatus.editing,
    );
  }

  void clearMeetingDatetime() {
    state = state.copyWith(
      clearMeetingDatetime: true,
      status: EventCreateStatus.editing,
    );
  }

  void updateResponseDeadline(DateTime? datetime) {
    state = state.copyWith(
      responseDeadlineDatetime: datetime,
      status: EventCreateStatus.editing,
    );
  }

  void clearResponseDeadline() {
    state = state.copyWith(
      clearResponseDeadline: true,
      status: EventCreateStatus.editing,
    );
  }

  void updateNotesMarkdown(String value) {
    state = state.copyWith(
      notesMarkdown: value,
      status: EventCreateStatus.editing,
    );
  }

  // ========== Venue Input Mode ==========

  void switchVenueInputMode(VenueInputMode mode) {
    state = state.copyWith(
      venueInputMode: mode,
      clearValidation: true,
    );
  }

  // ========== Previous Venue Selection ==========

  void selectPreviousVenue(EventPlace place) {
    state = state.copyWith(
      venueName: place.name,
      venueGoogleMapsUrl: place.googleMapsUrl,
      clearValidation: true,
    );
  }

  // ========== Manual Venue Entry ==========

  void updateVenueName(String value) {
    state = state.copyWith(
      venueName: value,
      status: EventCreateStatus.editing,
      clearValidation: true,
    );
  }

  void updateVenueGoogleMapsUrl(String value) {
    state = state.copyWith(
      venueGoogleMapsUrl: value,
      status: EventCreateStatus.editing,
      clearValidation: true,
    );
  }

  // ========== Validation ==========

  bool _validateForm() {
    final errors = <String, String>{};

    if (state.title.trim().isEmpty) {
      errors['title'] = 'タイトルを入力してください';
    }
    if (state.selectedEventTypeId == null) {
      errors['eventType'] = 'イベント種別を選択してください';
    }
    if (state.venueName.trim().isEmpty) {
      errors['venueName'] = '会場名を入力してください';
    }
    if (state.venueGoogleMapsUrl.trim().isEmpty) {
      errors['venueGoogleMapsUrl'] = 'Google Maps URLを入力してください';
    }

    if (errors.isNotEmpty) {
      state = state.copyWith(
        validationErrors: errors,
        status: EventCreateStatus.editing,
      );
      return false;
    }

    state = state.copyWith(clearValidation: true);
    return true;
  }

  // ========== Submit Event ==========

  Future<void> submitEvent() async {
    if (!_validateForm()) {
      return;
    }

    state = state.copyWith(
      status: EventCreateStatus.submitting,
      clearError: true,
    );

    try {
      final response = await SupabaseFunctionService.invoke(
        client: _supabaseClient,
        functionName: AppEnv.eventCreateFunctionName,
        body: {
          'title': state.title.trim(),
          'eventTypeId': state.selectedEventTypeId,
          if (state.startDatetime != null)
            'startDatetime': state.startDatetime!.toUtc().toIso8601String(),
          if (state.meetingDatetime != null)
            'meetingDatetime': state.meetingDatetime!.toUtc().toIso8601String(),
          if (state.responseDeadlineDatetime != null)
            'responseDeadlineDatetime':
                state.responseDeadlineDatetime!.toUtc().toIso8601String(),
          'place': {
            'name': state.venueName.trim(),
            'googleMapsUrl': state.venueGoogleMapsUrl.trim(),
          },
          if (state.notesMarkdown.trim().isNotEmpty)
            'notesMarkdown': state.notesMarkdown.trim(),
        },
      );

      final data = response.data;
      if (data is! Map<String, dynamic> || data['success'] != true) {
        throw const EventCreateException('イベントの作成に失敗しました');
      }

      // Refresh event_places cache
      await _refreshEventPlacesCache();

      state = state.copyWith(
        status: EventCreateStatus.success,
        clearError: true,
      );
    } on FunctionException catch (error) {
      state = state.copyWith(
        status: EventCreateStatus.error,
        errorMessage: SupabaseFunctionErrorHandler.extractErrorMessage(error.details) ??
            error.reasonPhrase ??
            'イベントの作成に失敗しました',
      );
    } catch (error) {
      state = state.copyWith(
        status: EventCreateStatus.error,
        errorMessage: 'イベントの作成に失敗しました: $error',
      );
    }
  }

  Future<void> _refreshEventPlacesCache() async {
    try {
      final placesResponse = await _supabaseClient
          .from('event_places')
          .select()
          .order('created_at', ascending: false)
          .limit(50) as List<dynamic>;

      final previousVenues = placesResponse
          .map((json) => EventPlace.fromJson(json as Map<String, dynamic>))
          .toList();

      state = state.copyWith(previousVenues: previousVenues);
    } catch (error) {
      // Don't fail the overall operation if cache refresh fails
    }
  }

  // ========== Place Creation Flow ==========

  /// Refresh previous venues list and select the latest one
  /// Call this after navigating back from PlaceCreatePage
  Future<void> refreshPlacesAndSelectLatest() async {
    try {
      final placesResponse = await _supabaseClient
          .from('event_places')
          .select()
          .order('created_at', ascending: false)
          .limit(50) as List<dynamic>;

      final previousVenues = placesResponse
          .map((json) => EventPlace.fromJson(json as Map<String, dynamic>))
          .toList();

      // Switch to previous venues mode
      state = state.copyWith(
        previousVenues: previousVenues,
        venueInputMode: VenueInputMode.previousVenues,
      );

      // Auto-select the latest place (first in the list)
      if (previousVenues.isNotEmpty) {
        final latestPlace = previousVenues.first;
        selectPreviousVenue(latestPlace);
      }
    } catch (error) {
      state = state.copyWith(
        errorMessage: 'イベント会場情報の更新に失敗しました',
      );
    }
  }
}

class EventCreateException implements Exception {
  const EventCreateException(this.message);
  final String message;
}
