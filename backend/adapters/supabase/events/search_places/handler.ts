import { zValidator } from "@hono/zod-validator"
import { executeSearchPlacesUseCase } from "@core/events/usecases/search_places/usecase.ts"
import { createBaseHonoApp } from "@adapters/_shared/base/hono_app_factory.ts"
import { authMiddleware } from "@adapters/_shared/middleware/auth.ts"
import { searchPlacesRequestSchema } from "./schemas.ts"
import { PlaceSearchError } from "@core/events/domain/errors/place_search_error.ts"

export interface SearchPlacesHandlerDeps {
  supabaseUrl: string
  serviceRoleKey: string
  nominatimEndpoint: string
  nominatimUserAgent: string
}

export function createSearchPlacesHandler(deps: SearchPlacesHandlerDeps) {
  // 認証付きの Hono アプリを作成
  const app = createBaseHonoApp(deps, {
    additionalMiddleware: [authMiddleware()],
  })

  // POST /search_places
  app.post(
    "/search_places",
    zValidator("json", searchPlacesRequestSchema),
    async (c) => {
      const body = c.req.valid("json")

      try {
        const results = await executeSearchPlacesUseCase(
          {
            query: body.query,
            limit: body.limit ?? undefined,
            countryCodes: body.countryCodes ?? undefined,
          },
          {
            fetchFn: fetch,
            endpoint: deps.nominatimEndpoint,
            userAgent: deps.nominatimUserAgent,
          },
        )

        return c.json({ success: true, results })
      } catch (error) {
        if (error instanceof PlaceSearchError) {
          return c.json(
            {
              success: false,
              error: {
                code: error.code,
                message: error.message,
              },
            },
            error.status as 400 | 429 | 502,
          )
        }
        throw error
      }
    },
  )

  return app
}
