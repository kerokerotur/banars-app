-- onesignal_players: OneSignal Player ID管理
CREATE TABLE public.onesignal_players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  player_id text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  created_user uuid,
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_user uuid,
  UNIQUE (user_id, player_id)
);

-- インデックス: 有効なPlayer ID取得用
CREATE INDEX onesignal_players_user_id_idx ON public.onesignal_players (user_id) WHERE is_active = true;

-- インデックス: 無効なPlayer IDの一括更新用
CREATE INDEX onesignal_players_is_active_idx ON public.onesignal_players (is_active);

-- updated_at自動更新トリガー
CREATE TRIGGER onesignal_players_set_updated_at
  BEFORE UPDATE ON public.onesignal_players
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at_timestamp();

