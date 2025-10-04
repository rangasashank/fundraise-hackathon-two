import React, { useState, useEffect } from 'react'
import { Box, Typography, Container, Avatar, AvatarGroup } from '@mui/material'
import { styled } from '@mui/material/styles'
import { Calendar as CalendarIcon, UserPlus, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ActionItems } from '@/components/action-items'
import { formatDate } from '@/lib/utils'
import { type Meeting, mockMeetings, pastMeetings } from '@/lib/mock-data'

// Styled components
const MainContainer = styled(Box)(() => ({
  minHeight: '100vh',
  backgroundColor: '#ffffff',
}))

const UpcomingSection = styled(Box)(() => ({
  borderBottom: '1px solid #e8e8e8',
  backgroundColor: '#ffffff',
}))

const MeetingCard = styled(Box)<{ clickable?: boolean }>(({ clickable }) => ({
  flexShrink: 0,
  width: 320,
  backgroundColor: 'rgba(247, 247, 247, 0.5)',
  border: '1px solid #e8e8e8',
  borderRadius: 10,
  padding: 16,
  cursor: clickable ? 'pointer' : 'default',
  transition: 'all 0.2s ease',
  '&:hover': clickable
    ? {
        backgroundColor: '#f7f7f7',
        transform: 'translateY(-2px)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      }
    : {},
}))

const PastMeetingCard = styled(Box)(() => ({
  position: 'relative',
  background: 'linear-gradient(135deg, #ffffff 0%, rgba(247, 247, 247, 0.3) 100%)',
  border: '1px solid #e8e8e8',
  borderRadius: 12,
  padding: 24,
  cursor: 'pointer',
  overflow: 'hidden',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
    transform: 'scale(1.02)',
    '&::before': {
      opacity: 1,
    },
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(135deg, rgba(52, 52, 52, 0.05) 0%, transparent 100%)',
    opacity: 0,
    transition: 'opacity 0.3s ease',
  },
}))

