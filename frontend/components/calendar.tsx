import React from 'react'
import { Box, Typography, Avatar, AvatarGroup } from '@mui/material'
import { styled } from '@mui/material/styles'
import { Calendar as CalendarIcon, Clock, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { cn, formatDateLong, formatDateKey, isToday } from '@/lib/utils'
import type { Meeting } from '@/lib/mock-data'

interface CalendarProps {
  meetings: Meeting[]
  selectedMeeting: Meeting | null
  onSelectMeeting: (meeting: Meeting) => void
  showHistory?: boolean
  onToggleHistory?: () => void
  onSchedule?: () => void
  onInviteNylas?: () => void
}

// Styled components
const CalendarContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
}))

const CalendarHeader = styled(Box)(({ theme }) => ({
  padding: '24px',
  borderBottom: '1px solid #e8e8e8',
}))

const CalendarContent = styled(Box)(({ theme }) => ({
  padding: '16px',
  flex: 1,
  overflow: 'hidden',
}))

const MeetingButton = styled('button')<{ selected?: boolean }>(({ theme, selected }) => ({
  width: '100%',
  textAlign: 'left',
  padding: '12px',
  borderRadius: '10px',
  border: selected ? '1px solid #343434' : '1px solid #e8e8e8',
  backgroundColor: selected ? 'rgba(52, 52, 52, 0.1)' : '#f7f7f7',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: selected ? 'rgba(52, 52, 52, 0.15)' : 'rgba(247, 247, 247, 0.8)',
  },
}))

const TranscriptIndicator = styled('div')(({ theme }) => ({
  width: 8,
  height: 8,
  borderRadius: '50%',
  backgroundColor: '#343434',
  flexShrink: 0,
}))

export function Calendar({
  meetings,
  selectedMeeting,
  onSelectMeeting,
  showHistory,
  onToggleHistory,
  onSchedule,
  onInviteNylas,
}: CalendarProps) {
  // Group meetings by date
  const groupedMeetings = meetings.reduce(
    (acc, meeting) => {
      const dateKey = formatDateKey(meeting.date)
      if (!acc[dateKey]) {
        acc[dateKey] = []
      }
      acc[dateKey].push(meeting)
      return acc
    },
    {} as Record<string, Meeting[]>
  )

  const sortedDates = Object.keys(groupedMeetings).sort((a, b) => {
    return showHistory ? b.localeCompare(a) : a.localeCompare(b)
  })

  return (
    <CalendarContainer>
      <CalendarHeader>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#252525', mb: 1 }}>
          Calendar
        </Typography>
        <Typography variant="body2" sx={{ color: '#8e8e8e', mb: 3 }}>
          Your schedule
        </Typography>

        <Box sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
          <Button
            onClick={onSchedule}
            variant="default"
            size="sm"
            className="flex-1"
          >
            <CalendarIcon size={16} style={{ marginRight: 8 }} />
            Schedule
          </Button>
          <Button
            onClick={onInviteNylas}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            <UserPlus size={16} style={{ marginRight: 8 }} />
            Invite Nylas
          </Button>
        </Box>

        <Button
          onClick={onToggleHistory}
          variant="outline"
          size="sm"
          className="w-full"
        >
          <Clock size={16} style={{ marginRight: 8 }} />
          Meeting History
        </Button>
      </CalendarHeader>

      <CalendarContent>
        <ScrollArea style={{ height: '100%' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {sortedDates.map((dateKey) => {
              const date = new Date(dateKey)
              const isTodayDate = isToday(date)
              const dateMeetings = groupedMeetings[dateKey]

              return (
                <Box key={dateKey}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500, color: '#252525' }}>
                      {formatDateLong(date)}
                    </Typography>
                    {isTodayDate && (
                      <Badge variant="secondary" className="text-xs">
                        Today
                      </Badge>
                    )}
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {dateMeetings.map((meeting) => (
                      <MeetingButton
                        key={meeting.id}
                        selected={selectedMeeting?.id === meeting.id}
                        onClick={() => onSelectMeeting(meeting)}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 500,
                                color: '#252525',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {meeting.title}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#8e8e8e', mt: 0.5 }}>
                              {meeting.time}
                            </Typography>
                          </Box>
                          {meeting.hasTranscript && <TranscriptIndicator />}
                        </Box>
                        {meeting.attendees.length > 0 && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                            <AvatarGroup max={3} sx={{ '& .MuiAvatar-root': { width: 24, height: 24, fontSize: '0.75rem' } }}>
                              {meeting.attendees.slice(0, 3).map((attendee, i) => (
                                <Avatar key={i} sx={{ bgcolor: '#f7f7f7', color: '#8e8e8e' }}>
                                  {attendee.charAt(0)}
                                </Avatar>
                              ))}
                            </AvatarGroup>
                            {meeting.attendees.length > 3 && (
                              <Typography variant="caption" sx={{ color: '#8e8e8e', ml: 0.5 }}>
                                +{meeting.attendees.length - 3}
                              </Typography>
                            )}
                          </Box>
                        )}
                      </MeetingButton>
                    ))}
                  </Box>
                </Box>
              )
            })}
          </Box>
        </ScrollArea>
      </CalendarContent>
    </CalendarContainer>
  )
}
