-- 既存ユーザーのロール変更用SQL
-- 用途: 既存ユーザーの app_metadata.role を更新する
--
-- 使用方法:
-- 1. 特定ユーザーのロールを変更する場合:
--    WHERE id = '<user_id>' の部分を対象ユーザーIDに変更して実行
--
-- 2. 全ユーザーのロールをデフォルト（member）に設定する場合:
--    WHERE 句を削除または条件を変更して実行
--
-- 3. ロールが未設定（null）のユーザーを member に設定する場合:
--    下記の「未設定ユーザーを member に設定」のSQLを使用

-- ============================================
-- パターン1: 特定ユーザーのロールを変更
-- ============================================
-- 例: ユーザーID 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx' を manager に変更
UPDATE auth.users
SET raw_app_meta_data = 
  COALESCE(raw_app_meta_data, '{}'::jsonb) || '{"role": "manager"}'::jsonb
WHERE id = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx';

-- 例: ユーザーID 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx' を member に変更
UPDATE auth.users
SET raw_app_meta_data = 
  COALESCE(raw_app_meta_data, '{}'::jsonb) || '{"role": "member"}'::jsonb
WHERE id = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx';

-- ============================================
-- パターン2: ロールが未設定（null）のユーザーを member に設定
-- ============================================
-- べき等性を保つため、既に role が設定されているユーザーはスキップ
UPDATE auth.users
SET raw_app_meta_data = 
  COALESCE(raw_app_meta_data, '{}'::jsonb) || '{"role": "member"}'::jsonb
WHERE 
  raw_app_meta_data->>'role' IS NULL
  OR raw_app_meta_data->>'role' = '';

-- ============================================
-- パターン3: 全ユーザーを member に設定（既存のロールを上書き）
-- ============================================
-- 注意: このSQLは既存のロールを全て member に上書きします
-- 実行前に必ずバックアップを取得してください
-- UPDATE auth.users
-- SET raw_app_meta_data = 
--   COALESCE(raw_app_meta_data, '{}'::jsonb) || '{"role": "member"}'::jsonb;

-- ============================================
-- 確認用: 現在のロール設定を確認
-- ============================================
-- SELECT 
--   id,
--   email,
--   raw_app_meta_data->>'role' as role,
--   raw_user_meta_data->>'displayName' as display_name
-- FROM auth.users
-- ORDER BY created_at;

