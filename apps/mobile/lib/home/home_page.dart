import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import 'package:mobile/home/home_controller.dart';
import 'package:mobile/home/home_state.dart';

class HomePage extends ConsumerWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final homeState = ref.watch(homeControllerProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('banars'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () => _signOut(context),
            tooltip: 'ログアウト',
          ),
        ],
      ),
      body: SafeArea(
        child: _buildBody(context, ref, homeState),
      ),
    );
  }

  Widget _buildBody(BuildContext context, WidgetRef ref, HomeState homeState) {
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
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(
                Icons.error_outline,
                size: 64,
                color: Colors.red,
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
                style: const TextStyle(color: Colors.grey),
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
            const Text(
              'このページはプレースホルダーです。\n今後、イベント一覧などの機能が追加されます。',
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.grey),
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
