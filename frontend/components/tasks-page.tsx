import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { Box, Typography, Container, Checkbox, Collapse, IconButton, Menu, MenuItem, Select, FormControl } from '@mui/material'
import { styled } from '@mui/material/styles'
import { Calendar, CheckCircle2, Circle, Clock, User, ChevronDown, ChevronRight, Trash2, MoreHorizontal } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'
import { mockMeetings, pastMeetings, type Meeting } from '@/lib/mock-data'

interface Task {
  id: string
  title: string
  description: string
  assignee: string
  dueDate: string
  priority: 'high' | 'medium' | 'low'
  status: 'todo' | 'in-progress' | 'completed'
  meetingId?: string
  meetingTitle?: string
}

const CURRENT_USER = 'Sarah Chen'

// Priority sorting function
const getPriorityValue = (priority: 'high' | 'medium' | 'low'): number => {
  switch (priority) {
    case 'high': return 1
    case 'medium': return 2
    case 'low': return 3
    default: return 3
  }
}

const sortTasksByPriority = (tasks: Task[]): Task[] => {
  return [...tasks].sort((a, b) => getPriorityValue(a.priority) - getPriorityValue(b.priority))
}

// Styled components
const MainContainer = styled(Container)(({ theme }) => ({
  maxWidth: '1200px',
  padding: '32px 24px',
}))

const SectionCard = styled(Card)(({ theme }) => ({
  marginBottom: '24px',
  border: '1px solid #e8e8e8',
  borderRadius: '12px',
  overflow: 'hidden',
}))

const SectionHeader = styled(Box)(({ theme }) => ({
  padding: '20px 24px',
  backgroundColor: '#f7f7f7',
  borderBottom: '1px solid #e8e8e8',
}))

const TaskCard = styled(Card)<{ highlight?: boolean }>(({ theme, highlight }) => ({
  padding: '16px',
  margin: '8px 0',
  border: highlight ? '2px solid #343434' : '1px solid #e8e8e8',
  borderRadius: '10px',
  backgroundColor: highlight ? 'rgba(52, 52, 52, 0.05)' : '#ffffff',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: 'rgba(247, 247, 247, 0.5)',
  },
  // Ensure interactive elements remain clickable
  '& .MuiFormControl-root, & .MuiSelect-root, & .MuiIconButton-root, & .MuiCheckbox-root': {
    position: 'relative',
    zIndex: 2,
    pointerEvents: 'auto',
  },
}))

const MeetingHeader = styled(Box)<{ expanded?: boolean }>(({ theme, expanded }) => ({
  padding: '16px 20px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  backgroundColor: expanded ? '#f7f7f7' : 'transparent',
  borderBottom: expanded ? '1px solid #e8e8e8' : 'none',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: '#f7f7f7',
  },
}))

