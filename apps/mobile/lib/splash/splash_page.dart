import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_line_sdk/flutter_line_sdk.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/date_symbol_data_local.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import 'package:mobile/config/app_env.dart';
import 'package:mobile/event_list/event_list_controller.dart';
import 'package:mobile/event_list/event_list_state.dart';
import 'package:mobile/home/home_controller.dart';
import 'package:mobile/home/home_page.dart';
import 'package:mobile/home/home_state.dart';
import 'package:mobile/shared/providers/event_types_provider.dart';
import 'package:mobile/shared/providers/users_provider.dart';
import 'package:mobile/signup/signup_page.dart';

/// アプリケーション起動時に表示されるスプラッシュ画面
///
/// アプリの初期化処理とデータプリフェッチを行います。
/// - アプリ初期化（Supabase, LINE SDK, SharedPreferences）
/// - 認証状態確認
/// - ログイン済みの場合、データプリフェッチ（イベント一覧、ユーザー情報等）
/// - 完了後、適切な画面へ遷移
class SplashPage extends ConsumerStatefulWidget {
  const SplashPage({super.key});

  @override
  ConsumerState<SplashPage> createState() => _SplashPageState();
}

class _SplashPageState extends ConsumerState<SplashPage> {
  bool _isInitializing = true;
  String _statusMessage = '初期化中...';

  @override
  void initState() {
    super.initState();
    _initializeAndNavigate();
  }

  /// ステータスメッセージを更新
  void _updateStatus(String message) {
    if (mounted) {
      setState(() {
        _statusMessage = message;
      });
    }
  }

  /// アプリ初期化とデータプリフェッチを実行し、適切な画面へ遷移
  Future<void> _initializeAndNavigate() async {
    final startTime = DateTime.now();

    try {
      // 1. 基本初期化
      _updateStatus('初期化中...');
      await _initializeApp();

      // 2. 認証状態確認
      _updateStatus('認証状態を確認中...');
      final session = Supabase.instance.client.auth.currentSession;

      // 3. ログイン済みの場合、データプリフェッチ
      if (session != null) {
        _updateStatus('データを読み込み中...');
        await _prefetchData();
      }

      // 4. 最小表示時間（1秒）を確保
      final elapsed = DateTime.now().difference(startTime);
      final remainingTime = const Duration(seconds: 1) - elapsed;
      if (remainingTime.isNegative == false) {
        await Future.delayed(remainingTime);
      }

      // 5. 適切な画面へ遷移
      if (!mounted) return;
      setState(() {
        _isInitializing = false;
      });

      if (session != null) {
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(builder: (context) => const HomePage()),
        );
      } else {
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(builder: (context) => const SignupPage()),
        );
      }
    } catch (error) {
      debugPrint('Splash initialization failed: $error');
      // エラーが発生してもサインアップ画面へ遷移
      if (!mounted) return;
      setState(() {
        _isInitializing = false;
      });
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (context) => const SignupPage()),
      );
    }
  }

  /// アプリケーションの基本初期化
  Future<void> _initializeApp() async {
    // 日付ロケールを初期化
    await initializeDateFormatting('ja_JP');

    // Supabase初期化
    await Supabase.initialize(
      url: AppEnv.supabaseUrl,
      anonKey: AppEnv.supabaseAnonKey,
    );

    // LINE SDK初期化
    try {
      await LineSDK.instance.setup(AppEnv.lineChannelId);
    } on PlatformException catch (error) {
      debugPrint('LINE SDK setup failed: ${error.message}');
    }
  }

  /// ログイン済みユーザー向けのデータプリフェッチ
  Future<void> _prefetchData() async {
    try {
      // 各プロバイダーを初期化してAPIリクエストを開始
      ref.read(eventListControllerProvider);
      ref.read(eventTypesProvider);
      ref.read(usersProvider);
      ref.read(homeControllerProvider);

      // すべてのAPIリクエストが完了するまで待機
      await _waitForAllData();
    } catch (error) {
      debugPrint('Data prefetch error: $error');
      // エラーが発生しても画面遷移は続行（各画面で再取得可能）
    }
  }

  /// すべてのデータの読み込み完了を待機
  Future<void> _waitForAllData() async {
    const maxWaitTime = Duration(seconds: 10); // タイムアウト
    const checkInterval = Duration(milliseconds: 100);
    final startTime = DateTime.now();

    while (true) {
      final eventListState = ref.read(eventListControllerProvider);
      final eventTypesState = ref.read(eventTypesProvider);
      final usersState = ref.read(usersProvider);
      final homeState = ref.read(homeControllerProvider);

      // すべてのデータが loaded または error の状態になったら完了
      final isEventListReady =
          eventListState.status == EventListStatus.loaded ||
              eventListState.status == EventListStatus.error;
      final isEventTypesReady =
          eventTypesState.isLoaded || eventTypesState.hasError;
      final isUsersReady = usersState.isLoaded || usersState.hasError;
      final isHomeReady = homeState.status == HomeStatus.loaded ||
          homeState.status == HomeStatus.error;

      if (isEventListReady &&
          isEventTypesReady &&
          isUsersReady &&
          isHomeReady) {
        break;
      }

      // タイムアウトチェック
      if (DateTime.now().difference(startTime) > maxWaitTime) {
        debugPrint('Data prefetch timeout');
        break;
      }

      await Future.delayed(checkInterval);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF001F3F), // スプラッシュ背景色（紺色）
      body: Stack(
        children: [
          // スプラッシュ画像
          Center(
            child: Image.asset(
              'assets/images/splash/app_splash.png',
              fit: BoxFit.contain,
              width: double.infinity,
            ),
          ),

          // ローディングインジケーター（画像の上に重ねて表示）
          if (_isInitializing)
            Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const SizedBox(
                    width: 40,
                    height: 40,
                    child: CircularProgressIndicator(
                      strokeWidth: 4,
                      valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                    ),
                  ),
                  const SizedBox(height: 24),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 24,
                      vertical: 12,
                    ),
                    decoration: BoxDecoration(
                      color: Colors.black.withValues(alpha: 0.3),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      _statusMessage,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 14,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }
}
