import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/home/home_page.dart';
import 'package:mobile/shared/theme/app_colors.dart';
import 'package:mobile/signup/signup_controller.dart';
import 'package:mobile/signup/signup_state.dart';

class SignupPage extends ConsumerStatefulWidget {
  const SignupPage({super.key});

  @override
  ConsumerState<SignupPage> createState() => _SignupPageState();
}

class _SignupPageState extends ConsumerState<SignupPage> {
  late final TextEditingController _inviteTokenController;
  ProviderSubscription<SignupState>? _signupSubscription;

  @override
  void initState() {
    super.initState();
    _inviteTokenController = TextEditingController();
    _signupSubscription =
        ref.listenManual(signupControllerProvider, _onSignupStateChanged);
  }

  @override
  void dispose() {
    _signupSubscription?.close();
    _inviteTokenController.dispose();
    super.dispose();
  }

  void _onSignupStateChanged(SignupState? previous, SignupState next) {
    if (next.errorMessage != null &&
        next.errorMessage != previous?.errorMessage) {
      _showSnackBar(next.errorMessage!, isError: true);
    }

    final previousStatus = previous?.status;
    if (next.status == SignupStatus.success &&
        previousStatus != SignupStatus.success) {
      _showSnackBar('登録が完了し、セッションを取得しました。');

      // サインアップ成功時、ホームページへ遷移
      if (mounted) {
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(
            builder: (context) => const HomePage(),
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final signupState = ref.watch(signupControllerProvider);
    _syncInviteTokenField(signupState.inviteToken);

    return Scaffold(
      appBar: AppBar(
        title: const Text('新規登録'),
      ),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(24),
          children: [
            Text(
              '招待リンクから登録',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 8),
            const Text(
              '招待リンクを受け取った方は、以下から初回登録を行ってください。',
            ),
            const SizedBox(height: 16),
            Text(
              '招待リンク',
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: 8),
            const Text(
              'banars://invite?token=xxxxx の形式で届くリンクをタップすると自動でトークンを取得します。 '
              'リンクが開けない場合は以下のフィールドに貼り付けてください。',
              style: TextStyle(fontSize: 12),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _inviteTokenController,
              decoration: InputDecoration(
                labelText: '招待トークン',
                hintText: '例) a1b2c3d4',
                suffixIcon: signupState.inviteToken.isEmpty
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
            _SignupStatusPanel(state: signupState),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              height: 48,
              child: ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.lineGreen,
                  foregroundColor: Colors.white,
                  disabledBackgroundColor: AppColors.lineGreen.withValues(alpha: 0.5),
                  disabledForegroundColor: Colors.white.withValues(alpha: 0.7),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                  elevation: 0,
                ),
                icon: signupState.isBusy
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          color: Colors.white,
                        ),
                      )
                    : const Icon(Icons.person_add, size: 20),
                label: const Text(
                  'LINE で登録する',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                onPressed: signupState.canStartSignup && !signupState.isBusy
                    ? () =>
                        ref.read(signupControllerProvider.notifier).startSignup()
                    : null,
              ),
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

class _SignupStatusPanel extends StatelessWidget {
  const _SignupStatusPanel({required this.state});

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
