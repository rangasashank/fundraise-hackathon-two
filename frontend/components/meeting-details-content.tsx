import React, { useState } from 'react'
import { Box, Typography, Checkbox } from '@mui/material'
import { styled } from '@mui/material/styles'
import { Users, Zap, FileText, MessageSquare, User, Calendar, Clock } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Meeting } from '@/lib/types'
import * as api from '@/lib/api'

interface MeetingDetailsContentProps {
  meeting: Meeting
}

const ContentContainer = styled(Box)(() => ({
  width: '600px',
  '& > div': {
    maxWidth: '100%',
    width: '100%',
  }
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
  maxWidth: '100%',
  width: '100%',
  overflowX: 'hidden',
  '@media (max-width: 600px)': {
    gap: '8px',
    marginBottom: '12px',
    paddingBottom: '6px',
  }
}))

const SectionTitle = styled(Typography)(() => ({
  fontSize: '1.1rem',
  fontWeight: 600,
  color: 'var(--text-primary)',
  minWidth: 0,
  '@media (max-width: 600px)': {
    fontSize: '1rem',
  }
}))

const ContentBox = styled(Box)(() => ({
  backgroundColor: 'var(--surface)',
  border: '1px solid var(--grey-200)',
  borderRadius: 'var(--radius-lg)',
  padding: 'var(--space-4)',
  marginTop: 'var(--space-3)',
  maxWidth: '100%',
  width: '100%',
  boxSizing: 'border-box',
  overflowWrap: 'break-word',
  wordWrap: 'break-word',
  overflowX: 'hidden',
  boxShadow: 'var(--shadow-sm)',
  transition: 'all var(--transition-fast)',
  '&:hover': {
    boxShadow: 'var(--shadow-md)',
    transform: 'translateY(-1px)',
  },
  '@media (min-width: 768px)': {
    padding: 'var(--space-5)',
  }
}))

