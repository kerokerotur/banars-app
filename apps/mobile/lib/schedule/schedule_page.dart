import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:table_calendar/table_calendar.dart';
import 'package:mobile/event_list/event_list_controller.dart';
import 'package:mobile/event_list/models/event_list_item.dart';
import 'package:mobile/schedule/schedule_controller.dart';
import 'package:mobile/schedule/widgets/event_list_bottom_sheet.dart';
import 'package:mobile/shared/theme/app_colors.dart';

/// スケジュール（カレンダー）画面
class SchedulePage extends ConsumerStatefulWidget {
  const SchedulePage({super.key});

  @override
  ConsumerState<SchedulePage> createState() => _SchedulePageState();
}

class _SchedulePageState extends ConsumerState<SchedulePage> {
  @override
  Widget build(BuildContext context) {
    final scheduleState = ref.watch(scheduleControllerProvider);
    final eventListState = ref.watch(eventListControllerProvider);

    // EventListController の状態変更を監視して eventsMap を更新
    ref.listen(eventListControllerProvider, (previous, next) {
      if (next.isLoaded) {
        ref.read(scheduleControllerProvider.notifier).buildEventsMap(next.events);
      }
    });

    // 初回表示時にもイベントマップを構築
    if (eventListState.isLoaded && scheduleState.eventsMap.isEmpty) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        ref.read(scheduleControllerProvider.notifier).buildEventsMap(eventListState.events);
      });
    }

    // エラー状態の表示
    if (eventListState.hasError) {
      return _buildErrorView(context, eventListState.errorMessage);
    }

    // ローディング状態の表示
    if (eventListState.isLoading) {
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

    return Column(
      children: [
        _buildCalendar(context, scheduleState),
        const Divider(height: 1),
        _buildHint(context),
      ],
    );
  }

  /// カレンダー表示
  Widget _buildCalendar(BuildContext context, scheduleState) {
    final controller = ref.read(scheduleControllerProvider.notifier);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return TableCalendar(
      firstDay: DateTime.utc(2020, 1, 1),
      lastDay: DateTime.utc(2030, 12, 31),
      focusedDay: scheduleState.focusedDay,
      locale: 'ja_JP',
      selectedDayPredicate: (day) {
        return scheduleState.selectedDay != null &&
            isSameDay(scheduleState.selectedDay, day);
      },
      eventLoader: (day) {
        return controller.getEventsForDay(day);
      },
      calendarBuilders: CalendarBuilders(
        markerBuilder: (context, day, events) {
          if (events.isEmpty) return null;
          return Positioned(
            bottom: 1,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: events.take(3).map((event) {
                return Container(
                  margin: const EdgeInsets.symmetric(horizontal: 1),
                  width: 6,
                  height: 6,
                  decoration: const BoxDecoration(
                    color: AppColors.primary,
                    shape: BoxShape.circle,
                  ),
                );
              }).toList(),
            ),
          );
        },
      ),
      calendarStyle: CalendarStyle(
        // 今日の日付
        todayDecoration: BoxDecoration(
          color: AppColors.primary.withValues(alpha: 0.3),
          shape: BoxShape.circle,
        ),
        todayTextStyle: TextStyle(
          color: isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary,
          fontWeight: FontWeight.bold,
        ),
        // 選択中の日付
        selectedDecoration: const BoxDecoration(
          color: AppColors.primary,
          shape: BoxShape.circle,
        ),
        selectedTextStyle: const TextStyle(
          color: Colors.white,
          fontWeight: FontWeight.bold,
        ),
        // 週末の色
        weekendTextStyle: TextStyle(
          color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
        ),
        // デフォルトテキスト
        defaultTextStyle: TextStyle(
          color: isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary,
        ),
        // 範囲外の日付
        outsideTextStyle: TextStyle(
          color: isDark ? AppColors.darkTextDisabled : AppColors.lightTextDisabled,
        ),
      ),
      headerStyle: HeaderStyle(
        formatButtonVisible: false,
        titleCentered: true,
        titleTextStyle: Theme.of(context).textTheme.titleMedium!.copyWith(
              fontWeight: FontWeight.bold,
            ),
        leftChevronIcon: Icon(
          Icons.chevron_left,
          color: isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary,
        ),
        rightChevronIcon: Icon(
          Icons.chevron_right,
          color: isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary,
        ),
      ),
      daysOfWeekStyle: DaysOfWeekStyle(
        weekdayStyle: TextStyle(
          color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
          fontWeight: FontWeight.bold,
        ),
        weekendStyle: TextStyle(
          color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
          fontWeight: FontWeight.bold,
        ),
      ),
      onDaySelected: (selectedDay, focusedDay) {
        controller.onDaySelected(selectedDay);
        controller.onFocusedDayChanged(focusedDay);

        // その日のイベント一覧を取得
        final events = controller.getEventsForDay(selectedDay);

        // イベントがある場合のみボトムシートを表示
        if (events.isNotEmpty) {
          _showEventListBottomSheet(context, selectedDay, events);
        }
      },
      onPageChanged: (focusedDay) {
        controller.onFocusedDayChanged(focusedDay);
        controller.clearSelectedDay();
      },
    );
  }

  /// エラー表示
  Widget _buildErrorView(BuildContext context, String? errorMessage) {
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
              color: Theme.of(context).colorScheme.error,
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

  /// ヒント表示
  Widget _buildHint(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final textSecondaryColor =
        isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary;

    return Padding(
      padding: const EdgeInsets.all(16),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.info_outline, size: 16, color: textSecondaryColor),
          const SizedBox(width: 8),
          Text(
            'イベントがある日をタップすると詳細が表示されます',
            style: TextStyle(
              fontSize: 12,
              color: textSecondaryColor,
            ),
          ),
        ],
      ),
    );
  }

  /// イベント一覧ボトムシートを表示
  void _showEventListBottomSheet(
    BuildContext context,
    DateTime selectedDay,
    List<EventListItem> events,
  ) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => EventListBottomSheet(
        selectedDay: selectedDay,
        events: events,
      ),
    );
  }
}
