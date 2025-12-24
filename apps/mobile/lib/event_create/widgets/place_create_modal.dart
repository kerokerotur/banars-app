import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:mobile/place_management/place_create/place_create_controller.dart';
import 'package:mobile/place_management/place_create/place_create_state.dart';
import 'package:mobile/place_management/place_create/widgets/google_maps_preview.dart';
import 'package:mobile/place_management/models/place.dart';

class PlaceCreateModal extends ConsumerStatefulWidget {
  const PlaceCreateModal({super.key});

  @override
  ConsumerState<PlaceCreateModal> createState() => _PlaceCreateModalState();
}

class _LookupStatusText extends StatelessWidget {
  const _LookupStatusText({required this.state, required this.theme});

  final PlaceCreateState state;
  final ThemeData theme;

  @override
  Widget build(BuildContext context) {
    final style = theme.textTheme.bodySmall;

    switch (state.lookupStatus) {
      case PlaceLookupStatus.checking:
        return Row(
          children: [
            const SizedBox(
              width: 16,
              height: 16,
              child: CircularProgressIndicator(strokeWidth: 2),
            ),
            const SizedBox(width: 8),
            Text('URLの重複を確認しています…', style: style),
          ],
        );
      case PlaceLookupStatus.duplicate:
        return Text(
          'この Google Maps URL は既に登録されています。既存の会場を選択してください。',
          style: style?.copyWith(color: theme.colorScheme.error),
        );
      case PlaceLookupStatus.available:
        return Text(
          '未登録のURLです。会場名を入力して登録できます。',
          style: style?.copyWith(color: theme.colorScheme.secondary),
        );
      case PlaceLookupStatus.error:
        return Text(
          state.errorMessage ?? '重複チェックに失敗しました',
          style: style?.copyWith(color: theme.colorScheme.error),
        );
      case PlaceLookupStatus.idle:
      default:
        return const SizedBox.shrink();
    }
  }
}

class _ExistingPlaceCard extends StatelessWidget {
  const _ExistingPlaceCard({required this.place, required this.onSelect});

  final Place place;
  final VoidCallback? onSelect;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Card(
      elevation: 0,
      color: theme.colorScheme.surfaceContainerHighest,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              '既存の会場が見つかりました',
              style: theme.textTheme.titleSmall,
            ),
            const SizedBox(height: 8),
            Text(place.name, style: theme.textTheme.titleMedium),
            const SizedBox(height: 4),
            Text(
              place.googleMapsUrlNormalized,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: theme.textTheme.bodySmall,
            ),
            const SizedBox(height: 12),
            FilledButton.icon(
              onPressed: onSelect,
              icon: const Icon(Icons.check_circle_outline),
              label: const Text('この会場を使う'),
            ),
          ],
        ),
      ),
    );
  }
}

class _PlaceCreateModalState extends ConsumerState<PlaceCreateModal> {
  late final TextEditingController _nameController;
  late final TextEditingController _googleMapsUrlController;
  ProviderSubscription<PlaceCreateState>? _subscription;

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController();
    _googleMapsUrlController = TextEditingController();

