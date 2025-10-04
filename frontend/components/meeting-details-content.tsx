import React, { useState } from 'react'
import { Box, Typography } from '@mui/material'
import { styled } from '@mui/material/styles'
import { Users, Zap, FileText, MessageSquare, User, Calendar, Clock } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import type { Meeting } from '@/lib/mock-data'

interface MeetingDetailsContentProps {
  meeting: Meeting
}

const ContentContainer = styled(ScrollArea)(() => ({
  height: '80vh',
  width: '100%',
}))

const Section = styled(Box)(() => ({
  marginBottom: '32px',
  '&:last-child': {
    marginBottom: 0,
  },
}))

const SectionHeader = styled(Box)(() => ({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  marginBottom: '16px',
  paddingBottom: '8px',
  borderBottom: '2px solid #f1f5f9',
}))

const SectionTitle = styled(Typography)(() => ({
  fontSize: '1.1rem',
  fontWeight: 600,
  color: '#252525',
}))

const ContentBox = styled(Box)(() => ({
  backgroundColor: '#f8f9fa',
  border: '1px solid #e8e8e8',
  borderRadius: '12px',
  padding: '20px',
  marginTop: '12px',
}))

export function MeetingDetailsContent({ meeting }: MeetingDetailsContentProps) {
  const [showTranscript, setShowTranscript] = useState(false)

  // Mock action items for demo
  const mockActionItems = [
    { task: 'Follow up on budget proposal', assignee: 'John Smith', priority: 'high' as const, dueDate: 'Oct 10' },
    { task: 'Schedule next team meeting', assignee: 'Sarah Johnson', priority: 'medium' as const, dueDate: 'Oct 8' },
    { task: 'Review project timeline', assignee: 'Mike Davis', priority: 'low' as const, dueDate: 'Oct 15' },
    { task: 'Update stakeholder presentation', assignee: 'Emily Chen', priority: 'high' as const, dueDate: 'Oct 12' },
    { task: 'Prepare marketing materials', assignee: 'Alex Wilson', priority: 'medium' as const, dueDate: 'Oct 14' },
  ]

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive'
      case 'medium': return 'secondary'
      case 'low': return 'outline'
      default: return 'secondary'
    }
  }

  return (
    <ContentContainer>
      <Box sx={{ p: 4 }}>
        {/* Meeting Overview Section */}
        <Section>
          <SectionHeader>
            <Users size={20} color="#343434" />
            <SectionTitle>Meeting Overview</SectionTitle>
          </SectionHeader>

          {/* Meeting Info Grid */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mb: 3 }}>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#6b7280', mb: 1, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Date & Time
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Calendar size={16} color="#8e8e8e" />
                <Typography variant="body2" sx={{ color: '#252525' }}>
                  {meeting.date.toLocaleDateString()}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Clock size={16} color="#8e8e8e" />
                <Typography variant="body2" sx={{ color: '#252525' }}>
                  {meeting.time}
                </Typography>
              </Box>
            </Box>

            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#6b7280', mb: 1, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Status
              </Typography>
              <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                <Badge variant={meeting.hasTranscript ? 'default' : 'secondary'}>
                  {meeting.hasTranscript ? 'Completed' : 'Upcoming'}
                </Badge>
                {meeting.hasTranscript && (
                  <Badge variant="outline">
                    Transcript Available
                  </Badge>
                )}
              </Box>
            </Box>
          </Box>

          {/* Attendees */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#6b7280', mb: 2, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Attendees ({meeting.attendees.length})
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
              {meeting.attendees.map((attendee, i) => (
                <Badge key={i} variant="secondary" style={{ fontSize: '0.85rem', padding: '6px 12px' }}>
                  {attendee}
                </Badge>
              ))}
            </Box>
          </Box>

          {/* Description */}
          {meeting.description && (
            <ContentBox>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#252525', mb: 2 }}>
                Description
              </Typography>
              <Typography variant="body2" sx={{ color: '#252525', lineHeight: 1.6 }}>
                {meeting.description}
              </Typography>
            </ContentBox>
          )}
        </Section>

        {/* Action Items Section */}
        {meeting.hasTranscript && (
          <Section>
            <SectionHeader>
              <Zap size={20} color="#343434" />
              <SectionTitle>AI-Generated Action Items</SectionTitle>
              <Button size="sm" variant="outline" style={{ marginLeft: 'auto' }}>
                Export to Tasks
              </Button>
            </SectionHeader>

            <Box sx={{ display: 'grid', gap: 3 }}>
              {mockActionItems.map((item, i) => (
                <ContentBox key={i} sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 3, mb: 2 }}>
                    <Typography variant="body1" sx={{ flex: 1, color: '#252525', fontWeight: 500, lineHeight: 1.5 }}>
                      {item.task}
                    </Typography>
                    <Badge variant={getPriorityColor(item.priority)} style={{ flexShrink: 0 }}>
                      {item.priority}
                    </Badge>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, color: '#6b7280' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <User size={14} />
                      <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                        {item.assignee}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Calendar size={14} />
                      <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                        Due: {item.dueDate}
                      </Typography>
                    </Box>
                  </Box>
                </ContentBox>
              ))}
            </Box>
          </Section>
        )}

        {/* Meeting Summary Section */}
        {meeting.notes && (
          <Section>
            <SectionHeader>
              <FileText size={20} color="#343434" />
              <SectionTitle>Meeting Summary</SectionTitle>
            </SectionHeader>

            <ContentBox>
              <Typography
                variant="body1"
                sx={{
                  color: '#252525',
                  whiteSpace: 'pre-line',
                  lineHeight: 1.6,
                  fontSize: '0.95rem',
                }}
              >
                {meeting.notes}
              </Typography>
            </ContentBox>
          </Section>
        )}

        {/* Meeting Transcript Section */}
        {meeting.transcript && (
          <Section>
            <SectionHeader>
              <MessageSquare size={20} color="#343434" />
              <SectionTitle>Meeting Transcript</SectionTitle>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowTranscript(!showTranscript)}
                style={{ marginLeft: 'auto' }}
              >
                {showTranscript ? 'Hide' : 'Show'} Transcript
              </Button>
            </SectionHeader>

            {showTranscript ? (
              <ContentBox>
                <Typography
                  variant="body2"
                  sx={{
                    color: '#252525',
                    whiteSpace: 'pre-line',
                    fontFamily: 'monospace',
                    fontSize: '0.85rem',
                    lineHeight: 1.5,
                    backgroundColor: '#ffffff',
                    padding: '16px',
                    borderRadius: '8px',
                    border: '1px solid #e8e8e8',
                  }}
                >
                  {meeting.transcript}
                </Typography>
              </ContentBox>
            ) : (
              <Box sx={{
                p: 3,
                backgroundColor: '#f8f9fa',
                borderRadius: '10px',
                border: '1px solid #e8e8e8',
                textAlign: 'center',
                color: '#6b7280'
              }}>
                <Typography variant="body2" sx={{ fontSize: '0.9rem' }}>
                  Click "Show Transcript" to view the full meeting transcript
                </Typography>
              </Box>
            )}
          </Section>
        )}
      </Box>
    </ContentContainer>
  )
}
