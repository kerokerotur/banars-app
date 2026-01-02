import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_line_sdk/flutter_line_sdk.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/date_symbol_data_local.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import 'config/app_env.dart';
import 'home/home_page.dart';
import 'shared/providers/theme_provider.dart';
import 'shared/theme/app_theme.dart';
import 'signup/signup_page.dart';
import 'splash/splash_page.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // SharedPreferences を初期化
  final sharedPreferences = await SharedPreferences.getInstance();

  runApp(
    ProviderScope(
      overrides: [
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
      locale: const Locale('ja', 'JP'),
      localizationsDelegates: const [
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      supportedLocales: const [
        Locale('ja', 'JP'),
      ],
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
  SharedPreferences? _sharedPreferences;

  @override
  void initState() {
    super.initState();
    _initializeApp();
  }

  /// アプリケーションの初期化処理
  ///
  /// Supabase, LINE SDK, SharedPreferences などの初期化を行います。
  /// 最小表示時間（1秒）を確保してスプラッシュ画面のチラつきを防ぎます。
  Future<void> _initializeApp() async {
    final startTime = DateTime.now();

    try {
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

      // 最小表示時間（1秒）を確保
      final elapsed = DateTime.now().difference(startTime);
      final remainingTime = const Duration(seconds: 1) - elapsed;
      if (remainingTime.isNegative == false) {
        await Future.delayed(remainingTime);
      }

      if (mounted) {
        setState(() {
          _sharedPreferences = sharedPreferences;
        });
      }
    } catch (error) {
      debugPrint('App initialization failed: $error');
      // エラーが発生した場合もダミーのSharedPreferencesを作成して進める
      if (mounted) {
        final prefs = await SharedPreferences.getInstance();
        setState(() {
          _sharedPreferences = prefs;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    // 初期化中はスプラッシュ画面を表示
    if (_sharedPreferences == null) {
      return const SplashPage();
    }

    // ProviderScope のオーバーライドは不要（main で既に設定済み）
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
