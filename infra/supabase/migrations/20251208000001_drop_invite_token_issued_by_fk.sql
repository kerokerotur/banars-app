-- invite_token.issued_by の外部キー制約を削除
-- 理由: manager ユーザーは auth.users に存在するが、public.user には
-- 必ずしもレコードがないため、外部キー制約が問題となる

-- 制約名は「テーブル名_カラム名_fkey」の形式で自動生成されている
ALTER TABLE public.invite_token
DROP CONSTRAINT IF EXISTS invite_token_issued_by_fkey;

