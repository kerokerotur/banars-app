import 'package:flutter/foundation.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

/// Supabase Edge Function呼び出しの共通サービス
///
/// API呼び出しとログ出力を統一的に処理します。
/// 開発環境（kDebugMode）でのみ、リクエスト・レスポンス・レスポンスタイムをログ出力します。
class SupabaseFunctionService {
  const SupabaseFunctionService._();

  /// Supabase Edge Functionを呼び出し、リクエスト・レスポンス情報をログ出力
  ///
  /// [client] SupabaseClientインスタンス
  /// [functionName] 呼び出すEdge Function名
  /// [method] HTTPメソッド（デフォルト: POST）
  /// [body] リクエストボディ
  /// [queryParameters] クエリパラメータ
  ///
  /// 開発環境（kDebugMode）でのみログ出力を行います。
  /// リクエストパラメータ、レスポンスデータ、レスポンスタイムを記録します。
  ///
  /// 例:
  /// ```dart
  /// final response = await SupabaseFunctionService.invoke(
  ///   client: _supabaseClient,
  ///   functionName: AppEnv.userListFunctionName,
  ///   method: HttpMethod.get,
  /// );
  /// ```
  static Future<FunctionResponse> invoke({
    required SupabaseClient client,
    required String functionName,
    HttpMethod method = HttpMethod.post,
    Map<String, dynamic>? body,
    Map<String, String>? queryParameters,
  }) async {
    final startTime = DateTime.now();

    try {
      final response = await client.functions.invoke(
        functionName,
        method: method,
        body: body,
        queryParameters: queryParameters,
      );

      final duration = DateTime.now().difference(startTime).inMilliseconds;

      if (kDebugMode) {
        _logApiCall(
          functionName: functionName,
          method: method,
          queryParameters: queryParameters,
          body: body,
          duration: duration,
          response: response.data,
          isError: false,
        );
      }

      return response;
    } catch (error) {
      final duration = DateTime.now().difference(startTime).inMilliseconds;

      if (kDebugMode) {
        _logApiCall(
          functionName: functionName,
          method: method,
          queryParameters: queryParameters,
          body: body,
          duration: duration,
          error: error,
          isError: true,
        );
      }

      rethrow;
    }
  }

  /// API呼び出しのログを整形して出力
  static void _logApiCall({
    required String functionName,
    required HttpMethod method,
    Map<String, String>? queryParameters,
    Map<String, dynamic>? body,
    required int duration,
    dynamic response,
    dynamic error,
    required bool isError,
  }) {
    final buffer = StringBuffer();

    // ヘッダー部分
    buffer.writeln('');
    buffer.writeln(
        '╔═══════════════════════════════════════════════════════════════');
    buffer.writeln('║ 🚀 Supabase Function Call');
    buffer.writeln(
        '╠═══════════════════════════════════════════════════════════════');

    // リクエスト情報
    buffer.writeln('║ Function: $functionName');
    buffer.writeln('║ Method:   ${method.name.toUpperCase()}');
    buffer.writeln('║ Duration: ${duration}ms');

    // クエリパラメータ
    if (queryParameters != null && queryParameters.isNotEmpty) {
      buffer.writeln('║');
      buffer.writeln('║ 📝 Query Parameters:');
      queryParameters.forEach((key, value) {
        buffer.writeln('║   • $key: $value');
      });
    }

    // リクエストボディ
    if (body != null && body.isNotEmpty) {
      buffer.writeln('║');
      buffer.writeln('║ 📤 Request Body:');
      final bodyStr = body.toString();
      if (bodyStr.length > 200) {
        buffer.writeln('║   ${bodyStr.substring(0, 200)}...');
      } else {
        buffer.writeln('║   $bodyStr');
      }
    }

    // レスポンス or エラー
    buffer.writeln('║');
    if (isError) {
      buffer.writeln('║ ❌ Error:');
      final errorStr = error.toString();
      final errorLines = errorStr.split('\n');
      for (final line in errorLines.take(5)) {
        buffer.writeln('║   $line');
      }
      if (errorLines.length > 5) {
        buffer.writeln('║   ... (${errorLines.length - 5} more lines)');
      }
    } else {
      buffer.writeln('║ ✅ Response:');
      final responseStr = response.toString();
      buffer.writeln('║   $responseStr');
    }

    // フッター
    buffer.writeln(
        '╚═══════════════════════════════════════════════════════════════');

    debugPrint(buffer.toString());
  }
}
