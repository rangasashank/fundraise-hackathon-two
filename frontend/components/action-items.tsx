import React, { useState, useEffect } from 'react'
import { Box, Typography, CircularProgress, Alert } from '@mui/material'
import { Zap, Check, Upload, User, Calendar, RefreshCw } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Meeting } from '@/lib/types'
import * as api from '@/lib/api'

interface ActionItemsProps {
  meeting: Meeting
}

interface ActionItem {
  task: string
  assignee: string
  priority: 'high' | 'medium' | 'low'
  dueDate?: string
}

export function ActionItems({ meeting }: ActionItemsProps) {
  const [actionItems, setActionItems] = useState<ActionItem[]>([])
  const [loading, setLoading] = useState(true)
  const [exported, setExported] = useState(false)
  const [exportedItems, setExportedItems] = useState<Set<number>>(new Set())
  const [reprocessing, setReprocessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Load action items from backend
    const loadActionItems = async () => {
      setLoading(true)
      setError(null)

      try {
        // If meeting has action items from backend, use them
        if (meeting.actionItems && meeting.actionItems.length > 0) {
          const items: ActionItem[] = meeting.actionItems.map((item) => {
            // Parse action item string to extract task, assignee, and due date
            // Format: "Task description (Assignee - Due Date)" or just "Task description"
            const match = item.match(/^(.+?)\s*\(([^)]+?)(?:\s*-\s*([^)]+))?\)/)
            if (match) {
              const [, task, assignee, dueDate] = match
              return {
                task: task.trim(),
                assignee: assignee.trim(),
                dueDate: dueDate?.trim(),
                priority: 'medium' as const,
              }
            }

            // Fallback: use the whole string as task
            return {
              task: item,
              assignee: meeting.attendees[0] || 'Unassigned',
              priority: 'medium' as const,
            }
          })
          setActionItems(items)
        } else if (meeting.transcriptId) {
          // If no action items but we have a transcript, try to process it
          console.log('No action items found, attempting to process transcript...')
          await processTranscript()
        } else {
          // No transcript available yet
          setActionItems([])
        }
      } catch (err: any) {
        console.error('Error loading action items:', err)
        setError(err.message || 'Failed to load action items')
      } finally {
        setLoading(false)
      }
    }

    loadActionItems()
  }, [meeting])

  // Process transcript with AI to extract action items
  const processTranscript = async () => {
    if (!meeting.transcriptId) {
      setError('No transcript available to process')
      return
    }

    try {
      setError(null)
      const response = await api.processTranscript({
        transcriptId: meeting.transcriptId,
        processSummary: false,
        processActionItems: true,
      })

      if (response.success && response.data?.transcript.actionItems) {
        const items: ActionItem[] = response.data.transcript.actionItems.map((item) => {
          const match = item.match(/^(.+?)\s*\(([^)]+?)(?:\s*-\s*([^)]+))?\)/)
          if (match) {
            const [, task, assignee, dueDate] = match
            return {
              task: task.trim(),
              assignee: assignee.trim(),
              dueDate: dueDate?.trim(),
              priority: 'medium' as const,
            }
          }

          return {
            task: item,
            assignee: meeting.attendees[0] || 'Unassigned',
            priority: 'medium' as const,
          }
        })
        setActionItems(items)
      }
    } catch (err: any) {
      console.error('Error processing transcript:', err)
      setError(err.message || 'Failed to process transcript')
    }
  }

  const handleExportToTasks = () => {
    console.log('Exporting action items to tasks page:', actionItems)
    setExported(true)
    setTimeout(() => setExported(false), 2000)
  }

  const handleExportSingleItem = (index: number, item: ActionItem) => {
    console.log('Exporting single action item to tasks page:', item)
    setExportedItems(prev => new Set(prev).add(index))
    setTimeout(() => {
      setExportedItems(prev => {
        const newSet = new Set(prev)
        newSet.delete(index)
        return newSet
      })
    }, 2000)
  }

  const handleReprocessWithAI = async () => {
    if (!meeting.transcriptId) {
      setError('No transcript available to reprocess')
      return
    }

    setReprocessing(true)
    setError(null)

    try {
      const response = await api.reprocessTranscript({
        transcriptId: meeting.transcriptId,
        processSummary: false,
        processActionItems: true,
      })

      if (response.success && response.data?.transcript.actionItems) {
        const items: ActionItem[] = response.data.transcript.actionItems.map((item) => {
          const match = item.match(/^(.+?)\s*\(([^)]+?)(?:\s*-\s*([^)]+))?\)/)
          if (match) {
            const [, task, assignee, dueDate] = match
            return {
              task: task.trim(),
              assignee: assignee.trim(),
              dueDate: dueDate?.trim(),
              priority: 'medium' as const,
            }
          }

          return {
            task: item,
            assignee: meeting.attendees[0] || 'Unassigned',
            priority: 'medium' as const,
          }
        })
        setActionItems(items)
      }
    } catch (err: any) {
      console.error('Error reprocessing transcript:', err)
      setError(err.message || 'Failed to reprocess transcript with AI')
    } finally {
      setReprocessing(false)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'destructive'
      case 'medium':
        return 'secondary'
      case 'low':
        return 'outline'
      default:
        return 'secondary'
    }
  }
  


  return (
    <Card>
      <CardHeader>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Zap size={20} color="#343434" />
            <CardTitle>AI-Generated Action Items</CardTitle>
          </Box>
          {!loading && actionItems.length > 0 && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                onClick={handleReprocessWithAI}
                disabled={reprocessing || !meeting.transcriptId}
                size="sm"
                variant="outline"
              >
                {reprocessing ? (
                  <>
                    <CircularProgress size={16} sx={{ mr: 1, color: '#343434' }} />
                    Reprocessing...
                  </>
                ) : (
                  <>
                    <RefreshCw size={16} style={{ marginRight: 8 }} />
                    Reprocess With AI
                  </>
                )}
              </Button>
              <Button
                onClick={handleExportToTasks}
                disabled={exported}
                size="sm"
                variant={exported ? 'secondary' : 'default'}
              >
                {exported ? (
                  <>
                    <Check size={16} style={{ marginRight: 8 }} />
                    Exported
                  </>
                ) : (
                  <>
                    <Upload size={16} style={{ marginRight: 8 }} />
                    Export All to Tasks
                  </>
                )}
              </Button>
            </Box>
          )}
        </Box>
      </CardHeader>

      <CardContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 6 }}>
            <CircularProgress size={32} sx={{ mb: 2, color: '#343434' }} />
            <Typography variant="body2" sx={{ color: '#8e8e8e' }}>
              Analyzing meeting transcript and notes...
            </Typography>
          </Box>
        )}

        {!loading && actionItems.length === 0 && !error && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" sx={{ color: '#8e8e8e', mb: 2 }}>
              No action items found in this meeting.
            </Typography>
            {meeting.transcriptId && (
              <Button
                onClick={processTranscript}
                size="sm"
                variant="outline"
              >
                <Zap size={16} style={{ marginRight: 8 }} />
                Generate Action Items with AI
              </Button>
            )}
          </Box>
        )}

        {!loading && actionItems.length > 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {actionItems.map((item, i) => (
              <Box
                key={i}
                sx={{
                  p: 2,
                  borderRadius: '10px',
                  backgroundColor: '#f7f7f7',
                  border: '1px solid #e8e8e8',
                  transition: 'border-color 0.2s ease',
                  '&:hover': {
                    borderColor: '#b5b5b5',
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, mb: 1 }}>
                  <Typography variant="body2" sx={{ flex: 1, color: '#252525' }}>
                    {item.task}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Badge variant={getPriorityColor(item.priority)}>
                      {item.priority}
                    </Badge>
                    <Button
                      onClick={() => handleExportSingleItem(i, item)}
                      disabled={exportedItems.has(i)}
                      size="sm"
                      variant="outline"
                      style={{ minWidth: 'auto', padding: '4px 8px' }}
                    >
                      {exportedItems.has(i) ? (
                        <Check size={14} />
                      ) : (
                        <Upload size={14} />
                      )}
                    </Button>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <User size={12} color="#8e8e8e" />
                    <Typography variant="caption" sx={{ color: '#8e8e8e' }}>
                      {item.assignee}
                    </Typography>
                  </Box>
                  {item.dueDate && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Calendar size={12} color="#8e8e8e" />
                      <Typography variant="caption" sx={{ color: '#8e8e8e' }}>
                        Due: {item.dueDate}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  )
}
