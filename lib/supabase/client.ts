import { createBrowserClient as createClient } from '@supabase/ssr'
import { Database } from '@/types/database.types'

/**
 * Creates a Supabase client for use in Client Components
 * This client runs in the browser and uses cookie-based authentication
 *
 * The client is cached as a singleton to avoid creating multiple instances
 *
 * @returns Supabase client configured for browser usage
 */
export function createBrowserClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
