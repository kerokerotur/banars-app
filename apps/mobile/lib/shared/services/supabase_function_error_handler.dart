/// Supabase Function呼び出しのエラーハンドリング共通ヘルパー
///
/// FunctionExceptionのdetailsから、エラーメッセージ、エラーコード、
/// その他のフィールドを抽出する共通ユーティリティを提供します。
class SupabaseFunctionErrorHandler {
  const SupabaseFunctionErrorHandler._();

  /// FunctionExceptionのdetailsからエラーメッセージを抽出
  ///
  /// 以下の順序でメッセージを探索します:
  /// 1. details['message'] (String)
  /// 2. details['error']['message'] (String)
  /// 3. details.toString()
  ///
  /// 例:
  /// ```dart
  /// on FunctionException catch (error) {
  ///   final message = SupabaseFunctionErrorHandler.extractErrorMessage(error.details);
  ///   // ...
  /// }
  /// ```
  static String? extractErrorMessage(dynamic details) {
    if (details == null) return null;
    if (details is String) return details;
    if (details is Map<String, dynamic>) {
      // トップレベルのmessage
      final message = details['message'];
      if (message is String) return message;

      // ネストされたerror.message
      final error = details['error'];
      if (error is Map<String, dynamic>) {
        final errorMessage = error['message'];
        if (errorMessage is String) return errorMessage;
      }
    }
    return details.toString();
  }

  /// FunctionExceptionのdetailsからエラーコードを抽出
  ///
  /// 以下の順序でコードを探索します:
  /// 1. details['code'] (String)
  /// 2. details['error']['code'] (String)
  /// 3. details (String) - details自体が文字列の場合
  ///
  /// 例:
  /// ```dart
  /// on FunctionException catch (error) {
  ///   final code = SupabaseFunctionErrorHandler.extractErrorCode(error.details);
  ///   if (code == 'user_not_found') {
  ///     // ...
  ///   }
  /// }
  /// ```
  static String? extractErrorCode(dynamic details) {
    if (details is Map<String, dynamic>) {
      // トップレベルのcode
      final code = details['code'];
      if (code is String) return code;

      // ネストされたerror.code
      final error = details['error'];
      if (error is Map<String, dynamic>) {
        final errorCode = error['code'];
        if (errorCode is String) return errorCode;
      }
    }
    if (details is String) return details;
    return null;
  }

  /// FunctionExceptionのdetailsから任意のフィールドを抽出（汎用ヘルパー）
  ///
  /// エラーレスポンスに含まれる追加情報（existing_placeなど）を抽出する際に使用します。
  ///
  /// 以下の順序でフィールドを探索します:
  /// 1. details[fieldName] (T型)
  /// 2. details['error'][fieldName] (T型)
  ///
  /// 例:
  /// ```dart
  /// on FunctionException catch (error) {
  ///   final existingPlace = SupabaseFunctionErrorHandler.extractField<Map<String, dynamic>>(
  ///     error.details,
  ///     'existing_place',
  ///   );
  ///   // ...
  /// }
  /// ```
  static T? extractField<T>(dynamic details, String fieldName) {
    if (details is Map<String, dynamic>) {
      // トップレベルのフィールド
      final field = details[fieldName];
      if (field is T) return field;

      // ネストされたerror[fieldName]
      final error = details['error'];
      if (error is Map<String, dynamic>) {
        final errorField = error[fieldName];
        if (errorField is T) return errorField;
      }
    }
    return null;
  }
}
