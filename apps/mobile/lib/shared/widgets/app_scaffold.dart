import 'package:flutter/material.dart';

import 'package:mobile/shared/widgets/app_header.dart';
import 'package:mobile/shared/widgets/app_footer.dart';

/// アプリ共通のシェルウィジェット
///
/// ヘッダー + フッター + コンテンツを統合して、
/// 各画面で再利用可能なレイアウトを提供する。
class AppScaffold extends StatelessWidget {
  const AppScaffold({
    super.key,
    required this.body,
    required this.currentTab,
    required this.onTabChanged,
    this.avatarUrl,
    this.onAvatarTap,
    this.onMenuItemSelected,
    this.onAddPressed,
    this.showHeader = true,
    this.showFooter = true,
  });

  /// メインコンテンツ
  final Widget body;

  /// 現在選択中のタブ
  final NavigationTab currentTab;

  /// タブが変更された時のコールバック
  final ValueChanged<NavigationTab> onTabChanged;

  /// ユーザーのアバター画像URL
  final String? avatarUrl;

  /// アバターがタップされた時のコールバック
  final VoidCallback? onAvatarTap;

  /// ヘッダーメニュー項目が選択された時のコールバック
  final ValueChanged<HeaderMenuItem>? onMenuItemSelected;

  /// 中央の+ボタンが押された時のコールバック
  final VoidCallback? onAddPressed;

  /// ヘッダーを表示するかどうか
  final bool showHeader;

  /// フッターを表示するかどうか
  final bool showFooter;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      body: Column(
        children: [
          // ヘッダー
          if (showHeader)
            AppHeader(
              avatarUrl: avatarUrl,
              onAvatarTap: onAvatarTap,
              onMenuItemSelected: onMenuItemSelected,
            ),
          // メインコンテンツ
          Expanded(
            child: body,
          ),
          // フッター
          if (showFooter)
            AppFooter(
              currentTab: currentTab,
              onTabChanged: onTabChanged,
              onAddPressed: onAddPressed,
            ),
        ],
      ),
    );
  }
}
