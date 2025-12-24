/// Google Maps URLをWebView埋め込み形式に変換するユーティリティ
class GoogleMapsUrlConverter {
  const GoogleMapsUrlConverter._();

  /// Google Maps URLをiframe埋め込み用のHTMLに変換
  ///
  /// 入力例:
  /// - https://maps.app.goo.gl/xxxxx (短縮URL)
  /// - https://www.google.com/maps/place/... (通常URL)
  /// - https://maps.google.com/?q=... (座標URL)
  ///
  /// 出力:
  /// - Google Mapsを表示するHTML文字列
  static String toEmbedHtml(String googleMapsUrl) {
    final uri = Uri.parse(googleMapsUrl);

    // 短縮URL (maps.app.goo.gl) の場合は、リダイレクトを許可する
    // WebViewでリダイレクト先を取得してから再度埋め込みHTMLを生成する必要がある
    if (uri.host.contains('maps.app.goo.gl')) {
      // 短縮URLの場合は、JavaScriptでリダイレクト先を取得
      return '''
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <style>
    * {
      margin: 0;
      padding: 0;
    }
    html, body {
      height: 100%;
      width: 100%;
      overflow: hidden;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: #f5f5f5;
    }
    .loading {
      text-align: center;
      color: #666;
    }
    iframe {
      display: none;
      border: 0;
      height: 100%;
      width: 100%;
    }
    iframe.loaded {
      display: block;
    }
  </style>
</head>
<body>
  <div class="loading" id="loading">地図を読み込んでいます...</div>
  <iframe id="map" src="$googleMapsUrl" allowfullscreen loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
  <script>
    // iframeの読み込み完了を待つ
    document.getElementById('map').addEventListener('load', function() {
      document.getElementById('loading').style.display = 'none';
      document.getElementById('map').classList.add('loaded');
    });

    // タイムアウト設定（10秒）
    setTimeout(function() {
      if (!document.getElementById('map').classList.contains('loaded')) {
        document.getElementById('map').classList.add('loaded');
        document.getElementById('loading').style.display = 'none';
      }
    }, 10000);
  </script>
</body>
</html>
''';
    }

    // 通常のGoogle Maps URLの場合
    return '''
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <style>
    * {
      margin: 0;
      padding: 0;
    }
    html, body {
      height: 100%;
      width: 100%;
      overflow: hidden;
    }
    iframe {
      border: 0;
      height: 100%;
      width: 100%;
    }
  </style>
</head>
<body>
  <iframe src="$googleMapsUrl" allowfullscreen loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
</body>
</html>
''';
  }

  /// Google Maps URLを埋め込み形式に変換
  ///
  /// 入力例:
  /// - https://maps.app.goo.gl/xxxxx
  /// - https://www.google.com/maps/place/...
  /// - https://maps.google.com/?q=...
  ///
  /// 出力:
  /// - URLに&output=embedまたは?output=embedを追加した形式
  static String toEmbedUrl(String googleMapsUrl) {
    final uri = Uri.parse(googleMapsUrl);

    // 既にembedパラメータがある場合はそのまま返す
    if (uri.queryParameters.containsKey('output') &&
        uri.queryParameters['output'] == 'embed') {
      return googleMapsUrl;
    }

    // 短縮URL (maps.app.goo.gl) の場合
    if (uri.host.contains('maps.app.goo.gl')) {
      // 短縮URLはリダイレクトされるため、そのまま使用
      // ただし、クエリパラメータにoutput=embedを追加
      return '$googleMapsUrl${googleMapsUrl.contains('?') ? '&' : '?'}output=embed';
    }

    // 通常のGoogle Maps URL
    if (uri.host.contains('google.com')) {
      // /maps/embed/ パスの場合はそのまま
      if (uri.path.contains('/maps/embed/')) {
        return googleMapsUrl;
      }

      // URLにoutput=embedパラメータを追加
      final separator = uri.query.isEmpty ? '?' : '&';
      return '$googleMapsUrl${separator}output=embed';
    }

    // その他の場合はそのまま返す
    return googleMapsUrl;
  }

  /// URLから座標を抽出（可能な場合）
  ///
  /// 戻り値: {lat: 緯度, lng: 経度} または null
  static Map<String, double>? extractCoordinates(String googleMapsUrl) {
    final uri = Uri.parse(googleMapsUrl);

    // クエリパラメータから座標を抽出
    final qParam = uri.queryParameters['q'];
    if (qParam != null) {
      final coords = _parseCoordinates(qParam);
      if (coords != null) return coords;
    }

    // パスから座標を抽出 (例: /@35.6812,139.7671,15z)
    final pathMatch = RegExp(r'@(-?\d+\.?\d*),(-?\d+\.?\d*)').firstMatch(uri.path);
    if (pathMatch != null) {
      final lat = double.tryParse(pathMatch.group(1)!);
      final lng = double.tryParse(pathMatch.group(2)!);
      if (lat != null && lng != null) {
        return {'lat': lat, 'lng': lng};
      }
    }

    return null;
  }

  static Map<String, double>? _parseCoordinates(String value) {
    // "lat,lng" 形式
    final parts = value.split(',');
    if (parts.length == 2) {
      final lat = double.tryParse(parts[0].trim());
      final lng = double.tryParse(parts[1].trim());
      if (lat != null && lng != null) {
        return {'lat': lat, 'lng': lng};
      }
    }
    return null;
  }
}
