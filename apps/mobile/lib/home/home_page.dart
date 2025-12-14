import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import 'package:mobile/event_create/event_create_page.dart';
import 'package:mobile/home/home_controller.dart';
import 'package:mobile/home/home_state.dart';
import 'package:mobile/settings/settings_page.dart';
import 'package:mobile/shared/providers/event_types_provider.dart';
import 'package:mobile/shared/theme/app_colors.dart';
import 'package:mobile/shared/widgets/app_scaffold.dart';
import 'package:mobile/shared/widgets/app_footer.dart';
import 'package:mobile/shared/widgets/app_header.dart';

class HomePage extends ConsumerStatefulWidget {
  const HomePage({super.key});

  @override
  ConsumerState<HomePage> createState() => _HomePageState();
}

class _HomePageState extends ConsumerState<HomePage> {
  NavigationTab _currentTab = NavigationTab.home;

  @override
  Widget build(BuildContext context) {
    final homeState = ref.watch(homeControllerProvider);
    // アプリ起動時にイベント種別をキャッシュ
    ref.watch(eventTypesProvider);

    return AppScaffold(
      currentTab: _currentTab,
      onTabChanged: (tab) {
        setState(() {
          _currentTab = tab;
        });
      },
      avatarUrl: homeState.userProfile?.avatarUrl,
      onMenuItemSelected: (item) => _handleMenuItemSelected(context, item),
      onAddPressed: () {
        Navigator.of(context).push(
          MaterialPageRoute(
            builder: (context) => const EventCreatePage(),
          ),
        );
      },
      body: _buildBody(context, homeState),
    );
  }

  void _handleMenuItemSelected(BuildContext context, HeaderMenuItem item) {
    switch (item) {
      case HeaderMenuItem.settings:
        Navigator.of(context).push(
          MaterialPageRoute(
            builder: (context) => const SettingsPage(),
          ),
        );
        break;
      case HeaderMenuItem.logout:
        _signOut(context);
        break;
    }
  }

  Widget _buildBody(BuildContext context, HomeState homeState) {
    if (homeState.isLoading) {
      return const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            CircularProgressIndicator(),
            SizedBox(height: 16),
            Text('ユーザー情報を取得中...'),
          ],
        ),
      );
    }

    if (homeState.hasError) {
      final colorScheme = Theme.of(context).colorScheme;
      final isDark = Theme.of(context).brightness == Brightness.dark;
      final textSecondaryColor =
          isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary;

      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                Icons.error_outline,
                size: 64,
                color: colorScheme.error,
              ),
              const SizedBox(height: 16),
              Text(
                'エラーが発生しました',
                style: Theme.of(context).textTheme.titleLarge,
              ),
              const SizedBox(height: 8),
              Text(
                homeState.errorMessage ?? '不明なエラー',
                textAlign: TextAlign.center,
                style: TextStyle(color: textSecondaryColor),
              ),
              const SizedBox(height: 24),
              FilledButton.icon(
                onPressed: () =>
                    ref.read(homeControllerProvider.notifier).fetchUserProfile(),
                icon: const Icon(Icons.refresh),
                label: const Text('再試行'),
              ),
            ],
          ),
        ),
      );
    }

    final userProfile = homeState.userProfile;
    if (userProfile == null) {
      return const Center(
        child: Text('ユーザー情報がありません'),
      );
    }

    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // ユーザーアイコン
            CircleAvatar(
              radius: 48,
              backgroundImage: userProfile.avatarUrl != null
                  ? NetworkImage(userProfile.avatarUrl!)
                  : null,
              child: userProfile.avatarUrl == null
                  ? const Icon(Icons.person, size: 48)
                  : null,
            ),
            const SizedBox(height: 16),
            // 表示名
            Text(
              userProfile.displayName,
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
            ),
            if (userProfile.role != null) ...[
              const SizedBox(height: 8),
              Chip(
                label: Text(userProfile.role!),
                backgroundColor:
                    Theme.of(context).colorScheme.primaryContainer,
              ),
            ],
            const SizedBox(height: 32),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'ユーザー情報',
                      style: Theme.of(context).textTheme.titleMedium,
                    ),
                    const SizedBox(height: 8),
                    Text('ID: ${userProfile.userId}'),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 32),
            Builder(
              builder: (context) {
                final isDark = Theme.of(context).brightness == Brightness.dark;
                final textSecondaryColor = isDark
                    ? AppColors.darkTextSecondary
                    : AppColors.lightTextSecondary;
                return Text(
                  'このページはプレースホルダーです。\n今後、イベント一覧などの機能が追加されます。',
                  textAlign: TextAlign.center,
                  style: TextStyle(color: textSecondaryColor),
                );
              },
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _signOut(BuildContext context) async {
    final shouldSignOut = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('ログアウト'),
        content: const Text('ログアウトしますか？'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: const Text('キャンセル'),
          ),
          FilledButton(
            onPressed: () => Navigator.of(context).pop(true),
            child: const Text('ログアウト'),
          ),
        ],
      ),
    );

    if (shouldSignOut == true) {
      await Supabase.instance.client.auth.signOut();
    }
  }
}
