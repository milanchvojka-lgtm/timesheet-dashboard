import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.join(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkKeywords() {
  const { data: keywords, error } = await supabase
    .from('activity_keywords')
    .select('*')
    .eq('is_active', true)
    .order('category', { ascending: true })

  if (error) {
    console.error('Error fetching keywords:', error)
    return
  }

  console.log('\n=== ACTIVITY KEYWORDS IN DATABASE ===\n')

  if (!keywords || keywords.length === 0) {
    console.log('❌ NO KEYWORDS FOUND - This is why everything is unpaired!')
    console.log('\nYou need to add keywords to the activity_keywords table.')
    console.log('Categories available: OPS_Hiring, OPS_Jobs, OPS_Reviews, OPS_Guiding')
    return
  }

  const grouped = keywords.reduce((acc, kw) => {
    if (!acc[kw.category]) acc[kw.category] = []
    acc[kw.category].push(kw.keyword)
    return acc
  }, {} as Record<string, string[]>)

  Object.entries(grouped).forEach(([category, words]) => {
    console.log(`${category}:`)
    words.forEach(word => console.log(`  - "${word}"`))
    console.log()
  })

  console.log(`Total keywords: ${keywords.length}`)
}

checkKeywords()
