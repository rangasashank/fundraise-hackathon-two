import React, { useState } from 'react'
import { Box, Typography, Container, Avatar, AvatarGroup } from '@mui/material'
import { styled } from '@mui/material/styles'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar } from '@/components/calendar'
import { ActionItems } from '@/components/action-items'
import { formatDate } from '@/lib/utils'
import { type Meeting, mockMeetings, pastMeetings } from '@/lib/mock-data'

// Styled components
const MainContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  minHeight: '100vh',
  backgroundColor: '#ffffff',
}))

const ContentArea = styled(Box)(({ theme }) => ({
  flex: 1,
  overflowY: 'auto',
}))

const UpcomingSection = styled(Box)(({ theme }) => ({
  borderBottom: '1px solid #e8e8e8',
  backgroundColor: '#ffffff',
}))

const MeetingCard = styled(Box)<{ clickable?: boolean }>(({ theme, clickable }) => ({
  flexShrink: 0,
  width: 320,
  backgroundColor: 'rgba(247, 247, 247, 0.5)',
  border: '1px solid #e8e8e8',
  borderRadius: 10,
  padding: 16,
  cursor: clickable ? 'pointer' : 'default',
  transition: 'all 0.2s ease',
  '&:hover': clickable ? {
    backgroundColor: '#f7f7f7',
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  } : {},
}))

