import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:share_plus/share_plus.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import 'package:mobile/config/app_env.dart';
import 'package:mobile/invite_issue/invite_issue_state.dart';
import 'package:mobile/shared/services/supabase_function_service.dart';
import 'package:mobile/shared/services/supabase_function_error_handler.dart';

final inviteIssueControllerProvider =
    NotifierProvider<InviteIssueController, InviteIssueState>(
  InviteIssueController.new,
);

class InviteIssueController extends Notifier<InviteIssueState> {
  late final SupabaseClient _supabaseClient;

  @override
  InviteIssueState build() {
    _supabaseClient = Supabase.instance.client;
    return InviteIssueState.initial();
  }

  // ========== Issue Invite Link ==========

  Future<void> issueInviteLink() async {
    state = state.copyWith(
      status: InviteIssueStatus.loading,
      clearError: true,
    );

    try {
      final response = await SupabaseFunctionService.invoke(
        client: _supabaseClient,
        functionName: AppEnv.inviteIssueFunctionName,
        body: {
          // expirationDays は省略してデフォルト7日を使用
        },
      );

      final data = response.data;
      if (data is! Map<String, dynamic>) {
        throw const InviteIssueException('招待リンクの発行に失敗しました');
      }

      final token = data['token'] as String?;
      final expiresAtString = data['expiresAt'] as String?;

      if (token == null || expiresAtString == null) {
        throw const InviteIssueException('招待リンクの発行に失敗しました');
      }

      final expiresAt = DateTime.parse(expiresAtString);
      final inviteLink =
          '${AppEnv.inviteLinkBaseUrl}/invite?token=$token';

      state = state.copyWith(
        status: InviteIssueStatus.success,
        inviteLink: inviteLink,
        expiresAt: expiresAt,
        clearError: true,
      );
    } on FunctionException catch (error) {
      state = state.copyWith(
        status: InviteIssueStatus.error,
        errorMessage:
            SupabaseFunctionErrorHandler.extractErrorMessage(error.details) ??
                error.reasonPhrase ??
                '招待リンクの発行に失敗しました',
      );
    } catch (error) {
      state = state.copyWith(
        status: InviteIssueStatus.error,
        errorMessage: '招待リンクの発行に失敗しました: $error',
      );
    }
  }

  // ========== Copy to Clipboard ==========

  Future<void> copyToClipboard(BuildContext context) async {
    if (state.inviteLink == null) {
      return;
    }

    try {
      await Clipboard.setData(ClipboardData(text: state.inviteLink!));

      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('招待リンクをコピーしました'),
            duration: Duration(seconds: 2),
          ),
        );
      }
    } catch (error) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('コピーに失敗しました'),
            duration: Duration(seconds: 2),
          ),
        );
      }
    }
  }

  // ========== Share Link ==========

  Future<void> shareLink() async {
    if (state.inviteLink == null) {
      return;
    }

    try {
      await Share.share(
        state.inviteLink!,
        subject: 'banars 招待リンク',
      );
    } catch (error) {
      // Share操作のキャンセルやエラーは無視
    }
  }
}

class InviteIssueException implements Exception {
  const InviteIssueException(this.message);
  final String message;
}
