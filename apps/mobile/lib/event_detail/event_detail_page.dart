import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'package:mobile/event_detail/event_detail_controller.dart';
import 'package:mobile/event_detail/event_detail_state.dart';
import 'package:mobile/event_detail/models/event_attendance.dart';
import 'package:mobile/event_list/models/event_list_item.dart';
import 'package:mobile/event_list/event_list_controller.dart';
import 'package:mobile/event_edit/event_edit_page.dart';
import 'package:mobile/shared/theme/app_colors.dart';
import 'package:url_launcher/url_launcher_string.dart';

class EventDetailPage extends ConsumerStatefulWidget {
  const EventDetailPage({super.key, required this.event});

  final EventListItem event;

  @override
  ConsumerState<EventDetailPage> createState() => _EventDetailPageState();
}

class _EventDetailPageState extends ConsumerState<EventDetailPage> {
  late final DateFormat _dateFormat = DateFormat('yyyy-MM-dd');
  late final DateFormat _timeFormat = DateFormat('HH:mm');
  late final TextEditingController _commentController;
  late final void Function() _commentListener;
  ProviderSubscription<EventDetailState>? _stateSubscription;

  @override
  void initState() {
    super.initState();
    _commentController = TextEditingController();
    _commentListener = () {
      final notifier =
          ref.read(eventDetailControllerProvider(widget.event).notifier);
      notifier.updateMyComment(_commentController.text);
    };
    _commentController.addListener(_commentListener);

    _stateSubscription = ref.listenManual<EventDetailState>(
      eventDetailControllerProvider(widget.event),
      (previous, next) {
        final nextText = next.myComment ?? '';
        if (nextText != _commentController.text) {
          final selection = _commentController.selection;
          _commentController.text = nextText;
          _commentController.selection = selection.copyWith(
            baseOffset: nextText.length,
            extentOffset: nextText.length,
          );
        }
      },
    );
  }

