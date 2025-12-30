import { describe, it, expect } from 'vitest'
import {
  categorizeActivity,
  categorizeTimesheet,
  getActivitySummary,
  getUnpairedEntries,
  calculateQualityScore,
  type ActivityKeyword,
  type CategorizedEntry,
} from '../activity-pairing'

describe('Activity Categorization', () => {
  const mockKeywords: ActivityKeyword[] = [
    { id: '1', category: 'OPS_Hiring', keyword: 'hiring' },
    { id: '2', category: 'OPS_Hiring', keyword: 'interview' },
    { id: '3', category: 'OPS_Hiring', keyword: 'recruitment' },
    { id: '4', category: 'OPS_Jobs', keyword: 'jobs' },
    { id: '5', category: 'OPS_Jobs', keyword: 'job' },
    { id: '6', category: 'OPS_Reviews', keyword: 'review' },
    { id: '7', category: 'OPS_Reviews', keyword: 'reviews' },
  ]

  describe('categorizeActivity', () => {
    it('should categorize hiring activities', () => {
      const category = categorizeActivity('Interview', 'Interview with candidate', 'OPS', mockKeywords)
      expect(category).toBe('OPS_Hiring')
    })

    it('should categorize jobs activities', () => {
      const category = categorizeActivity('Jobs', 'Update job postings', 'OPS', mockKeywords)
      expect(category).toBe('OPS_Jobs')
    })

    it('should categorize reviews activities', () => {
      const category = categorizeActivity('Reviews', 'Design review session', 'OPS', mockKeywords)
      expect(category).toBe('OPS_Reviews')
    })

    it('should detect Guiding from project name', () => {
      const category = categorizeActivity('Mentoring', 'Team mentoring', 'Guiding_2025', mockKeywords)
      expect(category).toBe('OPS_Guiding')
    })

    it('should be case-insensitive', () => {
      const category1 = categorizeActivity('HIRING', 'Some work', 'OPS', mockKeywords)
      const category2 = categorizeActivity('hiring', 'Some work', 'OPS', mockKeywords)
      const category3 = categorizeActivity('Hiring', 'Some work', 'OPS', mockKeywords)

      expect(category1).toBe('OPS_Hiring')
      expect(category2).toBe('OPS_Hiring')
      expect(category3).toBe('OPS_Hiring')
    })

    it('should match keywords in description', () => {
      const category = categorizeActivity('Meeting', 'Discussed hiring process', 'OPS', mockKeywords)
      expect(category).toBe('OPS_Hiring')
    })

    it('should return Unpaired for unmatched activities', () => {
      const category = categorizeActivity('Design', 'Random design work', 'Internal', mockKeywords)
      expect(category).toBe('Unpaired')
    })

    it('should handle null description', () => {
      const category = categorizeActivity('Interview', null, 'OPS', mockKeywords)
      expect(category).toBe('OPS_Hiring')
    })

    it('should prioritize hiring over jobs', () => {
      // "job" is in both hiring and jobs context
      const category = categorizeActivity('Job Interview', 'Interview for job position', 'OPS', mockKeywords)
      expect(category).toBe('OPS_Hiring') // Hiring comes first in check order
    })
  })

  describe('categorizeTimesheet', () => {
    const mockEntries = [
      {
        id: '1',
        person_id: 1,
        person_name: 'Alice',
        project_id: 100,
        project_name: 'OPS',
        activity_id: 200,
        activity_name: 'Interview',
        date: '2025-11-15',
        hours: 2,
        description: 'Candidate interview',
      },
      {
        id: '2',
        person_id: 2,
        person_name: 'Bob',
        project_id: 101,
        project_name: 'Guiding_2025',
        activity_id: 201,
        activity_name: 'Mentoring',
        date: '2025-11-16',
        hours: 3,
        description: null,
      },
      {
        id: '3',
        person_id: 3,
        person_name: 'Charlie',
        project_id: 102,
        project_name: 'Internal',
        activity_id: 202,
        activity_name: 'Design',
        date: '2025-11-17',
        hours: 5,
        description: 'UI Design work',
      },
    ]

    it('should categorize all entries', () => {
      const categorized = categorizeTimesheet(mockEntries, mockKeywords)

      expect(categorized).toHaveLength(3)
      expect(categorized[0].category).toBe('OPS_Hiring')
      expect(categorized[1].category).toBe('OPS_Guiding')
      expect(categorized[2].category).toBe('Unpaired')
    })

    it('should preserve all entry properties', () => {
      const categorized = categorizeTimesheet(mockEntries, mockKeywords)

      expect(categorized[0]).toMatchObject({
        id: '1',
        person_id: 1,
        person_name: 'Alice',
        hours: 2,
      })
    })
  })

  describe('getActivitySummary', () => {
    const mockCategorized = [
      {
        id: '1',
        person_id: 1,
        person_name: 'Alice',
        project_id: 100,
        project_name: 'OPS',
        activity_id: 200,
        activity_name: 'Interview',
        date: '2025-11-15',
        hours: 2,
        description: null,
        category: 'OPS_Hiring' as const,
      },
      {
        id: '2',
        person_id: 1,
        person_name: 'Alice',
        project_id: 100,
        project_name: 'OPS',
        activity_id: 200,
        activity_name: 'Interview',
        date: '2025-11-16',
        hours: 3,
        description: null,
        category: 'OPS_Hiring' as const,
      },
      {
        id: '3',
        person_id: 2,
        person_name: 'Bob',
        project_id: 101,
        project_name: 'OPS',
        activity_id: 201,
        activity_name: 'Jobs',
        date: '2025-11-17',
        hours: 5,
        description: null,
        category: 'OPS_Jobs' as const,
      },
    ]

    it('should sum hours by category', () => {
      const summary = getActivitySummary(mockCategorized)

      expect(summary).toHaveLength(2)

      const hiring = summary.find(s => s.category === 'OPS_Hiring')
      expect(hiring?.totalHours).toBe(5) // 2 + 3
      expect(hiring?.entryCount).toBe(2)

      const jobs = summary.find(s => s.category === 'OPS_Jobs')
      expect(jobs?.totalHours).toBe(5)
      expect(jobs?.entryCount).toBe(1)
    })

    it('should calculate percentages', () => {
      const summary = getActivitySummary(mockCategorized)

      const hiring = summary.find(s => s.category === 'OPS_Hiring')
      expect(hiring?.percentage).toBe(50) // 5 / 10 * 100

      const jobs = summary.find(s => s.category === 'OPS_Jobs')
      expect(jobs?.percentage).toBe(50)
    })

    it('should sort by total hours descending', () => {
      const summary = getActivitySummary(mockCategorized)

      // Both have 5 hours, so order may vary but should be sorted
      expect(summary[0].totalHours).toBeGreaterThanOrEqual(summary[1].totalHours)
    })
  })

  describe('getUnpairedEntries', () => {
    const mockCategorized = [
      {
        id: '1',
        person_id: 1,
        person_name: 'Alice',
        project_id: 100,
        project_name: 'OPS',
        activity_id: 200,
        activity_name: 'Interview',
        date: '2025-11-15',
        hours: 2,
        description: null,
        category: 'OPS_Hiring' as const,
      },
      {
        id: '2',
        person_id: 2,
        person_name: 'Bob',
        project_id: 101,
        project_name: 'Internal',
        activity_id: 201,
        activity_name: 'Design',
        date: '2025-11-16',
        hours: 3,
        description: null,
        category: 'Unpaired' as const,
      },
      {
        id: '3',
        person_id: 3,
        person_name: 'Charlie',
        project_id: 102,
        project_name: 'Internal',
        activity_id: 202,
        activity_name: 'Meeting',
        date: '2025-11-17',
        hours: 1,
        description: null,
        category: 'Unpaired' as const,
      },
    ]

    it('should return only unpaired entries', () => {
      const unpaired = getUnpairedEntries(mockCategorized)

      expect(unpaired).toHaveLength(2)
      expect(unpaired[0].person_name).toBe('Bob')
      expect(unpaired[1].person_name).toBe('Charlie')
    })

    it('should return empty array if all paired', () => {
      const allPaired = mockCategorized.map(e => ({ ...e, category: 'OPS_Hiring' as const }))
      const unpaired = getUnpairedEntries(allPaired)

      expect(unpaired).toHaveLength(0)
    })
  })

  describe('calculateQualityScore', () => {
    it('should calculate quality score correctly', () => {
      const mockCategorized: Partial<CategorizedEntry>[] = [
        { id: '1', category: 'OPS_Hiring' as const },
        { id: '2', category: 'OPS_Jobs' as const },
        { id: '3', category: 'Unpaired' as const },
        { id: '4', category: 'Unpaired' as const },
      ]

      const score = calculateQualityScore(mockCategorized as CategorizedEntry[])
      expect(score).toBe(50) // 2 / 4 * 100
    })

    it('should return 100 for all paired', () => {
      const mockCategorized: Partial<CategorizedEntry>[] = [
        { id: '1', category: 'OPS_Hiring' as const },
        { id: '2', category: 'OPS_Jobs' as const },
      ]

      const score = calculateQualityScore(mockCategorized as CategorizedEntry[])
      expect(score).toBe(100)
    })

    it('should return 0 for all unpaired', () => {
      const mockCategorized: Partial<CategorizedEntry>[] = [
        { id: '1', category: 'Unpaired' as const },
        { id: '2', category: 'Unpaired' as const },
      ]

      const score = calculateQualityScore(mockCategorized as CategorizedEntry[])
      expect(score).toBe(0)
    })

    it('should return 100 for empty array', () => {
      const score = calculateQualityScore([])
      expect(score).toBe(100)
    })
  })
})
