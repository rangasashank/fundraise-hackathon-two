import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { Box, Typography, Container, Avatar, AvatarGroup } from '@mui/material'
import { styled } from '@mui/material/styles'
import { Calendar as CalendarIcon, UserPlus, Search, ChevronLeft, ChevronRight, Video, Send, Plus } from 'lucide-react'
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
import { type Meeting, mockMeetings, pastMeetings } from '@/lib/mock-data'
import { MeetingDetailsContent } from '@/components/meeting-details-content'
import { InsightAgentSidebar } from '@/components/insight-agent-sidebar'

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
  const router = useRouter()
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null)
  const [showInviteDialog, setShowInviteDialog] = useState(false)
  const [showScheduleDialog, setShowScheduleDialog] = useState(false)

  // Handle meeting query parameter from URL
  useEffect(() => {
    const meetingId = router.query.meeting as string
    if (meetingId) {
      const allMeetings = [...mockMeetings, ...pastMeetings]
      const meeting = allMeetings.find(m => m.id === meetingId)
      if (meeting) {
        setSelectedMeeting(meeting)
      }
    }
  }, [router.query.meeting])

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

  // Insight Agent sidebar state
  const [isInsightSidebarOpen, setIsInsightSidebarOpen] = useState(false)

  // Generate tasks for insights analysis
  const generateTasksForInsights = () => {
    const allMeetings = [...mockMeetings, ...pastMeetings]
    const tasks: any[] = []

    allMeetings.forEach((meeting) => {
      if (meeting.hasTranscript && meeting.notes) {
        // Extract action items from notes
        const actionItemsMatch = meeting.notes.match(/Action Items?:([\s\S]*?)(?=\n\n|$)/i)
        if (actionItemsMatch) {
          const items = actionItemsMatch[1].split('\n').filter((line) => line.trim().startsWith('-'))
          items.forEach((item, index) => {
            const taskText = item.replace(/^-\s*/, '').trim()
            const assigneeMatch = taskText.match(/\(([^)]+)\s*-/)
            const dueDateMatch = taskText.match(/Due:?\s*([^)]+)\)/)

            const assignee = assigneeMatch ? assigneeMatch[1].trim() : meeting.attendees[index % meeting.attendees.length]
            const taskTitle = taskText.split('(')[0].trim()

            tasks.push({
              id: `${meeting.id}-task-${index}`,
              title: taskTitle,
              description: `From ${meeting.title}`,
              assignee,
              dueDate: dueDateMatch
                ? dueDateMatch[1]
                : new Date(meeting.date.getTime() + 7 * 86400000).toISOString().split('T')[0],
              priority: index === 0 ? 'high' : index === 1 ? 'medium' : 'low',
              status:
                meeting.date < new Date(Date.now() - 86400000 * 7)
                  ? 'completed'
                  : index % 3 === 0
                    ? 'in-progress'
                    : 'todo',
              meetingId: meeting.id,
              meetingTitle: meeting.title,
            })
          })
        }
      }
    })

    return tasks
  }

  const upcomingMeetings = mockMeetings.filter((m) => m.date >= new Date())

  // Filter and paginate past meetings
  const allCompletedMeetings = [...mockMeetings, ...pastMeetings]
    .filter((m) => m.date < new Date() && m.hasTranscript)
    .sort((a, b) => b.date.getTime() - a.date.getTime())

  // Apply search filter
  const filteredCompletedMeetings = allCompletedMeetings.filter((meeting) => {
    if (!searchQuery.trim()) return true
    const query = searchQuery.toLowerCase()
    return (
      meeting.title.toLowerCase().includes(query) ||
      meeting.attendees.some((attendee) => attendee.toLowerCase().includes(query)) ||
      (meeting.notes && meeting.notes.toLowerCase().includes(query)) ||
      (meeting.description && meeting.description.toLowerCase().includes(query))
    )
  })

  // Apply pagination
  const totalPages = Math.ceil(filteredCompletedMeetings.length / meetingsPerPage)
  const startIndex = currentPage * meetingsPerPage
  const endIndex = startIndex + meetingsPerPage
  const paginatedMeetings = filteredCompletedMeetings.slice(startIndex, endIndex)

  const getTruncatedSummary = (notes?: string) => {
    if (!notes) return ''
    const lines = notes.split('\n').filter((line) => line.trim() !== '')
    const firstContentLine = lines.find((line) => !line.trim().endsWith(':'))
    if (!firstContentLine) return lines[0]
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
    <>
      <MainContainer sx={{
        paddingRight: isInsightSidebarOpen ? '420px' : '20px',
        transition: 'padding-right var(--transition-normal)',
        '@media (max-width: 768px)': {
          paddingRight: isInsightSidebarOpen ? '0px' : '20px',
        }
      }}>
      {/* Upcoming Meetings Section */}
      <UpcomingSection>
        <Container maxWidth="xl" sx={{ py: 3 }}>
          <Box sx={{ display: 'flex', gap: 1.5, mb: 3 }}>
            <Button onClick={() => setShowScheduleDialog(true)} variant="default" size="sm">
              <CalendarIcon size={16} style={{ marginRight: 8 }} />
              Schedule
            </Button>
            <Button onClick={() => setShowInviteDialog(true)} variant="outline" size="sm">
              <UserPlus size={16} style={{ marginRight: 8 }} />
              Invite Nylas
            </Button>
          </Box>

          <Typography variant="h5" sx={{ fontWeight: 600, color: 'var(--text-primary)', mb: 2 }}>
            Upcoming Meetings
          </Typography>

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
          maxWidth: selectedMeeting?.hasTranscript ? '1500px' : '750px',
          width: selectedMeeting?.hasTranscript ? '92vw' : '88vw',
          maxHeight: selectedMeeting?.hasTranscript ? '95vh' : '90vh',
          padding: selectedMeeting?.hasTranscript ? 0 : undefined,
          overflowX: 'hidden',
          overflowY: 'auto',
          boxSizing: 'border-box',
          margin: '0 auto'
        }}>
          <DialogHeader style={{ padding: selectedMeeting?.hasTranscript ? '24px 24px 0 24px' : undefined }}>
            <DialogClose onClick={() => setSelectedMeeting(null)} />
            <DialogTitle>{selectedMeeting?.title}</DialogTitle>
            <DialogDescription>
              {selectedMeeting &&
                `${formatDate(selectedMeeting.date)} • ${selectedMeeting.time}`}
            </DialogDescription>
          </DialogHeader>

          {selectedMeeting && (
            selectedMeeting.hasTranscript ? (
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

                  {/* View in Tasks Button */}
                  <Box sx={{ pt: 2, borderTop: '1px solid var(--grey-200)' }}>
                    <Button
                      variant="outline"
                      onClick={() => router.push(`/tasks?meeting=${selectedMeeting.id}`)}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        px: 3,
                        py: 1.5,
                        borderColor: 'var(--brand-primary-300)',
                        color: 'var(--brand-primary-600)',
                        '&:hover': {
                          backgroundColor: 'var(--brand-primary-50)',
                          borderColor: 'var(--brand-primary-400)',
                        }
                      }}
                    >
                      <Video size={16} />
                      View Tasks from this Meeting
                    </Button>
                  </Box>
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
            <DialogClose onClick={() => setShowInviteDialog(false)} />
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
            </DialogDescription>
          </DialogHeader>

          <Box sx={{ py: 2, px: 3, display: 'flex', flexDirection: 'column', gap: 0 }}>
            <Box className="modal-form-field">
              <Label htmlFor="meeting-link">Meeting Link</Label>
              <Input
                id="meeting-link"
                placeholder="https://zoom.us/j/123456789"
                className="modal-form-field input"
              />
            </Box>
            <Box className="modal-form-field">
              <Label htmlFor="notetaker-name">Notetaker Name</Label>
              <Input
                id="notetaker-name"
                defaultValue="Nylas Notetaker"
                className="modal-form-field input"
              />
            </Box>
          </Box>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowInviteDialog(false)}
              className="modal-btn-secondary"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                console.log('Inviting Nylas notetaker...')
                setShowInviteDialog(false)
              }}
              className="modal-btn-primary"
            >
              <Send size={16} />
              Send Invitation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainContainer>

    {/* Insight Agent Sidebar */}
    <InsightAgentSidebar
      meetings={[...mockMeetings, ...pastMeetings]}
      tasks={generateTasksForInsights()}
      isOpen={isInsightSidebarOpen}
      onToggle={() => setIsInsightSidebarOpen(!isInsightSidebarOpen)}
    />
  </>
  )
}
