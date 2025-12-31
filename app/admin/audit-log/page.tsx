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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Download, ChevronLeft, ChevronRight, Filter, X } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

interface AuditLog {
  id: string
  user_email: string
  action: string
  entity_type: string
  entity_id: string
  details: any
  created_at: string
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

const ACTION_LABELS: Record<string, string> = {
  add_team_member: 'Added Team Member',
  remove_team_member: 'Removed Team Member',
  create_fte: 'Created FTE',
  update_fte: 'Updated FTE',
  create_keyword: 'Created Keyword',
  update_keyword: 'Updated Keyword',
  delete_keyword: 'Deleted Keyword',
  create_setting: 'Created Setting',
  update_setting: 'Updated Setting',
  upload_timesheet: 'Uploaded Timesheet',
}

const ACTION_COLORS: Record<string, string> = {
  add_team_member: 'bg-green-100 text-green-800',
  remove_team_member: 'bg-red-100 text-red-800',
  create_fte: 'bg-blue-100 text-blue-800',
  update_fte: 'bg-blue-100 text-blue-800',
  create_keyword: 'bg-purple-100 text-purple-800',
  update_keyword: 'bg-purple-100 text-purple-800',
  delete_keyword: 'bg-red-100 text-red-800',
  create_setting: 'bg-orange-100 text-orange-800',
  update_setting: 'bg-orange-100 text-orange-800',
  upload_timesheet: 'bg-cyan-100 text-cyan-800',
}

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  })

  // Filter state
  const [showFilters, setShowFilters] = useState(false)
  const [filterUserEmail, setFilterUserEmail] = useState('')
  const [filterAction, setFilterAction] = useState('')
  const [filterDateFrom, setFilterDateFrom] = useState('')
  const [filterDateTo, setFilterDateTo] = useState('')

  const { toast } = useToast()

  // Fetch audit logs
  const fetchLogs = async (page: number = 1) => {
    try {
      setLoading(true)

      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
      })

      if (filterUserEmail) params.append('user_email', filterUserEmail)
      if (filterAction) params.append('action', filterAction)
      if (filterDateFrom) params.append('date_from', filterDateFrom)
      if (filterDateTo) params.append('date_to', filterDateTo)

      const response = await fetch(`/api/admin/audit-log?${params.toString()}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch audit log')
      }

      setLogs(data.logs || [])
      setPagination(data.pagination)
    } catch (error) {
      console.error('Error fetching audit log:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to fetch audit log',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [])

  // Apply filters
  const handleApplyFilters = () => {
    fetchLogs(1) // Reset to page 1 when filtering
  }

  // Clear filters
  const handleClearFilters = () => {
    setFilterUserEmail('')
    setFilterAction('')
    setFilterDateFrom('')
    setFilterDateTo('')
    setTimeout(() => fetchLogs(1), 0)
  }

  // Export to CSV
  const handleExportCSV = async () => {
    try {
      setExporting(true)

      // Fetch all logs (no pagination)
      const params = new URLSearchParams({
        page: '1',
        limit: '10000', // Large limit to get all results
      })

      if (filterUserEmail) params.append('user_email', filterUserEmail)
      if (filterAction) params.append('action', filterAction)
      if (filterDateFrom) params.append('date_from', filterDateFrom)
      if (filterDateTo) params.append('date_to', filterDateTo)

      const response = await fetch(`/api/admin/audit-log?${params.toString()}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch audit log')
      }

      const allLogs = data.logs || []

      // Generate CSV
      const headers = ['Date', 'User', 'Action', 'Entity Type', 'Details']
      const rows = allLogs.map((log: AuditLog) => [
        new Date(log.created_at).toLocaleString('cs-CZ'),
        log.user_email,
        ACTION_LABELS[log.action] || log.action,
        log.entity_type,
        JSON.stringify(log.details),
      ])

      const csv = [
        headers.join(','),
        ...rows.map((row: string[]) =>
          row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',')
        ),
      ].join('\n')

      // Download CSV
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `audit-log-${new Date().toISOString().split('T')[0]}.csv`
      link.click()

      toast({
        title: 'Success',
        description: `Exported ${allLogs.length} audit log entries to CSV`,
      })
    } catch (error) {
      console.error('Error exporting CSV:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to export CSV',
        variant: 'destructive',
      })
    } finally {
      setExporting(false)
    }
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('cs-CZ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Format details
  const formatDetails = (details: any) => {
    if (!details) return '-'

    const entries = Object.entries(details)
      .slice(0, 3)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ')

    return entries || '-'
  }

  const activeFiltersCount =
    [filterUserEmail, filterAction, filterDateFrom, filterDateTo].filter(Boolean).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Audit Log</h2>
          <p className="text-muted-foreground mt-1">
            View history of all admin actions and changes
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="mr-2 h-4 w-4" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge className="ml-2" variant="secondary">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
          <Button variant="outline" onClick={handleExportCSV} disabled={exporting}>
            {exporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>Filter audit log entries</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="filterUserEmail">User Email</Label>
                <Input
                  id="filterUserEmail"
                  type="email"
                  placeholder="user@2fresh.cz"
                  value={filterUserEmail}
                  onChange={(e) => setFilterUserEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="filterAction">Action Type</Label>
                <Select value={filterAction || 'all'} onValueChange={(val) => setFilterAction(val === 'all' ? '' : val)}>
                  <SelectTrigger id="filterAction">
                    <SelectValue placeholder="All actions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All actions</SelectItem>
                    {Object.entries(ACTION_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="filterDateFrom">Date From</Label>
                <Input
                  id="filterDateFrom"
                  type="date"
                  value={filterDateFrom}
                  onChange={(e) => setFilterDateFrom(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="filterDateTo">Date To</Label>
                <Input
                  id="filterDateTo"
                  type="date"
                  value={filterDateTo}
                  onChange={(e) => setFilterDateTo(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={handleClearFilters}>
                <X className="mr-2 h-4 w-4" />
                Clear Filters
              </Button>
              <Button onClick={handleApplyFilters}>
                <Filter className="mr-2 h-4 w-4" />
                Apply Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Audit Log Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Audit Log Entries</CardTitle>
              <CardDescription>
                Total: {pagination.total} entries | Page {pagination.page} of{' '}
                {pagination.totalPages}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No audit log entries found
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Entity</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="whitespace-nowrap">
                        {formatDate(log.created_at)}
                      </TableCell>
                      <TableCell className="font-medium">{log.user_email}</TableCell>
                      <TableCell>
                        <Badge className={ACTION_COLORS[log.action] || 'bg-gray-100 text-gray-800'}>
                          {ACTION_LABELS[log.action] || log.action}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{log.entity_type}</TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-md truncate">
                        {formatDetails(log.details)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                  {pagination.total} entries
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchLogs(pagination.page - 1)}
                    disabled={!pagination.hasPrev || loading}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchLogs(pagination.page + 1)}
                    disabled={!pagination.hasNext || loading}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
