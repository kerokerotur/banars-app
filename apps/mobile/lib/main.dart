import 'package:flutter/material.dart';
import 'package:flutter_line_sdk/flutter_line_sdk.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import 'config/app_env.dart';
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
      title: 'banars signup',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.green),
        useMaterial3: true,
      ),
      home: const SignupPage(),
    );
  }
}
