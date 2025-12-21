import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:mobile/place_management/place_list/place_list_controller.dart';
import 'package:mobile/place_management/place_list/place_list_state.dart';
import 'package:mobile/place_management/place_create/place_create_page.dart';
import 'package:mobile/place_management/place_update/place_update_page.dart';
import 'package:mobile/place_management/models/place.dart';

class PlaceListPage extends ConsumerStatefulWidget {
  const PlaceListPage({super.key});

  @override
  ConsumerState<PlaceListPage> createState() => _PlaceListPageState();
}

class _PlaceListPageState extends ConsumerState<PlaceListPage> {
  ProviderSubscription<PlaceListState>? _subscription;

  @override
  void initState() {
    super.initState();
    _subscription = ref.listenManual(
      placeListControllerProvider,
      _onStateChanged,
    );
  }

  @override
  void dispose() {
    _subscription?.close();
    super.dispose();
  }

  void _onStateChanged(PlaceListState? previous, PlaceListState current) {
    // エラーメッセージを表示
    if (current.status == PlaceListStatus.error &&
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
    final state = ref.watch(placeListControllerProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('場所管理'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: () => _navigateToCreate(context),
            tooltip: '新規登録',
          ),
        ],
      ),
      body: _buildBody(state),
    );
  }

  Widget _buildBody(PlaceListState state) {
    if (state.isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (state.places.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.place_outlined,
              size: 64,
              color: Theme.of(context).colorScheme.outline,
            ),
            const SizedBox(height: 16),
            Text(
              '登録された場所がありません',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    color: Theme.of(context).colorScheme.onSurfaceVariant,
                  ),
            ),
            const SizedBox(height: 8),
            Text(
              '右上の + ボタンから場所を登録してください',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: Theme.of(context).colorScheme.onSurfaceVariant,
                  ),
            ),
          ],
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: () =>
          ref.read(placeListControllerProvider.notifier).loadPlaces(),
      child: ListView.separated(
        itemCount: state.places.length,
        separatorBuilder: (_, __) => const Divider(height: 1),
        itemBuilder: (context, index) {
          final place = state.places[index];
          final isDeleting =
              state.isDeleting && state.deletingPlaceId == place.id;

          return ListTile(
            leading: Icon(
              Icons.place,
              color: Theme.of(context).colorScheme.primary,
            ),
            title: Text(place.name),
            subtitle: Text(
              place.googleMapsUrlNormalized,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: Theme.of(context).colorScheme.onSurfaceVariant,
                  ),
            ),
            trailing: isDeleting
                ? const SizedBox(
                    width: 24,
                    height: 24,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                : Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      IconButton(
                        icon: const Icon(Icons.edit_outlined),
                        onPressed: () => _navigateToUpdate(context, place),
                        tooltip: '編集',
                      ),
                      IconButton(
                        icon: const Icon(Icons.delete_outline),
                        onPressed: () => _showDeleteConfirmDialog(place),
                        tooltip: '削除',
                      ),
                    ],
                  ),
          );
        },
      ),
    );
  }

  Future<void> _navigateToCreate(BuildContext context) async {
    final result = await Navigator.push<bool>(
      context,
      MaterialPageRoute(
        builder: (context) => const PlaceCreatePage(),
      ),
    );

    // 登録成功時にリロード
    if (result == true && mounted) {
      ref.read(placeListControllerProvider.notifier).loadPlaces();
    }
  }

  Future<void> _navigateToUpdate(BuildContext context, Place place) async {
    final result = await Navigator.push<bool>(
      context,
      MaterialPageRoute(
        builder: (context) => PlaceUpdatePage(place: place),
      ),
    );

    // 更新成功時にリロード
    if (result == true && mounted) {
      ref.read(placeListControllerProvider.notifier).loadPlaces();
    }
  }

  Future<void> _showDeleteConfirmDialog(Place place) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('場所を削除'),
        content: Text(
          '「${place.name}」を削除しますか?\n\n'
          '※この場所を使用しているイベントがある場合は削除できません。',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('キャンセル'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(context, true),
            style: FilledButton.styleFrom(
              backgroundColor: Theme.of(context).colorScheme.error,
            ),
            child: const Text('削除'),
          ),
        ],
      ),
    );

    if (confirmed == true && mounted) {
      await ref.read(placeListControllerProvider.notifier).deletePlace(place.id);
    }
  }
}
