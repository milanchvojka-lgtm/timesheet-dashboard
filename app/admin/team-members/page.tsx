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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { UserPlus, Trash2, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface TeamMember {
  id: string
  email: string
  name: string | null
  created_at: string
}

export default function TeamMembersPage() {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Add member form state
  const [newEmail, setNewEmail] = useState('')
  const [newName, setNewName] = useState('')
  const [emailError, setEmailError] = useState('')

  const { toast } = useToast()

  // Fetch team members
  const fetchMembers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/team-members')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch team members')
      }

      setMembers(data.users || [])
    } catch (error) {
      console.error('Error fetching team members:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to fetch team members',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMembers()
  }, [])

  // Validate email
  const validateEmail = (email: string): boolean => {
    setEmailError('')

    if (!email) {
      setEmailError('Email is required')
      return false
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setEmailError('Invalid email format')
      return false
    }

    if (!email.endsWith('@2fresh.cz')) {
      setEmailError('Only @2fresh.cz email addresses are allowed')
      return false
    }

    return true
  }

  // Add team member
  const handleAddMember = async () => {
    if (!validateEmail(newEmail)) {
      return
    }

    try {
      setSubmitting(true)

      const response = await fetch('/api/admin/team-members', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: newEmail.toLowerCase().trim(),
          name: newName.trim() || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add team member')
      }

      toast({
        title: 'Success',
        description: `Team member ${newEmail} added successfully`,
      })

      // Reset form and close dialog
      setNewEmail('')
      setNewName('')
      setEmailError('')
      setAddDialogOpen(false)

      // Refresh members list
      await fetchMembers()
    } catch (error) {
      console.error('Error adding team member:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add team member',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  // Remove team member
  const handleRemoveMember = async () => {
    if (!selectedMember) return

    try {
      setSubmitting(true)

      const response = await fetch('/api/admin/team-members', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: selectedMember.id,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to remove team member')
      }

      toast({
        title: 'Success',
        description: `Team member ${selectedMember.email} removed successfully`,
      })

      // Close dialog and clear selection
      setDeleteDialogOpen(false)
      setSelectedMember(null)

      // Refresh members list
      await fetchMembers()
    } catch (error) {
      console.error('Error removing team member:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to remove team member',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  // Open delete confirmation dialog
  const confirmDelete = (member: TeamMember) => {
    setSelectedMember(member)
    setDeleteDialogOpen(true)
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('cs-CZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Team Members</h2>
          <p className="text-muted-foreground mt-1">
            Manage team member access to the application
          </p>
        </div>

        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Add Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Team Member</DialogTitle>
              <DialogDescription>
                Add a new team member to the application. Only @2fresh.cz email addresses are
                allowed.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john.doe@2fresh.cz"
                  value={newEmail}
                  onChange={(e) => {
                    setNewEmail(e.target.value)
                    setEmailError('')
                  }}
                  onBlur={() => validateEmail(newEmail)}
                  className={emailError ? 'border-red-500' : ''}
                />
                {emailError && <p className="text-sm text-red-500">{emailError}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Name (Optional)</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setAddDialogOpen(false)
                  setNewEmail('')
                  setNewName('')
                  setEmailError('')
                }}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button onClick={handleAddMember} disabled={submitting || !newEmail}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  'Add Member'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Team Members ({members.length})</CardTitle>
          <CardDescription>
            All team members with access to the application
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : members.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No team members found. Add your first member to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Added Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">{member.email}</TableCell>
                    <TableCell>{member.name || '-'}</TableCell>
                    <TableCell>{formatDate(member.created_at)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => confirmDelete(member)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove <strong>{selectedMember?.email}</strong> from the
              team? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setSelectedMember(null)
                setDeleteDialogOpen(false)
              }}
              disabled={submitting}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveMember}
              disabled={submitting}
              className="bg-red-600 hover:bg-red-700"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Removing...
                </>
              ) : (
                'Remove Member'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