const PastMeetingCard = styled(Box)(({ theme }) => ({
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

const CalendarSidebar = styled(Box)(({ theme }) => ({
  width: 384,
  borderLeft: '1px solid #e8e8e8',
  backgroundColor: '#ffffff',
  flexShrink: 0,
  [theme.breakpoints.down('lg')]: {
    display: 'none',
  },
}))

export default function MeetingsPage() {
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null)
  const [expandedMeeting, setExpandedMeeting] = useState<string | null>(null)
  const [showHistory, setShowHistory] = useState(false)
  const [showInviteDialog, setShowInviteDialog] = useState(false)

  const upcomingMeetings = mockMeetings.filter((m) => m.date >= new Date())
  const completedMeetings = [...mockMeetings, ...pastMeetings]
    .filter((m) => m.date < new Date() && m.hasTranscript)
    .sort((a, b) => b.date.getTime() - a.date.getTime())

  const allMeetings = showHistory
    ? [...mockMeetings, ...pastMeetings].filter((m) => m.date < new Date())
    : mockMeetings.filter((m) => m.date >= new Date())

  const getPriorityColor = (index: number) => {
    if (index === 0) return { backgroundColor: 'rgba(220, 38, 38, 0.1)', color: '#dc2626', borderColor: 'rgba(220, 38, 38, 0.2)' }
    if (index === 1) return { backgroundColor: 'rgba(249, 115, 22, 0.1)', color: '#f97316', borderColor: 'rgba(249, 115, 22, 0.2)' }
    return { backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', borderColor: 'rgba(59, 130, 246, 0.2)' }
  }

  const extractKeyPoints = (notes?: string) => {
    if (!notes) return []
    const lines = notes.split('\n').filter((line) => line.trim() && !line.includes(':') && line.trim() !== '')
    return lines.slice(0, 3)
  }

  return (
    <MainContainer>
      <ContentArea>
        <UpcomingSection>
          <Container maxWidth="xl" sx={{ py: 3 }}>
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
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#252525', flex: 1 }}>
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
                      <AvatarGroup max={3} sx={{ '& .MuiAvatar-root': { width: 28, height: 28, fontSize: '0.75rem' } }}>
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
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#252525', mb: 3 }}>
            Past Meetings
          </Typography>
          <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(2, 1fr)' } }}>
            {completedMeetings.map((meeting, index) => {
              const keyPoints = extractKeyPoints(meeting.notes)
              return (
                <PastMeetingCard
                  key={meeting.id}
                  onClick={() => {
                    setSelectedMeeting(meeting)
                    setExpandedMeeting(meeting.id)
                  }}
                >
                  <Box sx={{ position: 'relative', zIndex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#252525', flex: 1 }}>
                        {meeting.title}
                      </Typography>
                      <Badge variant="secondary" style={{ marginLeft: 8, flexShrink: 0 }}>
                        {formatDate(meeting.date)}
                      </Badge>
                    </Box>
                    <Typography variant="body2" sx={{ color: '#8e8e8e', mb: 2 }}>
                      {meeting.time}
                    </Typography>

                    {keyPoints.length > 0 && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" sx={{ color: '#8e8e8e', fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                          Key Points
                        </Typography>
                        <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                          {keyPoints.map((point, i) => (
                            <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                              <Badge
                                variant="outline"
                                style={{
                                  flexShrink: 0,
                                  ...getPriorityColor(i),
                                }}
                              >
                                {i + 1}
                              </Badge>
                              <Typography variant="body2" sx={{ color: '#252525', lineHeight: 1.4 }}>
                                {point.replace(/^[-•]\s*/, '')}
                              </Typography>
                            </Box>
                          ))}
                        </Box>
                      </Box>
                    )}

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pt: 2, borderTop: '1px solid #e8e8e8' }}>
                      <AvatarGroup max={4} sx={{ '& .MuiAvatar-root': { width: 32, height: 32, fontSize: '0.75rem' } }}>
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
        </Container>
      </ContentArea>

      <CalendarSidebar>
        <Calendar
          meetings={allMeetings}
          selectedMeeting={selectedMeeting}
          onSelectMeeting={setSelectedMeeting}
          showHistory={showHistory}
          onToggleHistory={() => setShowHistory(!showHistory)}
          onSchedule={() => console.log('Schedule meeting')}
          onInviteNylas={() => setShowInviteDialog(true)}
        />
      </CalendarSidebar>

      {/* Meeting Details Dialog */}
      <Dialog open={!!selectedMeeting} onOpenChange={(open) => !open && setSelectedMeeting(null)}>
        <DialogContent style={{ maxWidth: '800px', width: '90vw', maxHeight: '90vh' }}>
          <DialogHeader>
            <DialogClose onClick={() => setSelectedMeeting(null)} />
            <DialogTitle>{selectedMeeting?.title}</DialogTitle>
            <DialogDescription>
              {selectedMeeting && `${formatDate(selectedMeeting.date)} • ${selectedMeeting.time}`}
            </DialogDescription>
          </DialogHeader>

          {selectedMeeting && (
            <ScrollArea style={{ maxHeight: '60vh' }}>
              <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Attendees */}
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#252525', mb: 1 }}>
                    Attendees ({selectedMeeting.attendees.length})
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {selectedMeeting.attendees.map((attendee, i) => (
                      <Badge key={i} variant="secondary">
                        {attendee}
                      </Badge>
                    ))}
                  </Box>
                </Box>

                {/* Description */}
                {selectedMeeting.description && (
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#252525', mb: 1 }}>
                      Description
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#8e8e8e' }}>
                      {selectedMeeting.description}
                    </Typography>
                  </Box>
                )}

                {/* Action Items */}
                {selectedMeeting.hasTranscript && (
                  <ActionItems meeting={selectedMeeting} />
                )}

                {/* Meeting Notes */}
                {selectedMeeting.notes && (
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#252525', mb: 1 }}>
                      Meeting Summary
                    </Typography>
                    <Box sx={{ p: 2, backgroundColor: '#f7f7f7', borderRadius: '10px', border: '1px solid #e8e8e8' }}>
                      <Typography variant="body2" sx={{ color: '#252525', whiteSpace: 'pre-line' }}>
                        {selectedMeeting.notes}
                      </Typography>
                    </Box>
                  </Box>
                )}

                {/* Transcript */}
                {selectedMeeting.transcript && (
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#252525', mb: 1 }}>
                      Transcript
                    </Typography>
                    <Box sx={{ p: 2, backgroundColor: '#f7f7f7', borderRadius: '10px', border: '1px solid #e8e8e8', maxHeight: '300px', overflow: 'auto' }}>
                      <Typography variant="body2" sx={{ color: '#252525', whiteSpace: 'pre-line', fontFamily: 'monospace', fontSize: '0.8rem' }}>
                        {selectedMeeting.transcript}
                      </Typography>
                    </Box>
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
              Add the Nylas notetaker to your meeting for automatic transcription and note-taking.
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
            <Button onClick={() => {
              console.log('Inviting Nylas notetaker...')
              setShowInviteDialog(false)
            }}>
              Send Invitation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainContainer>
  )
}
