.PHONY: run-dev run-prod bundle-functions deploy-functions

run-dev:
	cd apps/mobile && derry run-dev

run-prod:
	cd apps/mobile && derry run-prod

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