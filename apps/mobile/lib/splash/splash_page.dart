import 'package:flutter/material.dart';

/// アプリケーション起動時に表示されるスプラッシュ画面
///
/// アプリの初期化処理（Supabase, LINE SDK等）が完了するまで表示されます。
/// 最小表示時間は1秒に設定されており、チラつきを防ぎます。
class SplashPage extends StatelessWidget {
  const SplashPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF06292), // スプラッシュ背景色
      body: Center(
        child: Image.asset(
          'assets/images/splash/app_splash.png',
          fit: BoxFit.contain,
          width: double.infinity,
        ),
      ),
    );
  }
}
