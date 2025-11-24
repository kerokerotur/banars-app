import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:mobile/main.dart';

void main() {
  testWidgets('初回登録画面の基本要素が描画される', (tester) async {
    await tester.pumpWidget(const ProviderScope(child: BanarsApp()));

    expect(find.text('初回登録'), findsOneWidget);
    expect(find.textContaining('招待トークン'), findsOneWidget);
    expect(find.widgetWithIcon(FilledButton, Icons.login), findsOneWidget);
  });
}
