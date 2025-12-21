import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:mobile/place_management/place_create/place_create_controller.dart';
import 'package:mobile/place_management/place_create/place_create_state.dart';
import 'package:mobile/place_management/place_create/widgets/google_maps_preview.dart';

class PlaceCreatePage extends ConsumerStatefulWidget {
  const PlaceCreatePage({super.key});

  @override
  ConsumerState<PlaceCreatePage> createState() => _PlaceCreatePageState();
}

class _PlaceCreatePageState extends ConsumerState<PlaceCreatePage> {
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
    // 成功時に画面を閉じる
    if (current.status == PlaceCreateStatus.success) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text('イベント会場を登録しました'),
            backgroundColor: Theme.of(context).colorScheme.primary,
          ),
        );
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

    return Scaffold(
      appBar: AppBar(
        title: const Text('イベント会場登録'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // イベント会場名入力
            TextField(
              controller: _nameController,
              decoration: InputDecoration(
                labelText: 'イベント会場名',
                hintText: '例）○○体育館',
                errorText: state.validationErrors['name'],
                filled: true,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
              ),
              onChanged: (value) =>
                  ref.read(placeCreateControllerProvider.notifier).updateName(value),
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
                  .read(placeCreateControllerProvider.notifier)
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

            // 登録ボタン
            FilledButton(
              onPressed: state.canSubmit
                  ? () => ref
                      .read(placeCreateControllerProvider.notifier)
                      .submitPlace()
                  : null,
              child: state.status == PlaceCreateStatus.submitting
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: Colors.white,
                      ),
                    )
                  : const Text('登録'),
            ),
          ],
        ),
      ),
    );
  }
}
