-- 残りの外部キー制約をすべて削除
-- 理由: 本アプリは簡易的なアプリであり、レコード間の厳密な参照整合性よりも、
-- 柔軟にデータの変更ができるメリットを優先するため。
-- 参照整合性が必要な場合はアプリケーション層で担保する。

-- ============================================================
-- user テーブル (自己参照)
-- ============================================================
ALTER TABLE public.user
DROP CONSTRAINT IF EXISTS user_created_user_fkey;

ALTER TABLE public.user
DROP CONSTRAINT IF EXISTS user_updated_user_fkey;

-- ============================================================
-- user_detail テーブル
-- ============================================================
ALTER TABLE public.user_detail
DROP CONSTRAINT IF EXISTS user_detail_user_id_fkey;

ALTER TABLE public.user_detail
DROP CONSTRAINT IF EXISTS user_detail_created_user_fkey;

ALTER TABLE public.user_detail
DROP CONSTRAINT IF EXISTS user_detail_updated_user_fkey;

-- ============================================================
-- invite_token テーブル (issued_by は別ファイルで削除済み)
-- ============================================================
ALTER TABLE public.invite_token
DROP CONSTRAINT IF EXISTS invite_token_created_user_fkey;

ALTER TABLE public.invite_token
DROP CONSTRAINT IF EXISTS invite_token_updated_user_fkey;

