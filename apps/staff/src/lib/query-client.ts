import { createQueryClient } from '@masaar/api-client'

/** The app's single query cache, shared by the router and the auth store. */
export const queryClient = createQueryClient()
