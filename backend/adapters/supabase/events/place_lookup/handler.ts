import { zValidator } from "@hono/zod-validator"
import { executePlaceLookupUseCase } from "@core/events/usecases/place_lookup/usecase.ts"
import { PlaceManagementError } from "@core/events/domain/errors/place_management_error.ts"
import { createBaseHonoApp } from "@adapters/_shared/base/hono_app_factory.ts"
import { authMiddleware } from "@adapters/_shared/middleware/auth.ts"
import { EventRepositoryFactory } from "../_shared/repository_factory.ts"
import { placeLookupRequestSchema } from "./schemas.ts"

export interface PlaceLookupHandlerDeps {
  supabaseUrl: string
  serviceRoleKey: string
}

export function createPlaceLookupHandler(deps: PlaceLookupHandlerDeps) {
  const app = createBaseHonoApp(deps, {
    additionalMiddleware: [authMiddleware()],
  })

  app.get(
    "/place_lookup",
    zValidator("query", placeLookupRequestSchema),
    async (c) => {
      const query = c.req.valid("query")
      const supabaseClient = c.get("supabaseClient")

      const factory = new EventRepositoryFactory(supabaseClient)
      const repositories = {
        placeManagementRepository: factory.createPlaceManagementRepository(),
      }

      try {
        const result = await executePlaceLookupUseCase(
          { googleMapsUrl: query.google_maps_url },
          repositories,
        )

        if (!result.exists) {
          return c.json({ exists: false })
        }

        return c.json({
          exists: true,
          place: result.place?.toResponse(),
        })
      } catch (error) {
        if (error instanceof PlaceManagementError) {
          return c.json(
            {
              error: {
                code: error.code,
                message: error.message,
              },
            },
            error.status as 400 | 404 | 409 | 500,
          )
        }
        throw error
      }
    },
  )

  return app
}