  @override
  void dispose() {
    _stateSubscription?.close();
    _commentController.removeListener(_commentListener);
    _commentController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(eventDetailControllerProvider(widget.event));
    final controller =
        ref.read(eventDetailControllerProvider(widget.event).notifier);
    final isAfterDeadline = controller.isAfterDeadline;

    return Scaffold(
      appBar: AppBar(
        actions: [
          PopupMenuButton<String>(
            onSelected: (value) {
              if (value == 'edit') {
                _navigateToEditPage(context);
              } else if (value == 'delete') {
                _showDeleteConfirmDialog();
              }
            },
            itemBuilder: (context) => [
              const PopupMenuItem(
                value: 'edit',
                child: Row(
                  children: [
                    Icon(Icons.edit),
                    SizedBox(width: 8),
                    Text('編集'),
                  ],
                ),
              ),
              const PopupMenuItem(
                value: 'delete',
                child: Row(
                  children: [
                    Icon(Icons.delete, color: Colors.red),
                    SizedBox(width: 8),
                    Text('削除', style: TextStyle(color: Colors.red)),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () => controller.fetchAttendance(),
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              _EventSummaryCard(
                event: state.event,
                dateFormat: _dateFormat,
                timeFormat: _timeFormat,
                onOpenMap:
                    state.event.eventPlaceGoogleMapsUrlNormalized == null
                        ? null
                        : () => _openMap(
                            state.event.eventPlaceGoogleMapsUrlNormalized!),
              ),
              const SizedBox(height: 16),
              _NotesSection(notesMarkdown: state.event.notesMarkdown),
              const SizedBox(height: 16),
              _AttendanceSelector(
                current: state.myStatus,
                isSubmitting: state.isSubmitting,
                isAfterDeadline: isAfterDeadline,
                responseDeadlineDatetime: state.event.responseDeadlineDatetime,
                dateFormat: _dateFormat,
                timeFormat: _timeFormat,
                commentController: _commentController,
                onSelect: controller.selectMyStatus,
                onSubmit: controller.submitAttendance,
              ),
              if (state.errorMessage != null) ...[
                const SizedBox(height: 8),
                Text(
                  state.errorMessage!,
                  style: TextStyle(color: Theme.of(context).colorScheme.error),
                ),
              ],
              const SizedBox(height: 16),
              _AttendanceList(attendance: state.attendance),
              if (state.status == EventDetailStatus.loading) ...[
                const SizedBox(height: 16),
                const Center(child: CircularProgressIndicator()),
              ],
              if (state.status == EventDetailStatus.error &&
                  state.errorMessage != null)
                Padding(
                  padding: const EdgeInsets.only(top: 8),
                  child: Text(
                    state.errorMessage!,
                    style:
                        TextStyle(color: Theme.of(context).colorScheme.error),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _openMap(String url) async {
    if (await canLaunchUrlString(url)) {
      await launchUrlString(url, mode: LaunchMode.externalApplication);
    }
  }

  Future<void> _navigateToEditPage(BuildContext context) async {
    final state = ref.read(eventDetailControllerProvider(widget.event));
    final result = await Navigator.of(context).push<bool>(
      MaterialPageRoute(
        builder: (context) => EventEditPage(event: state.event),
      ),
    );

    // 編集成功時、イベント一覧のリフレッシュを待ってから最新データを取得して反映
    if (result == true && mounted) {
      // イベント一覧のrefreshが完了するまで待機
      await ref.read(eventListControllerProvider.notifier).refresh();

      final eventListState = ref.read(eventListControllerProvider);
      final updatedEvent = eventListState.events
          .where((e) => e.id == state.event.id)
          .firstOrNull;

      if (updatedEvent != null) {
        ref
            .read(eventDetailControllerProvider(widget.event).notifier)
            .updateEvent(updatedEvent);
      }
    }
  }

  Future<void> _showDeleteConfirmDialog() async {
    final state = ref.read(eventDetailControllerProvider(widget.event));
    final isFutureEvent = state.event.startDatetime != null &&
        state.event.startDatetime!.isAfter(DateTime.now());

    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('イベントを削除'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('このイベントを削除してもよろしいですか？'),
            if (isFutureEvent) ...[
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.orange.shade50,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: Colors.orange.shade200),
                ),
                child: Row(
                  children: [
                    Icon(Icons.warning_amber, color: Colors.orange.shade700),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        '開催予定のイベントです。削除すると参加者に通知されません。',
                        style: TextStyle(
                          color: Colors.orange.shade900,
                          fontSize: 13,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: const Text('キャンセル'),
          ),
          TextButton(
            onPressed: () => Navigator.of(context).pop(true),
            style: TextButton.styleFrom(
              foregroundColor: Colors.red,
            ),
            child: const Text('削除'),
          ),
        ],
      ),
    );

    if (confirmed == true && mounted) {
      await _deleteEvent();
    }
  }

  Future<void> _deleteEvent() async {
    final controller =
        ref.read(eventDetailControllerProvider(widget.event).notifier);
    final success = await controller.deleteEvent();

    if (!mounted) return;

    if (success) {
      // Refresh event list
      ref.read(eventListControllerProvider.notifier).refresh();
      _showSnackBar('イベントを削除しました');
      Navigator.of(context).pop();
    } else {
      final state = ref.read(eventDetailControllerProvider(widget.event));
      if (state.errorMessage != null) {
        _showSnackBar(state.errorMessage!, isError: true);
      }
    }
  }

  void _showSnackBar(String message, {bool isError = false}) {
    final colorScheme = Theme.of(context).colorScheme;
    final snackBar = SnackBar(
      content: Text(message),
      backgroundColor: isError ? colorScheme.error : null,
    );
    if (!mounted) return;
    ScaffoldMessenger.of(context)
      ..hideCurrentSnackBar()
      ..showSnackBar(snackBar);
  }
}

class _EventSummaryCard extends StatelessWidget {
  const _EventSummaryCard({
    required this.event,
    required this.dateFormat,
    required this.timeFormat,
    this.onOpenMap,
  });

  final EventListItem event;
  final DateFormat dateFormat;
  final DateFormat timeFormat;
  final VoidCallback? onOpenMap;

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;
    final eventTypeStyle = _resolveEventTypeStyle(context, event.eventTypeName);

    return Card(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(
                  eventTypeStyle.icon,
                  color: Theme.of(context).colorScheme.onSurface,
                  size: 28,
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    event.title,
                    style: textTheme.titleLarge
                        ?.copyWith(fontWeight: FontWeight.bold),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            _InfoRow(
              icon: Icons.event,
              title: event.startDatetime != null
                  ? dateFormat.format(event.startDatetime!)
                  : '日付未定',
              subtitle: '日付',
            ),
            const SizedBox(height: 12),
            _InfoRow(
              icon: Icons.groups,
              title: event.meetingDatetime != null
                  ? timeFormat.format(event.meetingDatetime!)
                  : '未定',
              subtitle: '集合時刻',
            ),
            const SizedBox(height: 12),
            _InfoRow(
              icon: Icons.play_arrow,
              title: event.startDatetime != null
                  ? timeFormat.format(event.startDatetime!)
                  : '未定',
              subtitle: '開始時刻',
            ),
            const SizedBox(height: 12),
            _InfoRow(
              icon: Icons.place,
              title: event.eventPlaceName ?? '場所未設定',
              subtitle: event.eventPlaceGoogleMapsUrlNormalized ?? 'URL なし',
            ),
            const SizedBox(height: 16),
            if (event.eventPlaceGoogleMapsUrlNormalized != null)
              SizedBox(
                width: double.infinity,
                child: OutlinedButton(
                  onPressed: onOpenMap,
                  child: const Text('地図を開く'),
                ),
              ),
          ],
        ),
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  const _InfoRow({
    required this.icon,
    required this.title,
    required this.subtitle,
  });

  final IconData icon;
  final String title;
  final String subtitle;

  @override
  Widget build(BuildContext context) {
    final secondary = Theme.of(context).brightness == Brightness.dark
        ? AppColors.darkTextSecondary
        : AppColors.lightTextSecondary;
    final textTheme = Theme.of(context).textTheme;

    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, color: Theme.of(context).colorScheme.primary),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: textTheme.titleMedium
                    ?.copyWith(fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 2),
              Text(
                subtitle,
                style: textTheme.bodySmall?.copyWith(color: secondary),
              ),
            ],
          ),
        )
      ],
    );
  }
}

class _AttendanceSelector extends StatelessWidget {
  const _AttendanceSelector({
    required this.current,
    required this.isSubmitting,
    required this.isAfterDeadline,
    required this.responseDeadlineDatetime,
    required this.dateFormat,
    required this.timeFormat,
    required this.commentController,
    required this.onSelect,
    required this.onSubmit,
  });

  final EventAttendanceStatus? current;
  final bool isSubmitting;
  final bool isAfterDeadline;
  final DateTime? responseDeadlineDatetime;
  final DateFormat dateFormat;
  final DateFormat timeFormat;
  final TextEditingController commentController;
  final void Function(EventAttendanceStatus) onSelect;
  final VoidCallback onSubmit;

  @override
  Widget build(BuildContext context) {
    final options = [
      (EventAttendanceStatus.attending, '出席', Icons.check_circle_outline, AppColors.success),
      (EventAttendanceStatus.notAttending, '欠席', Icons.cancel_outlined, AppColors.error),
      (EventAttendanceStatus.pending, '保留', Icons.help_outline, AppColors.warning),
    ];

    return Card(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('出欠状況', style: Theme.of(context).textTheme.titleMedium),
            if (responseDeadlineDatetime != null) ...[
              const SizedBox(height: 4),
              Row(
                children: [
                  Icon(
                    Icons.access_time,
                    size: 16,
                    color: isAfterDeadline
                        ? Theme.of(context).colorScheme.error
                        : Theme.of(context).colorScheme.onSurfaceVariant,
                  ),
                  const SizedBox(width: 4),
                  Text(
                    '回答期限: ${dateFormat.format(responseDeadlineDatetime!)} ${timeFormat.format(responseDeadlineDatetime!)}',
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: isAfterDeadline
                              ? Theme.of(context).colorScheme.error
                              : Theme.of(context).colorScheme.onSurfaceVariant,
                        ),
                  ),
                ],
              ),
            ],
            const SizedBox(height: 12),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: options.map((opt) {
                final selected = current == opt.$1;
                final statusColor = opt.$4;
                return Expanded(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 4),
                    child: OutlinedButton.icon(
                      onPressed: (isSubmitting || isAfterDeadline)
                          ? null
                          : () => onSelect(opt.$1),
                      icon: Icon(
                        opt.$3,
                        color: selected ? statusColor : Theme.of(context).colorScheme.onSurface,
                      ),
                      label: Text(
                        opt.$2,
                        style: TextStyle(
                          color: selected ? statusColor : null,
                        ),
                      ),
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        side: BorderSide(
                          color: selected ? statusColor : Theme.of(context).colorScheme.outline,
                          width: selected ? 2 : 1,
                        ),
                        backgroundColor: selected ? statusColor.withOpacity(0.1) : null,
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: commentController,
              maxLines: 3,
              minLines: 1,
              enabled: !isAfterDeadline && !isSubmitting,
              decoration: const InputDecoration(
                labelText: 'コメント (任意)',
                hintText: '出席/欠席/保留の理由や補足を記入できます',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 12),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: (isSubmitting || isAfterDeadline) ? null : onSubmit,
                icon: const Icon(Icons.send),
                label: isSubmitting
                    ? const SizedBox(
                        height: 16,
                        width: 16,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : const Text('回答する'),
              ),
            ),
            if (isAfterDeadline) ...[
              const SizedBox(height: 8),
              Text(
                '締切後のため変更できません',
                style: TextStyle(color: Theme.of(context).colorScheme.error),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _NotesSection extends StatelessWidget {
  const _NotesSection({required this.notesMarkdown});

  final String? notesMarkdown;

  @override
  Widget build(BuildContext context) {
    if (notesMarkdown == null || notesMarkdown!.isEmpty) {
      return const SizedBox.shrink();
    }

    return Card(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('詳細情報', style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: 8),
            Text(
              notesMarkdown!,
              style: Theme.of(context).textTheme.bodyMedium,
            ),
          ],
        ),
      ),
    );
  }
}

class _AttendanceList extends StatelessWidget {
  const _AttendanceList({required this.attendance});

  final List<EventAttendance> attendance;

  @override
  Widget build(BuildContext context) {
    return Card(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('回答者リスト', style: Theme.of(context).textTheme.titleMedium),
                Text('${attendance.length} 名'),
              ],
            ),
            const SizedBox(height: 12),
            if (attendance.isEmpty)
              Text('まだ回答がありません',
                  style: Theme.of(context)
                      .textTheme
                      .bodyMedium
                      ?.copyWith(color: AppColors.lightTextSecondary))
            else
              Column(
                children: attendance
                    .map((a) => _AttendanceTile(attendance: a))
                    .toList(),
              ),
          ],
        ),
      ),
    );
  }
}

class _AttendanceTile extends StatelessWidget {
  const _AttendanceTile({required this.attendance});

  final EventAttendance attendance;

  @override
  Widget build(BuildContext context) {
    final statusData = _mapStatus(attendance.status, context);
    return ListTile(
      contentPadding: EdgeInsets.zero,
      leading: CircleAvatar(
        backgroundColor: statusData.color.withOpacity(0.15),
        backgroundImage: attendance.avatarUrl != null
            ? NetworkImage(attendance.avatarUrl!)
            : null,
        child: attendance.avatarUrl == null
            ? Icon(statusData.icon, color: statusData.color)
            : null,
      ),
      title: Text(attendance.displayName ?? attendance.memberId),
      subtitle: attendance.comment != null && attendance.comment!.isNotEmpty
          ? Text(attendance.comment!)
          : null,
      trailing: Chip(
        label: Text(statusData.label),
        backgroundColor: statusData.color.withOpacity(0.15),
        labelStyle: TextStyle(color: statusData.color),
      ),
    );
  }

  _StatusLabel _mapStatus(EventAttendanceStatus status, BuildContext context) {
    switch (status) {
      case EventAttendanceStatus.attending:
        return const _StatusLabel(
          label: '出席',
          icon: Icons.check_circle_outline,
          color: AppColors.success,
        );
      case EventAttendanceStatus.notAttending:
        return const _StatusLabel(
          label: '欠席',
          icon: Icons.cancel_outlined,
          color: AppColors.error,
        );
      case EventAttendanceStatus.pending:
      default:
        return const _StatusLabel(
          label: '保留',
          icon: Icons.help_outline,
          color: AppColors.warning,
        );
    }
  }
}

class _StatusLabel {
  const _StatusLabel({
    required this.label,
    required this.icon,
    required this.color,
  });

  final String label;
  final IconData icon;
  final Color color;
}

/// イベントタイプごとの色・アイコンを決定
_EventTypeStyle _resolveEventTypeStyle(
  BuildContext context,
  String? eventTypeName,
) {
  final name = eventTypeName?.trim().toLowerCase();

  switch (name) {
    case '試合':
    case 'game':
      return const _EventTypeStyle(
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

class _EventTypeStyle {
  const _EventTypeStyle({required this.color, required this.icon});
  final Color color;
  final IconData icon;
}
