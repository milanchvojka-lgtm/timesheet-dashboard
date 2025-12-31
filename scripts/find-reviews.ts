import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.join(__dirname, '../.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function findReviews() {
  // Get all OPS entries for November 2025
  const { data: entries, error } = await supabase
    .from('timesheet_entries')
    .select('*')
    .gte('date', '2025-11-01')
    .lte('date', '2025-11-30')
    .order('date', { ascending: true })

  if (error) {
    console.error('Error:', error)
    return
  }

  // Filter to OPS and Guiding projects
  const opsEntries = entries?.filter((entry: any) => {
    const projectNameLower = entry.project_name?.toLowerCase() || ''
    return projectNameLower.includes('ops') || projectNameLower.includes('guiding')
  }) || []

  console.log(`Total OPS/Guiding entries: ${opsEntries.length}\n`)

  // Find all entries with review-related keywords (case-insensitive)
  const reviewKeywords = ['review', 'feedback', '1:1', 'one-on-one', 'evaluation', 'performance']

  const possibleReviews = opsEntries.filter((entry: any) => {
    const searchText = `${entry.activity_name} ${entry.description || ''}`.toLowerCase()
    return reviewKeywords.some(keyword => searchText.includes(keyword.toLowerCase()))
  })

  console.log(`Found ${possibleReviews.length} entries with review-related keywords:\n`)

  possibleReviews.forEach((entry: any) => {
    console.log(`${entry.date} | ${entry.person_name} | ${entry.hours}h`)
    console.log(`  Activity: ${entry.activity_name}`)
    console.log(`  Description: ${entry.description}`)
    console.log()
  })

  const totalHours = possibleReviews.reduce((sum, e) => sum + Number(e.hours), 0)
  console.log(`Total hours: ${totalHours.toFixed(2)}`)
  console.log(`Total entries: ${possibleReviews.length}`)
}

findReviews()
