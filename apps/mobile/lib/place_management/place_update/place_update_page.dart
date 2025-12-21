import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:mobile/place_management/models/place.dart';
import 'package:mobile/place_management/place_update/place_update_controller.dart';
import 'package:mobile/place_management/place_update/place_update_state.dart';
import 'package:mobile/place_management/place_create/widgets/google_maps_preview.dart';

class PlaceUpdatePage extends ConsumerStatefulWidget {
  final Place place;

  const PlaceUpdatePage({
    super.key,
    required this.place,
  });

  @override
  ConsumerState<PlaceUpdatePage> createState() => _PlaceUpdatePageState();
}

class _PlaceUpdatePageState extends ConsumerState<PlaceUpdatePage> {
  late final TextEditingController _nameController;
  late final TextEditingController _googleMapsUrlController;
  ProviderSubscription<PlaceUpdateState>? _subscription;

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController(text: widget.place.name);
    _googleMapsUrlController =
        TextEditingController(text: widget.place.googleMapsUrlNormalized);

    _subscription = ref.listenManual(
      placeUpdateControllerProvider((
        widget.place.id,
        widget.place.name,
        widget.place.googleMapsUrlNormalized,
      )),
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

  void _onStateChanged(PlaceUpdateState? previous, PlaceUpdateState current) {
    // 成功時に画面を閉じる
    if (current.status == PlaceUpdateStatus.success) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text('場所を更新しました'),
            backgroundColor: Theme.of(context).colorScheme.primary,
          ),
        );
        Navigator.pop(context, true);
      }
    }

    // エラーメッセージを表示
    if (current.status == PlaceUpdateStatus.error &&
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
    final state = ref.watch(
      placeUpdateControllerProvider((
        widget.place.id,
        widget.place.name,
        widget.place.googleMapsUrlNormalized,
      )),
    );

    return Scaffold(
      appBar: AppBar(
        title: const Text('場所編集'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // 場所名入力
            TextField(
              controller: _nameController,
              decoration: InputDecoration(
                labelText: '場所名',
                hintText: '例）○○体育館',
                errorText: state.validationErrors['name'],
                filled: true,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
              ),
              onChanged: (value) => ref
          .read(placeUpdateControllerProvider((
            widget.place.id,
            widget.place.name,
            widget.place.googleMapsUrlNormalized,
          )).notifier)
          .updateName(value),
            ),
            const SizedBox(height: 16),

            // Google Maps URL入力
            TextField(
              controller: _googleMapsUrlController,
              decoration: InputDecoration(
                labelText: 'Google Maps URL',
                hintText: 'https://maps.app.goo.gl/xxxxx',
                helperText: 'Google Maps で場所を開き、共有→リンクをコピー で取得できます',
                helperMaxLines: 2,
                errorText: state.validationErrors['google_maps_url'],
                filled: true,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
              ),
              keyboardType: TextInputType.url,
              onChanged: (value) => ref
          .read(placeUpdateControllerProvider((
            widget.place.id,
            widget.place.name,
            widget.place.googleMapsUrlNormalized,
          )).notifier)
          .updateGoogleMapsUrl(value),
            ),
            const SizedBox(height: 24),

            // 地図プレビュー
            if (state.showPreview && state.previewUrl != null) ...[
              Text(
                '地図プレビュー',
                style: Theme.of(context).textTheme.titleSmall,
              ),
              const SizedBox(height: 8),
              GoogleMapsPreview(googleMapsUrl: state.previewUrl!),
              const SizedBox(height: 24),
            ],

            // 保存ボタン
            FilledButton(
              onPressed: state.canSubmit
                  ? () => ref
                      .read(placeUpdateControllerProvider((
                        widget.place.id,
                        widget.place.name,
                        widget.place.googleMapsUrlNormalized,
                      )).notifier)
                      .submitPlace()
                  : null,
              child: state.status == PlaceUpdateStatus.submitting
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: Colors.white,
                      ),
                    )
                  : const Text('保存'),
            ),

            if (!state.hasChanges) ...[
              const SizedBox(height: 8),
              Text(
                '変更がありません',
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: Theme.of(context).colorScheme.onSurfaceVariant,
                    ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
