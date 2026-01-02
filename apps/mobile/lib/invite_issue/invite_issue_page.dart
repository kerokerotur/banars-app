import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import 'package:mobile/invite_issue/invite_issue_controller.dart';
import 'package:mobile/invite_issue/invite_issue_state.dart';
import 'package:mobile/shared/theme/app_colors.dart';

/// 招待リンク発行画面
class InviteIssuePage extends ConsumerWidget {
  const InviteIssuePage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final colorScheme = Theme.of(context).colorScheme;
    final state = ref.watch(inviteIssueControllerProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final textPrimaryColor =
        isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary;
    final textSecondaryColor =
        isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary;

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: Icon(Icons.arrow_back, color: colorScheme.onSurface),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: Text(
          '招待リンク発行',
          style: TextStyle(
            color: colorScheme.onSurface,
            fontWeight: FontWeight.w600,
          ),
        ),
        centerTitle: true,
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // 説明テキスト
              Text(
                '新しいメンバーを招待するためのリンクを発行します。有効期限は7日間です。',
                style: TextStyle(
                  color: textSecondaryColor,
                  fontSize: 14,
                  height: 1.5,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 32),

              // 発行ボタンまたはローディング
              if (state.status == InviteIssueStatus.initial ||
                  state.status == InviteIssueStatus.error)
                ElevatedButton(
                  onPressed: state.isLoading
                      ? null
                      : () {
                          ref
                              .read(inviteIssueControllerProvider.notifier)
                              .issueInviteLink();
                        },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: colorScheme.primary,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    elevation: 2,
                  ),
                  child: const Text(
                    'リンクを発行',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                )
              else if (state.isLoading)
                const Center(
                  child: CircularProgressIndicator(),
                ),

              // エラーメッセージ
              if (state.status == InviteIssueStatus.error &&
                  state.errorMessage != null) ...[
                const SizedBox(height: 16),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.red.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    children: [
                      Icon(Icons.error_outline, color: Colors.red[700]),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          state.errorMessage!,
                          style: TextStyle(
                            color: Colors.red[700],
                            fontSize: 14,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],

              // 結果表示エリア
              if (state.hasInviteLink) ...[
                const SizedBox(height: 24),
                _ResultCard(
                  inviteLink: state.inviteLink!,
                  expiresAt: state.expiresAt!,
                  textPrimaryColor: textPrimaryColor,
                  textSecondaryColor: textSecondaryColor,
                  colorScheme: colorScheme,
                  isDark: isDark,
                  onCopy: () {
                    ref
                        .read(inviteIssueControllerProvider.notifier)
                        .copyToClipboard(context);
                  },
                  onShare: () {
                    ref
                        .read(inviteIssueControllerProvider.notifier)
                        .shareLink();
                  },
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}

/// 発行結果カード
class _ResultCard extends StatelessWidget {
  const _ResultCard({
    required this.inviteLink,
    required this.expiresAt,
    required this.textPrimaryColor,
    required this.textSecondaryColor,
    required this.colorScheme,
    required this.isDark,
    required this.onCopy,
    required this.onShare,
  });

  final String inviteLink;
  final DateTime expiresAt;
  final Color textPrimaryColor;
  final Color textSecondaryColor;
  final ColorScheme colorScheme;
  final bool isDark;
  final VoidCallback onCopy;
  final VoidCallback onShare;

  @override
  Widget build(BuildContext context) {
    final shadowColor = isDark ? AppColors.darkShadow : AppColors.lightShadow;
    final dateFormat = DateFormat('yyyy年M月d日 HH:mm');

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: colorScheme.surface,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: shadowColor.withValues(alpha: 0.08),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // 成功アイコンとタイトル
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: Colors.green.withValues(alpha: 0.1),
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  Icons.check_circle,
                  color: Colors.green[700],
                  size: 24,
                ),
              ),
              const SizedBox(width: 12),
              Text(
                '招待リンクを発行しました',
                style: TextStyle(
                  color: textPrimaryColor,
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),

          // 招待リンク表示
          Text(
            '招待リンク',
            style: TextStyle(
              color: textSecondaryColor,
              fontSize: 12,
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: isDark
                  ? AppColors.darkSurface.withValues(alpha: 0.5)
                  : AppColors.lightSurface.withValues(alpha: 0.5),
              borderRadius: BorderRadius.circular(8),
              border: Border.all(
                color: colorScheme.outline.withValues(alpha: 0.2),
              ),
            ),
            child: SelectableText(
              inviteLink,
              style: TextStyle(
                color: textPrimaryColor,
                fontSize: 13,
                fontFamily: 'monospace',
              ),
            ),
          ),
          const SizedBox(height: 16),

          // 有効期限表示
          Row(
            children: [
              Icon(
                Icons.schedule,
                size: 16,
                color: textSecondaryColor,
              ),
              const SizedBox(width: 6),
              Text(
                '有効期限: ${dateFormat.format(expiresAt)} まで',
                style: TextStyle(
                  color: textSecondaryColor,
                  fontSize: 13,
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),

          // アクションボタン
          Row(
            children: [
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: onCopy,
                  icon: const Icon(Icons.copy, size: 18),
                  label: const Text('コピー'),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: colorScheme.primary,
                    side: BorderSide(color: colorScheme.primary),
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: onShare,
                  icon: const Icon(Icons.share, size: 18),
                  label: const Text('共有'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: colorScheme.primary,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                    elevation: 2,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
