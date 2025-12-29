import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import 'package:mobile/event_create/event_create_page.dart';
import 'package:mobile/event_list/event_list_page.dart';
import 'package:mobile/home/home_controller.dart';
import 'package:mobile/home/home_state.dart';
import 'package:mobile/settings/settings_page.dart';
import 'package:mobile/user_list/user_list_page.dart';
import 'package:mobile/user_profile/user_profile_page.dart';
import 'package:mobile/shared/providers/event_types_provider.dart';
import 'package:mobile/shared/providers/users_provider.dart';
import 'package:mobile/shared/widgets/app_scaffold.dart';
import 'package:mobile/shared/widgets/app_footer.dart';
import 'package:mobile/shared/widgets/app_header.dart';

class HomePage extends ConsumerStatefulWidget {
  const HomePage({super.key});

  @override
  ConsumerState<HomePage> createState() => _HomePageState();
}

class _HomePageState extends ConsumerState<HomePage> {
  NavigationTab _currentTab = NavigationTab.home;

  @override
  Widget build(BuildContext context) {
    final homeState = ref.watch(homeControllerProvider);
    // アプリ起動時にグローバルキャッシュを初期化
    ref.watch(eventTypesProvider);
    ref.watch(usersProvider);

    return AppScaffold(
      currentTab: _currentTab,
      onTabChanged: (tab) {
        setState(() {
          _currentTab = tab;
        });
      },
      avatarUrl: homeState.userProfile?.avatarUrl,
      onAvatarTap: () => _openUserProfile(context),
      onMenuItemSelected: (item) => _handleMenuItemSelected(context, item),
      onAddPressed: () {
        Navigator.of(context).push(
          MaterialPageRoute(
            builder: (context) => const EventCreatePage(),
          ),
        );
      },
      body: _buildBody(context, homeState),
    );
  }

  void _handleMenuItemSelected(BuildContext context, HeaderMenuItem item) {
    switch (item) {
      case HeaderMenuItem.userList:
        Navigator.of(context).push(
          MaterialPageRoute(
            builder: (context) => const UserListPage(),
          ),
        );
        break;
      case HeaderMenuItem.settings:
        Navigator.of(context).push(
          MaterialPageRoute(
            builder: (context) => const SettingsPage(),
          ),
        );
        break;
      case HeaderMenuItem.logout:
        _signOut(context);
        break;
    }
  }

  void _openUserProfile(BuildContext context) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) => const UserProfilePage(),
      ),
    );
  }

  Widget _buildBody(BuildContext context, HomeState homeState) {
    // イベント一覧を表示
    return const EventListPage();
  }

  Future<void> _signOut(BuildContext context) async {
    final shouldSignOut = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('ログアウト'),
        content: const Text('ログアウトしますか？'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: const Text('キャンセル'),
          ),
          FilledButton(
            onPressed: () => Navigator.of(context).pop(true),
            child: const Text('ログアウト'),
          ),
        ],
      ),
    );

    if (shouldSignOut == true) {
      await Supabase.instance.client.auth.signOut();
    }
  }
}
