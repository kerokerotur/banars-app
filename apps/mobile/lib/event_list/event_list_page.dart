import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'package:mobile/event_list/event_list_controller.dart';
import 'package:mobile/event_list/models/event_list_item.dart';
import 'package:mobile/event_list/models/attendance_summary.dart';
import 'package:mobile/event_detail/event_detail_page.dart';
import 'package:mobile/event_list/widgets/attendance_modal.dart';
import 'package:mobile/shared/theme/app_colors.dart';
import 'package:mobile/shared/providers/users_provider.dart';

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

    return _buildEventList(context, state.events, ref);
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
  Widget _buildEventList(
    BuildContext context,
    List<EventListItem> events,
    WidgetRef ref,
  ) {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: events.length,
      itemBuilder: (context, index) {
        final event = events[index];
        return _buildEventCard(context, event, ref);
      },
    );
  }

  /// イベントカード
  Widget _buildEventCard(
    BuildContext context,
    EventListItem event,
    WidgetRef ref,
  ) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final textSecondaryColor =
        isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary;
    final dateFormat = DateFormat('yyyy/MM/dd (E) HH:mm', 'ja_JP');
    final eventTypeStyle = _resolveEventTypeStyle(context, event.eventTypeName);
    final meeting = event.meetingDatetime;

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
        child: IntrinsicHeight(
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Container(
                width: 6,
                decoration: BoxDecoration(
                  color: eventTypeStyle.color,
                  borderRadius: const BorderRadius.only(
                    topLeft: Radius.circular(12),
                    bottomLeft: Radius.circular(12),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // 上段: アイコン + タイトル + 出欠バッジ
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.center,
                        children: [
                          Icon(eventTypeStyle.icon,
                              size: 20, color: eventTypeStyle.color),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              event.title,
                              style: Theme.of(context)
                                  .textTheme
                                  .titleMedium
                                  ?.copyWith(fontWeight: FontWeight.bold),
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          const SizedBox(width: 8),
                          _buildAttendanceStatusBadge(
                              context, event.userAttendanceStatus),
                        ],
                      ),
                      const SizedBox(height: 12),

                      // 中段: 既存の情報（日時・会場・回答期限・出欠者）

                      Row(
                        children: [
                          Icon(Icons.event_available,
                              size: 16, color: textSecondaryColor),
                          const SizedBox(width: 4),
                          Text(
                            '集合日時: ${meeting != null ? dateFormat.format(meeting) : '-'}',
                            style: TextStyle(
                              fontSize: 14,
                              color: textSecondaryColor,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 4),

                      if (event.eventPlaceName != null) ...[
                        Row(
                          children: [
                            Icon(Icons.place,
                                size: 16, color: textSecondaryColor),
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

                      const SizedBox(height: 8),
                      _buildAttendanceAvatars(context, event, ref),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  /// 出欠者アバター一覧
  Widget _buildAttendanceAvatars(
    BuildContext context,
    EventListItem event,
    WidgetRef ref,
  ) {
    final eventListState = ref.watch(eventListControllerProvider);
    final summaries = eventListState.attendanceSummaries[event.id];

    if (eventListState.isLoadingAttendances) {
      return _buildAvatarsLoading(context);
    }

    if (summaries == null || summaries.isEmpty) {
      return const SizedBox.shrink();
    }

    final isDark = Theme.of(context).brightness == Brightness.dark;
    final textSecondaryColor =
        isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary;

    return InkWell(
      onTap: () => _showAttendanceModal(context, event),
      borderRadius: BorderRadius.circular(8),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 6, horizontal: 4),
        child: Row(
          children: [
            Icon(Icons.people, size: 18, color: textSecondaryColor),
            const SizedBox(width: 8),
            Expanded(
                child:
                    _buildAttendanceSummaryText(textSecondaryColor, summaries)),
            Icon(Icons.chevron_right, size: 20, color: textSecondaryColor),
          ],
        ),
      ),
    );
  }

  /// 出欠サマリーテキスト
  Widget _buildAttendanceSummaryText(
    Color textColor,
    List<AttendanceSummary> summaries,
  ) {
    final attendingCount = summaries
        .where((s) => s.status == AttendanceSummaryStatus.attending)
        .length;
    final absentCount = summaries
        .where((s) => s.status == AttendanceSummaryStatus.notAttending)
        .length;
    final pendingCount = summaries
        .where((s) => s.status == AttendanceSummaryStatus.pending)
        .length;
    final answeredCount = summaries.length;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          '回答済み $answeredCount 人',
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            color: textColor,
          ),
        ),
        const SizedBox(height: 2),
        Text(
          '出席 $attendingCount ・ 欠席 $absentCount ・ 保留 $pendingCount',
          style: TextStyle(
            fontSize: 12,
            color: textColor,
          ),
        ),
      ],
    );
  }

  /// 出欠者一覧モーダルを表示
  void _showAttendanceModal(BuildContext context, EventListItem event) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => AttendanceModal(event: event),
    );
  }

  /// アバター読み込み中
  Widget _buildAvatarsLoading(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final textSecondaryColor =
        isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary;

    return Row(
      children: [
        Icon(Icons.people, size: 16, color: textSecondaryColor),
        const SizedBox(width: 4),
        const SizedBox(
          width: 100,
          height: 2,
          child: LinearProgressIndicator(),
        ),
      ],
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
    IconData icon;

    switch (status) {
      case UserAttendanceStatus.participating:
        backgroundColor = Colors.green.shade100;
        textColor = Colors.green.shade900;
        label = '参加';
        icon = Icons.check_circle;
        break;
      case UserAttendanceStatus.absent:
        backgroundColor = Colors.red.shade100;
        textColor = Colors.red.shade900;
        label = '欠席';
        icon = Icons.cancel;
        break;
      case UserAttendanceStatus.pending:
        backgroundColor = Colors.orange.shade100;
        textColor = Colors.orange.shade900;
        label = '保留';
        icon = Icons.hourglass_empty;
        break;
      case UserAttendanceStatus.unanswered:
        backgroundColor = Colors.grey.shade200;
        textColor = Colors.grey.shade700;
        label = '未回答';
        icon = Icons.help_outline;
        break;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 16, color: textColor),
          const SizedBox(width: 4),
          Text(
            label,
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.bold,
              color: textColor,
            ),
          ),
        ],
      ),
    );
  }

  /// イベントタイプごとの色・アイコンを決定
  _EventTypeStyle _resolveEventTypeStyle(
    BuildContext context,
    String? eventTypeName,
  ) {
    final colorScheme = Theme.of(context).colorScheme;
    final name = eventTypeName?.trim().toLowerCase();

    switch (name) {
      case '試合':
      case 'game':
        return _EventTypeStyle(
          color: AppColors.primary,
          icon: Icons.sports_baseball,
        );
      case '練習':
      case 'practice':
        return _EventTypeStyle(
          color: Colors.green.shade300,
          icon: Icons.fitness_center,
        );
      default:
        return _EventTypeStyle(
          color: Colors.amber.shade400,
          icon: Icons.category,
        );
    }
  }
}

class _EventTypeStyle {
  const _EventTypeStyle({required this.color, required this.icon});
  final Color color;
  final IconData icon;
}
