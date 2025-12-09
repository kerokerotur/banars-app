import 'package:flutter/material.dart';

import 'package:mobile/shared/theme/app_colors.dart';

/// ナビゲーションタブの種類
enum NavigationTab {
  home,
  schedule,
}

/// アプリ共通のフッターナビゲーション
///
/// デザイン画像に合わせた3カラム構成:
/// - 左: ホーム
/// - 中央: +ボタン (FAB)
/// - 右: 予定
class AppFooter extends StatelessWidget {
  const AppFooter({
    super.key,
    required this.currentTab,
    required this.onTabChanged,
    this.onAddPressed,
  });

  /// 現在選択中のタブ
  final NavigationTab currentTab;

  /// タブが変更された時のコールバック
  final ValueChanged<NavigationTab> onTabChanged;

  /// 中央の+ボタンが押された時のコールバック
  final VoidCallback? onAddPressed;

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      decoration: BoxDecoration(
        color: colorScheme.surface,
        boxShadow: [
          BoxShadow(
            color: (isDark ? AppColors.darkShadow : AppColors.lightShadow)
                .withValues(alpha: 0.1),
            blurRadius: 8,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      child: SafeArea(
        top: false,
        child: SizedBox(
          height: 64,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              // ホームタブ
              _NavItem(
                icon: Icons.home_outlined,
                activeIcon: Icons.home,
                label: 'ホーム',
                isSelected: currentTab == NavigationTab.home,
                onTap: () => onTabChanged(NavigationTab.home),
              ),
              // 中央の+ボタン
              _CenterAddButton(
                onPressed: onAddPressed,
              ),
              // 予定タブ
              _NavItem(
                icon: Icons.calendar_today_outlined,
                activeIcon: Icons.calendar_today,
                label: '予定',
                isSelected: currentTab == NavigationTab.schedule,
                onTap: () => onTabChanged(NavigationTab.schedule),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// ナビゲーションアイテム（ホーム、予定）
class _NavItem extends StatelessWidget {
  const _NavItem({
    required this.icon,
    required this.activeIcon,
    required this.label,
    required this.isSelected,
    required this.onTap,
  });

  final IconData icon;
  final IconData activeIcon;
  final String label;
  final bool isSelected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final activeColor =
        isDark ? AppColors.darkNavActive : AppColors.lightNavActive;
    final inactiveColor =
        isDark ? AppColors.darkNavInactive : AppColors.lightNavInactive;
    final color = isSelected ? activeColor : inactiveColor;

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              isSelected ? activeIcon : icon,
              color: color,
              size: 24,
            ),
            const SizedBox(height: 4),
            Text(
              label,
              style: TextStyle(
                color: color,
                fontSize: 12,
                fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// 中央の+ボタン（FAB風デザイン）
class _CenterAddButton extends StatelessWidget {
  const _CenterAddButton({
    this.onPressed,
  });

  final VoidCallback? onPressed;

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    return GestureDetector(
      onTap: onPressed,
      child: Container(
        width: 56,
        height: 56,
        decoration: BoxDecoration(
          color: colorScheme.primary,
          shape: BoxShape.circle,
          boxShadow: [
            BoxShadow(
              color: colorScheme.primary.withValues(alpha: 0.4),
              blurRadius: 8,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Icon(
          Icons.add,
          color: colorScheme.onPrimary,
          size: 28,
        ),
      ),
    );
  }
}
