import 'package:flutter/material.dart';
import 'package:flutter_line_sdk/flutter_line_sdk.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import 'config/app_env.dart';
import 'home/home_page.dart';
import 'signup/signup_page.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  await Supabase.initialize(
    url: AppEnv.supabaseUrl,
    anonKey: AppEnv.supabaseAnonKey,
  );

  try {
    await LineSDK.instance.setup(AppEnv.lineChannelId);
  } on PlatformException catch (error) {
    debugPrint('LINE SDK setup failed: ${error.message}');
  }

  runApp(const ProviderScope(child: BanarsApp()));
}

class BanarsApp extends StatelessWidget {
  const BanarsApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'banars',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.green),
        useMaterial3: true,
      ),
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
