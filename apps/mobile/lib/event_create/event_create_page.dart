import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:mobile/event_create/event_create_controller.dart';
import 'package:mobile/event_create/event_create_state.dart';
import 'package:mobile/event_create/widgets/place_create_modal.dart';

class EventCreatePage extends ConsumerStatefulWidget {
  const EventCreatePage({super.key});

  @override
  ConsumerState<EventCreatePage> createState() => _EventCreatePageState();
}

class _EventCreatePageState extends ConsumerState<EventCreatePage> {
  late final TextEditingController _titleController;
  late final TextEditingController _notesController;
  ProviderSubscription<EventCreateState>? _subscription;
  bool _isVenueDropdownOpen = false;

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
    // Success: Navigate back to home
    if (next.status == EventCreateStatus.success &&
        previous?.status != EventCreateStatus.success) {
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
          onChanged: (value) =>
              ref.read(eventCreateControllerProvider.notifier).updateTitle(value),
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
        DropdownButtonFormField<String>(
          value: state.selectedEventTypeId,
          decoration: InputDecoration(
            hintText: '種別を選択',
            errorText: state.validationErrors['eventType'],
            filled: true,
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
            ),
          ),
          items: state.eventTypes.map((type) {
            return DropdownMenuItem(
              value: type.id,
              child: Text(type.name),
            );
          }).toList(),
          onChanged: (value) => ref
              .read(eventCreateControllerProvider.notifier)
              .updateEventType(value),
        ),
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
          onSelect: (datetime) => ref
              .read(eventCreateControllerProvider.notifier)
              .updateStartDatetime(datetime),
          onClear: () =>
              ref.read(eventCreateControllerProvider.notifier).clearStartDatetime(),
        ),
        const SizedBox(height: 12),
        _buildDateTimeField(
          label: '集合日時',
          datetime: state.meetingDatetime,
          onSelect: (datetime) => ref
              .read(eventCreateControllerProvider.notifier)
              .updateMeetingDatetime(datetime),
          onClear: () => ref
              .read(eventCreateControllerProvider.notifier)
              .clearMeetingDatetime(),
        ),
        const SizedBox(height: 12),
        _buildDateTimeField(
          label: '回答締切',
          datetime: state.responseDeadlineDatetime,
          onSelect: (datetime) => ref
              .read(eventCreateControllerProvider.notifier)
              .updateResponseDeadline(datetime),
          onClear: () => ref
              .read(eventCreateControllerProvider.notifier)
              .clearResponseDeadline(),
        ),
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
          datetime != null
              ? _formatDateTime(datetime)
              : '日時を選択',
          style: datetime != null
              ? null
              : TextStyle(color: Colors.grey.shade600),
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

    final time = await showTimePicker(
      context: context,
      initialTime: TimeOfDay.now(),
    );
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
          ? () =>
              ref.read(eventCreateControllerProvider.notifier).submitEvent()
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
