import { SupabaseClient } from '@supabase/supabase-js'

/**
 * Log an admin action to the audit log
 *
 * Note: This function uses type assertions because the Supabase generated types
 * don't match the actual database schema (which has user_email and details columns
 * added via migration 20250101170000_fix_audit_log_schema.sql)
 */
export async function logAuditAction(
  supabase: SupabaseClient,
  params: {
    userEmail: string | null | undefined
    action: string
    entityType: string
    entityId?: string
    details?: Record<string, unknown>
  }
) {
  const { userEmail, action, entityType, entityId, details } = params

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return supabase.from('audit_log').insert({
    user_email: userEmail || 'unknown',
    action,
    entity_type: entityType,
    entity_id: entityId,
    details,
  } as any)
}