function generateTasksFromMeetings(): Task[] {
  const allMeetings = [...mockMeetings, ...pastMeetings]
  const tasks: Task[] = []

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

export default function TasksPage() {
  const router = useRouter()
  const highlightMeetingId = router.query.meeting as string

  const [tasks, setTasks] = useState<Task[]>(generateTasksFromMeetings())
  const [expandedMeetings, setExpandedMeetings] = useState<Set<string>>(
    new Set(highlightMeetingId ? [highlightMeetingId] : [])
  )

  // State for enhanced task management
  const [pendingReorders, setPendingReorders] = useState<Map<string, NodeJS.Timeout>>(new Map())
  const [taskCountdowns, setTaskCountdowns] = useState<Map<string, number>>(new Map())

  useEffect(() => {
    if (highlightMeetingId) {
      setTimeout(() => {
        const element = document.getElementById(`meeting-${highlightMeetingId}`)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }, 100)
    }
  }, [highlightMeetingId])

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      pendingReorders.forEach((timer) => {
        clearTimeout(timer)
      })
    }
  }, [])

  // Function to toggle task completion status
  const handleTaskToggle = (taskId: string) => {
    // Clear any existing timer for this task
    const existingTimer = pendingReorders.get(taskId)
    if (existingTimer) {
      clearTimeout(existingTimer)
      setPendingReorders(prev => {
        const newMap = new Map(prev)
        newMap.delete(taskId)
        return newMap
      })
      setTaskCountdowns(prev => {
        const newMap = new Map(prev)
        newMap.delete(taskId)
        return newMap
      })
    }

    // Update task status immediately
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId
          ? { ...task, status: task.status === 'completed' ? 'todo' : 'completed' }
          : task
      )
    )

    // If task is being marked as completed, set up reorder timer
    const task = tasks.find(t => t.id === taskId)
    if (task && task.status !== 'completed') {
      // Start countdown
      setTaskCountdowns(prev => new Map(prev).set(taskId, 60))

      // Update countdown every second
      const countdownInterval = setInterval(() => {
        setTaskCountdowns(prev => {
          const newMap = new Map(prev)
          const currentCount = newMap.get(taskId) || 0
          if (currentCount > 1) {
            newMap.set(taskId, currentCount - 1)
            return newMap
          } else {
            newMap.delete(taskId)
            return newMap
          }
        })
      }, 1000)

      // Set up reorder timer (60 seconds)
      const reorderTimer = setTimeout(() => {
        clearInterval(countdownInterval)
        reorderCompletedTask(taskId)
        setPendingReorders(prev => {
          const newMap = new Map(prev)
          newMap.delete(taskId)
          return newMap
        })
        setTaskCountdowns(prev => {
          const newMap = new Map(prev)
          newMap.delete(taskId)
          return newMap
        })
      }, 60000)

      setPendingReorders(prev => new Map(prev).set(taskId, reorderTimer))
    }
  }

  // Function to reorder completed tasks to bottom
  const reorderCompletedTask = (taskId: string) => {
    setTasks(prevTasks => {
      const taskToMove = prevTasks.find(t => t.id === taskId)
      if (!taskToMove || taskToMove.status !== 'completed') return prevTasks

      const otherTasks = prevTasks.filter(t => t.id !== taskId)

      // Group tasks by their section (my tasks, team tasks, meeting tasks)
      const myTasks = otherTasks.filter(t => t.assignee === CURRENT_USER)
      const teamTasks = otherTasks.filter(t => t.assignee !== CURRENT_USER)

      if (taskToMove.assignee === CURRENT_USER) {
        return [...myTasks, taskToMove, ...teamTasks]
      } else {
        return [...myTasks, ...teamTasks, taskToMove]
      }
    })
  }

  // Function to delete a task
  const handleDeleteTask = (taskId: string) => {
    // Clear any pending timers for this task
    const existingTimer = pendingReorders.get(taskId)
    if (existingTimer) {
      clearTimeout(existingTimer)
      setPendingReorders(prev => {
        const newMap = new Map(prev)
        newMap.delete(taskId)
        return newMap
      })
      setTaskCountdowns(prev => {
        const newMap = new Map(prev)
        newMap.delete(taskId)
        return newMap
      })
    }

    // Remove task from list
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId))
  }

  // Function to change task status (for in-progress)
  const handleStatusChange = (taskId: string, newStatus: 'todo' | 'in-progress' | 'completed') => {
    // Clear any existing timer for this task if changing from completed
    const existingTimer = pendingReorders.get(taskId)
    if (existingTimer) {
      clearTimeout(existingTimer)
      setPendingReorders(prev => {
        const newMap = new Map(prev)
        newMap.delete(taskId)
        return newMap
      })
      setTaskCountdowns(prev => {
        const newMap = new Map(prev)
        newMap.delete(taskId)
        return newMap
      })
    }

    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId
          ? { ...task, status: newStatus }
          : task
      )
    )
  }

  // Separate completed and non-completed tasks, keeping completed tasks visible until reordered
  const myTasksIncomplete = sortTasksByPriority(tasks.filter((t) => t.assignee === CURRENT_USER && t.status !== 'completed'))
  const myTasksCompleted = sortTasksByPriority(tasks.filter((t) => t.assignee === CURRENT_USER && t.status === 'completed'))
  const myTasks = [...myTasksIncomplete, ...myTasksCompleted]

  const teamTasksIncomplete = sortTasksByPriority(tasks.filter((t) => t.assignee !== CURRENT_USER && t.status !== 'completed'))
  const teamTasksCompleted = sortTasksByPriority(tasks.filter((t) => t.assignee !== CURRENT_USER && t.status === 'completed'))
  const teamTasks = [...teamTasksIncomplete, ...teamTasksCompleted]

  const meetingGroups = new Map<string, { meeting: Meeting; tasks: Task[] }>()
  const allMeetings = [...mockMeetings, ...pastMeetings]

  tasks.forEach((task) => {
    if (task.meetingId) {
      const meeting = allMeetings.find((m) => m.id === task.meetingId)
      if (meeting) {
        if (!meetingGroups.has(task.meetingId)) {
          meetingGroups.set(task.meetingId, { meeting, tasks: [] })
        }
        meetingGroups.get(task.meetingId)!.tasks.push(task)
      }
    }
  })

  const sortedMeetingGroups = Array.from(meetingGroups.values())
    .map(group => ({
      ...group,
      tasks: sortTasksByPriority(group.tasks)
    }))
    .sort((a, b) => b.meeting.date.getTime() - a.meeting.date.getTime())

  const toggleMeeting = (meetingId: string) => {
    setExpandedMeetings((prev) => {
      const next = new Set(prev)
      if (next.has(meetingId)) {
        next.delete(meetingId)
      } else {
        next.add(meetingId)
      }
      return next
    })
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 size={16} color="#22c55e" />
      case 'in-progress':
        return <Clock size={16} color="#3b82f6" />
      default:
        return <Circle size={16} color="#8e8e8e" />
    }
  }

  const TaskCardComponent = ({
    task,
    highlight = false,
    onToggle,
    onDelete,
    onStatusChange,
    countdown
  }: {
    task: Task;
    highlight?: boolean;
    onToggle?: (taskId: string) => void;
    onDelete?: (taskId: string) => void;
    onStatusChange?: (taskId: string, status: 'todo' | 'in-progress' | 'completed') => void;
    countdown?: number;
  }) => (
    <TaskCard
      highlight={highlight}
      sx={{
        opacity: task.status === 'completed' ? 0.7 : 1,
        transition: 'opacity 0.2s ease',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
        <Checkbox
          checked={task.status === 'completed'}
          onChange={() => onToggle?.(task.id)}
          sx={{
            mt: 0.5,
            position: 'relative',
            zIndex: 10,
            '& .MuiSvgIcon-root': { fontSize: 20 },
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.04)',
            }
          }}
        />
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, mb: 1 }}>
            <Typography
              variant="body1"
              sx={{
                fontWeight: 500,
                color: '#252525',
                textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                transition: 'text-decoration 0.2s ease'
              }}
            >
              {task.title}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Badge variant={getPriorityColor(task.priority)}>
                {task.priority}
              </Badge>
              {/* Delete Button */}
              <IconButton
                size="small"
                onClick={() => onDelete?.(task.id)}
                sx={{
                  p: 0.5,
                  position: 'relative',
                  zIndex: 10,
                  '&:hover': { backgroundColor: 'rgba(239, 68, 68, 0.1)' },
                  color: '#8e8e8e'
                }}
              >
                <Trash2 size={14} />
              </IconButton>
            </Box>
          </Box>
          <Typography variant="body2" sx={{ color: '#8e8e8e', mb: 1 }}>
            {task.description}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            {/* Status Selector */}
            <FormControl
              size="small"
              sx={{
                minWidth: 120,
                position: 'relative',
                zIndex: 10,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'white',
                  '&:hover': {
                    backgroundColor: 'white',
                  }
                }
              }}
            >
              <Select
                value={task.status}
                onChange={(e) => onStatusChange?.(task.id, e.target.value as 'todo' | 'in-progress' | 'completed')}
                sx={{
                  fontSize: '0.75rem',
                  '& .MuiSelect-select': { py: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 },
                  '&:hover': {
                    backgroundColor: 'white',
                  }
                }}
              >
                <MenuItem value="todo" sx={{ fontSize: '0.75rem' }}>
                  <Circle size={12} color="#8e8e8e" style={{ marginRight: 4 }} />
                  To Do
                </MenuItem>
                <MenuItem value="in-progress" sx={{ fontSize: '0.75rem' }}>
                  <Clock size={12} color="#3b82f6" style={{ marginRight: 4 }} />
                  In Progress
                </MenuItem>
                <MenuItem value="completed" sx={{ fontSize: '0.75rem' }}>
                  <CheckCircle2 size={12} color="#22c55e" style={{ marginRight: 4 }} />
                  Completed
                </MenuItem>
              </Select>
            </FormControl>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <User size={12} color="#8e8e8e" />
              <Typography variant="caption" sx={{ color: '#8e8e8e' }}>
                {task.assignee}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Calendar size={12} color="#8e8e8e" />
              <Typography variant="caption" sx={{ color: '#8e8e8e' }}>
                {new Date(task.dueDate).toLocaleDateString()}
              </Typography>
            </Box>
          </Box>

          {/* Countdown Display */}
          {countdown && countdown > 0 && (
            <Box sx={{
              mt: 1,
              p: 1,
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              borderRadius: 1,
              border: '1px solid rgba(59, 130, 246, 0.2)'
            }}>
              <Typography variant="caption" sx={{ color: '#3b82f6', fontWeight: 500 }}>
                ⏱️ Moving to bottom in {countdown}s
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </TaskCard>
  )

  return (
    <MainContainer>
      <Typography variant="h3" sx={{ fontWeight: 700, color: '#252525', mb: 4 }}>
        Tasks
      </Typography>

      {/* My Action Items */}
      <SectionCard>
        <SectionHeader>
          <Typography variant="h5" sx={{ fontWeight: 600, color: '#252525' }}>
            My Action Items ({myTasks.length})
          </Typography>
        </SectionHeader>
        <CardContent>
          {myTasks.length === 0 ? (
            <Typography variant="body2" sx={{ color: '#8e8e8e', textAlign: 'center', py: 4 }}>
              No action items assigned to you.
            </Typography>
          ) : (
            myTasks.map((task) => (
              <TaskCardComponent
                key={task.id}
                task={task}
                onToggle={handleTaskToggle}
                onDelete={handleDeleteTask}
                onStatusChange={handleStatusChange}
                countdown={taskCountdowns.get(task.id)}
              />
            ))
          )}
        </CardContent>
      </SectionCard>

      {/* Team Action Items */}
      <SectionCard>
        <SectionHeader>
          <Typography variant="h5" sx={{ fontWeight: 600, color: '#252525' }}>
            Team Action Items ({teamTasks.length})
          </Typography>
        </SectionHeader>
        <CardContent>
          {teamTasks.length === 0 ? (
            <Typography variant="body2" sx={{ color: '#8e8e8e', textAlign: 'center', py: 4 }}>
              No team action items.
            </Typography>
          ) : (
            teamTasks.map((task) => (
              <TaskCardComponent
                key={task.id}
                task={task}
                onToggle={handleTaskToggle}
                onDelete={handleDeleteTask}
                onStatusChange={handleStatusChange}
                countdown={taskCountdowns.get(task.id)}
              />
            ))
          )}
        </CardContent>
      </SectionCard>

      {/* Meeting History */}
      <SectionCard>
        <SectionHeader>
          <Typography variant="h5" sx={{ fontWeight: 600, color: '#252525' }}>
            Meeting History ({sortedMeetingGroups.length})
          </Typography>
        </SectionHeader>
        <Box>
          {sortedMeetingGroups.map(({ meeting, tasks: meetingTasks }) => {
            const isExpanded = expandedMeetings.has(meeting.id)
            const isHighlighted = highlightMeetingId === meeting.id

            return (
              <Box
                key={meeting.id}
                id={`meeting-${meeting.id}`}
                sx={{
                  border: isHighlighted ? '2px solid #343434' : 'none',
                  borderRadius: isHighlighted ? '10px' : 0,
                  margin: isHighlighted ? '8px' : 0,
                }}
              >
                <MeetingHeader
                  expanded={isExpanded}
                  onClick={() => toggleMeeting(meeting.id)}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <IconButton size="small" sx={{ p: 0 }}>
                      {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                    </IconButton>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#252525' }}>
                        {meeting.title}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#8e8e8e' }}>
                        {formatDate(meeting.date)} • {meetingTasks.length} tasks
                      </Typography>
                    </Box>
                  </Box>
                  <Badge variant="secondary">
                    {formatDate(meeting.date)}
                  </Badge>
                </MeetingHeader>

                <Collapse in={isExpanded}>
                  <Box sx={{ p: 2, backgroundColor: '#ffffff' }}>
                    {meetingTasks.map((task) => (
                      <TaskCardComponent
                        key={task.id}
                        task={task}
                        highlight={isHighlighted}
                        onToggle={handleTaskToggle}
                        onDelete={handleDeleteTask}
                        onStatusChange={handleStatusChange}
                        countdown={taskCountdowns.get(task.id)}
                      />
                    ))}
                  </Box>
                </Collapse>
              </Box>
            )
          })}

          {sortedMeetingGroups.length === 0 && (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: '#8e8e8e' }}>
                No meetings with action items found.
              </Typography>
            </Box>
          )}
        </Box>
      </SectionCard>
    </MainContainer>
  )
}
