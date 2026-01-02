import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import 'package:mobile/config/app_env.dart';
import 'package:mobile/event_edit/event_edit_state.dart';
import 'package:mobile/event_create/models/event_place.dart';
import 'package:mobile/event_list/models/event_list_item.dart';
import 'package:mobile/shared/providers/event_types_provider.dart';
import 'package:mobile/shared/services/supabase_function_service.dart';
import 'package:mobile/shared/services/supabase_function_error_handler.dart';

final eventEditControllerProvider =
    NotifierProvider.family<EventEditController, EventEditState, EventListItem>(
  EventEditController.new,
);

class EventEditController extends FamilyNotifier<EventEditState, EventListItem> {
  late final SupabaseClient _supabaseClient;

  @override
  EventEditState build(EventListItem arg) {
    _supabaseClient = Supabase.instance.client;
    // Load cache data on init
    Future.microtask(() => _loadCacheData());
    // Initialize state with event data
    return EventEditState.fromEvent(arg);
  }

  // ========== Initialization ==========

  Future<void> _loadCacheData() async {
    try {
      // Load event types from global cache
      final eventTypesState = ref.read(eventTypesProvider);
      final eventTypes = eventTypesState.eventTypes;

      // Load event places
      final placesResponse = await _supabaseClient
          .from('event_places')
          .select()
          .order('created_at', ascending: false)
          .limit(50) as List<dynamic>;

      final eventPlaces = placesResponse
          .map((json) => EventPlace.fromJson(json as Map<String, dynamic>))
          .toList();

      state = state.copyWith(
        eventTypes: eventTypes,
        eventPlaces: eventPlaces,
        status: EventEditStatus.editing,
      );
    } catch (error) {
      state = state.copyWith(
        status: EventEditStatus.error,
        errorMessage: 'イベント種別・会場情報の読み込みに失敗しました',
      );
    }
  }

  // ========== Form Field Updates ==========

  void updateTitle(String value) {
    state = state.copyWith(
      title: value,
      status: EventEditStatus.editing,
      clearValidation: true,
    );
  }

  void updateEventType(String? eventTypeId) {
    state = state.copyWith(
      selectedEventTypeId: eventTypeId,
      status: EventEditStatus.editing,
      clearValidation: true,
    );
  }

  void updateStartDatetime(DateTime? datetime) {
    state = state.copyWith(
      startDatetime: datetime,
      status: EventEditStatus.editing,
    );
  }

  void clearStartDatetime() {
    state = state.copyWith(
      clearStartDatetime: true,
      status: EventEditStatus.editing,
    );
  }

  void updateMeetingDatetime(DateTime? datetime) {
    state = state.copyWith(
      meetingDatetime: datetime,
      status: EventEditStatus.editing,
    );
  }

  void clearMeetingDatetime() {
    state = state.copyWith(
      clearMeetingDatetime: true,
      status: EventEditStatus.editing,
    );
  }

  void updateResponseDeadline(DateTime? datetime) {
    state = state.copyWith(
      responseDeadlineDatetime: datetime,
      status: EventEditStatus.editing,
    );
  }

  void clearResponseDeadline() {
    state = state.copyWith(
      clearResponseDeadline: true,
      status: EventEditStatus.editing,
    );
  }

  void updateNotesMarkdown(String value) {
    state = state.copyWith(
      notesMarkdown: value,
      status: EventEditStatus.editing,
    );
  }

  // ========== Event Place Selection ==========

  void selectEventPlace(String? eventPlaceId) {
    state = state.copyWith(
      selectedEventPlaceId: eventPlaceId,
      clearValidation: true,
    );
  }

  void clearEventPlace() {
    state = state.copyWith(
      clearEventPlaceId: true,
      status: EventEditStatus.editing,
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

    if (errors.isNotEmpty) {
      state = state.copyWith(
        validationErrors: errors,
        status: EventEditStatus.editing,
      );
      return false;
    }

    state = state.copyWith(clearValidation: true);
    return true;
  }

  // ========== Submit Event Update ==========

  Future<void> submitEvent() async {
    if (!_validateForm()) {
      return;
    }

    state = state.copyWith(
      status: EventEditStatus.submitting,
      clearError: true,
    );

    try {
      final response = await SupabaseFunctionService.invoke(
        client: _supabaseClient,
        functionName: AppEnv.eventUpdateFunctionName,
        body: {
          'eventId': state.eventId,
          'title': state.title.trim(),
          'eventTypeId': state.selectedEventTypeId,
          if (state.startDatetime != null)
            'startDatetime': state.startDatetime!.toUtc().toIso8601String(),
          if (state.meetingDatetime != null)
            'meetingDatetime': state.meetingDatetime!.toUtc().toIso8601String(),
          if (state.responseDeadlineDatetime != null)
            'responseDeadlineDatetime':
                state.responseDeadlineDatetime!.toUtc().toIso8601String(),
          if (state.selectedEventPlaceId != null)
            'eventPlaceId': state.selectedEventPlaceId,
          if (state.notesMarkdown.trim().isNotEmpty)
            'notesMarkdown': state.notesMarkdown.trim(),
        },
      );

      final data = response.data;
      if (data is! Map<String, dynamic> || data['success'] != true) {
        throw const EventEditException('イベントの更新に失敗しました');
      }

      state = state.copyWith(
        status: EventEditStatus.success,
        clearError: true,
      );
    } on FunctionException catch (error) {
      state = state.copyWith(
        status: EventEditStatus.error,
        errorMessage: SupabaseFunctionErrorHandler.extractErrorMessage(error.details) ??
            error.reasonPhrase ??
            'イベントの更新に失敗しました',
      );
    } catch (error) {
      state = state.copyWith(
        status: EventEditStatus.error,
        errorMessage: 'イベントの更新に失敗しました: $error',
      );
    }
  }

  // ========== Place Creation Flow ==========

  /// Refresh event places list and select the latest one
  /// Call this after navigating back from PlaceCreatePage
  Future<void> refreshPlacesAndSelectLatest() async {
    try {
      final placesResponse = await _supabaseClient
          .from('event_places')
          .select()
          .order('created_at', ascending: false)
          .limit(50) as List<dynamic>;

      final eventPlaces = placesResponse
          .map((json) => EventPlace.fromJson(json as Map<String, dynamic>))
          .toList();

      state = state.copyWith(
        eventPlaces: eventPlaces,
      );

      // Auto-select the latest place (first in the list)
      if (eventPlaces.isNotEmpty) {
        final latestPlace = eventPlaces.first;
        selectEventPlace(latestPlace.id);
      }
    } catch (error) {
      state = state.copyWith(
        errorMessage: 'イベント会場情報の更新に失敗しました',
      );
    }
  }
}

class EventEditException implements Exception {
  const EventEditException(this.message);
  final String message;
}
