import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'package:mobile/event_detail/event_detail_controller.dart';
import 'package:mobile/event_detail/event_detail_state.dart';
import 'package:mobile/event_detail/models/event_attendance.dart';
import 'package:mobile/event_list/models/event_list_item.dart';
import 'package:mobile/place_management/place_create/widgets/google_maps_preview.dart';
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

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(eventDetailControllerProvider(widget.event));
    final controller =
        ref.read(eventDetailControllerProvider(widget.event).notifier);

    return Scaffold(
      appBar: AppBar(
        title: const Text('イベント詳細'),
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
                event: widget.event,
                dateFormat: _dateFormat,
                timeFormat: _timeFormat,
                onOpenMap: widget.event.eventPlaceGoogleMapsUrlNormalized == null
                    ? null
                    : () => _openMap(widget.event.eventPlaceGoogleMapsUrlNormalized!),
              ),
              const SizedBox(height: 16),
              _AttendanceSelector(
                current: state.myStatus,
                isSubmitting: state.isSubmitting,
                onSelect: controller.updateMyAttendance,
              ),
              const SizedBox(height: 16),
              _NotesSection(notesMarkdown: widget.event.notesMarkdown),
              const SizedBox(height: 16),
              _AttendanceList(attendance: state.attendance),
              if (state.status == EventDetailStatus.loading) ...[
                const SizedBox(height: 16),
                const Center(child: CircularProgressIndicator()),
              ],
              if (state.status == EventDetailStatus.error && state.errorMessage != null)
                Padding(
                  padding: const EdgeInsets.only(top: 8),
                  child: Text(
                    state.errorMessage!,
                    style: TextStyle(color: Theme.of(context).colorScheme.error),
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
    final secondary = Theme.of(context).brightness == Brightness.dark
        ? AppColors.darkTextSecondary
        : AppColors.lightTextSecondary;

    return Card(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              event.title,
              style: textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
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
              icon: Icons.access_time,
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
            if (event.eventPlaceGoogleMapsUrlNormalized != null) ...[
              GoogleMapsPreview(
                googleMapsUrl: event.eventPlaceGoogleMapsUrlNormalized!,
                height: 200,
              ),
              const SizedBox(height: 12),
              SizedBox(
                width: double.infinity,
                child: OutlinedButton(
                  onPressed: onOpenMap,
                  child: const Text('地図を開く'),
                ),
              ),
            ],
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
                style: textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
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
    required this.onSelect,
  });

  final EventAttendanceStatus? current;
  final bool isSubmitting;
  final void Function(EventAttendanceStatus) onSelect;

  @override
  Widget build(BuildContext context) {
    final options = [
      (EventAttendanceStatus.attending, '出席', Icons.check_circle_outline),
      (EventAttendanceStatus.notAttending, '欠席', Icons.cancel_outlined),
      (EventAttendanceStatus.pending, '保留', Icons.help_outline),
    ];

    return Card(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('出欠状況', style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: 12),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: options.map((opt) {
                final selected = current == opt.$1;
                return Expanded(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 4),
                    child: OutlinedButton.icon(
                      onPressed: isSubmitting
                          ? null
                          : () => onSelect(opt.$1),
                      icon: Icon(opt.$3,
                          color: selected
                              ? Theme.of(context).colorScheme.primary
                              : Theme.of(context).colorScheme.onSurface),
                      label: Text(opt.$2),
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        side: BorderSide(
                          color: selected
                              ? Theme.of(context).colorScheme.primary
                              : Theme.of(context).colorScheme.outline,
                        ),
                        backgroundColor: selected
                            ? Theme.of(context)
                                .colorScheme
                                .primary
                                .withOpacity(0.08)
                            : null,
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),
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
                Text('参加者リスト', style: Theme.of(context).textTheme.titleMedium),
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
                children: attendance.map((a) => _AttendanceTile(attendance: a)).toList(),
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
        return _StatusLabel(
          label: '出席',
          icon: Icons.check_circle_outline,
          color: AppColors.success,
        );
      case EventAttendanceStatus.notAttending:
        return _StatusLabel(
          label: '欠席',
          icon: Icons.cancel_outlined,
          color: AppColors.error,
        );
      case EventAttendanceStatus.pending:
      default:
        return _StatusLabel(
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
