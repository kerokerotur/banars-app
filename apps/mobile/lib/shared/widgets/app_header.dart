import 'package:flutter/material.dart';

import 'package:mobile/shared/theme/app_colors.dart';

/// ヘッダーメニューの項目
enum HeaderMenuItem {
  settings,
  logout,
}

/// アプリ共通のヘッダー
///
/// - 左側: ハンバーガーメニュー（設定・ログアウト）
/// - 右側: ユーザーアイコン（CircleAvatar）
class AppHeader extends StatelessWidget implements PreferredSizeWidget {
  const AppHeader({
    super.key,
    this.avatarUrl,
    this.onAvatarTap,
    this.onMenuItemSelected,
  });

  /// ユーザーのアバター画像URL
  final String? avatarUrl;

  /// アバターがタップされた時のコールバック
  final VoidCallback? onAvatarTap;

  /// メニュー項目が選択された時のコールバック
  final ValueChanged<HeaderMenuItem>? onMenuItemSelected;

  /// ヘッダーの高さ
  static const double headerHeight = 64.0;

  @override
  Size get preferredSize => const Size.fromHeight(headerHeight);

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final dividerColor =
        isDark ? AppColors.darkDivider : AppColors.lightDivider;

    return Container(
      decoration: BoxDecoration(
        color: colorScheme.surface,
        border: Border(
          bottom: BorderSide(
            color: dividerColor,
            width: 1,
          ),
        ),
      ),
      child: SafeArea(
        bottom: false,
        child: SizedBox(
          height: headerHeight,
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 8),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                // 左側: ハンバーガーメニュー
                _HeaderMenu(
                  onItemSelected: onMenuItemSelected,
                ),
                // 右側: ユーザーアイコン
                Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: _UserAvatar(
                    avatarUrl: avatarUrl,
                    onTap: onAvatarTap,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

/// ヘッダーメニュー（ハンバーガーメニュー）
class _HeaderMenu extends StatelessWidget {
  const _HeaderMenu({
    this.onItemSelected,
  });

  final ValueChanged<HeaderMenuItem>? onItemSelected;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final iconColor =
        isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary;

    return PopupMenuButton<HeaderMenuItem>(
      icon: Icon(
        Icons.menu,
        color: iconColor,
        size: 28,
      ),
      offset: const Offset(0, 48),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      onSelected: onItemSelected,
      itemBuilder: (context) => [
        _buildMenuItem(
          context: context,
          value: HeaderMenuItem.settings,
          icon: Icons.settings_outlined,
          label: '設定',
        ),
        const PopupMenuDivider(),
        _buildMenuItem(
          context: context,
          value: HeaderMenuItem.logout,
          icon: Icons.logout,
          label: 'ログアウト',
          isDestructive: true,
        ),
      ],
    );
  }

  PopupMenuItem<HeaderMenuItem> _buildMenuItem({
    required BuildContext context,
    required HeaderMenuItem value,
    required IconData icon,
    required String label,
    bool isDestructive = false,
  }) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final textColor =
        isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary;
    final color = isDestructive ? AppColors.error : textColor;

    return PopupMenuItem<HeaderMenuItem>(
      value: value,
      child: Row(
        children: [
          Icon(icon, color: color, size: 20),
          const SizedBox(width: 12),
          Text(
            label,
            style: TextStyle(
              color: color,
              fontSize: 14,
            ),
          ),
        ],
      ),
    );
  }
}

/// ユーザーアバターウィジェット
class _UserAvatar extends StatelessWidget {
  const _UserAvatar({
    this.avatarUrl,
    this.onTap,
  });

  final String? avatarUrl;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 44,
        height: 44,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          border: Border.all(
            color: AppColors.primaryLight.withValues(alpha: 0.3),
            width: 2,
          ),
        ),
        child: ClipOval(
          child: avatarUrl != null
              ? Image.network(
                  avatarUrl!,
                  fit: BoxFit.cover,
                  errorBuilder: (context, error, stackTrace) {
                    return _buildDefaultAvatar(colorScheme);
                  },
                )
              : _buildDefaultAvatar(colorScheme),
        ),
      ),
    );
  }

  Widget _buildDefaultAvatar(ColorScheme colorScheme) {
    return Container(
      color: AppColors.primaryLight.withValues(alpha: 0.2),
      child: Icon(
        Icons.person,
        size: 26,
        color: colorScheme.primary,
      ),
    );
  }
}
