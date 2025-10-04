import React, { useState, useEffect, useCallback } from 'react'
import { Box, Typography, Container, Avatar, AvatarGroup, CircularProgress, Alert } from '@mui/material'
import { styled } from '@mui/material/styles'
import { Calendar as CalendarIcon, UserPlus, Search, ChevronLeft, ChevronRight, Video, Send, Plus, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatDate } from '@/lib/utils'
import { type Meeting } from '@/lib/types'
import { MeetingDetailsContent } from '@/components/meeting-details-content'
import * as api from '@/lib/api'
import { transformToMeetings, separateMeetings, filterMeetings } from '@/lib/dataTransformers'
import { useSSE } from '@/lib/useSSE'

// Styled components
const MainContainer = styled(Box)(() => ({
  minHeight: '100vh',
  backgroundColor: 'var(--surface-alt)',
}))

const UpcomingSection = styled(Box)(() => ({
  borderBottom: '1px solid var(--grey-200)',
  backgroundColor: 'var(--surface)',
  boxShadow: 'var(--shadow-sm)',
}))

const MeetingCard = styled(Box)<{ clickable?: boolean }>(({ clickable }) => ({
  flexShrink: 0,
  width: 320,
  backgroundColor: 'var(--surface)',
  border: '1px solid var(--grey-200)',
  borderLeft: '4px solid var(--brand-primary)',
  borderRadius: 'var(--radius-lg)',
  padding: 'var(--space-4)',
  cursor: clickable ? 'pointer' : 'default',
  transition: 'all var(--transition-normal)',
  boxShadow: 'var(--shadow-sm)',
  background: 'linear-gradient(135deg, var(--surface) 0%, var(--brand-primary-50) 100%)',
  '&:hover': clickable
    ? {
        background: 'linear-gradient(135deg, var(--surface) 0%, var(--brand-primary-100) 100%)',
        transform: 'translateY(-4px)',
        boxShadow: '0 8px 24px rgba(79, 195, 161, 0.15)',
        borderColor: 'var(--brand-primary-300)',
      }
    : {},
}))

const PastMeetingCard = styled(Box)(() => ({
  position: 'relative',
  background: 'linear-gradient(135deg, var(--surface) 0%, var(--surface-alt) 100%)',
  border: '1px solid var(--grey-200)',
  borderRadius: 'var(--radius-lg)',
  padding: 'var(--space-6)',
  cursor: 'pointer',
  overflow: 'hidden',
  transition: 'all var(--transition-normal)',
  boxShadow: 'var(--shadow-sm)',
  '&:hover': {
    boxShadow: '0 12px 32px rgba(79, 195, 161, 0.2)',
    transform: 'translateY(-4px) scale(1.01)',
    borderColor: 'var(--brand-primary-300)',
    background: 'linear-gradient(135deg, var(--surface) 0%, var(--brand-primary-100) 100%)',
    '&::before': {
      opacity: 1,
    },
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(135deg, var(--brand-primary-100) 0%, transparent 100%)',
    opacity: 0,
    transition: 'opacity var(--transition-normal)',
  },
}))

