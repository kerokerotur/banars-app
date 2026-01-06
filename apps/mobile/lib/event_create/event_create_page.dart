import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:url_launcher/url_launcher_string.dart';

import 'package:mobile/event_create/event_create_controller.dart';
import 'package:mobile/event_create/event_create_state.dart';
import 'package:mobile/event_create/widgets/place_create_modal.dart';
import 'package:mobile/event_list/event_list_controller.dart';
import 'package:mobile/shared/theme/app_colors.dart';

class EventCreatePage extends ConsumerStatefulWidget {
  const EventCreatePage({super.key});

  @override
  ConsumerState<EventCreatePage> createState() => _EventCreatePageState();
}

enum MeetingTimeOption {
  before30,
  before60,
  before90,
  custom,
}

enum ResponseDeadlineOption {
  before3Days,
  before7Days,
  before10Days,
  custom,
}

class _EventCreatePageState extends ConsumerState<EventCreatePage> {
  late final TextEditingController _titleController;
  late final TextEditingController _notesController;
  ProviderSubscription<EventCreateState>? _subscription;
  bool _isVenueDropdownOpen = false;
  bool _isEventTypeDropdownOpen = false;
  MeetingTimeOption? _selectedMeetingTimeOption;
  ResponseDeadlineOption? _selectedResponseDeadlineOption;

  @override
  void initState() {
    super.initState();
    _titleController = TextEditingController();
    _notesController = TextEditingController();
    _subscription = ref.listenManual(
      eventCreateControllerProvider,
      _onStateChanged,
    );
  }

