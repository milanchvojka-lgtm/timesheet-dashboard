import { describe, it, expect } from 'vitest'
import {
  calculateFTE,
  calculateMonthlyFTE,
  calculateTeamMonthlyFTE,
  calculateTotalTeamFTE,
  calculateFTEStats,
} from '../fte'

describe('FTE Calculator', () => {
  describe('calculateFTE', () => {
    it('should calculate 1.0 FTE for full-time work', () => {
      const fte = calculateFTE(160, 160)
      expect(fte).toBe(1.0)
    })

    it('should calculate 0.5 FTE for half-time work', () => {
      const fte = calculateFTE(80, 160)
      expect(fte).toBe(0.5)
    })

    it('should calculate FTE with overtime', () => {
      const fte = calculateFTE(180, 160)
      expect(fte).toBe(1.13)
    })

    it('should calculate FTE with partial hours', () => {
      const fte = calculateFTE(20.25, 152)
      expect(fte).toBe(0.13)
    })

    it('should return 0 for zero working hours', () => {
      const fte = calculateFTE(0, 0)
      expect(fte).toBe(0)
    })

    it('should round to 2 decimal places', () => {
      const fte = calculateFTE(133.3333, 160)
      expect(fte).toBe(0.83)
    })
  })

  describe('calculateMonthlyFTE', () => {
    it('should calculate FTE for November 2025', () => {
      const fte = calculateMonthlyFTE(152, 2025, 11)
      expect(fte).toBe(1.0) // 152 hours = 1 FTE for November 2025
    })

    it('should calculate partial FTE', () => {
      const fte = calculateMonthlyFTE(20.25, 2025, 11)
      expect(fte).toBe(0.13)
    })
  })

  describe('calculateTeamMonthlyFTE', () => {
    const mockData = [
      { person_id: 1, person_name: 'Alice', hours: 152, date: '2025-11-15' },
      { person_id: 1, person_name: 'Alice', hours: 8, date: '2025-11-16' },
      { person_id: 2, person_name: 'Bob', hours: 76, date: '2025-11-15' },
      { person_id: 3, person_name: 'Charlie', hours: 40, date: '2025-10-15' }, // Different month
    ]

    it('should calculate FTE for all team members in a month', () => {
      const results = calculateTeamMonthlyFTE(mockData, 2025, 11)

      expect(results).toHaveLength(2) // Only Alice and Bob have November entries

      const alice = results.find(r => r.personName === 'Alice')
      expect(alice?.trackedHours).toBe(160) // 152 + 8
      expect(alice?.fte).toBe(1.05) // 160 / 152

      const bob = results.find(r => r.personName === 'Bob')
      expect(bob?.trackedHours).toBe(76)
      expect(bob?.fte).toBe(0.5) // 76 / 152
    })

    it('should calculate deviation from planned FTE', () => {
      const plannedFTEs = new Map([[1, 1.0], [2, 0.8]])
      const results = calculateTeamMonthlyFTE(mockData, 2025, 11, plannedFTEs)

      const alice = results.find(r => r.personName === 'Alice')
      expect(alice?.plannedFTE).toBe(1.0)
      expect(alice?.deviation).toBeCloseTo(5.0, 0) // 5% over planned

      const bob = results.find(r => r.personName === 'Bob')
      expect(bob?.plannedFTE).toBe(0.8)
      expect(bob?.deviation).toBeCloseTo(-37.5, 0) // 37.5% under planned
    })

    it('should sort results by person name', () => {
      const results = calculateTeamMonthlyFTE(mockData, 2025, 11)

      expect(results[0].personName).toBe('Alice')
      expect(results[1].personName).toBe('Bob')
    })
  })

  describe('calculateTotalTeamFTE', () => {
    const mockFTEs = [
      { personId: 1, personName: 'Alice', year: 2025, month: 11, trackedHours: 160, workingHours: 152, fte: 1.05 },
      { personId: 2, personName: 'Bob', year: 2025, month: 11, trackedHours: 76, workingHours: 152, fte: 0.5 },
      { personId: 3, personName: 'Charlie', year: 2025, month: 11, trackedHours: 38, workingHours: 152, fte: 0.25 },
    ]

    it('should sum all FTEs', () => {
      const total = calculateTotalTeamFTE(mockFTEs)
      expect(total).toBe(1.8) // 1.05 + 0.5 + 0.25
    })

    it('should return 0 for empty array', () => {
      const total = calculateTotalTeamFTE([])
      expect(total).toBe(0)
    })
  })

  describe('calculateFTEStats', () => {
    const mockFTEs = [
      { personId: 1, personName: 'Alice', year: 2025, month: 11, trackedHours: 160, workingHours: 152, fte: 1.05 },
      { personId: 2, personName: 'Bob', year: 2025, month: 11, trackedHours: 76, workingHours: 152, fte: 0.5 },
      { personId: 3, personName: 'Charlie', year: 2025, month: 11, trackedHours: 38, workingHours: 152, fte: 0.25 },
    ]

    it('should calculate correct statistics', () => {
      const stats = calculateFTEStats(mockFTEs)

      expect(stats.totalFTE).toBe(1.8)
      expect(stats.averageFTE).toBe(0.6) // 1.8 / 3
      expect(stats.highestFTE).toBe(1.05)
      expect(stats.lowestFTE).toBe(0.25)
      expect(stats.teamMemberCount).toBe(3)
    })

    it('should handle empty array', () => {
      const stats = calculateFTEStats([])

      expect(stats.totalFTE).toBe(0)
      expect(stats.averageFTE).toBe(0)
      expect(stats.highestFTE).toBe(0)
      expect(stats.lowestFTE).toBe(0)
      expect(stats.teamMemberCount).toBe(0)
    })
  })
})