export default function MeetingsPage() {
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null)
  const [showInviteDialog, setShowInviteDialog] = useState(false)
  const [showScheduleDialog, setShowScheduleDialog] = useState(false)

  // Data state
  const [allMeetings, setAllMeetings] = useState<Meeting[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  // Invite notetaker state
  const [meetingLink, setMeetingLink] = useState('')
  const [inviting, setInviting] = useState(false)
  const [inviteError, setInviteError] = useState<string | null>(null)

  // Schedule meeting state
  const [newMeeting, setNewMeeting] = useState({
    title: '',
    date: '',
    time: '',
    description: '',
  })

  // Pagination and search state
  const [currentPage, setCurrentPage] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const meetingsPerPage = 4

  // Fetch meetings from backend
  const fetchMeetings = async () => {
    try {
      setError(null)
      const [sessionsResponse, transcriptsResponse] = await Promise.all([
        api.getSessions(),
        api.getTranscripts(),
      ])

      if (sessionsResponse.success && transcriptsResponse.success) {
        const meetings = transformToMeetings(sessionsResponse.data, transcriptsResponse.data)
        setAllMeetings(meetings)
      } else {
        throw new Error('Failed to fetch meetings data')
      }
    } catch (err: any) {
      console.error('Error fetching meetings:', err)
      setError(err.message || 'Failed to load meetings. Please try again.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Initial data fetch
  useEffect(() => {
    fetchMeetings()
  }, [])

  // Real-time updates with SSE
  const handleSessionUpdate = useCallback(() => {
    console.log('[Meetings] Session update received, refreshing data...')
    fetchMeetings()
  }, [])

  const handleTranscriptUpdate = useCallback(() => {
    console.log('[Meetings] Transcript update received, refreshing data...')
    fetchMeetings()
  }, [])

  useSSE({
    onSessionUpdate: handleSessionUpdate,
    onTranscriptUpdate: handleTranscriptUpdate,
    enabled: !loading, // Only enable SSE after initial load
  })

  // Refresh meetings
  const handleRefresh = () => {
    setRefreshing(true)
    fetchMeetings()
  }

  // Separate meetings into upcoming and past
  const { upcoming: upcomingMeetings, past: pastMeetings } = separateMeetings(allMeetings)

  // Apply search filter to past meetings
  const filteredCompletedMeetings = filterMeetings(pastMeetings, searchQuery)

  // Apply pagination
  const totalPages = Math.ceil(filteredCompletedMeetings.length / meetingsPerPage)
  const startIndex = currentPage * meetingsPerPage
  const endIndex = startIndex + meetingsPerPage
  const paginatedMeetings = filteredCompletedMeetings.slice(startIndex, endIndex)

  const getTruncatedSummary = (notes?: string) => {
    if (!notes) return ''

    // Look for "Key Topics Discussed:" section
    const keyTopicsRegex = /Key Topics Discussed:\s*\n?\s*([\s\S]+?)(?=\n\n[A-Z]|\n[A-Z][a-z]+:|\n\n|$)/i
    const keyTopicsMatch = notes.match(keyTopicsRegex)

    if (keyTopicsMatch && keyTopicsMatch[1]) {
      // Extract content after the colon
      let content = keyTopicsMatch[1].trim()

      // Remove bullet points and clean up
      content = content
        .split('\n')
        .map(line => line.trim().replace(/^[-•*]\s*/, ''))
        .filter(line => line.length > 0)
        .join(', ')

      // Truncate if too long
      if (content.length > 80) {
        content = content.substring(0, 80).replace(/\s+\S*$/, '') + '...'
      }

      return content
    }

    // Fallback to original logic if "Key Topics Discussed:" not found
    const lines = notes.split('\n').filter((line) => line.trim() !== '')
    const firstContentLine = lines.find((line) => !line.trim().endsWith(':'))
    if (!firstContentLine) return lines[0] || ''

    const truncated =
      firstContentLine.length > 80
        ? firstContentLine.substring(0, 80).replace(/\s+\S*$/, '') + '...'
        : firstContentLine
    return truncated.replace(/^[-•]\s*/, '')
  }

  // Form validation
  const isFormComplete = () => {
    const { title, date, time, description } = newMeeting
    return !!(title && date && time && description)
  }

  // Invite notetaker handler
  const handleInviteNotetaker = async () => {
    if (!meetingLink.trim()) {
      setInviteError('Please enter a meeting link')
      return
    }

    try {
      setInviting(true)
      setInviteError(null)

      const response = await api.inviteNotetaker({
        meetingLink: meetingLink.trim(),
        name: 'Nylas Notetaker',
      })

      if (response.success) {
        // Close dialog and refresh meetings
        setShowInviteDialog(false)
        setMeetingLink('')
        await fetchMeetings()
      } else {
        throw new Error(response.error || 'Failed to invite notetaker')
      }
    } catch (err: any) {
      console.error('Error inviting notetaker:', err)
      setInviteError(err.message || 'Failed to invite notetaker. Please check the meeting link and try again.')
    } finally {
      setInviting(false)
    }
  }

  // Calendar link generator
  const createCalendarLinks = () => {
    const { title, date, time, description } = newMeeting
    if (!title || !date || !time) return null

    const startDate = new Date(`${date}T${time}`)
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000)
    const startStr = startDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
    const endStr = endDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'

    const googleLink = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      title
    )}&dates=${startStr}/${endStr}&details=${encodeURIComponent(description)}`

    const outlookLink = `https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(
      title
    )}&body=${encodeURIComponent(description)}&startdt=${startDate.toISOString()}&enddt=${endDate.toISOString()}`

    return { googleLink, outlookLink }
  }

  return (
    <MainContainer>
      {/* Upcoming Meetings Section */}
      <UpcomingSection>
        <Container maxWidth="xl" sx={{ py: 3 }}>
          <Box sx={{ display: 'flex', gap: 1.5, mb: 3, alignItems: 'center' }}>
            <Button onClick={() => setShowScheduleDialog(true)} variant="default" size="sm">
              <CalendarIcon size={16} style={{ marginRight: 8 }} />
              Schedule
            </Button>
            <Button onClick={() => setShowInviteDialog(true)} variant="outline" size="sm">
              <UserPlus size={16} style={{ marginRight: 8 }} />
              Invite Nylas
            </Button>
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              disabled={refreshing}
            >
              <RefreshCw size={16} style={{ marginRight: 8 }} className={refreshing ? 'animate-spin' : ''} />
              Refresh
            </Button>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Typography variant="h5" sx={{ fontWeight: 600, color: 'var(--text-primary)', mb: 2 }}>
            Upcoming Meetings
          </Typography>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : upcomingMeetings.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" sx={{ color: 'var(--text-secondary)' }}>
                No upcoming meetings. Click "Invite Nylas" to add a notetaker to your next meeting.
              </Typography>
            </Box>
          ) : (
            <ScrollArea style={{ width: '100%' }}>
              <Box sx={{ display: 'flex', gap: 2, pb: 2 }}>
                {upcomingMeetings.map((meeting) => (
                  <MeetingCard
                    key={meeting.id}
                    clickable
                    onClick={() => setSelectedMeeting(meeting)}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {meeting.title}
                      </Typography>
                      <Badge variant="outline">{formatDate(meeting.date)}</Badge>
                    </Box>
                    <Typography variant="body2" sx={{ color: 'var(--text-secondary)', mb: 2 }}>
                      {meeting.time}
                    </Typography>
                    <AvatarGroup
                      max={3}
                      sx={{ '& .MuiAvatar-root': { width: 28, height: 28, fontSize: '0.75rem' } }}
                    >
                      {meeting.attendees.slice(0, 3).map((attendee, i) => (
                        <Avatar key={i}>{attendee.charAt(0)}</Avatar>
                      ))}
                    </AvatarGroup>
                  </MeetingCard>
                ))}
              </Box>
            </ScrollArea>
          )}
        </Container>
      </UpcomingSection>

      {/* Past Meetings Section */}
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 4, mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'var(--text-primary)' }}>
            Past Meetings
          </Typography>

          {/* Search Bar */}
          <Box sx={{ position: 'relative', width: 400, flex: 1, maxWidth: 500 }}>
            <Search
              size={20}
              style={{
                position: 'absolute',
                left: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-tertiary)',
              }}
            />
            <Input
              placeholder="Search meetings..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(0)
              }}
              style={{
                paddingLeft: 40,
                backgroundColor: 'var(--surface-hover)',
                border: '1px solid var(--grey-200)',
                borderRadius: 10,
                width: '100%',
              }}
            />
          </Box>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gap: 3,
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(2, 1fr)' },
            mb: 4,
          }}
        >
          {paginatedMeetings.map((meeting) => {
            const truncatedSummary = getTruncatedSummary(meeting.notes)
            return (
              <PastMeetingCard key={meeting.id} onClick={() => setSelectedMeeting(meeting)}>
                <Box sx={{ position: 'relative', zIndex: 1 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      mb: 1,
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 600, color: '#252525', flex: 1 }}
                    >
                      {meeting.title}
                    </Typography>
                    <Badge variant="secondary" style={{ marginLeft: 8, flexShrink: 0 }}>
                      {formatDate(meeting.date)}
                    </Badge>
                  </Box>
                  <Typography variant="body2" sx={{ color: '#8e8e8e', mb: 2 }}>
                    {meeting.time}
                  </Typography>

                  {truncatedSummary && (
                    <Box sx={{ mb: 2 }}>
                      <Typography
                        variant="caption"
                        sx={{
                          color: '#8e8e8e',
                          fontWeight: 500,
                          textTransform: 'uppercase',
                          letterSpacing: 0.5,
                        }}
                      >
                        Key Takeaways
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: '#252525',
                          lineHeight: 1.4,
                          mt: 1,
                          fontStyle: 'italic',
                        }}
                      >
                        {truncatedSummary}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </PastMeetingCard>
            )
          })}
        </Box>

        {/* Pagination Controls */}
        {filteredCompletedMeetings.length > meetingsPerPage && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 2,
              mt: 4,
            }}
          >
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
              disabled={currentPage === 0}
            >
              <ChevronLeft size={16} style={{ marginRight: 4 }} />
              Previous
            </Button>

            <Typography variant="body2" sx={{ color: '#8e8e8e' }}>
              Page {currentPage + 1} of {totalPages}
            </Typography>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
              disabled={currentPage >= totalPages - 1}
            >
              Next
              <ChevronRight size={16} style={{ marginLeft: 4 }} />
            </Button>
          </Box>
        )}
      </Container>

      {/* Schedule Meeting Dialog */}
      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogClose onClick={() => setShowScheduleDialog(false)} />
            <DialogTitle>
              <Box className="modal-title-with-icon">
                <Box className="icon-container-primary">
                  <CalendarIcon size={20} color="var(--brand-primary)" />
                </Box>
                Schedule a Meeting
              </Box>
            </DialogTitle>
            <DialogDescription>
              Fill out the details below to schedule a new meeting or add it to your calendar.
            </DialogDescription>
          </DialogHeader>

          <Box sx={{ py: 2, px: 3, display: 'flex', flexDirection: 'column', gap: 0 }}>
            <Box className="modal-form-field">
              <Label htmlFor="meeting-title">Title</Label>
              <Input
                id="meeting-title"
                placeholder="Project sync-up"
                value={newMeeting.title}
                onChange={(e) => setNewMeeting({ ...newMeeting, title: e.target.value })}
                className="modal-form-field input"
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Box sx={{ flex: 1 }} className="modal-form-field">
                <Label htmlFor="meeting-date">Date</Label>
                <Input
                  id="meeting-date"
                  type="date"
                  value={newMeeting.date}
                  onChange={(e) => setNewMeeting({ ...newMeeting, date: e.target.value })}
                  className="modal-form-field input"
                />
              </Box>
              <Box sx={{ flex: 1 }} className="modal-form-field">
                <Label htmlFor="meeting-time">Time</Label>
                <Input
                  id="meeting-time"
                  type="time"
                  value={newMeeting.time}
                  onChange={(e) => setNewMeeting({ ...newMeeting, time: e.target.value })}
                  className="modal-form-field input"
                />
              </Box>
            </Box>

            <Box className="modal-form-field">
              <Label htmlFor="meeting-description">Description</Label>
              <Input
                id="meeting-description"
                placeholder="Add meeting notes or agenda"
                value={newMeeting.description}
                onChange={(e) => setNewMeeting({ ...newMeeting, description: e.target.value })}
                className="modal-form-field input"
              />
            </Box>
          </Box>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowScheduleDialog(false)}
              className="modal-btn-secondary"
            >
              Cancel
            </Button>

            <Button
              variant="outline"
              disabled={!isFormComplete()}
              onClick={() => {
                const links = createCalendarLinks()
                if (links) {
                  window.open(links.googleLink, '_blank', 'noopener,noreferrer')
                }
              }}
              className="modal-btn-secondary"
              style={{
                opacity: isFormComplete() ? 1 : 0.5,
                cursor: isFormComplete() ? 'pointer' : 'not-allowed'
              }}
            >
              <CalendarIcon size={16} />
              Add to Google Calendar
            </Button>

            <Button
              variant="outline"
              disabled={!isFormComplete()}
              onClick={() => {
                const links = createCalendarLinks()
                if (links) {
                  window.open(links.outlookLink, '_blank', 'noopener,noreferrer')
                }
              }}
              className="modal-btn-secondary"
              style={{
                opacity: isFormComplete() ? 1 : 0.5,
                cursor: isFormComplete() ? 'pointer' : 'not-allowed'
              }}
            >
              <CalendarIcon size={16} />
              Add to Outlook
            </Button>

            <Button
              disabled={!isFormComplete()}
              onClick={() => {
                if (isFormComplete()) {
                  alert('Meeting scheduled internally!')
                  setShowScheduleDialog(false)
                }
              }}
              className="modal-btn-primary"
              style={{
                opacity: isFormComplete() ? 1 : 0.5,
                cursor: isFormComplete() ? 'pointer' : 'not-allowed'
              }}
            >
              <Plus size={16} />
              Create Custom Meeting
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Meeting Details Dialog */}
      <Dialog
        open={!!selectedMeeting}
        onOpenChange={(open) => !open && setSelectedMeeting(null)}
      >
        <DialogContent style={{
          maxWidth: selectedMeeting?.hasTranscript || selectedMeeting?.summaryText || selectedMeeting?.actionItems?.length ? '1500px' : '750px',
          width: selectedMeeting?.hasTranscript || selectedMeeting?.summaryText || selectedMeeting?.actionItems?.length ? '92vw' : '88vw',
          maxHeight: '95vh',
          padding: selectedMeeting?.hasTranscript || selectedMeeting?.summaryText || selectedMeeting?.actionItems?.length ? 0 : undefined,
          overflowX: 'hidden',
          overflowY: 'auto',
          boxSizing: 'border-box',
          margin: '0 auto'
        }}>
          <DialogHeader style={{ padding: selectedMeeting?.hasTranscript || selectedMeeting?.summaryText || selectedMeeting?.actionItems?.length ? '24px 24px 0 24px' : undefined }}>
            <DialogClose onClick={() => setSelectedMeeting(null)} />
            <DialogTitle>{selectedMeeting?.title}</DialogTitle>
            <DialogDescription>
              {selectedMeeting &&
                `${formatDate(selectedMeeting.date)} • ${selectedMeeting.time}`}
            </DialogDescription>
          </DialogHeader>

          {selectedMeeting && (
            (selectedMeeting.hasTranscript || selectedMeeting.summaryText || selectedMeeting.actionItems?.length) ? (
              <MeetingDetailsContent meeting={selectedMeeting} />
            ) : (
              <ScrollArea style={{ maxHeight: '60vh', overflowX: 'hidden' }}>
                <Box sx={{
                  p: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 3,
                  maxWidth: '100%',
                  width: '100%',
                  boxSizing: 'border-box',
                  overflowWrap: 'break-word',
                  wordWrap: 'break-word'
                }}>
                  {/* Attendees */}
                  <Box>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 600, color: '#252525', mb: 1 }}
                    >
                      Attendees ({selectedMeeting.attendees.length})
                    </Typography>
                    <Box sx={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 1,
                      maxWidth: '100%',
                      width: '100%'
                    }}>
                      {selectedMeeting.attendees.map((attendee, i) => (
                        <Badge key={i} variant="secondary" style={{
                          maxWidth: '200px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {attendee}
                        </Badge>
                      ))}
                    </Box>
                  </Box>

                  {/* Description */}
                  {selectedMeeting.description && (
                    <Box>
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: 600, color: '#252525', mb: 1 }}
                      >
                        Description
                      </Typography>
                      <Typography variant="body2" sx={{
                        color: '#8e8e8e',
                        overflowWrap: 'break-word',
                        wordWrap: 'break-word',
                        maxWidth: '100%'
                      }}>
                        {selectedMeeting.description}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </ScrollArea>
            )
          )}
        </DialogContent>
      </Dialog>

      {/* Invite Nylas Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogClose onClick={() => {
              setShowInviteDialog(false)
              setMeetingLink('')
              setInviteError(null)
            }} />
            <DialogTitle>
              <Box className="modal-title-with-icon">
                <Box className="icon-container-accent">
                  <Video size={20} color="var(--brand-accent)" />
                </Box>
                Invite Nylas Notetaker
              </Box>
            </DialogTitle>
            <DialogDescription>
              Add the Nylas notetaker to your meeting for automatic transcription and note-taking.
              Supports Zoom, Google Meet, and Microsoft Teams.
            </DialogDescription>
          </DialogHeader>

          <Box sx={{ py: 2, px: 3, display: 'flex', flexDirection: 'column', gap: 0 }}>
            {inviteError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {inviteError}
              </Alert>
            )}

            <Box className="modal-form-field">
              <Label htmlFor="meeting-link">Meeting Link *</Label>
              <Input
                id="meeting-link"
                placeholder="https://zoom.us/j/123456789 or https://meet.google.com/abc-defg-hij"
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
                className="modal-form-field input"
                disabled={inviting}
              />
              <Typography variant="caption" sx={{ color: 'var(--text-secondary)', mt: 0.5 }}>
                Enter your Zoom, Google Meet, or Microsoft Teams meeting link
              </Typography>
            </Box>
          </Box>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowInviteDialog(false)
                setMeetingLink('')
                setInviteError(null)
              }}
              className="modal-btn-secondary"
              disabled={inviting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleInviteNotetaker}
              className="modal-btn-primary"
              disabled={inviting || !meetingLink.trim()}
            >
              {inviting ? (
                <>
                  <CircularProgress size={16} sx={{ mr: 1, color: 'white' }} />
                  Inviting...
                </>
              ) : (
                <>
                  <Send size={16} />
                  Send Invitation
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainContainer>
  )
}