  @override
  void dispose() {
    _subscription?.close();
    _titleController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  void _onStateChanged(EventCreateState? previous, EventCreateState next) {
    // Success: Refresh event list and navigate back
    if (next.status == EventCreateStatus.success &&
        previous?.status != EventCreateStatus.success) {
      // Refresh event list
      ref.read(eventListControllerProvider.notifier).refresh();
      _showSnackBar('イベントを作成しました');
      Navigator.of(context).pop();
    }

    // Error: Show error message
    if (next.errorMessage != null &&
        next.errorMessage != previous?.errorMessage) {
      _showSnackBar(next.errorMessage!, isError: true);
    }
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(eventCreateControllerProvider);

    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            _buildAppBar(context),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.all(24),
                children: [
                  _buildTitleSection(state),
                  const SizedBox(height: 24),
                  _buildEventTypeSection(state),
                  const SizedBox(height: 24),
                  _buildVenueSection(state),
                  const SizedBox(height: 24),
                  _buildDateTimeSection(state),
                  const SizedBox(height: 24),
                  _buildNotesSection(state),
                  const SizedBox(height: 32),
                  _buildSubmitButton(state),
                  const SizedBox(height: 32),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAppBar(BuildContext context) {
    return Container(
      height: 64,
      padding: const EdgeInsets.symmetric(horizontal: 8),
      decoration: BoxDecoration(
        border: Border(
          bottom: BorderSide(
            color: Theme.of(context).dividerColor,
            width: 1,
          ),
        ),
      ),
      child: Row(
        children: [
          IconButton(
            icon: const Icon(Icons.arrow_back),
            onPressed: () => Navigator.of(context).pop(),
          ),
          const SizedBox(width: 8),
          Text(
            'イベント作成',
            style: Theme.of(context).textTheme.titleLarge,
          ),
        ],
      ),
    );
  }

  Widget _buildTitleSection(EventCreateState state) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'タイトル',
          style: Theme.of(context).textTheme.titleMedium,
        ),
        const SizedBox(height: 8),
        TextField(
          controller: _titleController,
          decoration: InputDecoration(
            hintText: '例: 練習試合 vs レッドソックス',
            errorText: state.validationErrors['title'],
            filled: true,
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
            ),
          ),
          onChanged: (value) => ref
              .read(eventCreateControllerProvider.notifier)
              .updateTitle(value),
        ),
      ],
    );
  }

  Widget _buildEventTypeSection(EventCreateState state) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'イベント種別',
          style: Theme.of(context).textTheme.titleMedium,
        ),
        const SizedBox(height: 8),
        _buildEventTypeDropdown(state),
        if (state.validationErrors['eventType'] != null) ...[
          const SizedBox(height: 8),
          Text(
            state.validationErrors['eventType']!,
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: Theme.of(context).colorScheme.error,
                ),
          ),
        ],
      ],
    );
  }

  Widget _buildVenueSection(EventCreateState state) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Text(
              'イベント会場',
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(width: 4),
            Text(
              '*',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    color: Theme.of(context).colorScheme.error,
                  ),
            ),
          ],
        ),
        const SizedBox(height: 8),
        _buildVenueDropdown(state),
        if (state.validationErrors['venueName'] != null) ...[
          const SizedBox(height: 8),
          Text(
            state.validationErrors['venueName']!,
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: Theme.of(context).colorScheme.error,
                ),
          ),
        ],
        if (state.venueName.isNotEmpty &&
            state.venueGoogleMapsUrl.isNotEmpty) ...[
          const SizedBox(height: 8),
          SizedBox(
            width: double.infinity,
            child: OutlinedButton.icon(
              onPressed: () => _openMap(state.venueGoogleMapsUrl),
              icon: const Icon(Icons.map),
              label: const Text('地図を開く'),
            ),
          ),
        ],
      ],
    );
  }

  Widget _buildDateTimeSection(EventCreateState state) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          '日時 (任意)',
          style: Theme.of(context).textTheme.titleMedium,
        ),
        const SizedBox(height: 8),
        _buildDateTimeField(
          label: '開始日時',
          datetime: state.startDatetime,
          onSelect: (datetime) {
            ref
                .read(eventCreateControllerProvider.notifier)
                .updateStartDatetime(datetime);
            // 開始日時が変更されたら、選択中の集合日時オプションに応じて集合日時を更新
            if (_selectedMeetingTimeOption != null &&
                _selectedMeetingTimeOption != MeetingTimeOption.custom) {
              _updateMeetingTimeBasedOnOption(
                  datetime, _selectedMeetingTimeOption!);
            }
            // 開始日時が変更されたら、選択中の回答締切オプションに応じて回答締切を更新
            if (_selectedResponseDeadlineOption != null &&
                _selectedResponseDeadlineOption !=
                    ResponseDeadlineOption.custom) {
              _updateResponseDeadlineBasedOnOption(
                  datetime, _selectedResponseDeadlineOption!);
            }
          },
          onClear: () {
            ref
                .read(eventCreateControllerProvider.notifier)
                .clearStartDatetime();
            // 開始日時をクリアしたら集合日時と回答締切もクリア
            setState(() {
              _selectedMeetingTimeOption = null;
              _selectedResponseDeadlineOption = null;
            });
            ref
                .read(eventCreateControllerProvider.notifier)
                .clearMeetingDatetime();
            ref
                .read(eventCreateControllerProvider.notifier)
                .clearResponseDeadline();
          },
        ),
        const SizedBox(height: 12),
        _buildMeetingTimeSection(state),
        const SizedBox(height: 12),
        _buildResponseDeadlineSection(state),
      ],
    );
  }

  Widget _buildDateTimeField({
    required String label,
    required DateTime? datetime,
    required void Function(DateTime) onSelect,
    required VoidCallback onClear,
  }) {
    return InkWell(
      onTap: () => _selectDateTime(onSelect),
      child: InputDecorator(
        decoration: InputDecoration(
          labelText: label,
          filled: true,
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8),
          ),
          suffixIcon: datetime != null
              ? IconButton(
                  icon: const Icon(Icons.clear),
                  onPressed: onClear,
                )
              : const Icon(Icons.calendar_today),
        ),
        child: Text(
          datetime != null ? _formatDateTime(datetime) : '日時を選択',
          style:
              datetime != null ? null : const TextStyle(color: AppColors.disabledText),
        ),
      ),
    );
  }

  Future<void> _selectDateTime(void Function(DateTime) onSelect) async {
    final date = await showDatePicker(
      context: context,
      initialDate: DateTime.now(),
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 365)),
    );
    if (date == null || !mounted) return;

    final time = await _showTimePicker24h(initialTime: TimeOfDay.now());
    if (time == null || !mounted) return;

    final datetime = DateTime(
      date.year,
      date.month,
      date.day,
      time.hour,
      time.minute,
    );
    onSelect(datetime);
  }

  Future<TimeOfDay?> _showTimePicker24h({required TimeOfDay initialTime}) {
    return showTimePicker(
      context: context,
      initialTime: initialTime,
      builder: (context, child) {
        return MediaQuery(
          data: MediaQuery.of(context).copyWith(alwaysUse24HourFormat: true),
          child: child!,
        );
      },
    );
  }

  String _formatDateTime(DateTime datetime) {
    return '${datetime.year}/${datetime.month}/${datetime.day} '
        '${datetime.hour.toString().padLeft(2, '0')}:${datetime.minute.toString().padLeft(2, '0')}';
  }

  Widget _buildNotesSection(EventCreateState state) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'メモ・持ち物 (任意)',
          style: Theme.of(context).textTheme.titleMedium,
        ),
        const SizedBox(height: 8),
        TextField(
          controller: _notesController,
          decoration: InputDecoration(
            hintText: '持ち物や注意事項など',
            filled: true,
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
            ),
          ),
          maxLines: 5,
          onChanged: (value) => ref
              .read(eventCreateControllerProvider.notifier)
              .updateNotesMarkdown(value),
        ),
      ],
    );
  }

  Widget _buildSubmitButton(EventCreateState state) {
    return FilledButton.icon(
      icon: state.isSubmitting
          ? const SizedBox(
              width: 16,
              height: 16,
              child: CircularProgressIndicator(
                strokeWidth: 2,
                color: Colors.white,
              ),
            )
          : const Icon(Icons.check),
      label: const Text('イベントを作成'),
      onPressed: state.canSubmit && !state.isSubmitting
          ? () => ref.read(eventCreateControllerProvider.notifier).submitEvent()
          : null,
      style: FilledButton.styleFrom(
        minimumSize: const Size.fromHeight(48),
      ),
    );
  }

  Widget _buildVenueDropdown(EventCreateState state) {
    final hasSelectedVenue = state.venueName.isNotEmpty;
    final theme = Theme.of(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        InkWell(
          onTap: () => setState(() {
            _isVenueDropdownOpen = !_isVenueDropdownOpen;
          }),
          borderRadius: BorderRadius.circular(8),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
            decoration: BoxDecoration(
              border: Border.all(
                color: state.validationErrors['venueName'] != null
                    ? theme.colorScheme.error
                    : theme.colorScheme.outline,
              ),
              borderRadius: BorderRadius.circular(8),
              color: theme.colorScheme.surface,
            ),
            child: Row(
              children: [
                if (hasSelectedVenue) ...[
                  Icon(
                    Icons.location_on,
                    color: theme.colorScheme.error,
                    size: 20,
                  ),
                  const SizedBox(width: 8),
                ],
                Expanded(
                  child: Text(
                    hasSelectedVenue ? state.venueName : 'イベント会場を選択',
                    style: theme.textTheme.bodyLarge?.copyWith(
                      color: hasSelectedVenue
                          ? theme.colorScheme.onSurface
                          : theme.colorScheme.onSurfaceVariant,
                    ),
                  ),
                ),
                Icon(
                  _isVenueDropdownOpen
                      ? Icons.arrow_drop_up
                      : Icons.arrow_drop_down,
                  color: theme.colorScheme.onSurfaceVariant,
                ),
              ],
            ),
          ),
        ),
        if (_isVenueDropdownOpen) ...[
          const SizedBox(height: 4),
          _buildVenueDropdownMenu(state, theme),
        ],
      ],
    );
  }

  Widget _buildVenueDropdownMenu(EventCreateState state, ThemeData theme) {
    return Container(
      decoration: BoxDecoration(
        border: Border.all(
          color: theme.colorScheme.outline,
        ),
        borderRadius: BorderRadius.circular(8),
        color: theme.colorScheme.surface,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.1),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      constraints: const BoxConstraints(maxHeight: 300),
      child: ListView(
        shrinkWrap: true,
        padding: EdgeInsets.zero,
        children: [
          // 登録済み会場のリスト
          ...state.previousVenues.map((place) {
            final isSelected = state.venueName == place.name;
            return InkWell(
              onTap: () {
                ref
                    .read(eventCreateControllerProvider.notifier)
                    .selectPreviousVenue(place);
                setState(() {
                  _isVenueDropdownOpen = false;
                });
              },
              child: Container(
                color: isSelected
                    ? theme.colorScheme.errorContainer.withValues(alpha: 0.3)
                    : null,
                padding:
                    const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                child: Row(
                  children: [
                    Icon(
                      Icons.location_on,
                      color: theme.colorScheme.error,
                      size: 20,
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        place.name,
                        style: theme.textTheme.bodyMedium,
                      ),
                    ),
                  ],
                ),
              ),
            );
          }),
          // 区切り線
          if (state.previousVenues.isNotEmpty)
            Divider(
              height: 1,
              color: theme.colorScheme.outline,
            ),
          // 新しい場所を追加
          InkWell(
            onTap: () {
              setState(() {
                _isVenueDropdownOpen = false;
              });
              _showPlaceCreateModal();
            },
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              child: Row(
                children: [
                  Icon(
                    Icons.add,
                    color: theme.colorScheme.error,
                    size: 20,
                  ),
                  const SizedBox(width: 12),
                  Text(
                    '新しい場所を追加',
                    style: theme.textTheme.bodyMedium?.copyWith(
                      color: theme.colorScheme.error,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _showPlaceCreateModal() async {
    final result = await showDialog<bool>(
      context: context,
      builder: (context) => const PlaceCreateModal(),
    );

    // If place was successfully created, refresh the list and select the latest
    if (result == true && mounted) {
      await ref
          .read(eventCreateControllerProvider.notifier)
          .refreshPlacesAndSelectLatest();
    }
  }

  Widget _buildEventTypeDropdown(EventCreateState state) {
    final selectedEventType = state.eventTypes
        .where((type) => type.id == state.selectedEventTypeId)
        .firstOrNull;
    final hasSelectedEventType = selectedEventType != null;
    final theme = Theme.of(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        InkWell(
          onTap: () => setState(() {
            _isEventTypeDropdownOpen = !_isEventTypeDropdownOpen;
          }),
          borderRadius: BorderRadius.circular(8),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
            decoration: BoxDecoration(
              border: Border.all(
                color: state.validationErrors['eventType'] != null
                    ? theme.colorScheme.error
                    : theme.colorScheme.outline,
              ),
              borderRadius: BorderRadius.circular(8),
              color: theme.colorScheme.surface,
            ),
            child: Row(
              children: [
                if (hasSelectedEventType) ...[
                  Icon(
                    _resolveEventTypeStyle(selectedEventType.name).icon,
                    color: theme.colorScheme.onSurface,
                    size: 20,
                  ),
                  const SizedBox(width: 8),
                ],
                Expanded(
                  child: Text(
                    hasSelectedEventType ? selectedEventType.name : 'イベント種別を選択',
                    style: theme.textTheme.bodyLarge?.copyWith(
                      color: hasSelectedEventType
                          ? theme.colorScheme.onSurface
                          : theme.colorScheme.onSurfaceVariant,
                    ),
                  ),
                ),
                Icon(
                  _isEventTypeDropdownOpen
                      ? Icons.arrow_drop_up
                      : Icons.arrow_drop_down,
                  color: theme.colorScheme.onSurfaceVariant,
                ),
              ],
            ),
          ),
        ),
        if (_isEventTypeDropdownOpen) ...[
          const SizedBox(height: 4),
          _buildEventTypeDropdownMenu(state, theme),
        ],
      ],
    );
  }

  Widget _buildEventTypeDropdownMenu(EventCreateState state, ThemeData theme) {
    return Container(
      decoration: BoxDecoration(
        border: Border.all(
          color: theme.colorScheme.outline,
        ),
        borderRadius: BorderRadius.circular(8),
        color: theme.colorScheme.surface,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.1),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      constraints: const BoxConstraints(maxHeight: 300),
      child: ListView(
        shrinkWrap: true,
        padding: EdgeInsets.zero,
        children: state.eventTypes.map((type) {
          final isSelected = state.selectedEventTypeId == type.id;
          final style = _resolveEventTypeStyle(type.name);
          return InkWell(
            onTap: () {
              ref
                  .read(eventCreateControllerProvider.notifier)
                  .updateEventType(type.id);
              setState(() {
                _isEventTypeDropdownOpen = false;
              });
            },
            child: Container(
              color: isSelected
                  ? theme.colorScheme.primaryContainer.withValues(alpha: 0.3)
                  : null,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              child: Row(
                children: [
                  Icon(
                    style.icon,
                    color: theme.colorScheme.onSurface,
                    size: 20,
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      type.name,
                      style: theme.textTheme.bodyMedium,
                    ),
                  ),
                ],
              ),
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _buildMeetingTimeSection(EventCreateState state) {
    final hasStartDatetime = state.startDatetime != null;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Text(
              '集合日時',
              style: Theme.of(context).textTheme.labelLarge,
            ),
            if (!hasStartDatetime) ...[
              const SizedBox(width: 8),
              Text(
                '※開始日時を設定してください',
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: Theme.of(context).colorScheme.error,
                    ),
              ),
            ],
          ],
        ),
        const SizedBox(height: 8),
        if (hasStartDatetime) ...[
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              _buildMeetingTimeChip(
                label: '30分前',
                option: MeetingTimeOption.before30,
                state: state,
              ),
              _buildMeetingTimeChip(
                label: '60分前',
                option: MeetingTimeOption.before60,
                state: state,
              ),
              _buildMeetingTimeChip(
                label: '90分前',
                option: MeetingTimeOption.before90,
                state: state,
              ),
              _buildMeetingTimeChip(
                label: 'カスタム',
                option: MeetingTimeOption.custom,
                state: state,
              ),
            ],
          ),
          if (state.meetingDatetime != null) ...[
            const SizedBox(height: 8),
            InputDecorator(
              decoration: InputDecoration(
                labelText: '設定された集合日時',
                filled: true,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
                suffixIcon: IconButton(
                  icon: const Icon(Icons.clear),
                  onPressed: () {
                    setState(() {
                      _selectedMeetingTimeOption = null;
                    });
                    ref
                        .read(eventCreateControllerProvider.notifier)
                        .clearMeetingDatetime();
                  },
                ),
              ),
              child: Text(_formatDateTime(state.meetingDatetime!)),
            ),
          ],
        ] else
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
            decoration: BoxDecoration(
              border: Border.all(
                color: Theme.of(context).colorScheme.outline,
              ),
              borderRadius: BorderRadius.circular(8),
              color:
                  Theme.of(context).colorScheme.surface.withValues(alpha: 0.5),
            ),
            child: Row(
              children: [
                Icon(
                  Icons.info_outline,
                  size: 20,
                  color: Theme.of(context).colorScheme.onSurfaceVariant,
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    '開始日時を先に設定してください',
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: Theme.of(context).colorScheme.onSurfaceVariant,
                        ),
                  ),
                ),
              ],
            ),
          ),
      ],
    );
  }

  Widget _buildMeetingTimeChip({
    required String label,
    required MeetingTimeOption option,
    required EventCreateState state,
  }) {
    final isSelected = _selectedMeetingTimeOption == option;
    final theme = Theme.of(context);

    return FilterChip(
      label: Text(label),
      selected: isSelected,
      onSelected: (_) => _onMeetingTimeOptionSelected(option, state),
      backgroundColor: theme.colorScheme.surface,
      selectedColor: theme.colorScheme.primaryContainer,
      checkmarkColor: theme.colorScheme.onPrimaryContainer,
      labelStyle: TextStyle(
        color: isSelected
            ? theme.colorScheme.onPrimaryContainer
            : theme.colorScheme.onSurface,
      ),
      side: BorderSide(
        color:
            isSelected ? theme.colorScheme.primary : theme.colorScheme.outline,
      ),
    );
  }

  Future<void> _onMeetingTimeOptionSelected(
      MeetingTimeOption option, EventCreateState state) async {
    if (state.startDatetime == null) return;

    if (option == MeetingTimeOption.custom) {
      // カスタムの場合は、まずカレンダーを表示
      final date = await showDatePicker(
        context: context,
        initialDate: state.startDatetime!,
        firstDate: DateTime.now(),
        lastDate: DateTime.now().add(const Duration(days: 365)),
      );
      if (date == null || !mounted) return;

      final time = await _showTimePicker24h(
        initialTime: TimeOfDay.fromDateTime(state.startDatetime!),
      );
      if (time == null || !mounted) return;

      final datetime = DateTime(
        date.year,
        date.month,
        date.day,
        time.hour,
        time.minute,
      );

      setState(() {
        _selectedMeetingTimeOption = option;
      });

      ref
          .read(eventCreateControllerProvider.notifier)
          .updateMeetingDatetime(datetime);
    } else {
      setState(() {
        _selectedMeetingTimeOption = option;
      });
      _updateMeetingTimeBasedOnOption(state.startDatetime!, option);
    }
  }

  void _updateMeetingTimeBasedOnOption(
      DateTime startDatetime, MeetingTimeOption option) {
    final minutes = switch (option) {
      MeetingTimeOption.before30 => 30,
      MeetingTimeOption.before60 => 60,
      MeetingTimeOption.before90 => 90,
      MeetingTimeOption.custom => 0,
    };

    if (minutes > 0) {
      final meetingDatetime =
          startDatetime.subtract(Duration(minutes: minutes));
      ref
          .read(eventCreateControllerProvider.notifier)
          .updateMeetingDatetime(meetingDatetime);
    }
  }

  Widget _buildResponseDeadlineSection(EventCreateState state) {
    final hasStartDatetime = state.startDatetime != null;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Text(
              '回答締切',
              style: Theme.of(context).textTheme.labelLarge,
            ),
            if (!hasStartDatetime) ...[
              const SizedBox(width: 8),
              Text(
                '※開始日時を設定してください',
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: Theme.of(context).colorScheme.error,
                    ),
              ),
            ],
          ],
        ),
        const SizedBox(height: 8),
        if (hasStartDatetime) ...[
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              _buildResponseDeadlineChip(
                label: '3日前',
                option: ResponseDeadlineOption.before3Days,
                state: state,
              ),
              _buildResponseDeadlineChip(
                label: '7日前',
                option: ResponseDeadlineOption.before7Days,
                state: state,
              ),
              _buildResponseDeadlineChip(
                label: '10日前',
                option: ResponseDeadlineOption.before10Days,
                state: state,
              ),
              _buildResponseDeadlineChip(
                label: 'カスタム',
                option: ResponseDeadlineOption.custom,
                state: state,
              ),
            ],
          ),
          if (state.responseDeadlineDatetime != null) ...[
            const SizedBox(height: 8),
            InputDecorator(
              decoration: InputDecoration(
                labelText: '設定された回答締切',
                filled: true,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
                suffixIcon: IconButton(
                  icon: const Icon(Icons.clear),
                  onPressed: () {
                    setState(() {
                      _selectedResponseDeadlineOption = null;
                    });
                    ref
                        .read(eventCreateControllerProvider.notifier)
                        .clearResponseDeadline();
                  },
                ),
              ),
              child: Text(_formatDateTime(state.responseDeadlineDatetime!)),
            ),
          ],
        ] else
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
            decoration: BoxDecoration(
              border: Border.all(
                color: Theme.of(context).colorScheme.outline,
              ),
              borderRadius: BorderRadius.circular(8),
              color:
                  Theme.of(context).colorScheme.surface.withValues(alpha: 0.5),
            ),
            child: Row(
              children: [
                Icon(
                  Icons.info_outline,
                  size: 20,
                  color: Theme.of(context).colorScheme.onSurfaceVariant,
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    '開始日時を先に設定してください',
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: Theme.of(context).colorScheme.onSurfaceVariant,
                        ),
                  ),
                ),
              ],
            ),
          ),
      ],
    );
  }

  Widget _buildResponseDeadlineChip({
    required String label,
    required ResponseDeadlineOption option,
    required EventCreateState state,
  }) {
    final isSelected = _selectedResponseDeadlineOption == option;
    final theme = Theme.of(context);

    return FilterChip(
      label: Text(label),
      selected: isSelected,
      onSelected: (_) => _onResponseDeadlineOptionSelected(option, state),
      backgroundColor: theme.colorScheme.surface,
      selectedColor: theme.colorScheme.primaryContainer,
      checkmarkColor: theme.colorScheme.onPrimaryContainer,
      labelStyle: TextStyle(
        color: isSelected
            ? theme.colorScheme.onPrimaryContainer
            : theme.colorScheme.onSurface,
      ),
      side: BorderSide(
        color:
            isSelected ? theme.colorScheme.primary : theme.colorScheme.outline,
      ),
    );
  }

  Future<void> _onResponseDeadlineOptionSelected(
      ResponseDeadlineOption option, EventCreateState state) async {
    if (state.startDatetime == null) return;

    if (option == ResponseDeadlineOption.custom) {
      // カスタムの場合は、まずカレンダーを表示
      final firstDate = DateTime.now();
      final calculatedInitialDate =
          state.startDatetime!.subtract(const Duration(days: 3));
      final initialDate = calculatedInitialDate.isBefore(firstDate)
          ? firstDate
          : calculatedInitialDate;

      final date = await showDatePicker(
        context: context,
        initialDate: initialDate,
        firstDate: firstDate,
        lastDate: state.startDatetime!,
      );
      if (date == null || !mounted) return;

      final time = await _showTimePicker24h(
        initialTime: TimeOfDay.fromDateTime(state.startDatetime!),
      );
      if (time == null || !mounted) return;

      final datetime = DateTime(
        date.year,
        date.month,
        date.day,
        time.hour,
        time.minute,
      );

      setState(() {
        _selectedResponseDeadlineOption = option;
      });

      ref
          .read(eventCreateControllerProvider.notifier)
          .updateResponseDeadline(datetime);
    } else {
      setState(() {
        _selectedResponseDeadlineOption = option;
      });
      _updateResponseDeadlineBasedOnOption(state.startDatetime!, option);
    }
  }

  void _updateResponseDeadlineBasedOnOption(
      DateTime startDatetime, ResponseDeadlineOption option) {
    final days = switch (option) {
      ResponseDeadlineOption.before3Days => 3,
      ResponseDeadlineOption.before7Days => 7,
      ResponseDeadlineOption.before10Days => 10,
      ResponseDeadlineOption.custom => 0,
    };

    if (days > 0) {
      final responseDeadline = startDatetime.subtract(Duration(days: days));
      ref
          .read(eventCreateControllerProvider.notifier)
          .updateResponseDeadline(responseDeadline);
    }
  }

  _EventTypeStyle _resolveEventTypeStyle(String? eventTypeName) {
    final name = eventTypeName?.trim().toLowerCase();

    switch (name) {
      case '試合':
      case 'game':
        return const _EventTypeStyle(
          icon: Icons.sports_baseball,
        );
      case '練習':
      case 'practice':
        return const _EventTypeStyle(
          icon: Icons.fitness_center,
        );
      default:
        return const _EventTypeStyle(
          icon: Icons.category,
        );
    }
  }

  Future<void> _openMap(String url) async {
    if (await canLaunchUrlString(url)) {
      await launchUrlString(url, mode: LaunchMode.externalApplication);
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

class _EventTypeStyle {
  const _EventTypeStyle({required this.icon});
  final IconData icon;
}
