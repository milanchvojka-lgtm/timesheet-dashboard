'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Loader2, AlertTriangle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'

interface Keyword {
  id: string
  keyword: string
  category: string
  description: string | null
  is_active: boolean
  created_at: string
}

const CATEGORY_INFO = {
  OPS_Hiring: {
    label: 'OPS Hiring',
    description: 'Keywords for hiring and interview activities',
    color: 'bg-blue-100 text-blue-800',
  },
  OPS_Jobs: {
    label: 'OPS Jobs',
    description: 'Keywords for job posting and management activities',
    color: 'bg-green-100 text-green-800',
  },
  OPS_Reviews: {
    label: 'OPS Reviews',
    description: 'Keywords for review and feedback activities',
    color: 'bg-purple-100 text-purple-800',
  },
  OPS_Guiding: {
    label: 'OPS Guiding',
    description: 'Keywords for guiding and general OPS activities',
    color: 'bg-orange-100 text-orange-800',
  },
}

export default function KeywordsPage() {
  const [keywords, setKeywords] = useState<Keyword[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Form state
  const [newKeyword, setNewKeyword] = useState('')
  const [newCategory, setNewCategory] = useState('OPS_Guiding')
  const [newDescription, setNewDescription] = useState('')
  const [errors, setErrors] = useState({ keyword: '', category: '' })

  const { toast } = useToast()

  // Fetch keywords
  const fetchKeywords = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/keywords')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch keywords')
      }

      setKeywords(data.keywords || [])
    } catch (error) {
      console.error('Error fetching keywords:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to fetch keywords',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchKeywords()
  }, [])

  // Validate form
  const validateForm = (): boolean => {
    const newErrors = { keyword: '', category: '' }

    if (!newKeyword.trim()) {
      newErrors.keyword = 'Keyword is required'
    }

    if (!newCategory) {
      newErrors.category = 'Category is required'
    }

    setErrors(newErrors)
    return !Object.values(newErrors).some((error) => error !== '')
  }

  // Add keyword
  const handleAddKeyword = async () => {
    if (!validateForm()) {
      return
    }

    try {
      setSubmitting(true)

      const response = await fetch('/api/admin/keywords', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          keyword: newKeyword.trim(),
          category: newCategory,
          description: newDescription.trim() || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add keyword')
      }

      toast({
        title: 'Success',
        description: `Keyword "${newKeyword}" added successfully`,
      })

      // Reset form and close dialog
      setNewKeyword('')
      setNewCategory('OPS_Guiding')
      setNewDescription('')
      setErrors({ keyword: '', category: '' })
      setDialogOpen(false)

      // Refresh keywords
      await fetchKeywords()
    } catch (error) {
      console.error('Error adding keyword:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add keyword',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  // Toggle active status
  const handleToggleActive = async (keyword: Keyword) => {
    try {
      const response = await fetch('/api/admin/keywords', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          keywordId: keyword.id,
          isActive: !keyword.is_active,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update keyword')
      }

      toast({
        title: 'Success',
        description: `Keyword "${keyword.keyword}" ${keyword.is_active ? 'deactivated' : 'activated'}`,
      })

      // Refresh keywords
      await fetchKeywords()
    } catch (error) {
      console.error('Error toggling keyword:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update keyword',
        variant: 'destructive',
      })
    }
  }

  // Group keywords by category
  const groupedKeywords = keywords.reduce((acc, keyword) => {
    if (!acc[keyword.category]) {
      acc[keyword.category] = []
    }
    acc[keyword.category].push(keyword)
    return acc
  }, {} as Record<string, Keyword[]>)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Activity Keywords</h2>
          <p className="text-muted-foreground mt-1">
            Manage keywords for categorizing timesheet activities
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Keyword
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Activity Keyword</DialogTitle>
              <DialogDescription>
                Add a new keyword for activity categorization. Keywords are case-insensitive.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="keyword">Keyword *</Label>
                <Input
                  id="keyword"
                  type="text"
                  placeholder="e.g., hiring, interview, jobs"
                  value={newKeyword}
                  onChange={(e) => {
                    setNewKeyword(e.target.value)
                    setErrors({ ...errors, keyword: '' })
                  }}
                  className={errors.keyword ? 'border-red-500' : ''}
                />
                {errors.keyword && <p className="text-sm text-red-500">{errors.keyword}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={newCategory}
                  onValueChange={(value) => {
                    setNewCategory(value)
                    setErrors({ ...errors, category: '' })
                  }}
                >
                  <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(CATEGORY_INFO).map(([key, info]) => (
                      <SelectItem key={key} value={key}>
                        {info.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && <p className="text-sm text-red-500">{errors.category}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Describe when this keyword should be used..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setDialogOpen(false)
                  setNewKeyword('')
                  setNewCategory('OPS_Guiding')
                  setNewDescription('')
                  setErrors({ keyword: '', category: '' })
                }}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button onClick={handleAddKeyword} disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  'Add Keyword'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Warning Card */}
      <Card className="bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            <CardTitle className="text-yellow-900 dark:text-yellow-100">
              Important: Changes Affect Historical Data
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="text-sm text-yellow-800 dark:text-yellow-200">
          <p>
            Modifying keywords affects how all timesheet entries (past and future) are categorized.
            When you add, remove, or deactivate keywords, historical reports and quality scores may
            change. Always review the impact before making changes.
          </p>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(CATEGORY_INFO).map(([categoryKey, categoryInfo]) => {
            const categoryKeywords = groupedKeywords[categoryKey] || []
            const activeCount = categoryKeywords.filter((k) => k.is_active).length

            return (
              <Card key={categoryKey}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{categoryInfo.label}</CardTitle>
                      <CardDescription>
                        {categoryInfo.description} ({activeCount} active)
                      </CardDescription>
                    </div>
                    <Badge className={categoryInfo.color}>{categoryKey}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {categoryKeywords.length === 0 ? (
                    <p className="text-center py-4 text-muted-foreground">
                      No keywords in this category yet
                    </p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Keyword</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {categoryKeywords.map((keyword) => (
                          <TableRow key={keyword.id}>
                            <TableCell className="font-medium">{keyword.keyword}</TableCell>
                            <TableCell className="text-muted-foreground">
                              {keyword.description || '-'}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Switch
                                  checked={keyword.is_active}
                                  onCheckedChange={() => handleToggleActive(keyword)}
                                />
                                <span className="text-sm">
                                  {keyword.is_active ? 'Active' : 'Inactive'}
                                </span>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

    </div>
  )
}
