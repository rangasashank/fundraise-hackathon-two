import React, { useState, useEffect } from 'react'
import { Box, Typography, CircularProgress } from '@mui/material'
import { Zap, Check, Upload, User, Calendar, RefreshCw } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Meeting } from '@/lib/mock-data'

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

  useEffect(() => {
    // Extract action items from meeting notes
    const extractActionItems = () => {
      setLoading(true)
      
      // Simulate API delay
      setTimeout(() => {
        const items: ActionItem[] = []
        
        if (meeting.notes) {
          // Look for "Action Items:" section in notes
          const actionItemsSection = meeting.notes.split('Action Items:')[1]
          if (actionItemsSection) {
            const lines = actionItemsSection.split('\n').filter(line => line.trim().startsWith('-'))
            
            lines.forEach(line => {
              const cleanLine = line.replace(/^-\s*/, '').trim()
              if (cleanLine) {
                // Extract assignee and due date from parentheses
                const match = cleanLine.match(/^(.+?)\s*\(([^)]+)\s*-\s*([^)]+)\)/)
                if (match) {
                  const [, task, assignee, dueDate] = match
                  items.push({
                    task: task.trim(),
                    assignee: assignee.trim(),
                    dueDate: dueDate.trim(),
                    priority: Math.random() > 0.5 ? 'high' : Math.random() > 0.5 ? 'medium' : 'low'
                  })
                } else {
                  // Fallback: assign to random attendee
                  const randomAssignee = meeting.attendees[Math.floor(Math.random() * meeting.attendees.length)]
                  items.push({
                    task: cleanLine,
                    assignee: randomAssignee || 'Unassigned',
                    priority: Math.random() > 0.5 ? 'high' : Math.random() > 0.5 ? 'medium' : 'low'
                  })
                }
              }
            })
          }
        }
        
        setActionItems(items)
        setLoading(false)
      }, 1500)
    }

    extractActionItems()
  }, [meeting])

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

  const handleReprocessWithAI = () => {
    console.log('Reprocessing action items with AI for meeting:', meeting.id)
    setReprocessing(true)
    // Simulate AI reprocessing delay
    setTimeout(() => {
      setReprocessing(false)
      // In a real implementation, this would trigger a new AI analysis
    }, 3000)
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
                disabled={reprocessing}
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
        {loading && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 6 }}>
            <CircularProgress size={32} sx={{ mb: 2, color: '#343434' }} />
            <Typography variant="body2" sx={{ color: '#8e8e8e' }}>
              Analyzing meeting transcript and notes...
            </Typography>
          </Box>
        )}

        {!loading && actionItems.length === 0 && (
          <Typography variant="body2" sx={{ color: '#8e8e8e' }}>
            No action items found in this meeting.
          </Typography>
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
