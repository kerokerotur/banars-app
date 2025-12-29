import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/config/app_env.dart';
import 'package:mobile/event_detail/models/event_attendance.dart';
import 'package:mobile/event_list/models/event_list_item.dart';
import 'package:mobile/shared/services/supabase_function_service.dart';
import 'package:mobile/shared/theme/app_colors.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

/// 出欠者一覧モーダル
class AttendanceModal extends ConsumerStatefulWidget {
  const AttendanceModal({super.key, required this.event});

  final EventListItem event;

  @override
  ConsumerState<AttendanceModal> createState() => _AttendanceModalState();
}

class _AttendanceModalState extends ConsumerState<AttendanceModal> {
  bool _isLoading = true;
  String? _errorMessage;
  List<EventAttendance> _attendances = [];

  @override
  void initState() {
    super.initState();
    _fetchAttendanceDetail();
  }

  Future<void> _fetchAttendanceDetail() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final response = await SupabaseFunctionService.invoke(
        client: Supabase.instance.client,
        functionName: AppEnv.eventDetailFunctionName,
        method: HttpMethod.get,
        queryParameters: {
          'event_id': widget.event.id,
        },
      );

      final attendanceList = (response.data['attendance'] as List)
          .map((json) => EventAttendance.fromJson(json as Map<String, dynamic>))
          .toList();

