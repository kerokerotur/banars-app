import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:mobile/place_management/place_create/place_create_controller.dart';
import 'package:mobile/place_management/place_create/place_create_state.dart';

class PlaceCreateModal extends ConsumerStatefulWidget {
  const PlaceCreateModal({super.key});

  @override
  ConsumerState<PlaceCreateModal> createState() => _PlaceCreateModalState();
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

    return Dialog(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
      child: Container(
        constraints: const BoxConstraints(maxWidth: 600),
        padding: const EdgeInsets.all(24),
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

            // イベント会場名入力
            Text(
              'イベント会場名',
              style: theme.textTheme.titleSmall,
            ),
            const SizedBox(height: 8),
            TextField(
              controller: _nameController,
              decoration: InputDecoration(
                hintText: '例）東京ドーム',
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
              onChanged: (value) =>
                  ref.read(placeCreateControllerProvider.notifier).updateName(value),
            ),
            const SizedBox(height: 16),

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
            const SizedBox(height: 24),

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
    );
  }
}
