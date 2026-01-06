import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/user_list/user_list_controller.dart';
import 'package:mobile/user_list/user_list_state.dart';
import 'package:mobile/user_list/models/user_list_item.dart';
import 'package:mobile/shared/theme/app_colors.dart';

class UserListPage extends ConsumerWidget {
  const UserListPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(userListControllerProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('メンバー一覧'),
      ),
      body: _buildBody(context, ref, state),
    );
  }

  Widget _buildBody(BuildContext context, WidgetRef ref, UserListState state) {
    if (state.isLoading) {
      return const Center(
        child: CircularProgressIndicator(),
      );
    }

    if (state.hasError) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              state.errorMessage ?? 'エラーが発生しました',
              style: const TextStyle(color: Colors.red),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: () {
                ref.read(userListControllerProvider.notifier).refresh();
              },
              child: const Text('再試行'),
            ),
          ],
        ),
      );
    }

    if (state.users.isEmpty) {
      return const Center(
        child: Text('登録されているメンバーがいません'),
      );
    }

    return RefreshIndicator(
      onRefresh: () async {
        await ref.read(userListControllerProvider.notifier).refresh();
      },
      child: ListView.builder(
        itemCount: state.users.length,
        itemBuilder: (context, index) {
          final user = state.users[index];
          return _UserListTile(user: user);
        },
      ),
    );
  }
}

class _UserListTile extends StatelessWidget {
  const _UserListTile({required this.user});

  final UserListItem user;

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: CircleAvatar(
        backgroundImage:
            user.avatarUrl != null ? NetworkImage(user.avatarUrl!) : null,
        child: user.avatarUrl == null
            ? Text(
                user.displayName.isNotEmpty ? user.displayName[0] : '?',
                style: const TextStyle(fontSize: 20),
              )
            : null,
      ),
      title: Text(user.displayName),
      subtitle: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (user.role != null) ...[
            const SizedBox(height: 4),
            Text(
              'ロール: ${_roleToDisplayName(user.role!)}',
              style: const TextStyle(
                fontSize: 12,
                color: AppColors.disabledText,
              ),
            ),
          ],
          if (user.lastLoginDatetime != null) ...[
            const SizedBox(height: 4),
            Text(
              '最終ログイン: ${_formatDateTime(user.lastLoginDatetime!)}',
              style: const TextStyle(
                fontSize: 12,
                color: AppColors.disabledText,
              ),
            ),
          ],
        ],
      ),
    );
  }

  String _roleToDisplayName(String role) {
    switch (role) {
      case 'admin':
        return '管理者';
      case 'manager':
        return '運営';
      case 'member':
        return 'メンバー';
      default:
        return role;
    }
  }

  String _formatDateTime(DateTime dateTime) {
    return '${dateTime.year}/${dateTime.month}/${dateTime.day}';
  }
}
