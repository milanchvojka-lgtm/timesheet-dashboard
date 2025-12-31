import { Metadata } from 'next'
import { ReviewBuddyView } from '@/components/review-buddy/review-buddy-view'

export const metadata: Metadata = {
  title: 'Review Buddy | Timesheet Analytics',
  description: 'Quality control for timesheet entries',
}

export default function ReviewBuddyPage() {
  return <ReviewBuddyView />
}
