-- ユーザー一覧取得用のViewテーブルを作成
-- user と user_detail を JOIN した結果を提供する
-- 外部キー制約を設定しない方針のため、supabase-js で JOIN できない問題を解決

CREATE VIEW user_list_view AS
SELECT
  u.id,
  u.line_user_id,
  u.status,
  u.last_login_datetime,
  u.created_at,
  ud.display_name,
  ud.avatar_url
FROM
  "user" u
  INNER JOIN user_detail ud ON u.id = ud.user_id;

-- View に対する RLS ポリシーは不要（元テーブルの RLS が適用される）
-- View の SELECT 権限を authenticated ロールに付与
GRANT SELECT ON user_list_view TO authenticated;
