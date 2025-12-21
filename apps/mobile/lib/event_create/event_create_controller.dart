import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import 'package:mobile/config/app_env.dart';
import 'package:mobile/event_create/event_create_state.dart';
import 'package:mobile/event_create/models/event_place.dart';
import 'package:mobile/event_create/models/nominatim_result.dart';
import 'package:mobile/shared/providers/event_types_provider.dart';

final eventCreateControllerProvider =
    NotifierProvider<EventCreateController, EventCreateState>(
  EventCreateController.new,
);

class EventCreateController extends Notifier<EventCreateState> {
  late final SupabaseClient _supabaseClient;
  DateTime? _lastNominatimRequest;
  static const _nominatimRateLimit = Duration(seconds: 1);

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
      debugPrint('Failed to load cache data: $error');
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
      nominatimSearchStatus: NominatimSearchStatus.idle,
      nominatimResults: [],
      clearValidation: true,
    );
  }

  // ========== Nominatim Search ==========

  void updateNominatimSearchQuery(String query) {
    state = state.copyWith(
      nominatimSearchQuery: query,
    );

    // Clear results when query is empty
    if (query.isEmpty) {
      state = state.copyWith(
        nominatimResults: [],
        nominatimSearchStatus: NominatimSearchStatus.idle,
      );
    }
  }

  Future<void> performNominatimSearch() async {
    final query = state.nominatimSearchQuery;
    if (query.isEmpty) {
      return;
    }
    // Rate limiting check
    if (_lastNominatimRequest != null) {
      final elapsed = DateTime.now().difference(_lastNominatimRequest!);
      if (elapsed < _nominatimRateLimit) {
        final waitTime = _nominatimRateLimit - elapsed;
        await Future.delayed(waitTime);
      }
    }

    state = state.copyWith(
      nominatimSearchStatus: NominatimSearchStatus.searching,
    );

    try {
      _lastNominatimRequest = DateTime.now();

      final response = await _supabaseClient.functions.invoke(
        AppEnv.searchPlacesFunctionName,
        body: {
          'query': query,
          'limit': 5,
          'countryCodes': ['jp'],
        },
      );

      final data = response.data;
      if (data is Map && data['success'] == true && data['results'] is List) {
        final results = (data['results'] as List)
            .map(
              (json) =>
                  NominatimResult.fromJson(json as Map<String, dynamic>),
            )
            .toList();

        state = state.copyWith(
          nominatimResults: results,
          nominatimSearchStatus: NominatimSearchStatus.success,
        );
      } else {
        throw Exception('unexpected response');
      }
    } on FunctionException catch (error) {
      debugPrint('search_places FunctionException: ${error.details}');
      if (error.status == 429) {
        state = state.copyWith(
          nominatimSearchStatus: NominatimSearchStatus.rateLimited,
          errorMessage: _extractErrorMessage(error.details) ??
              'レート制限に達しました。しばらくお待ちください。',
        );
      } else {
        state = state.copyWith(
          nominatimSearchStatus: NominatimSearchStatus.error,
          errorMessage: _extractErrorMessage(error.details) ??
              error.reasonPhrase ??
              '会場検索に失敗しました。手入力をお試しください。',
        );
      }
    } catch (error) {
      debugPrint('Nominatim search error: $error');
      state = state.copyWith(
        nominatimSearchStatus: NominatimSearchStatus.error,
        errorMessage: '会場検索に失敗しました。手入力をお試しください。',
      );
    }
  }

  void selectNominatimResult(NominatimResult result) {
    state = state.copyWith(
      venueName: result.formattedName,
      venueAddress: result.displayName,
      venueLatitude: result.lat,
      venueLongitude: result.lon,
      venueOsmId: result.osmId,
      venueOsmType: result.osmType,
      nominatimSearchStatus: NominatimSearchStatus.idle,
      nominatimResults: [],
      clearValidation: true,
    );
  }

  // ========== Previous Venue Selection ==========

  void selectPreviousVenue(EventPlace place) {
    state = state.copyWith(
      venueName: place.name,
      venueAddress: place.address,
      venueLatitude: place.latitude,
      venueLongitude: place.longitude,
      venueOsmId: place.osmId,
      venueOsmType: place.osmType,
      clearValidation: true,
    );
  }

  // ========== Manual Venue Entry ==========

  void updateVenueName(String value) {
    state = state.copyWith(
      venueName: value,
      status: EventCreateStatus.editing,
      clearValidation: true,
      clearVenueOsm: true, // Clear OSM data when manually editing
    );
  }

  void updateVenueAddress(String value) {
    state = state.copyWith(
      venueAddress: value,
      status: EventCreateStatus.editing,
      clearValidation: true,
      clearVenueOsm: true,
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
    if (state.venueAddress.trim().isEmpty) {
      errors['venueAddress'] = '住所を入力してください';
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
      final response = await _supabaseClient.functions.invoke(
        AppEnv.eventCreateFunctionName,
        body: {
          'title': state.title.trim(),
          'eventTypeId': state.selectedEventTypeId,
          if (state.startDatetime != null)
            'startDatetime': state.startDatetime!.toIso8601String(),
          if (state.meetingDatetime != null)
            'meetingDatetime': state.meetingDatetime!.toIso8601String(),
          if (state.responseDeadlineDatetime != null)
            'responseDeadlineDatetime':
                state.responseDeadlineDatetime!.toIso8601String(),
          'place': {
            'name': state.venueName.trim(),
            'address': state.venueAddress.trim(),
            if (state.venueLatitude != null) 'latitude': state.venueLatitude,
            if (state.venueLongitude != null)
              'longitude': state.venueLongitude,
            if (state.venueOsmId != null) 'osmId': state.venueOsmId,
            if (state.venueOsmType != null) 'osmType': state.venueOsmType,
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
      debugPrint('event_create FunctionException: ${error.details}');
      state = state.copyWith(
        status: EventCreateStatus.error,
        errorMessage: _extractErrorMessage(error.details) ??
            error.reasonPhrase ??
            'イベントの作成に失敗しました',
      );
    } catch (error) {
      debugPrint('event_create error: $error');
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
      debugPrint('Failed to refresh event_places cache: $error');
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
      debugPrint('Failed to refresh places and select latest: $error');
      state = state.copyWith(
        errorMessage: 'イベント会場情報の更新に失敗しました',
      );
    }
  }

  String? _extractErrorMessage(dynamic details) {
    if (details == null) return null;
    if (details is String) return details;
    if (details is Map<String, dynamic>) {
      final message = details['message'];
      if (message is String) return message;
      final error = details['error'];
      if (error is Map<String, dynamic>) {
        final errorMessage = error['message'];
        if (errorMessage is String) return errorMessage;
      }
    }
    return details.toString();
  }
}

class EventCreateException implements Exception {
  const EventCreateException(this.message);
  final String message;
}
