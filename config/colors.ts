import { ProjectCategory } from '@/types/costlocker.types'

/**
 * Project Color Configuration
 *
 * Defines colors for each project category used throughout the application
 * Colors are optimized for both light and dark modes
 */

export const PROJECT_COLORS: Record<ProjectCategory, string> = {
  Internal: '#3b82f6',     // blue
  OPS: '#10b981',          // green
  'R&D': '#f59e0b',        // orange
  Guiding: '#8b5cf6',      // purple
  PR: '#ec4899',           // pink
  'UX Maturity': '#06b6d4', // cyan
  Other: '#94a3b8',        // slate
}

export const ACTIVITY_COLORS = {
  OPS_Hiring: '#10b981',    // green
  OPS_Jobs: '#3b82f6',      // blue
  OPS_Reviews: '#f59e0b',   // orange
  OPS_Guiding: '#8b5cf6',   // purple
  Unpaired: '#ef4444',      // red
}
