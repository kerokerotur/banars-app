-- ============================================
-- Seed Data for Local Development
-- ============================================
-- このファイルは `supabase db reset` 時にマイグレーション適用後に実行される。
-- 開発・テストに必要な初期データをここに定義する。
--
-- 注意:
-- - 本番環境には適用されない（ローカル開発専用）
-- - `supabase db push` では実行されない
-- ============================================

-- --------------------------------------------
-- テスト用 Manager ユーザー
-- --------------------------------------------
-- 招待トークン発行など manager 権限が必要な機能のテスト用

-- 1. Supabase Auth ユーザーを作成
INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token
)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'manager@example.com',
  crypt('password123', gen_salt('bf')),
  now(),
  '{"provider": "email", "providers": ["email"], "role": "manager"}'::jsonb,
  '{"displayName": "テスト管理者"}'::jsonb,
  now(),
  now(),
  '',
  ''
)
ON CONFLICT (id) DO NOTHING;

-- 2. public.user テーブルにレコードを作成（auth.users との整合性のため）
INSERT INTO public.user (
  id,
  line_user_id,
  status,
  created_at,
  updated_at
)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'test_line_user_manager_001',
  'active',
  now(),
  now()
)
ON CONFLICT (id) DO NOTHING;

-- --------------------------------------------
-- 追加の初期データはここに記述
-- --------------------------------------------
-- 例: テスト用の一般ユーザー、イベントデータなど