export function MeetingDetailsContent({ meeting }: MeetingDetailsContentProps) {
  const [showTranscript, setShowTranscript] = useState(false)
  const [selectedActionItems, setSelectedActionItems] = useState<Set<number>>(new Set())
  const [exportedItems, setExportedItems] = useState<Set<number>>(new Set())
  const [exportError, setExportError] = useState<string | null>(null)

  // Parse action items from meeting data
  const parseActionItems = (): Array<{
    task: string
    assignee: string
    priority: 'high' | 'medium' | 'low'
    dueDate: string
  }> => {
    if (!meeting.actionItems || meeting.actionItems.length === 0) {
      return []
    }

    return meeting.actionItems.map((item, index) => {
      // Parse format: "Task description (Assignee - Due Date)" or just "Task description"
      const match = item.match(/^(.+?)\s*\(([^)]+?)(?:\s*-\s*([^)]+))?\)/)

      if (match) {
        const [, task, assignee, dueDate] = match
        const priority: 'high' | 'medium' | 'low' = index === 0 ? 'high' : index === 1 ? 'medium' : 'low'
        return {
          task: task.trim(),
          assignee: assignee.trim(),
          priority,
          dueDate: dueDate?.trim() || 'Not set'
        }
      }

      // Fallback: use the whole string as task
      return {
        task: item,
        assignee: 'Unassigned',
        priority: 'medium' as 'medium',
        dueDate: 'Not set'
      }
    })
  }

  const actionItems = parseActionItems()

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive'
      case 'medium': return 'secondary'
      case 'low': return 'outline'
      default: return 'secondary'
    }
  }

  // Handle individual action item selection
  const handleActionItemSelect = (index: number) => {
    setSelectedActionItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(index)) {
        newSet.delete(index)
      } else {
        newSet.add(index)
      }
      return newSet
    })
  }

  // Handle select all / deselect all
  const handleSelectAll = () => {
    if (selectedActionItems.size === actionItems.length) {
      setSelectedActionItems(new Set())
    } else {
      setSelectedActionItems(new Set(actionItems.map((_, index) => index)))
    }
  }

  // Handle export selected items
  const handleExportSelected = async () => {
    if (selectedActionItems.size === 0) return

    const selectedItems = Array.from(selectedActionItems).map(index => actionItems[index])
    console.log('Exporting selected action items to Tasks page:', selectedItems)

    try {
      setExportError(null)

      // Create tasks for selected action items
      const createPromises = selectedItems.map(item =>
        api.createTask({
          title: item.task,
          description: `From meeting: ${meeting.title}`,
          assignee: item.assignee,
          dueDate: item.dueDate !== 'Not set' ? item.dueDate : undefined,
          priority: item.priority,
          status: 'todo',
          meetingId: meeting.id,
          transcriptId: meeting.transcriptId,
        })
      )

      await Promise.all(createPromises)
      console.log(`Successfully created ${selectedItems.length} tasks`)

      // Add exported items to the exported set
      setExportedItems(prev => new Set([...Array.from(prev), ...Array.from(selectedActionItems)]))

      // Clear selections after export
      setSelectedActionItems(new Set())

      // Show success feedback
      alert(`Successfully exported ${selectedItems.length} action item(s) to Tasks page!`)
    } catch (err: any) {
      console.error('Error exporting action items to tasks:', err)
      setExportError(err.message || 'Failed to export action items')
      alert(`Failed to export action items: ${err.message || 'Unknown error'}`)
    }
  }

  return (
    <ContentContainer>
      <Box sx={{
        p: { xs: 2, sm: 3, md: 3, lg: 4 },
        maxWidth: '100%',
        width: '100%',
        boxSizing: 'border-box',
        overflowWrap: 'break-word',
        wordWrap: 'break-word',
        overflowX: 'hidden'
      }}>
        {/* Meeting Overview Section */}
        <Section>
          <SectionHeader>
            <Users size={20} color="var(--brand-primary)" />
            <SectionTitle>Meeting Overview</SectionTitle>
          </SectionHeader>

          {/* Meeting Info Grid */}
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr', md: '1fr 1fr', lg: '1fr 1fr' },
            gap: { xs: 2, sm: 2, md: 3 },
            mb: 3,
            maxWidth: '100%',
            width: '100%',
            overflowX: 'hidden'
          }}>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'var(--text-secondary)', mb: 1, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Date & Time
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Calendar size={16} color="var(--brand-primary)" />
                <Typography variant="body2" sx={{ color: 'var(--text-primary)' }}>
                  {meeting.date.toLocaleDateString()}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Clock size={16} color="var(--brand-primary)" />
                <Typography variant="body2" sx={{ color: 'var(--text-primary)' }}>
                  {meeting.time}
                </Typography>
              </Box>
            </Box>

            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#6b7280', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
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
            <Box sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 1.5,
              maxWidth: '100%',
              width: '100%',
              overflowX: 'hidden'
            }}>
              {meeting.attendees.map((attendee, i) => (
                <Badge
                  key={i}
                  variant="secondary"
                  style={{
                    fontSize: '0.85rem',
                    padding: '6px 12px',
                    maxWidth: '200px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
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
        {(meeting.actionItems && meeting.actionItems.length > 0) && (
          <Section>
            <SectionHeader sx={{
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'flex-start', sm: 'center' },
              gap: { xs: 2, sm: 0 },
              maxWidth: '100%',
              width: '100%',
              overflowX: 'hidden'
            }}>
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: { xs: 1, sm: 2 },
                flex: 1,
                minWidth: 0,
                maxWidth: '100%'
              }}>
                <Zap size={15} color="var(--brand-primary)" />
                <SectionTitle sx={{
                  fontSize: { xs: '1rem', sm: '1.1rem' },
                  minWidth: 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  Action Items
                </SectionTitle>
                <Checkbox
                  checked={selectedActionItems.size === actionItems.length && actionItems.length > 0}
                  indeterminate={selectedActionItems.size > 0 && selectedActionItems.size < actionItems.length}
                  onChange={handleSelectAll}
                  sx={{
                    ml: { xs: 0.5, sm: 1 },
                    '& .MuiSvgIcon-root': { fontSize: { xs: 16, sm: 18 } },
                    color: 'var(--brand-primary-400)',
                    '&.Mui-checked': {
                      color: 'var(--brand-primary)',
                    },
                    '&.MuiCheckbox-indeterminate': {
                      color: 'var(--brand-primary)',
                    }
                  }}
                />
                <Typography variant="caption" sx={{
                  color: '#6b7280',
                  fontSize: { xs: '0.7rem', sm: '0.75rem' },
                  display: { xs: 'none', sm: 'block' },
                  minWidth: 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {selectedActionItems.size === 0
                    ? 'Select items to export'
                    : selectedActionItems.size === actionItems.length
                    ? 'All selected'
                    : `${selectedActionItems.size} of ${actionItems.length} selected`
                  }
                </Typography>
              </Box>
              <Box sx={{
                display: 'flex',
                gap: 1,
                marginLeft: { xs: 0, sm: 'auto' },
                width: { xs: '100%', sm: 'auto' },
                justifyContent: { xs: 'stretch', sm: 'flex-end' }
              }}>
                <Button
                  size="sm"
                  variant={selectedActionItems.size > 0 ? "default" : "outline"}
                  onClick={handleExportSelected}
                  disabled={selectedActionItems.size === 0}
                  style={{
                    opacity: selectedActionItems.size === 0 ? 0.5 : 1,
                    cursor: selectedActionItems.size === 0 ? 'not-allowed' : 'pointer',
                    fontSize: '0.75rem',
                    fontWeight: selectedActionItems.size > 0 ? 600 : 400,
                    minWidth: 'auto',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {selectedActionItems.size > 0
                    ? `Export ${selectedActionItems.size} to Tasks`
                    : 'Export to Tasks'
                  }
                </Button>
              </Box>
            </SectionHeader>

            <Box sx={{
              display: 'grid',
              gap: { xs: 2, sm: 3 },
              maxWidth: '100%',
              width: '100%',
              overflowX: 'hidden'
            }}>
              {actionItems.map((item, i) => (
                <ContentBox
                  key={i}
                  sx={{
                    p: { xs: 2, sm: 3 },
                    backgroundColor: selectedActionItems.has(i) ? 'var(--brand-primary-50)' : 'var(--surface-alt)',
                    border: selectedActionItems.has(i) ? '2px solid var(--brand-primary-200)' : '1px solid var(--grey-200)',
                    transition: 'all 0.2s ease',
                    position: 'relative',
                    maxWidth: '100%',
                    width: '100%',
                    boxSizing: 'border-box',
                    overflowX: 'hidden'
                  }}
                >
                  {/* Exported Badge */}
                  {exportedItems.has(i) && (
                    <Box sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      zIndex: 2
                    }}>
                      <Badge
                        variant="default"
                        style={{
                          fontSize: '0.7rem',
                          padding: '4px 8px',
                          backgroundColor: 'var(--success)',
                          color: 'white',
                          fontWeight: 600,
                          boxShadow: '0 2px 4px rgba(34, 197, 94, 0.2)'
                        }}
                      >
                        ✓ Exported
                      </Badge>
                    </Box>
                  )}

                  <Box sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: { xs: 1, sm: 2 },
                    mb: 2,
                    width: '100%',
                    maxWidth: '100%',
                    overflowX: 'hidden'
                  }}>
                    {/* Selection Checkbox */}
                    <Checkbox
                      checked={selectedActionItems.has(i)}
                      onChange={() => handleActionItemSelect(i)}
                      sx={{
                        mt: -0.5,
                        flexShrink: 0,
                        '& .MuiSvgIcon-root': { fontSize: { xs: 18, sm: 20 } },
                        color: 'var(--brand-primary-400)',
                        '&.Mui-checked': {
                          color: 'var(--brand-primary)',
                        }
                      }}
                    />

                    <Box sx={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      gap: { xs: 2, sm: 3 },
                      flex: 1,
                      width: '100%',
                      maxWidth: '100%',
                      minWidth: 0,
                      overflowX: 'hidden'
                    }}>
                    <Typography variant="body1" sx={{
                      flex: 1,
                      color: '#252525',
                      fontWeight: 500,
                      lineHeight: 1.5,
                      overflowWrap: 'break-word',
                      wordWrap: 'break-word',
                      minWidth: 0,
                      maxWidth: { xs: 'calc(100% - 60px)', sm: 'calc(100% - 80px)' },
                      fontSize: { xs: '0.9rem', sm: '1rem' }
                    }}>
                      {item.task}
                    </Typography>
                    <Badge
                      variant={getPriorityColor(item.priority)}
                      style={{
                        flexShrink: 0,
                        fontSize: '0.75rem',
                        padding: '2px 6px'
                      }}
                    >
                      {item.priority}
                    </Badge>
                    </Box>
                  </Box>

                  <Box sx={{ ml: { xs: 3, sm: 4 } }}>
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: { xs: 2, sm: 3 },
                    color: '#6b7280',
                    flexWrap: 'wrap',
                    maxWidth: '100%',
                    overflowX: 'hidden'
                  }}>
                    <Box sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      minWidth: 0,
                      maxWidth: { xs: '150px', sm: '200px' }
                    }}>
                      <User size={14} />
                      <Typography variant="body2" sx={{
                        fontSize: { xs: '0.8rem', sm: '0.85rem' },
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        minWidth: 0
                      }}>
                        {item.assignee}
                      </Typography>
                    </Box>
                    <Box sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      minWidth: 0,
                      flexShrink: 0
                    }}>
                      <Calendar size={14} />
                      <Typography variant="body2" sx={{
                        fontSize: { xs: '0.8rem', sm: '0.85rem' },
                        whiteSpace: 'nowrap'
                      }}>
                        Due: {item.dueDate}
                      </Typography>
                    </Box>
                  </Box>
                  </Box>
                </ContentBox>
              ))}
            </Box>
          </Section>
        )}

        {/* Meeting Summary Section */}
        {(meeting.summaryText || meeting.notes) && (
          <Section>
            <SectionHeader>
              <FileText size={20} color="var(--brand-primary)" />
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
                {meeting.summaryText || meeting.notes}
              </Typography>
            </ContentBox>
          </Section>
        )}

        {/* Meeting Transcript Section */}
        {meeting.transcript && (
          <Section>
            <SectionHeader>
              <MessageSquare size={20} color="var(--brand-primary)" />
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
