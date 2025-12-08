-- 初期ユーザに manager 権限を付与する
-- 初回だけ、手動でSupabase Consoleからユーザ作成し、その作成したユーザに対してこのSQLを実行する想定
-- 手動でSupabase Consoleから作成したユーザは、アプリのUserテーブルには登録しない
UPDATE auth.users
SET raw_app_meta_data = 
  COALESCE(raw_app_meta_data, '{}'::jsonb) || '{"role": "manager"}'::jsonb
WHERE id = '21a60aa4-4719-40e7-8725-fae33361caf5';
