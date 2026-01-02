import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:mobile/home/home_controller.dart';
import 'package:mobile/invite_issue/invite_issue_page.dart';
import 'package:mobile/user_list/user_list_page.dart';
import 'package:mobile/shared/theme/app_colors.dart';

/// チーム管理画面
class TeamManagementPage extends ConsumerWidget {
  const TeamManagementPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final colorScheme = Theme.of(context).colorScheme;
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final textSecondaryColor =
        isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary;

    // ユーザープロフィールからロールを取得
    final homeState = ref.watch(homeControllerProvider);
    final isManager = homeState.userProfile?.role == 'manager';

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: Icon(Icons.arrow_back, color: colorScheme.onSurface),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: Text(
          'チーム管理',
          style: TextStyle(
            color: colorScheme.onSurface,
            fontWeight: FontWeight.w600,
          ),
        ),
        centerTitle: true,
      ),
      body: ListView(
        children: [
          const SizedBox(height: 16),
          _SettingsCard(
            children: [
              _SettingsTile(
                icon: Icons.people_outline,
                title: 'メンバー一覧',
                subtitle: 'チームメンバーを確認',
                trailing: Icon(Icons.chevron_right, color: textSecondaryColor),
                onTap: () {
                  Navigator.of(context).push(
                    MaterialPageRoute(
                      builder: (context) => const UserListPage(),
                    ),
                  );
                },
              ),
            ],
          ),
          if (isManager) ...[
            const SizedBox(height: 16),
            _SettingsCard(
              children: [
                _SettingsTile(
                  icon: Icons.link,
                  title: '招待リンク発行',
                  subtitle: '新しいメンバーを招待',
                  trailing: Icon(Icons.chevron_right, color: textSecondaryColor),
                  onTap: () {
                    Navigator.of(context).push(
                      MaterialPageRoute(
                        builder: (context) => const InviteIssuePage(),
                      ),
                    );
                  },
                ),
              ],
            ),
          ],
          const SizedBox(height: 32),
        ],
      ),
    );
  }
}

/// 設定項目をグループ化するカード
class _SettingsCard extends StatelessWidget {
  const _SettingsCard({
    required this.children,
  });

  final List<Widget> children;

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final shadowColor = isDark ? AppColors.darkShadow : AppColors.lightShadow;

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      decoration: BoxDecoration(
        color: colorScheme.surface,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: shadowColor.withValues(alpha: 0.04),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        children: _buildChildrenWithDividers(),
      ),
    );
  }

  List<Widget> _buildChildrenWithDividers() {
    final result = <Widget>[];
    for (var i = 0; i < children.length; i++) {
      result.add(children[i]);
      if (i < children.length - 1) {
        result.add(
          const Divider(
            height: 1,
            indent: 56,
            endIndent: 16,
          ),
        );
      }
    }
    return result;
  }
}

/// 設定項目のタイル
class _SettingsTile extends StatelessWidget {
  const _SettingsTile({
    required this.icon,
    required this.title,
    this.subtitle,
    this.trailing,
    this.onTap,
  });

  final IconData icon;
  final String title;
  final String? subtitle;
  final Widget? trailing;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final textPrimaryColor =
        isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary;
    final textSecondaryColor =
        isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary;

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        child: Row(
          children: [
            Container(
              width: 36,
              height: 36,
              decoration: BoxDecoration(
                color: AppColors.primaryLight.withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Icon(
                icon,
                color: colorScheme.primary,
                size: 20,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: TextStyle(
                      color: textPrimaryColor,
                      fontSize: 15,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  if (subtitle != null) ...[
                    const SizedBox(height: 2),
                    Text(
                      subtitle!,
                      style: TextStyle(
                        color: textSecondaryColor,
                        fontSize: 12,
                      ),
                    ),
                  ],
                ],
              ),
            ),
            if (trailing != null) trailing!,
          ],
        ),
      ),
    );
  }
}
