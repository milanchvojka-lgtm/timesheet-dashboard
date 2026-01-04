import { createServerAdminClient } from '@/lib/supabase/server'

export interface DataRange {
  startDate: string | null // YYYY-MM-DD format
  endDate: string | null // YYYY-MM-DD format
}

/**
 * Get data range settings from the database
 * Returns the configured start and end dates for data availability
 */
export async function getDataRange(): Promise<DataRange> {
  const supabase = createServerAdminClient()

  // Fetch data_range_start and data_range_end from settings
  const { data: settings, error } = await supabase
    .from('settings')
    .select('key, value')
    .in('key', ['data_range_start', 'data_range_end'])

  if (error) {
    console.error('[Settings] Error fetching data range:', error)
    return { startDate: null, endDate: null }
  }

  const startSetting = settings?.find((s) => s.key === 'data_range_start')
  const endSetting = settings?.find((s) => s.key === 'data_range_end')

  return {
    startDate: startSetting?.value || null,
    endDate: endSetting?.value || null,
  }
}
