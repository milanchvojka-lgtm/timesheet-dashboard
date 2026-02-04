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
    it('should categorize hiring activities with prefix in description', () => {
      const category = categorizeActivity('Internal', 'Hiring: Lada Čápová', 'OPS', mockKeywords)
      expect(category).toBe('OPS_Hiring')
    })

    it('should categorize jobs activities with prefix in description', () => {
      const category = categorizeActivity('Internal', 'Jobs: Eurowag, komunikácia', 'OPS', mockKeywords)
      expect(category).toBe('OPS_Jobs')
    })

    it('should categorize reviews activities with prefix in description', () => {
      const category = categorizeActivity('Internal', 'Review: Petr Tejkal + zpracování', 'OPS', mockKeywords)
      expect(category).toBe('OPS_Reviews')
    })

    it('should detect Guiding from project name', () => {
      const category = categorizeActivity('Mentoring', 'Team mentoring', 'Guiding_2025', mockKeywords)
      expect(category).toBe('OPS_Guiding')
    })

    it('should be case-insensitive', () => {
      const category1 = categorizeActivity('Internal', 'HIRING: task', 'OPS', mockKeywords)
      const category2 = categorizeActivity('Internal', 'hiring: task', 'OPS', mockKeywords)
      const category3 = categorizeActivity('Internal', 'Hiring: task', 'OPS', mockKeywords)

      expect(category1).toBe('OPS_Hiring')
      expect(category2).toBe('OPS_Hiring')
      expect(category3).toBe('OPS_Hiring')
    })

    it('should NOT match keyword mid-text in description', () => {
      // "hiring" appears mid-text, not as prefix with ":"
      const category = categorizeActivity('Internal', 'Discussed hiring process', 'OPS', mockKeywords)
      // OPS project without prefix match → OPS_Guiding in lenient mode
      expect(category).toBe('OPS_Guiding')
    })

    it('should NOT match keyword mid-text in description on other projects', () => {
      // "jobs" appears mid-text on Internal project → not a tagged entry
      const category = categorizeActivity('Internal', 'design ops status a jobs ops', 'Internal', mockKeywords)
      expect(category).toBe('Other')
    })

    it('should return Other for non-OPS/Guiding projects without keyword prefix', () => {
      const category = categorizeActivity('Design', 'Random design work', 'Internal', mockKeywords)
      expect(category).toBe('Other')
    })

    it('should handle null description on OPS project', () => {
      // No description → no prefix match → OPS fallback (lenient = OPS_Guiding)
      const category = categorizeActivity('Internal', null, 'OPS', mockKeywords)
      expect(category).toBe('OPS_Guiding')
    })

    it('should match with colon, without colon, and with whitespace', () => {
      const cat1 = categorizeActivity('Internal', 'Jobs: posting', 'OPS', mockKeywords)
      const cat2 = categorizeActivity('Internal', 'Jobs:posting', 'OPS', mockKeywords)
      const cat3 = categorizeActivity('Internal', 'Jobs posting', 'OPS', mockKeywords)
      const cat4 = categorizeActivity('Internal', 'Jobs', 'OPS', mockKeywords)

      expect(cat1).toBe('OPS_Jobs')
      expect(cat2).toBe('OPS_Jobs')
      expect(cat3).toBe('OPS_Jobs')
      expect(cat4).toBe('OPS_Jobs')
    })

    it('should NOT partially match keywords', () => {
      // "job" keyword should not match "jobs" at start
      const category = categorizeActivity('Internal', 'jobsomething else', 'OPS', mockKeywords)
      // "job" starts it but next char is "s" — not a word boundary
      // "jobs" keyword does start it and next char is "o" — also not a word boundary
      // No match → OPS fallback (lenient = OPS_Guiding)
      expect(category).toBe('OPS_Guiding')
    })

    it('should mark keyword prefix on wrong project as Unpaired', () => {
      // "Jobs:" prefix in description on Internal project → mistake
      const category = categorizeActivity('Internal', 'Jobs: posting update', 'Internal', mockKeywords)
      expect(category).toBe('Unpaired')
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
        activity_name: 'Internal',
        date: '2025-11-15',
        hours: 2,
        description: 'Interview: Candidate screening',
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
      expect(categorized[2].category).toBe('Other')
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
