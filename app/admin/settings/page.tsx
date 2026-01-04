'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Save } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Settings {
  default_period?: string
  data_range_start?: string
  data_range_end?: string
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Form state
  const [defaultPeriod, setDefaultPeriod] = useState('monthly')
  const [dataRangeStart, setDataRangeStart] = useState('')
  const [dataRangeEnd, setDataRangeEnd] = useState('')

  const { toast } = useToast()

  // Fetch settings
  const fetchSettings = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/settings')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch settings')
      }

      const settingsData = data.settings || {}
      setSettings(settingsData)

      // Set form values
      setDefaultPeriod(settingsData.default_period || 'monthly')
      setDataRangeStart(settingsData.data_range_start || '')
      setDataRangeEnd(settingsData.data_range_end || '')
    } catch (error) {
      console.error('Error fetching settings:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to fetch settings',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  // Save individual setting
  const saveSetting = async (key: string, value: string) => {
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key, value }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save setting')
      }

      return true
    } catch (error) {
      console.error('Error saving setting:', error)
      throw error
    }
  }

  // Save all settings
  const handleSaveAll = async () => {
    try {
      setSaving(true)

      // Save each setting
      await saveSetting('default_period', defaultPeriod)

      if (dataRangeStart) {
        await saveSetting('data_range_start', dataRangeStart)
      }

      if (dataRangeEnd) {
        await saveSetting('data_range_end', dataRangeEnd)
      }

      toast({
        title: 'Success',
        description: 'Settings saved successfully',
      })

      // Refresh settings
      await fetchSettings()
    } catch (error) {
      console.error('Error saving settings:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save settings',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Settings</h2>
        <p className="text-muted-foreground mt-1">
          Configure default period and data range settings
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Default Period</CardTitle>
          <CardDescription>
            Set the default time period for dashboard views and reports
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="defaultPeriod">Default Period</Label>
            <Select value={defaultPeriod} onValueChange={setDefaultPeriod}>
              <SelectTrigger id="defaultPeriod">
                <SelectValue placeholder="Select default period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              This will be the default period shown on dashboards and reports when users first load
              the page.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Range</CardTitle>
          <CardDescription>
            Configure the date range for available data in the application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="dataRangeStart">Start Date</Label>
              <Input
                id="dataRangeStart"
                type="date"
                value={dataRangeStart}
                onChange={(e) => setDataRangeStart(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                The earliest date for which data should be displayed
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dataRangeEnd">End Date</Label>
              <Input
                id="dataRangeEnd"
                type="date"
                value={dataRangeEnd}
                onChange={(e) => setDataRangeEnd(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                The latest date for which data should be displayed (leave empty for current date)
              </p>
            </div>
          </div>

          {dataRangeStart && dataRangeEnd && (
            <div className="rounded-md bg-blue-50 dark:bg-blue-950 p-4 border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                <strong>Data Range:</strong>{' '}
                {new Date(dataRangeStart).toLocaleDateString('cs-CZ', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}{' '}
                -{' '}
                {new Date(dataRangeEnd).toLocaleDateString('cs-CZ', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSaveAll} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Settings
            </>
          )}
        </Button>
      </div>

      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-base">Current Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-2">
            <div className="flex justify-between py-2 border-b">
              <dt className="text-muted-foreground">Default Period:</dt>
              <dd className="font-medium">{settings.default_period || 'Not set'}</dd>
            </div>
            <div className="flex justify-between py-2 border-b">
              <dt className="text-muted-foreground">Data Range Start:</dt>
              <dd className="font-medium">
                {settings.data_range_start
                  ? new Date(settings.data_range_start).toLocaleDateString('cs-CZ')
                  : 'Not set'}
              </dd>
            </div>
            <div className="flex justify-between py-2">
              <dt className="text-muted-foreground">Data Range End:</dt>
              <dd className="font-medium">
                {settings.data_range_end
                  ? new Date(settings.data_range_end).toLocaleDateString('cs-CZ')
                  : 'Not set'}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  )
}
