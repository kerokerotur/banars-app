import 'package:flutter/material.dart';

/// アプリ全体のカラートークン定義
///
/// セマンティックカラーを定義し、ライト/ダークテーマで一貫した
/// カラーシステムを提供する。
class AppColors {
  AppColors._();

  // ==========================================================================
  // ブランドカラー（ライト/ダーク共通）
  // ==========================================================================

  /// プライマリカラー（ピンク/コーラル系）
  static const Color primary = Color(0xFFE91E63);

  /// プライマリカラー（明るめ）
  static const Color primaryLight = Color(0xFFF06292);

  /// プライマリカラー（暗め）
  static const Color primaryDark = Color(0xFFC2185B);

  // ==========================================================================
  // ライトテーマ用カラー
  // ==========================================================================

  /// ライト: 背景色
  static const Color lightBackground = Color(0xFFFAFAFA);

  /// ライト: サーフェス色（カード、シートなど）
  static const Color lightSurface = Colors.white;

  /// ライト: サーフェス色（高コントラスト）
  static const Color lightSurfaceContainer = Color(0xFFF5F5F5);

  /// ライト: プライマリテキスト
  static const Color lightTextPrimary = Color(0xFF212121);

  /// ライト: セカンダリテキスト
  static const Color lightTextSecondary = Color(0xFF757575);

  /// ライト: 無効テキスト
  static const Color lightTextDisabled = Color(0xFFBDBDBD);

  /// ライト: ナビゲーションアクティブ
  static const Color lightNavActive = primary;

  /// ライト: ナビゲーション非アクティブ
  static const Color lightNavInactive = Color(0xFF9E9E9E);

  /// ライト: ディバイダー
  static const Color lightDivider = Color(0xFFEEEEEE);

  /// ライト: シャドウ
  static const Color lightShadow = Colors.black;

  // ==========================================================================
  // ダークテーマ用カラー
  // ==========================================================================

  /// ダーク: 背景色
  static const Color darkBackground = Color(0xFF121212);

  /// ダーク: サーフェス色（カード、シートなど）
  static const Color darkSurface = Color(0xFF1E1E1E);

  /// ダーク: サーフェス色（高コントラスト）
  static const Color darkSurfaceContainer = Color(0xFF2C2C2C);

  /// ダーク: プライマリテキスト
  static const Color darkTextPrimary = Color(0xFFE0E0E0);

  /// ダーク: セカンダリテキスト
  static const Color darkTextSecondary = Color(0xFF9E9E9E);

  /// ダーク: 無効テキスト
  static const Color darkTextDisabled = Color(0xFF616161);

  /// ダーク: ナビゲーションアクティブ（ピンクを維持）
  static const Color darkNavActive = primaryLight;

  /// ダーク: ナビゲーション非アクティブ
  static const Color darkNavInactive = Color(0xFF757575);

  /// ダーク: ディバイダー
  static const Color darkDivider = Color(0xFF424242);

  /// ダーク: シャドウ
  static const Color darkShadow = Colors.black;

  // ==========================================================================
  // セマンティックカラー（ステータス）
  // ==========================================================================

  /// エラー色
  static const Color error = Color(0xFFE53935);

  /// エラー色（ダーク用、明るめ）
  static const Color errorLight = Color(0xFFEF5350);

  /// 成功色
  static const Color success = Color(0xFF43A047);

  /// 警告色
  static const Color warning = Color(0xFFFFA000);

  /// 情報色
  static const Color info = Color(0xFF1E88E5);
}

