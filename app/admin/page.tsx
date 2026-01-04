import { redirect } from 'next/navigation'

/**
 * Admin Root Page
 *
 * Redirects to Team Members page as the default admin view
 */
export default function AdminPage() {
  redirect('/admin/team-members')
}
