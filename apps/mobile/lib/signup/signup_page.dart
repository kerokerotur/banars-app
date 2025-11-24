import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/signup/signup_controller.dart';
import 'package:mobile/signup/signup_state.dart';

class SignupPage extends ConsumerStatefulWidget {
  const SignupPage({super.key});

  @override
  ConsumerState<SignupPage> createState() => _SignupPageState();
}

class _SignupPageState extends ConsumerState<SignupPage> {
  late final TextEditingController _inviteTokenController;
  ProviderSubscription<SignupState>? _subscription;

  @override
  void initState() {
    super.initState();
    _inviteTokenController = TextEditingController();
    _subscription = ref.listenManual(signupControllerProvider, _onStateChanged);
  }

  @override
  void dispose() {
    _subscription?.close();
    _inviteTokenController.dispose();
    super.dispose();
  }

  void _onStateChanged(SignupState? previous, SignupState next) {
    if (next.errorMessage != null &&
        next.errorMessage != previous?.errorMessage) {
      _showSnackBar(next.errorMessage!, isError: true);
    }

    final previousStatus = previous?.status;
    if (next.status == SignupStatus.success &&
        previousStatus != SignupStatus.success) {
      _showSnackBar('登録が完了し、セッションを取得しました。');
    }
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(signupControllerProvider);
    _syncInviteTokenField(state.inviteToken);

    return Scaffold(
      appBar: AppBar(
        title: const Text('初回登録'),
      ),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(24),
          children: [
            Text(
              '招待リンク',
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: 8),
            const Text(
              'banars://invite?token=xxxxx の形式で届くリンクをタップすると自動でトークンを取得します。 '
              'リンクが開けない場合は以下のフィールドに貼り付けてください。',
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _inviteTokenController,
              decoration: InputDecoration(
                labelText: '招待トークン',
                hintText: '例) a1b2c3d4',
                suffixIcon: state.inviteToken.isEmpty
                    ? null
                    : IconButton(
                        icon: const Icon(Icons.clear),
                        onPressed: () => ref
                            .read(signupControllerProvider.notifier)
                            .updateInviteToken(''),
                      ),
              ),
              onChanged: (value) => ref
                  .read(signupControllerProvider.notifier)
                  .updateInviteToken(value),
            ),
            const SizedBox(height: 24),
            _StatusPanel(state: state),
            const SizedBox(height: 24),
            FilledButton.icon(
              icon: state.isBusy
                  ? const SizedBox(
                      width: 16,
                      height: 16,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Icon(Icons.login),
              label: const Text('LINE で登録する'),
              onPressed: state.canStartSignup && !state.isBusy
                  ? () =>
                      ref.read(signupControllerProvider.notifier).startSignup()
                  : null,
            ),
            const SizedBox(height: 16),
            Text(
              'LINE ログイン後に Edge Function `initial_signup` を呼び出し、Supabase のセッションを取得します。 '
              '通信環境を安定させた上で実行してください。',
              style: Theme.of(context).textTheme.bodySmall,
            ),
          ],
        ),
      ),
    );
  }

  void _syncInviteTokenField(String value) {
    if (_inviteTokenController.text == value) {
      return;
    }
    _inviteTokenController.value = TextEditingValue(
      text: value,
      selection: TextSelection.collapsed(offset: value.length),
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

class _StatusPanel extends StatelessWidget {
  const _StatusPanel({required this.state});

  final SignupState state;

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    final isSuccess = state.status == SignupStatus.success;
    final isError = state.status == SignupStatus.error;

    return Card(
      elevation: 0,
      color: isSuccess
          ? colorScheme.primaryContainer
          : isError
              ? colorScheme.errorContainer
              : null,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              '現在の状態',
              style: Theme.of(context).textTheme.titleSmall,
            ),
            const SizedBox(height: 8),
            Text(
              state.statusLabel(),
              style: Theme.of(context)
                  .textTheme
                  .titleMedium
                  ?.copyWith(fontWeight: FontWeight.bold),
            ),
            if (state.errorMessage != null) ...[
              const SizedBox(height: 12),
              Text(
                state.errorMessage!,
                style: Theme.of(context).textTheme.bodyMedium,
              )
            ],
          ],
        ),
      ),
    );
  }
}