      setState(() {
        _attendances = attendanceList;
        _isLoading = false;
      });
    } catch (error) {
      setState(() {
        _errorMessage = '出欠情報の取得に失敗しました: $error';
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final textSecondaryColor =
        isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary;

    return Container(
      height: MediaQuery.of(context).size.height * 0.7,
      decoration: BoxDecoration(
        color: Theme.of(context).scaffoldBackgroundColor,
        borderRadius: const BorderRadius.only(
          topLeft: Radius.circular(16),
          topRight: Radius.circular(16),
        ),
      ),
      child: Column(
        children: [
          // ヘッダー
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                Text(
                  '出欠一覧',
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                ),
                const Spacer(),
                IconButton(
                  icon: const Icon(Icons.close),
                  onPressed: () => Navigator.pop(context),
                ),
              ],
            ),
          ),
          const Divider(height: 1),

          // コンテンツ
          Expanded(
            child: _isLoading
                ? const Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        CircularProgressIndicator(),
                        SizedBox(height: 16),
                        Text('出欠情報を取得中...'),
                      ],
                    ),
                  )
                : _errorMessage != null
                    ? Center(
                        child: Padding(
                          padding: const EdgeInsets.all(24),
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(
                                Icons.error_outline,
                                size: 64,
                                color: Theme.of(context).colorScheme.error,
                              ),
                              const SizedBox(height: 16),
                              Text(
                                'エラーが発生しました',
                                style: Theme.of(context).textTheme.titleLarge,
                              ),
                              const SizedBox(height: 8),
                              Text(
                                _errorMessage!,
                                textAlign: TextAlign.center,
                                style: TextStyle(color: textSecondaryColor),
                              ),
                              const SizedBox(height: 24),
                              FilledButton.icon(
                                onPressed: _fetchAttendanceDetail,
                                icon: const Icon(Icons.refresh),
                                label: const Text('再試行'),
                              ),
                            ],
                          ),
                        ),
                      )
                    : _buildAttendanceList(context),
          ),
        ],
      ),
    );
  }

  Widget _buildAttendanceList(BuildContext context) {
    if (_attendances.isEmpty) {
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
                Icons.people_outline,
                size: 64,
                color: textSecondaryColor,
              ),
              const SizedBox(height: 16),
              Text(
                'まだ回答がありません',
                style: Theme.of(context).textTheme.titleMedium,
              ),
            ],
          ),
        ),
      );
    }

    // ステータス別にグループ化
    final attending = _attendances
        .where((a) => a.status == EventAttendanceStatus.attending)
        .toList();
    final pending = _attendances
        .where((a) => a.status == EventAttendanceStatus.pending)
        .toList();
    final notAttending = _attendances
        .where((a) => a.status == EventAttendanceStatus.notAttending)
        .toList();

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        // サマリー
        _buildSummaryCard(context, attending.length, pending.length,
            notAttending.length),
        const SizedBox(height: 16),

        // 出席者セクション
        if (attending.isNotEmpty) ...[
          _buildSectionHeader(
            context,
            '出席',
            attending.length,
            AppColors.success,
          ),
          const SizedBox(height: 8),
          ...attending.map((a) => _buildAttendanceTile(context, a)),
          const SizedBox(height: 16),
        ],

        // 保留セクション
        if (pending.isNotEmpty) ...[
          _buildSectionHeader(
            context,
            '保留',
            pending.length,
            AppColors.warning,
          ),
          const SizedBox(height: 8),
          ...pending.map((a) => _buildAttendanceTile(context, a)),
          const SizedBox(height: 16),
        ],

        // 欠席者セクション
        if (notAttending.isNotEmpty) ...[
          _buildSectionHeader(
            context,
            '欠席',
            notAttending.length,
            AppColors.error,
          ),
          const SizedBox(height: 8),
          ...notAttending.map((a) => _buildAttendanceTile(context, a)),
        ],
      ],
    );
  }

  Widget _buildSummaryCard(
    BuildContext context,
    int attendingCount,
    int pendingCount,
    int notAttendingCount,
  ) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceAround,
          children: [
            _buildSummaryItem(
              context,
              '出席',
              attendingCount,
              AppColors.success,
            ),
            _buildSummaryItem(
              context,
              '保留',
              pendingCount,
              AppColors.warning,
            ),
            _buildSummaryItem(
              context,
              '欠席',
              notAttendingCount,
              AppColors.error,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSummaryItem(
    BuildContext context,
    String label,
    int count,
    Color color,
  ) {
    return Column(
      children: [
        Text(
          '$count',
          style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                color: color,
                fontWeight: FontWeight.bold,
              ),
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: Theme.of(context).textTheme.bodySmall,
        ),
      ],
    );
  }

  Widget _buildSectionHeader(
    BuildContext context,
    String title,
    int count,
    Color color,
  ) {
    return Row(
      children: [
        Container(
          width: 4,
          height: 20,
          decoration: BoxDecoration(
            color: color,
            borderRadius: BorderRadius.circular(2),
          ),
        ),
        const SizedBox(width: 8),
        Text(
          title,
          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
              ),
        ),
        const SizedBox(width: 8),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
          decoration: BoxDecoration(
            color: color.withValues(alpha: 0.15),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Text(
            '$count名',
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.bold,
              color: color,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildAttendanceTile(
    BuildContext context,
    EventAttendance attendance,
  ) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final textSecondaryColor =
        isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary;

    Color statusColor;
    switch (attendance.status) {
      case EventAttendanceStatus.attending:
        statusColor = AppColors.success;
        break;
      case EventAttendanceStatus.notAttending:
        statusColor = AppColors.error;
        break;
      case EventAttendanceStatus.pending:
        statusColor = AppColors.warning;
        break;
    }

    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        leading: Container(
          width: 48,
          height: 48,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            border: Border.all(color: statusColor, width: 2),
            color: Colors.grey[300],
          ),
          child: ClipOval(
            child: attendance.avatarUrl != null
                ? Image.network(
                    attendance.avatarUrl!,
                    fit: BoxFit.cover,
                    errorBuilder: (context, error, stackTrace) {
                      return const Icon(Icons.person, size: 24);
                    },
                  )
                : const Icon(Icons.person, size: 24),
          ),
        ),
        title: Text(
          attendance.displayName ?? attendance.memberId,
          style: const TextStyle(fontWeight: FontWeight.bold),
        ),
        subtitle: attendance.comment != null && attendance.comment!.isNotEmpty
            ? Text(
                attendance.comment!,
                style: TextStyle(color: textSecondaryColor),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              )
            : null,
      ),
    );
  }
}
