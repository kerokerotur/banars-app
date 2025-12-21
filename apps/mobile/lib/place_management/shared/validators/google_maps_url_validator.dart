class GoogleMapsUrlValidator {
  const GoogleMapsUrlValidator._();

  static const int maxNameLength = 120;

  /// 場所名のバリデーション
  static String? validateName(String? value) {
    if (value == null || value.trim().isEmpty) {
      return '場所名を入力してください';
    }
    if (value.trim().length > maxNameLength) {
      return '場所名は$maxNameLength文字以内で入力してください';
    }
    return null;
  }

  /// Google Maps URLのバリデーション
  static String? validateGoogleMapsUrl(String? value) {
    if (value == null || value.trim().isEmpty) {
      return 'Google Maps URLを入力してください';
    }

    // URL形式チェック
    final uri = Uri.tryParse(value.trim());
    if (uri == null || !uri.hasScheme || !uri.scheme.startsWith('http')) {
      return '正しいURL形式で入力してください';
    }

    // HTTPS チェック
    if (uri.scheme != 'https') {
      return 'HTTPSで始まるURLを入力してください';
    }

    // Google Maps ドメインチェック
    final host = uri.host.toLowerCase();
    if (!host.contains('maps.app.goo.gl') && !host.contains('google.com')) {
      return 'Google Maps のURLを入力してください';
    }

    // google.comドメインの場合、/maps/パスを含むか確認
    if (host.contains('google.com') && !uri.path.contains('/maps')) {
      return 'Google Maps のURLを入力してください';
    }

    return null;
  }

  /// Google Maps URLが有効かどうかを返す
  static bool isValid(String? value) {
    return validateGoogleMapsUrl(value) == null;
  }
}
