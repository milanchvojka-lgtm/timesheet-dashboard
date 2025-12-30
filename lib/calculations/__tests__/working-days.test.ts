import { describe, it, expect } from 'vitest'
import { calculateWorkingDays, getWorkingHoursForPeriod } from '../working-days'

describe('Working Days Calculator', () => {
  describe('calculateWorkingDays', () => {
    it('should calculate working days for November 2025', () => {
      const result = calculateWorkingDays(2025, 11)

      expect(result.totalDays).toBe(30)
      expect(result.weekdays).toBe(20)
      expect(result.holidays).toBe(1) // November 17, 2025 is Freedom and Democracy Day (Czech holiday)
      expect(result.workingDays).toBe(19)
      expect(result.workingHours).toBe(152) // 19 days * 8 hours
    })

    it('should calculate working days for December 2024', () => {
      const result = calculateWorkingDays(2024, 12)

      expect(result.totalDays).toBe(31)
      expect(result.weekdays).toBeGreaterThanOrEqual(21)
      expect(result.holidays).toBeGreaterThanOrEqual(2) // Christmas holidays
      expect(result.workingDays).toBeGreaterThanOrEqual(19)
      expect(result.workingHours).toBe(result.workingDays * 8)
    })

    it('should handle months with no holidays', () => {
      const result = calculateWorkingDays(2025, 2) // February 2025

      expect(result.totalDays).toBe(28)
      expect(result.holidays).toBe(0)
      expect(result.workingDays).toBe(result.weekdays)
    })

    it('should calculate working hours correctly', () => {
      const result = calculateWorkingDays(2025, 10) // October 2025

      expect(result.workingHours).toBe(result.workingDays * 8)
    })
  })

  describe('getWorkingHoursForPeriod', () => {
    it('should calculate working hours for a single month', () => {
      const hours = getWorkingHoursForPeriod('2025-11-01', '2025-11-30')

      expect(hours).toBe(152) // November 2025 has 152 working hours
    })

    it('should calculate working hours for multiple months', () => {
      const hours = getWorkingHoursForPeriod('2025-10-01', '2025-11-30')

      // October 2025 + November 2025
      const oct = calculateWorkingDays(2025, 10)
      const nov = calculateWorkingDays(2025, 11)
      const expected = oct.workingHours + nov.workingHours

      expect(hours).toBe(expected)
    })
  })
})
