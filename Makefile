.PHONY: run-dev run-prod run-web install-deps install-deps-web install-deps-backend install-deps-mobile bundle-functions deploy-functions

run-dev:
	cd apps/mobile && derry run-dev

run-prod:
	cd apps/mobile && derry run-prod

run-web:
	cd apps/web && npm run dev

# 依存関係のインストール
# 使い方:
#   make install-deps              # web / backend / mobile の依存をすべてインストール
#   make install-deps-web          # web のみ
#   make install-deps-backend      # backend のみ
#   make install-deps-mobile       # mobile のみ
install-deps: install-deps-web install-deps-backend install-deps-mobile

install-deps-web:
	cd apps/web && npm install

install-deps-backend:
	cd backend && npm install

install-deps-mobile:
	cd apps/mobile && fvm dart run derry setup

# Edge Functions をバンドル（backend/ 配下のコードを含めてバンドル + config.toml 自動更新）
# 使い方:
#   make bundle-functions              # 全関数をバンドル
#   make bundle-functions FUNCTION=xxx # 指定した関数のみバンドル
bundle-functions:
ifdef FUNCTION
	cd backend && npm run bundle-functions -- $(FUNCTION)
else
	cd backend && npm run bundle-functions
endif

# Edge Functions をバンドルしてデプロイ
# 使い方:
#   make deploy-functions              # 全関数をデプロイ
#   make deploy-functions FUNCTION=xxx # 指定した関数のみデプロイ
deploy-functions:
ifdef FUNCTION
	$(MAKE) bundle-functions FUNCTION=$(FUNCTION)
	cd infra/supabase && supabase functions deploy $(FUNCTION)
else
	$(MAKE) bundle-functions
	cd infra/supabase && supabase functions deploy --use-api
endif

migrate-dev:
	cd infra/supabase && supabase db push