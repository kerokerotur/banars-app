import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'package:mobile/event_list/event_list_controller.dart';
import 'package:mobile/event_list/models/event_list_item.dart';
import 'package:mobile/event_detail/event_detail_page.dart';
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

  /// イベントリスト表示
  Widget _buildEventList(BuildContext context, List<EventListItem> events) {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: events.length,
      itemBuilder: (context, index) {
        final event = events[index];
        return _buildEventCard(context, event);
      },
    );
  }

  /// イベントカード
  Widget _buildEventCard(BuildContext context, EventListItem event) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final textSecondaryColor =
        isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary;
    final dateFormat = DateFormat('yyyy/MM/dd (E) HH:mm', 'ja_JP');

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: InkWell(
        onTap: () {
          Navigator.of(context).push(
            MaterialPageRoute(
              builder: (context) => EventDetailPage(event: event),
            ),
          );
        },
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // タイトル行
              Row(
                children: [
                  Expanded(
                    child: Text(
                      event.title,
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                    ),
                  ),
                  _buildAttendanceStatusBadge(
                      context, event.userAttendanceStatus),
                ],
              ),
              const SizedBox(height: 8),

              // イベント種別
              if (event.eventTypeName != null) ...[
                Row(
                  children: [
                    Icon(Icons.category, size: 16, color: textSecondaryColor),
                    const SizedBox(width: 4),
                    Text(
                      event.eventTypeName!,
                      style: TextStyle(
                        fontSize: 14,
                        color: textSecondaryColor,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
              ],

              // 開始日時
              if (event.startDatetime != null) ...[
                Row(
                  children: [
                    Icon(Icons.event, size: 16, color: textSecondaryColor),
                    const SizedBox(width: 4),
                    Text(
                      dateFormat.format(event.startDatetime!),
                      style: TextStyle(
                        fontSize: 14,
                        color: textSecondaryColor,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
              ],

              // 会場
              if (event.eventPlaceName != null) ...[
                Row(
                  children: [
                    Icon(Icons.place, size: 16, color: textSecondaryColor),
                    const SizedBox(width: 4),
                    Expanded(
                      child: Text(
                        event.eventPlaceName!,
                        style: TextStyle(
                          fontSize: 14,
                          color: textSecondaryColor,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
              ],

              // 回答期限
              if (event.responseDeadlineDatetime != null) ...[
                Row(
                  children: [
                    Icon(Icons.access_time,
                        size: 16, color: textSecondaryColor),
                    const SizedBox(width: 4),
                    Text(
                      '回答期限: ${dateFormat.format(event.responseDeadlineDatetime!)}',
                      style: TextStyle(
                        fontSize: 14,
                        color: textSecondaryColor,
                      ),
                    ),
                  ],
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  /// 出欠ステータスバッジ
  Widget _buildAttendanceStatusBadge(
    BuildContext context,
    UserAttendanceStatus status,
  ) {
    Color backgroundColor;
    Color textColor;
    String label;

    switch (status) {
      case UserAttendanceStatus.participating:
        backgroundColor = Colors.green.shade100;
        textColor = Colors.green.shade900;
        label = '参加';
        break;
      case UserAttendanceStatus.absent:
        backgroundColor = Colors.red.shade100;
        textColor = Colors.red.shade900;
        label = '欠席';
        break;
      case UserAttendanceStatus.pending:
        backgroundColor = Colors.orange.shade100;
        textColor = Colors.orange.shade900;
        label = '保留';
        break;
      case UserAttendanceStatus.unanswered:
        backgroundColor = Colors.grey.shade200;
        textColor = Colors.grey.shade700;
        label = '未回答';
        break;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Text(
        label,
        style: TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.bold,
          color: textColor,
        ),
      ),
    );
  }
}
