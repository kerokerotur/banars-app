import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:mobile/event_list/models/event_list_item.dart';
import 'package:mobile/event_detail/event_detail_page.dart';
import 'package:mobile/shared/theme/app_colors.dart';

/// 選択日のイベント一覧を表示するボトムシート
class EventListBottomSheet extends StatelessWidget {
  const EventListBottomSheet({
    super.key,
    required this.selectedDay,
    required this.events,
  });

  final DateTime selectedDay;
  final List<EventListItem> events;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final surfaceColor =
        isDark ? AppColors.darkSurface : AppColors.lightSurface;
    final textSecondaryColor =
        isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary;

    return DraggableScrollableSheet(
      initialChildSize: 0.6,
      minChildSize: 0.3,
      maxChildSize: 0.9,
      builder: (context, scrollController) {
        return Container(
          decoration: BoxDecoration(
            color: surfaceColor,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
          ),
          child: Column(
            children: [
              // ドラッグハンドル
              Container(
                margin: const EdgeInsets.only(top: 8, bottom: 4),
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: Colors.grey.shade300,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              // ヘッダー
              _buildHeader(context, textSecondaryColor),
              const Divider(height: 1),
              // イベントリスト
              Expanded(
                child: events.isEmpty
                    ? _buildEmptyView(context, textSecondaryColor)
                    : _buildEventsList(context, scrollController),
              ),
            ],
          ),
        );
      },
    );
  }

  /// ヘッダー（選択日の表示）
  Widget _buildHeader(BuildContext context, Color textSecondaryColor) {
    final dateFormat = DateFormat('yyyy年MM月dd日 (E)', 'ja_JP');
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Row(
        children: [
          const Icon(Icons.event, color: AppColors.primary),
          const SizedBox(width: 8),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  dateFormat.format(selectedDay),
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                ),
                Text(
                  '${events.length}件のイベント',
                  style: TextStyle(
                    fontSize: 12,
                    color: textSecondaryColor,
                  ),
                ),
              ],
            ),
          ),
          IconButton(
            onPressed: () => Navigator.of(context).pop(),
            icon: const Icon(Icons.close),
          ),
        ],
      ),
    );
  }

  /// 空状態の表示
  Widget _buildEmptyView(BuildContext context, Color textSecondaryColor) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.event_busy,
              size: 64,
              color: textSecondaryColor,
            ),
            const SizedBox(height: 16),
            Text(
              'この日はイベントがありません',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    color: textSecondaryColor,
                  ),
            ),
          ],
        ),
      ),
    );
  }

  /// イベントリスト
  Widget _buildEventsList(
    BuildContext context,
    ScrollController scrollController,
  ) {
    return ListView.builder(
      controller: scrollController,
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
    final dateFormat = DateFormat('HH:mm', 'ja_JP');
    final attendanceBarColor =
        _resolveAttendanceBarColor(event.userAttendanceStatus);
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
              // 左側のステータスバー
              Container(
                width: 6,
                decoration: BoxDecoration(
                  color: attendanceBarColor,
                  borderRadius: const BorderRadius.only(
                    topLeft: Radius.circular(12),
                    bottomLeft: Radius.circular(12),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              // コンテンツ
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // タイトル
                      Text(
                        event.title,
                        style: Theme.of(context)
                            .textTheme
                            .titleMedium
                            ?.copyWith(fontWeight: FontWeight.bold),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 8),
                      // 集合時刻
                      Row(
                        children: [
                          Icon(Icons.access_time,
                              size: 16, color: textSecondaryColor),
                          const SizedBox(width: 4),
                          Text(
                            meeting != null ? dateFormat.format(meeting) : '-',
                            style: TextStyle(
                              fontSize: 14,
                              color: textSecondaryColor,
                            ),
                          ),
                        ],
                      ),
                      // 会場
                      if (event.eventPlaceName != null) ...[
                        const SizedBox(height: 4),
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
                      ],
                      // 出欠ステータスバッジ
                      const SizedBox(height: 8),
                      _buildAttendanceStatusBadge(
                        context,
                        event.userAttendanceStatus,
                      ),
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
          Icon(icon, size: 14, color: textColor),
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

  /// 出欠ステータスに応じたカラーバーの色を決定
  Color _resolveAttendanceBarColor(UserAttendanceStatus status) {
    switch (status) {
      case UserAttendanceStatus.participating:
        return AppColors.success;
      case UserAttendanceStatus.absent:
        return AppColors.error;
      case UserAttendanceStatus.pending:
        return AppColors.warning;
      case UserAttendanceStatus.unanswered:
        return Colors.grey.shade400;
    }
  }
}
