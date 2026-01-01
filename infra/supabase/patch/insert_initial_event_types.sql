-- event_types 初期データ投入
-- イベント種別マスタに初期値を登録する

-- べき等性を保つため、既存データがある場合はスキップ
INSERT INTO event_types (name, display_order)
SELECT '試合', 1
WHERE NOT EXISTS (SELECT 1 FROM event_types WHERE name = '試合');

INSERT INTO event_types (name, display_order)
SELECT '練習', 2
WHERE NOT EXISTS (SELECT 1 FROM event_types WHERE name = '練習');

INSERT INTO event_types (name, display_order)
SELECT 'その他', 3
WHERE NOT EXISTS (SELECT 1 FROM event_types WHERE name = 'その他');
