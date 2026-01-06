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

  /// エラー色（暗め）
  static const Color errorDark = Color(0xFFD32F2F); // red.shade700

  /// エラー背景色（薄め）
  static const Color errorBackgroundLight = Color(0xFFFFEBEE); // red with alpha 0.1 相当

  /// 成功色
  static const Color success = Color(0xFF43A047);

  /// 成功色（暗め）
  static const Color successDark = Color(0xFF388E3C); // green.shade700

  /// 成功背景色（薄め）
  static const Color successBackgroundLight = Color(0xFFE8F5E9); // green with alpha 0.1 相当

  /// 警告色
  static const Color warning = Color(0xFFFFA000);

  /// 情報色
  static const Color info = Color(0xFF1E88E5);

  // ==========================================================================
  // 出欠ステータスバッジカラー
  // ==========================================================================

  /// 参加ステータス: 背景色
  static const Color attendingBackground = Color(0xFFC8E6C9); // green.shade100

  /// 参加ステータス: テキスト色
  static const Color attendingText = Color(0xFF1B5E20); // green.shade900

  /// 欠席ステータス: 背景色
  static const Color absentBackground = Color(0xFFFFCDD2); // red.shade100

  /// 欠席ステータス: テキスト色
  static const Color absentText = Color(0xFFB71C1C); // red.shade900

  /// 保留ステータス: 背景色
  static const Color pendingBackground = Color(0xFFFFE0B2); // orange.shade100

  /// 保留ステータス: テキスト色
  static const Color pendingText = Color(0xFFE65100); // orange.shade900

  /// 未回答ステータス: 背景色
  static const Color unansweredBackground = Color(0xFFEEEEEE); // grey.shade200

  /// 未回答ステータス: テキスト色
  static const Color unansweredText = Color(0xFF616161); // grey.shade700

  // ==========================================================================
  // イベントタイプカラー
  // ==========================================================================

  /// イベントタイプ: 練習
  static const Color eventTypePractice = Color(0xFF81C784); // green.shade300

  /// イベントタイプ: その他
  static const Color eventTypeOther = Color(0xFFFFCA28); // amber.shade400

  // ==========================================================================
  // 警告・注意表示カラー
  // ==========================================================================

  /// 警告表示: 背景色（薄め）
  static const Color warningBackgroundLight = Color(0xFFFFF3E0); // orange.shade50

  /// 警告表示: ボーダー色
  static const Color warningBorder = Color(0xFFFFCCBC); // orange.shade200

  /// 警告表示: アイコン色
  static const Color warningIcon = Color(0xFFF57C00); // orange.shade700

  /// 警告表示: テキスト色（濃いめ）
  static const Color warningTextDark = Color(0xFFE65100); // orange.shade900

  // ==========================================================================
  // その他のUIカラー
  // ==========================================================================

  /// イベントカラーバー（統一グレー）
  static const Color eventCardBar = Color(0xFF9E9E9E);

  /// 無効状態のテキスト色
  static const Color disabledText = Color(0xFF757575); // grey.shade600

  /// ボトムシートハンドル色
  static const Color bottomSheetHandle = Color(0xFFE0E0E0); // grey.shade300

  /// グレー（中程度）
  static const Color greyMedium = Color(0xFFBDBDBD); // grey.shade400

  // ==========================================================================
  // 外部サービス連携カラー
  // ==========================================================================

  /// LINE ブランドカラー
  static const Color lineGreen = Color(0xFF06C755);
}

