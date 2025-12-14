import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:mobile/event_create/event_create_controller.dart';
import 'package:mobile/event_create/event_create_state.dart';
import 'package:mobile/event_create/models/nominatim_result.dart';

class EventCreatePage extends ConsumerStatefulWidget {
  const EventCreatePage({super.key});

  @override
  ConsumerState<EventCreatePage> createState() => _EventCreatePageState();
}

class _EventCreatePageState extends ConsumerState<EventCreatePage> {
  late final TextEditingController _titleController;
  late final TextEditingController _venueNameController;
  late final TextEditingController _venueAddressController;
  late final TextEditingController _notesController;
  late final TextEditingController _nominatimSearchController;
  ProviderSubscription<EventCreateState>? _subscription;

  @override
  void initState() {
    super.initState();
    _titleController = TextEditingController();
    _venueNameController = TextEditingController();
    _venueAddressController = TextEditingController();
    _notesController = TextEditingController();
    _nominatimSearchController = TextEditingController();
    _subscription = ref.listenManual(
      eventCreateControllerProvider,
      _onStateChanged,
    );
  }

  @override
  void dispose() {
    _subscription?.close();
    _titleController.dispose();
    _venueNameController.dispose();
    _venueAddressController.dispose();
    _notesController.dispose();
    _nominatimSearchController.dispose();
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

    // Update venue fields when selected from Nominatim or previous venues
    if (next.venueName != previous?.venueName &&
        next.venueName != _venueNameController.text) {
      _venueNameController.text = next.venueName;
    }
    if (next.venueAddress != previous?.venueAddress &&
        next.venueAddress != _venueAddressController.text) {
      _venueAddressController.text = next.venueAddress;
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
        Text(
          '会場',
          style: Theme.of(context).textTheme.titleMedium,
        ),
        const SizedBox(height: 8),
        _buildVenueModeTabs(state),
        const SizedBox(height: 16),
        if (state.venueInputMode == VenueInputMode.nominatim)
          _buildNominatimSearch(state)
        else if (state.venueInputMode == VenueInputMode.previousVenues)
          _buildPreviousVenuesList(state)
        else
          _buildManualVenueInput(state),
      ],
    );
  }

  Widget _buildVenueModeTabs(EventCreateState state) {
    return SegmentedButton<VenueInputMode>(
      segments: const [
        ButtonSegment(
          value: VenueInputMode.nominatim,
          label: Text('検索'),
          icon: Icon(Icons.search),
        ),
        ButtonSegment(
          value: VenueInputMode.previousVenues,
          label: Text('履歴'),
          icon: Icon(Icons.history),
        ),
        ButtonSegment(
          value: VenueInputMode.manual,
          label: Text('手入力'),
          icon: Icon(Icons.edit),
        ),
      ],
      selected: {state.venueInputMode},
      onSelectionChanged: (Set<VenueInputMode> selection) {
        ref
            .read(eventCreateControllerProvider.notifier)
            .switchVenueInputMode(selection.first);
      },
    );
  }

  Widget _buildNominatimSearch(EventCreateState state) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        TextField(
          controller: _nominatimSearchController,
          decoration: InputDecoration(
            hintText: '会場名で検索 (例: 東京ドーム)',
            prefixIcon: const Icon(Icons.search),
            suffixIcon: IconButton(
              icon: const Icon(Icons.search),
              tooltip: '検索',
              onPressed: state.nominatimSearchQuery.isNotEmpty
                  ? () => ref
                      .read(eventCreateControllerProvider.notifier)
                      .performNominatimSearch()
                  : null,
            ),
            filled: true,
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
            ),
          ),
          onChanged: (value) => ref
              .read(eventCreateControllerProvider.notifier)
              .updateNominatimSearchQuery(value),
          onSubmitted: (value) {
            if (value.isNotEmpty) {
              ref
                  .read(eventCreateControllerProvider.notifier)
                  .performNominatimSearch();
            }
          },
        ),
        const SizedBox(height: 12),
        if (state.isSearching)
          const Center(
            child: Padding(
              padding: EdgeInsets.all(16.0),
              child: CircularProgressIndicator(),
            ),
          )
        else if (state.nominatimResults.isNotEmpty)
          _buildNominatimResults(state.nominatimResults)
        else if (state.nominatimSearchQuery.isNotEmpty)
          const Padding(
            padding: EdgeInsets.all(16.0),
            child: Text('検索結果がありません'),
          ),
        if (state.venueName.isNotEmpty) ...[
          const SizedBox(height: 12),
          _buildSelectedVenueDisplay(state),
        ],
      ],
    );
  }

  Widget _buildNominatimResults(List<NominatimResult> results) {
    return Container(
      decoration: BoxDecoration(
        border: Border.all(color: Colors.grey.shade300),
        borderRadius: BorderRadius.circular(8),
      ),
      constraints: const BoxConstraints(maxHeight: 300),
      child: ListView.separated(
        shrinkWrap: true,
        itemCount: results.length,
        separatorBuilder: (_, __) => const Divider(height: 1),
        itemBuilder: (context, index) {
          final result = results[index];
          return ListTile(
            title: Text(result.formattedName),
            subtitle: Text(
              result.displayName,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
            onTap: () {
              ref
                  .read(eventCreateControllerProvider.notifier)
                  .selectNominatimResult(result);
              _nominatimSearchController.clear();
            },
          );
        },
      ),
    );
  }

  Widget _buildPreviousVenuesList(EventCreateState state) {
    if (state.previousVenues.isEmpty) {
      return const Padding(
        padding: EdgeInsets.all(16.0),
        child: Text('まだ会場の履歴がありません'),
      );
    }

    return Column(
      children: [
        Container(
          decoration: BoxDecoration(
            border: Border.all(color: Colors.grey.shade300),
            borderRadius: BorderRadius.circular(8),
          ),
          constraints: const BoxConstraints(maxHeight: 300),
          child: ListView.separated(
            shrinkWrap: true,
            itemCount: state.previousVenues.length,
            separatorBuilder: (_, __) => const Divider(height: 1),
            itemBuilder: (context, index) {
              final place = state.previousVenues[index];
              return ListTile(
                title: Text(place.name),
                subtitle: Text(place.address),
                onTap: () {
                  ref
                      .read(eventCreateControllerProvider.notifier)
                      .selectPreviousVenue(place);
                },
              );
            },
          ),
        ),
        if (state.venueName.isNotEmpty) ...[
          const SizedBox(height: 12),
          _buildSelectedVenueDisplay(state),
        ],
      ],
    );
  }

  Widget _buildManualVenueInput(EventCreateState state) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        TextField(
          controller: _venueNameController,
          decoration: InputDecoration(
            labelText: '会場名',
            hintText: '例: 東京ドーム',
            errorText: state.validationErrors['venueName'],
            filled: true,
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
            ),
          ),
          onChanged: (value) => ref
              .read(eventCreateControllerProvider.notifier)
              .updateVenueName(value),
        ),
        const SizedBox(height: 12),
        TextField(
          controller: _venueAddressController,
          decoration: InputDecoration(
            labelText: '住所',
            hintText: '例: 東京都文京区後楽1-3-61',
            errorText: state.validationErrors['venueAddress'],
            filled: true,
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
            ),
          ),
          onChanged: (value) => ref
              .read(eventCreateControllerProvider.notifier)
              .updateVenueAddress(value),
        ),
      ],
    );
  }

  Widget _buildSelectedVenueDisplay(EventCreateState state) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(12.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(Icons.location_on, size: 16),
                const SizedBox(width: 4),
                Expanded(
                  child: Text(
                    '選択中の会場',
                    style: Theme.of(context).textTheme.labelSmall,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 4),
            Text(
              state.venueName,
              style: Theme.of(context).textTheme.titleSmall,
            ),
            Text(
              state.venueAddress,
              style: Theme.of(context).textTheme.bodySmall,
            ),
          ],
        ),
      ),
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
