import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_line_sdk/flutter_line_sdk.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/date_symbol_data_local.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import 'config/app_env.dart';
import 'home/home_page.dart';
import 'shared/providers/theme_provider.dart';
import 'shared/theme/app_theme.dart';
import 'signup/signup_page.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // 日付ロケールを初期化（例：DateFormat で ja_JP を利用するため）
  await initializeDateFormatting('ja_JP');

  // SharedPreferences を初期化
  final sharedPreferences = await SharedPreferences.getInstance();

  await Supabase.initialize(
    url: AppEnv.supabaseUrl,
    anonKey: AppEnv.supabaseAnonKey,
  );

  try {
    await LineSDK.instance.setup(AppEnv.lineChannelId);
  } on PlatformException catch (error) {
    debugPrint('LINE SDK setup failed: ${error.message}');
  }

  runApp(
    ProviderScope(
      overrides: [
        // SharedPreferences のプロバイダーをオーバーライド
        sharedPreferencesProvider.overrideWithValue(sharedPreferences),
      ],
      child: const BanarsApp(),
    ),
  );
}

class BanarsApp extends ConsumerWidget {
  const BanarsApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final themeMode = ref.watch(themeModeProvider);

    return MaterialApp(
      title: 'banars',
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: themeMode,
      home: const AuthGate(),
    );
  }
}

/// 認証状態に基づいて画面を切り替えるウィジェット
class AuthGate extends StatefulWidget {
  const AuthGate({super.key});

  @override
  State<AuthGate> createState() => _AuthGateState();
}

class _AuthGateState extends State<AuthGate> {
  @override
  Widget build(BuildContext context) {
    return StreamBuilder<AuthState>(
      stream: Supabase.instance.client.auth.onAuthStateChange,
      builder: (context, snapshot) {
        // 初期状態またはセッション情報待ち
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Scaffold(
            body: Center(
              child: CircularProgressIndicator(),
            ),
          );
        }

        // セッションがあるかどうかで画面を切り替え
        final session = Supabase.instance.client.auth.currentSession;
        if (session != null) {
          return const HomePage();
        }

        return const SignupPage();
      },
    );
  }
}
