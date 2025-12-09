import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// テーマ設定の永続化キー
const _themePreferenceKey = 'theme_mode';

/// SharedPreferences のプロバイダー
///
/// アプリ起動時に初期化される必要がある。
final sharedPreferencesProvider = Provider<SharedPreferences>((ref) {
  throw UnimplementedError(
    'sharedPreferencesProvider must be overridden with a valid SharedPreferences instance',
  );
});

/// 現在のテーマモードを提供するプロバイダー
final themeModeProvider =
    NotifierProvider<ThemeModeNotifier, ThemeMode>(ThemeModeNotifier.new);

/// テーマモードを管理する Notifier
class ThemeModeNotifier extends Notifier<ThemeMode> {
  @override
  ThemeMode build() {
    final prefs = ref.watch(sharedPreferencesProvider);
    return _loadThemeMode(prefs);
  }

  /// SharedPreferences からテーマモードを読み込む
  ThemeMode _loadThemeMode(SharedPreferences prefs) {
    final savedMode = prefs.getString(_themePreferenceKey);
    switch (savedMode) {
      case 'dark':
        return ThemeMode.dark;
      case 'light':
      default:
        return ThemeMode.light;
    }
  }

  /// テーマをダークモードに設定
  Future<void> setDarkMode() async {
    state = ThemeMode.dark;
    final prefs = ref.read(sharedPreferencesProvider);
    await prefs.setString(_themePreferenceKey, 'dark');
  }

  /// テーマをライトモードに設定
  Future<void> setLightMode() async {
    state = ThemeMode.light;
    final prefs = ref.read(sharedPreferencesProvider);
    await prefs.setString(_themePreferenceKey, 'light');
  }

  /// テーマを切り替える
  Future<void> toggleTheme() async {
    if (state == ThemeMode.dark) {
      await setLightMode();
    } else {
      await setDarkMode();
    }
  }

  /// ダークモードかどうか
  bool get isDarkMode => state == ThemeMode.dark;
}

/// ダークモードかどうかを返す便利プロバイダー
final isDarkModeProvider = Provider<bool>((ref) {
  return ref.watch(themeModeProvider) == ThemeMode.dark;
});