export default function MeetingsPage() {
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null)
  const [showInviteDialog, setShowInviteDialog] = useState(false)
  const [showTranscript, setShowTranscript] = useState(false)

  // Pagination and search state
  const [currentPage, setCurrentPage] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const meetingsPerPage = 4

  // Reset transcript view when opening a different meeting
  useEffect(() => {
    setShowTranscript(false)
  }, [selectedMeeting])

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
      meeting.attendees.some(attendee => attendee.toLowerCase().includes(query)) ||
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
    // Get the first meaningful sentence or line from the notes
    const lines = notes.split('\n').filter((line) => line.trim() !== '')
    if (lines.length === 0) return ''

    // Find the first line that's not a header (doesn't end with ':')
    const firstContentLine = lines.find((line) => !line.trim().endsWith(':'))
    if (!firstContentLine) return lines[0] // Fallback to first line

    // Truncate to approximately 80 characters, breaking at word boundaries
    const truncated = firstContentLine.length > 80
      ? firstContentLine.substring(0, 80).replace(/\s+\S*$/, '') + '...'
      : firstContentLine

    return truncated.replace(/^[-•]\s*/, '') // Remove bullet points
  }

  return (
    <MainContainer>
      <UpcomingSection>
        <Container maxWidth="xl" sx={{ py: 3 }}>
          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 1.5, mb: 3 }}>
            <Button onClick={() => console.log('Schedule meeting')} variant="default" size="sm">
              <CalendarIcon size={16} style={{ marginRight: 8 }} />
              Schedule
            </Button>
            <Button onClick={() => setShowInviteDialog(true)} variant="outline" size="sm">
              <UserPlus size={16} style={{ marginRight: 8 }} />
              Invite Nylas
            </Button>
          </Box>

          <Typography variant="h5" sx={{ fontWeight: 600, color: '#252525', mb: 2 }}>
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
                    <Badge variant="outline" style={{ marginLeft: 8, flexShrink: 0 }}>
                      {formatDate(meeting.date)}
                    </Badge>
                  </Box>
                  <Typography variant="body2" sx={{ color: '#8e8e8e', mb: 2 }}>
                    {meeting.time}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AvatarGroup
                      max={3}
                      sx={{ '& .MuiAvatar-root': { width: 28, height: 28, fontSize: '0.75rem' } }}
                    >
                      {meeting.attendees.slice(0, 3).map((attendee, i) => (
                        <Avatar
                          key={i}
                          sx={{
                            bgcolor: 'rgba(52, 52, 52, 0.2)',
                            color: '#343434',
                            border: '2px solid #ffffff',
                          }}
                        >
                          {attendee.charAt(0)}
                        </Avatar>
                      ))}
                    </AvatarGroup>
                    {meeting.attendees.length > 3 && (
                      <Typography variant="caption" sx={{ color: '#8e8e8e' }}>
                        +{meeting.attendees.length - 3} more
                      </Typography>
                    )}
                  </Box>
                </MeetingCard>
              ))}
            </Box>
          </ScrollArea>
        </Container>
      </UpcomingSection>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 4, mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#252525' }}>
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
                color: '#8e8e8e'
              }}
            />
            <Input
              placeholder="Search meetings..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(0) // Reset to first page when searching
              }}
              style={{
                paddingLeft: 40,
                backgroundColor: '#f7f7f7',
                border: '1px solid #e8e8e8',
                borderRadius: 10,
                width: '100%'
              }}
            />
          </Box>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gap: 3,
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(2, 1fr)' },
            mb: 4
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
                          fontStyle: 'italic'
                        }}
                      >
                        {truncatedSummary}
                      </Typography>
                    </Box>
                  )}

                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      pt: 2,
                      borderTop: '1px solid #e8e8e8',
                    }}
                  >
                    <AvatarGroup
                      max={4}
                      sx={{ '& .MuiAvatar-root': { width: 32, height: 32, fontSize: '0.75rem' } }}
                    >
                      {meeting.attendees.slice(0, 4).map((attendee, i) => (
                        <Avatar
                          key={i}
                          title={attendee}
                          sx={{
                            bgcolor: 'rgba(52, 52, 52, 0.2)',
                            color: '#343434',
                            border: '2px solid #ffffff',
                          }}
                        >
                          {attendee.charAt(0)}
                        </Avatar>
                      ))}
                    </AvatarGroup>
                    {meeting.attendees.length > 4 && (
                      <Typography variant="caption" sx={{ color: '#8e8e8e' }}>
                        +{meeting.attendees.length - 4}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </PastMeetingCard>
            )
          })}
        </Box>

        {/* Pagination Controls */}
        {filteredCompletedMeetings.length > meetingsPerPage && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, mt: 4 }}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
              disabled={currentPage === 0}
            >
              <ChevronLeft size={16} style={{ marginRight: 4 }} />
              Previous
            </Button>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" sx={{ color: '#8e8e8e' }}>
                Page {currentPage + 1} of {totalPages}
              </Typography>
            </Box>

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

        {/* No results message */}
        {filteredCompletedMeetings.length === 0 && searchQuery.trim() && (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="body1" sx={{ color: '#8e8e8e', mb: 1 }}>
              No meetings found matching "{searchQuery}"
            </Typography>
            <Typography variant="body2" sx={{ color: '#8e8e8e' }}>
              Try adjusting your search terms
            </Typography>
          </Box>
        )}
      </Container>

      {/* Meeting Details Dialog */}
      <Dialog
        open={!!selectedMeeting}
        onOpenChange={(open) => !open && setSelectedMeeting(null)}
      >
        <DialogContent style={{ maxWidth: '800px', width: '90vw', maxHeight: '90vh' }}>
          <DialogHeader>
            <DialogClose onClick={() => setSelectedMeeting(null)} />
            <DialogTitle>{selectedMeeting?.title}</DialogTitle>
            <DialogDescription>
              {selectedMeeting &&
                `${formatDate(selectedMeeting.date)} • ${selectedMeeting.time}`}
            </DialogDescription>
          </DialogHeader>

          {selectedMeeting && (
            <ScrollArea style={{ maxHeight: '60vh' }}>
              <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Attendees */}
                
              
                {/* Description */}
                {selectedMeeting.description && (
                  <Box>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 600, color: '#252525', mb: 1 }}
                    >
                      Description
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#8e8e8e' }}>
                      {selectedMeeting.description}
                    </Typography>
                  </Box>
                )}

                {/* Action Items */}
                {selectedMeeting.hasTranscript && <ActionItems meeting={selectedMeeting} />}

                {/* Meeting Notes */}
                {selectedMeeting.notes && (
                  <Box>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 600, color: '#252525', mb: 1 }}
                    >
                      Meeting Summary
                    </Typography>
                    <Box
                      sx={{
                        p: 2,
                        backgroundColor: '#f7f7f7',
                        borderRadius: '10px',
                        border: '1px solid #e8e8e8',
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ color: '#252525', whiteSpace: 'pre-line' }}
                      >
                        {selectedMeeting.notes}
                      </Typography>
                    </Box>
                  </Box>
                )}

                {/* Transcript */}
                {selectedMeeting.transcript && (
                  <Box>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 1,
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: 600, color: '#252525' }}
                      >
                        Transcript
                      </Typography>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowTranscript(!showTranscript)}
                      >
                        {showTranscript ? 'Hide' : 'Show'}
                      </Button>
                    </Box>

                    {showTranscript && (
                      <Box
                        sx={{
                          p: 2,
                          backgroundColor: '#f7f7f7',
                          borderRadius: '10px',
                          border: '1px solid #e8e8e8',
                          maxHeight: '300px',
                          overflow: 'auto',
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            color: '#252525',
                            whiteSpace: 'pre-line',
                            fontFamily: 'monospace',
                            fontSize: '0.8rem',
                          }}
                        >
                          {selectedMeeting.transcript}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                )}
              </Box>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>

      {/* Invite Nylas Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogClose onClick={() => setShowInviteDialog(false)} />
            <DialogTitle>Invite Nylas Notetaker</DialogTitle>
            <DialogDescription>
              Add the Nylas notetaker to your meeting for automatic transcription and
              note-taking.
            </DialogDescription>
          </DialogHeader>

          <Box sx={{ py: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box>
              <Label htmlFor="meeting-link">Meeting Link</Label>
              <Input
                id="meeting-link"
                placeholder="https://zoom.us/j/123456789"
                style={{ marginTop: 8 }}
              />
            </Box>
            <Box>
              <Label htmlFor="notetaker-name">Notetaker Name</Label>
              <Input
                id="notetaker-name"
                defaultValue="Nylas Notetaker"
                style={{ marginTop: 8 }}
              />
            </Box>
          </Box>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                console.log('Inviting Nylas notetaker...')
                setShowInviteDialog(false)
              }}
            >
              Send Invitation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainContainer>
  )
}
