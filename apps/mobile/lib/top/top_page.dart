import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/home/home_page.dart';
import 'package:mobile/login/login_controller.dart';
import 'package:mobile/login/login_state.dart';
import 'package:mobile/shared/theme/app_colors.dart';
import 'package:mobile/signup/signup_page.dart';

/// アプリケーションのトップ画面
///
/// ログインと新規登録の選択肢を提供します。
/// - ログインボタン: LINEログインを実行
/// - 新規登録ボタン: サインアップ画面へ遷移
class TopPage extends ConsumerStatefulWidget {
  const TopPage({super.key});

  @override
  ConsumerState<TopPage> createState() => _TopPageState();
}

class _TopPageState extends ConsumerState<TopPage> {
  ProviderSubscription<LoginState>? _loginSubscription;

  @override
  void initState() {
    super.initState();
    _loginSubscription =
        ref.listenManual(loginControllerProvider, _onLoginStateChanged);
  }

  @override
  void dispose() {
    _loginSubscription?.close();
    super.dispose();
  }

  void _onLoginStateChanged(LoginState? previous, LoginState next) {
    if (next.errorMessage != null &&
        next.errorMessage != previous?.errorMessage) {
      _showSnackBar(next.errorMessage!, isError: true);
    }

    final previousStatus = previous?.status;
    if (next.status == LoginStatus.success &&
        previousStatus != LoginStatus.success) {
      _showSnackBar('ログインが完了しました。');

      // ログイン成功時、ホームページへ遷移
      if (mounted) {
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(
            builder: (context) => const HomePage(),
          ),
        );
      }
    }
  }

  void _showSnackBar(String message, {bool isError = false}) {
    final colorScheme = Theme.of(context).colorScheme;
    final snackBar = SnackBar(
      content: Text(message),
      backgroundColor: isError ? colorScheme.error : null,
    );
    if (!mounted) return;
    ScaffoldMessenger.of(context)
      ..hideCurrentSnackBar()
      ..showSnackBar(snackBar);
  }

  @override
  Widget build(BuildContext context) {
    final loginState = ref.watch(loginControllerProvider);

    return Scaffold(
      backgroundColor: const Color(0xFF001F3F), // スプラッシュと同じ背景色（紺色）
      body: SafeArea(
        child: Stack(
          children: [
            // 背景画像
            Center(
              child: Image.asset(
                'assets/images/splash/app_splash.png',
                fit: BoxFit.contain,
                width: double.infinity,
              ),
            ),

            // ボタン群を下部に配置
            Positioned(
              left: 24,
              right: 24,
              bottom: 48,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  // ログインボタン
                  SizedBox(
                    width: double.infinity,
                    height: 56,
                    child: ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.lineGreen,
                        foregroundColor: Colors.white,
                        disabledBackgroundColor:
                            AppColors.lineGreen.withValues(alpha: 0.5),
                        disabledForegroundColor:
                            Colors.white.withValues(alpha: 0.7),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                        elevation: 0,
                      ),
                      icon: loginState.isBusy
                          ? const SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                color: Colors.white,
                              ),
                            )
                          : const Icon(Icons.login, size: 24),
                      label: const Text(
                        'LINE でログイン',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      onPressed: loginState.canStartLogin && !loginState.isBusy
                          ? () => ref
                              .read(loginControllerProvider.notifier)
                              .startLogin()
                          : null,
                    ),
                  ),
                  const SizedBox(height: 16),

                  // 新規登録ボタン
                  SizedBox(
                    width: double.infinity,
                    height: 56,
                    child: OutlinedButton.icon(
                      style: OutlinedButton.styleFrom(
                        foregroundColor: Colors.white,
                        side: const BorderSide(color: Colors.white, width: 2),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      icon: const Icon(Icons.person_add, size: 24),
                      label: const Text(
                        '新規登録',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      onPressed: () {
                        Navigator.of(context).push(
                          MaterialPageRoute(
                            builder: (context) => const SignupPage(),
                          ),
                        );
                      },
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
