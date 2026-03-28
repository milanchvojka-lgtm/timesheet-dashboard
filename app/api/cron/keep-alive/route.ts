import { NextResponse } from 'next/server'
import { Client } from 'pg'

export async function GET(request: Request) {
  // Only enforce auth if CRON_SECRET is configured
  if (process.env.CRON_SECRET) {
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  // Use a direct PostgreSQL connection instead of the Supabase REST API.
  // Supabase does not count REST API calls as "activity" for its
  // free-tier inactivity check — only real database connections count.
  const connectionString = process.env.SUPABASE_DB_URL
  if (!connectionString) {
    return NextResponse.json(
      { ok: false, error: 'SUPABASE_DB_URL not configured' },
      { status: 500 }
    )
  }

  const client = new Client({ connectionString })

  try {
    await client.connect()
    const result = await client.query('SELECT NOW() AS time')
    await client.end()

    return NextResponse.json({
      ok: true,
      timestamp: result.rows[0].time,
    })
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