    _subscription = ref.listenManual(
      placeCreateControllerProvider,
      _onStateChanged,
    );
  }

  @override
  void dispose() {
    _subscription?.close();
    _nameController.dispose();
    _googleMapsUrlController.dispose();
    super.dispose();
  }

  void _onStateChanged(PlaceCreateState? previous, PlaceCreateState current) {
    // 成功時にモーダルを閉じる
    if (current.status == PlaceCreateStatus.success) {
      if (mounted) {
        Navigator.pop(context, true);
      }
    }

    if (current.status == PlaceCreateStatus.existingSelected) {
      if (mounted) {
        Navigator.pop(context, true);
      }
    }

    // エラーメッセージを表示
    if (current.status == PlaceCreateStatus.error &&
        current.errorMessage != null) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(current.errorMessage!),
            backgroundColor: Theme.of(context).colorScheme.error,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(placeCreateControllerProvider);
    final theme = Theme.of(context);
    final existingPlace = state.existingPlace != null
        ? Place.fromJson(state.existingPlace!)
        : null;

    return Dialog(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
      insetPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 24),
      child: Container(
        constraints: BoxConstraints(
          maxWidth: MediaQuery.of(context).size.width - 32,
          maxHeight: MediaQuery.of(context).size.height * 0.9,
        ),
        padding: const EdgeInsets.all(24),
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
            // ヘッダー
            Row(
              children: [
                Icon(
                  Icons.location_on,
                  color: theme.colorScheme.error,
                  size: 28,
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    '新しいイベント会場を追加',
                    style: theme.textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.close),
                  onPressed: () => Navigator.pop(context),
                  padding: EdgeInsets.zero,
                  constraints: const BoxConstraints(),
                ),
              ],
            ),
            const SizedBox(height: 24),

            // 地図URL入力
            Text(
              '地図URL',
              style: theme.textTheme.titleSmall,
            ),
            const SizedBox(height: 8),
            TextField(
              controller: _googleMapsUrlController,
              decoration: InputDecoration(
                hintText: 'https://maps.google.com/...',
                helperText: 'Google Mapsなどの地図URLを入力してください',
                helperMaxLines: 2,
                errorText: state.validationErrors['google_maps_url'],
                filled: true,
                fillColor: theme.colorScheme.surface,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide(
                    color: theme.colorScheme.error,
                    width: 2,
                  ),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide(
                    color: theme.colorScheme.outline,
                    width: 1,
                  ),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide(
                    color: theme.colorScheme.error,
                    width: 2,
                  ),
                ),
                errorBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide(
                    color: theme.colorScheme.error,
                    width: 2,
                  ),
                ),
              ),
              keyboardType: TextInputType.url,
              onChanged: (value) => ref
                  .read(placeCreateControllerProvider.notifier)
                  .updateGoogleMapsUrl(value),
            ),
            const SizedBox(height: 8),
            _LookupStatusText(state: state, theme: theme),
            const SizedBox(height: 16),

            if (state.lookupStatus == PlaceLookupStatus.duplicate &&
                existingPlace != null) ...[
              _ExistingPlaceCard(
                place: existingPlace,
                onSelect: state.canSelectExisting
                    ? () => ref
                        .read(placeCreateControllerProvider.notifier)
                        .selectExistingPlace()
                    : null,
              ),
              const SizedBox(height: 16),
            ],

            // 地図プレビュー（未登録時は会場名入力の前に表示）
            if (state.showPreview && state.previewUrl != null) ...[
              Text(
                '地図プレビュー',
                style: theme.textTheme.titleSmall,
              ),
              const SizedBox(height: 8),
              GoogleMapsPreview(
                googleMapsUrl: state.previewUrl!,
                height: 400,
              ),
              const SizedBox(height: 16),
            ],

            if (state.lookupStatus == PlaceLookupStatus.available) ...[
              // イベント会場名入力（未登録時のみ）
              Text(
                'イベント会場名',
                style: theme.textTheme.titleSmall,
              ),
              const SizedBox(height: 8),
              TextField(
                controller: _nameController,
                decoration: InputDecoration(
                  hintText: '例）東京ドーム',
                  helperText: '地図を確認しながら会場名を入力してください',
                  errorText: state.validationErrors['name'],
                  filled: true,
                  fillColor: theme.colorScheme.surface,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide(
                      color: theme.colorScheme.error,
                      width: 2,
                    ),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide(
                      color: theme.colorScheme.outline,
                      width: 1,
                    ),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide(
                      color: theme.colorScheme.error,
                      width: 2,
                    ),
                  ),
                  errorBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide(
                      color: theme.colorScheme.error,
                      width: 2,
                    ),
                  ),
                ),
                onChanged: (value) => ref
                    .read(placeCreateControllerProvider.notifier)
                    .updateName(value),
              ),
              const SizedBox(height: 16),
            ],

            // ボタン
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                // キャンセルボタン
                TextButton(
                  onPressed: () => Navigator.pop(context),
                  style: TextButton.styleFrom(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 24,
                      vertical: 12,
                    ),
                  ),
                  child: const Text('キャンセル'),
                ),
                const SizedBox(width: 12),
                // 追加ボタン
                FilledButton(
                  onPressed: state.canSubmit &&
                          state.status != PlaceCreateStatus.submitting
                      ? () => ref
                          .read(placeCreateControllerProvider.notifier)
                          .submitPlace()
                      : null,
                  style: FilledButton.styleFrom(
                    backgroundColor: theme.colorScheme.error,
                    padding: const EdgeInsets.symmetric(
                      horizontal: 32,
                      vertical: 12,
                    ),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(24),
                    ),
                  ),
                  child: state.status == PlaceCreateStatus.submitting
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: Colors.white,
                          ),
                        )
                      : const Text('追加'),
                ),
              ],
            ),
            ],
          ),
        ),
      ),
    );
  }
}
