import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/event_list/event_list_controller.dart';
import 'package:mobile/shared/theme/app_colors.dart';

/// イベント一覧ページ
class EventListPage extends ConsumerWidget {
  const EventListPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(eventListControllerProvider);

    if (state.isLoading) {
      return const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            CircularProgressIndicator(),
            SizedBox(height: 16),
            Text('イベントを取得中...'),
          ],
        ),
      );
    }

    if (state.hasError) {
      return _buildErrorView(context, ref, state.errorMessage);
    }

    if (state.events.isEmpty) {
      return _buildEmptyView(context);
    }

    return _buildEventList(context, state.events);
  }

  /// エラー表示
  Widget _buildErrorView(
    BuildContext context,
    WidgetRef ref,
    String? errorMessage,
  ) {
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
              errorMessage ?? '不明なエラー',
              textAlign: TextAlign.center,
              style: TextStyle(color: textSecondaryColor),
            ),
            const SizedBox(height: 24),
            FilledButton.icon(
              onPressed: () =>
                  ref.read(eventListControllerProvider.notifier).refresh(),
              icon: const Icon(Icons.refresh),
              label: const Text('再試行'),
            ),
          ],
        ),
      ),
    );
  }

  /// 空の状態表示
  Widget _buildEmptyView(BuildContext context) {
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
              Icons.event_note,
              size: 64,
              color: textSecondaryColor,
            ),
            const SizedBox(height: 16),
            Text(
              'イベントがありません',
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: 8),
            Text(
              '右下の+ボタンから\nイベントを作成できます',
              textAlign: TextAlign.center,
              style: TextStyle(color: textSecondaryColor),
            ),
          ],
        ),
      ),
    );
  }

  /// イベントリスト表示（今後実装）
  Widget _buildEventList(BuildContext context, List<dynamic> events) {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: events.length,
      itemBuilder: (context, index) {
        return Card(
          child: ListTile(
            title: Text('イベント ${index + 1}'),
          ),
        );
      },
    );
  }
}
