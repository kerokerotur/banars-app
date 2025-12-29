class AppEnv {
  const AppEnv._();

  static const supabaseUrl = String.fromEnvironment(
    'SUPABASE_URL',
    defaultValue: 'https://example.supabase.co',
  );
  static const supabaseAnonKey = String.fromEnvironment(
    'SUPABASE_ANON_KEY',
    defaultValue: 'supabase-anon-key',
  );
  static const lineChannelId = String.fromEnvironment(
    'LINE_CHANNEL_ID',
    defaultValue: '1234567890',
  );

  static const inviteLinkScheme = 'banars';
  static const inviteLinkHost = 'invite';
  static const inviteTokenQueryParam = 'token';

  static const initialSignupFunctionName = 'initial_signup';
  static const lineLoginFunctionName = 'line_login';
  static const getMeFunctionName = 'get_me';
  static const getEventTypesFunctionName = 'get_event_types';
  static const eventCreateFunctionName = 'event_create';
  static const eventListFunctionName = 'event_list';
  static const eventDetailFunctionName = 'event_detail';
  static const attendanceRegisterFunctionName = 'attendance_register';
  static const searchPlacesFunctionName = 'search_places';
  static const placeListFunctionName = 'place_list';
  static const placeLookupFunctionName = 'place_lookup';
  static const placeCreateFunctionName = 'place_create';
  static const placeUpdateFunctionName = 'place_update';
  static const placeDeleteFunctionName = 'place_delete';
  static const userListFunctionName = 'user_list';
  static const eventAttendancesSummaryFunctionName =
      'event_attendances_summary';
}
