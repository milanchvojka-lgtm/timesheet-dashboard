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
import { Plus, Loader2, History } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface FTERecord {
  id: string
  person_name: string
  fte_value: number
  valid_from: string
  valid_to: string | null
  created_at: string
}

export default function PlannedFTEPage() {
  const [records, setRecords] = useState<FTERecord[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Form state
  const [personName, setPersonName] = useState('')
  const [fte, setFte] = useState('1.00')
  const [validFrom, setValidFrom] = useState(
    new Date().toISOString().split('T')[0]
  )
  const [errors, setErrors] = useState({
    personName: '',
    fte: '',
    validFrom: '',
  })

  const { toast } = useToast()

  // Fetch FTE records
  const fetchRecords = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/fte')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch FTE records')
      }

      setRecords(data.fteRecords || [])
    } catch (error) {
      console.error('Error fetching FTE records:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to fetch FTE records',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRecords()
  }, [])

  // Validate form
  const validateForm = (): boolean => {
    const newErrors = {
      personName: '',
      fte: '',
      validFrom: '',
    }

    if (!personName.trim()) {
      newErrors.personName = 'Person name is required'
    }

    const fteNum = parseFloat(fte)
    if (isNaN(fteNum) || fteNum < 0 || fteNum > 2) {
      newErrors.fte = 'FTE must be between 0 and 2'
    } else {
      const remainder = (fteNum * 100) % 5
      if (remainder !== 0) {
        newErrors.fte = 'FTE must be in increments of 0.05'
      }
    }

    if (!validFrom) {
      newErrors.validFrom = 'Valid from date is required'
    }

    setErrors(newErrors)
    return !Object.values(newErrors).some((error) => error !== '')
  }

  // Save FTE record
  const handleSave = async () => {
    if (!validateForm()) {
      return
    }

    try {
      setSubmitting(true)

      const response = await fetch('/api/admin/fte', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personName: personName.trim(),
          fte: parseFloat(fte),
          validFrom,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save FTE record')
      }

      toast({
        title: 'Success',
        description: `FTE for ${personName} saved successfully`,
      })

      // Reset form and close dialog
      setPersonName('')
      setFte('1.00')
      setValidFrom(new Date().toISOString().split('T')[0])
      setErrors({ personName: '', fte: '', validFrom: '' })
      setDialogOpen(false)

      // Refresh records
      await fetchRecords()
    } catch (error) {
      console.error('Error saving FTE record:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save FTE record',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  // Edit existing record
  const handleEdit = (record: FTERecord) => {
    setPersonName(record.person_name)
    setFte(record.fte_value.toFixed(2))
    setValidFrom(new Date().toISOString().split('T')[0])
    setDialogOpen(true)
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('cs-CZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  // Generate FTE options (0 to 2, step 0.05)
  const fteOptions = []
  for (let i = 0; i <= 200; i += 5) {
    const value = (i / 100).toFixed(2)
    fteOptions.push(value)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Planned FTE</h2>
          <p className="text-muted-foreground mt-1">
            Set planned Full-Time Equivalent values for team members
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Set FTE
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Set Planned FTE</DialogTitle>
              <DialogDescription>
                Set or update the planned FTE for a team member. This will create a new record
                with the specified valid from date.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="personName">Person Name *</Label>
                <Input
                  id="personName"
                  type="text"
                  placeholder="Jan Novák"
                  value={personName}
                  onChange={(e) => {
                    setPersonName(e.target.value)
                    setErrors({ ...errors, personName: '' })
                  }}
                  className={errors.personName ? 'border-red-500' : ''}
                />
                {errors.personName && (
                  <p className="text-sm text-red-500">{errors.personName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="fte">FTE Value *</Label>
                <Select value={fte} onValueChange={(value) => {
                  setFte(value)
                  setErrors({ ...errors, fte: '' })
                }}>
                  <SelectTrigger className={errors.fte ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select FTE" />
                  </SelectTrigger>
                  <SelectContent>
                    {fteOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option} FTE
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.fte && <p className="text-sm text-red-500">{errors.fte}</p>}
                <p className="text-sm text-muted-foreground">
                  Range: 0.00 - 2.00, increments of 0.05
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="validFrom">Valid From *</Label>
                <Input
                  id="validFrom"
                  type="date"
                  value={validFrom}
                  onChange={(e) => {
                    setValidFrom(e.target.value)
                    setErrors({ ...errors, validFrom: '' })
                  }}
                  className={errors.validFrom ? 'border-red-500' : ''}
                />
                {errors.validFrom && (
                  <p className="text-sm text-red-500">{errors.validFrom}</p>
                )}
                <p className="text-sm text-muted-foreground">
                  The date from which this FTE value becomes effective
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setDialogOpen(false)
                  setPersonName('')
                  setFte('1.00')
                  setValidFrom(new Date().toISOString().split('T')[0])
                  setErrors({ personName: '', fte: '', validFrom: '' })
                }}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save FTE'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current FTE Values ({records.length})</CardTitle>
          <CardDescription>
            Currently active planned FTE values for all team members
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : records.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No FTE records found. Set your first FTE value to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Person Name</TableHead>
                  <TableHead>FTE Value</TableHead>
                  <TableHead>Valid From</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">{record.person_name}</TableCell>
                    <TableCell>
                      <span className="font-mono">{record.fte_value.toFixed(2)}</span>
                    </TableCell>
                    <TableCell>{formatDate(record.valid_from)}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-green-100 text-green-700">
                        Active
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(record)}
                      >
                        Update
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="text-blue-900 dark:text-blue-100">
            How FTE Management Works
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
          <p>
            <strong>Temporal Versioning:</strong> Each FTE change creates a new record. Old
            records are automatically closed (valid_to is set) when you create a new one.
          </p>
          <p>
            <strong>FTE Range:</strong> Values between 0.00 and 2.00, in increments of 0.05 (e.g.,
            0.05, 0.10, 0.15, ... 1.90, 1.95, 2.00).
          </p>
          <p>
            <strong>Valid From:</strong> The date when the new FTE value becomes effective. The
            previous record is automatically closed the day before.
          </p>
          <p>
            <strong>Audit Trail:</strong> All changes are logged in the audit log with old and new
            values.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
