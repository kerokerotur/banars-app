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
}
