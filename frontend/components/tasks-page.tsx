import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { Box, Typography, Container, Checkbox, Collapse, IconButton, Menu, MenuItem, Select, FormControl } from '@mui/material'
import { styled } from '@mui/material/styles'
import { Calendar, CheckCircle2, Circle, Clock, User, ChevronDown, ChevronRight, Trash2, MoreHorizontal, CheckSquare, Users, Video } from 'lucide-react'
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
const MainContainer = styled(Container)(() => ({
  maxWidth: '1200px',
  padding: 'var(--space-8) var(--space-6)',
  background: 'linear-gradient(135deg, var(--surface-alt) 0%, var(--brand-primary-50) 50%, var(--brand-accent-50) 100%)',
  minHeight: '100vh',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: 'radial-gradient(circle at 20% 20%, var(--brand-primary-100) 1px, transparent 1px), radial-gradient(circle at 80% 80%, var(--brand-accent-100) 1px, transparent 1px)',
    backgroundSize: '40px 40px, 60px 60px',
    opacity: 0.3,
    pointerEvents: 'none',
    zIndex: 0,
  },
  '& > *': {
    position: 'relative',
    zIndex: 1,
  },
}))

const SectionCard = styled(Card)(() => ({
  marginBottom: 'var(--space-6)',
  border: '1px solid var(--grey-200)',
  borderRadius: 'var(--radius-lg)',
  overflow: 'hidden',
  background: 'linear-gradient(135deg, var(--surface) 0%, var(--surface-alt) 100%)',
  boxShadow: 'var(--shadow-md)',
  transition: 'all var(--transition-normal)',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '3px',
    background: 'linear-gradient(90deg, var(--brand-primary) 0%, var(--brand-accent) 100%)',
    opacity: 0.8,
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: '-50px',
    right: '-50px',
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, var(--brand-primary-100) 0%, transparent 70%)',
    opacity: 0.4,
    pointerEvents: 'none',
  },
  '&:hover': {
    boxShadow: 'var(--shadow-lg)',
    transform: 'translateY(-2px)',
    '&::before': {
      opacity: 1,
    },
    '&::after': {
      opacity: 0.6,
    },
  }
}))

const SectionHeader = styled(Box)(() => ({
  padding: 'var(--space-5) var(--space-6)',
  backgroundColor: 'var(--surface-alt)',
  borderBottom: '1px solid var(--grey-200)',
}))

const TaskCard = styled(Card)<{ highlight?: boolean }>(({ highlight }) => ({
  padding: 'var(--space-4)',
  margin: 'var(--space-2) 0',
  border: highlight ? '2px solid var(--brand-primary)' : '1px solid var(--grey-200)',
  borderRadius: 'var(--radius-md)',
  backgroundColor: highlight ? 'var(--brand-primary-50)' : 'var(--surface)',
  transition: 'all var(--transition-fast)',
  boxShadow: 'var(--shadow-sm)',
  '&:hover': {
    backgroundColor: highlight ? 'var(--brand-primary-100)' : 'var(--surface-hover)',
    boxShadow: 'var(--shadow-md)',
    transform: 'translateY(-1px)',
  },
  // Ensure interactive elements remain clickable
  '& .MuiFormControl-root, & .MuiSelect-root, & .MuiIconButton-root, & .MuiCheckbox-root': {
    position: 'relative',
    zIndex: 2,
    pointerEvents: 'auto',
  },
}))

const MeetingHeader = styled(Box)<{ expanded?: boolean }>(({ expanded }) => ({
  padding: 'var(--space-4) var(--space-5)',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  background: expanded
    ? 'linear-gradient(135deg, var(--surface-alt) 0%, var(--brand-primary-50) 100%)'
    : 'transparent',
  borderBottom: expanded ? '1px solid var(--grey-200)' : 'none',
  transition: 'all var(--transition-fast)',
  borderRadius: 'var(--radius-md)',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '3px',
    background: 'linear-gradient(180deg, var(--brand-primary) 0%, var(--brand-accent) 100%)',
    opacity: expanded ? 1 : 0,
    transition: 'opacity var(--transition-fast)',
  },
  '&:hover': {
    background: 'linear-gradient(135deg, var(--surface-hover) 0%, var(--brand-primary-100) 100%)',
    transform: 'translateX(4px)',
    '&::before': {
      opacity: 0.7,
    },
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
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null)
  const [dropTargetId, setDropTargetId] = useState<string | null>(null)

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



  // Function to toggle task completion status
  const handleTaskToggle = (taskId: string) => {
    // Update task status immediately
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId
          ? { ...task, status: task.status === 'completed' ? 'todo' : 'completed' }
          : task
      )
    )
  }

  // Function to delete a task
  const handleDeleteTask = (taskId: string) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId))
  }

  // Function to change task status (for in-progress)
  const handleStatusChange = (taskId: string, newStatus: 'todo' | 'in-progress' | 'completed') => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId
          ? { ...task, status: newStatus }
          : task
      )
    )
  }

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', taskId)

    // Add visual feedback to dragged element
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.5'
    }
  }

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedTaskId(null)
    setDropTargetId(null)

    // Reset visual feedback
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1'
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDragEnter = (e: React.DragEvent, targetTaskId: string) => {
    e.preventDefault()
    if (draggedTaskId && draggedTaskId !== targetTaskId) {
      setDropTargetId(targetTaskId)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    // Only clear drop target if we're leaving the card entirely
    if (e.currentTarget === e.target) {
      setDropTargetId(null)
    }
  }

  const handleDrop = (e: React.DragEvent, targetTaskId: string) => {
    e.preventDefault()

    if (!draggedTaskId || draggedTaskId === targetTaskId) {
      return
    }

    const draggedTask = tasks.find(t => t.id === draggedTaskId)
    const targetTask = tasks.find(t => t.id === targetTaskId)

    if (!draggedTask || !targetTask) {
      return
    }

    // Only allow reordering within the same section
    const sameSection = (
      (draggedTask.assignee === CURRENT_USER && targetTask.assignee === CURRENT_USER) ||
      (draggedTask.assignee !== CURRENT_USER && targetTask.assignee !== CURRENT_USER) ||
      (draggedTask.description.includes('From') && targetTask.description.includes('From') &&
       draggedTask.description === targetTask.description)
    )

    if (!sameSection) {
      return
    }

    // Reorder tasks
    setTasks(prevTasks => {
      const newTasks = [...prevTasks]
      const draggedIndex = newTasks.findIndex(t => t.id === draggedTaskId)
      const targetIndex = newTasks.findIndex(t => t.id === targetTaskId)

      if (draggedIndex === -1 || targetIndex === -1) {
        return prevTasks
      }

      // Remove dragged task and insert at target position
      const [draggedItem] = newTasks.splice(draggedIndex, 1)
      newTasks.splice(targetIndex, 0, draggedItem)

      return newTasks
    })

    setDraggedTaskId(null)
    setDropTargetId(null)
  }

  // Keyboard reordering handlers
  const handleKeyDown = (e: React.KeyboardEvent, taskId: string) => {
    if (e.altKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
      e.preventDefault()

      const taskIndex = tasks.findIndex(t => t.id === taskId)
      if (taskIndex === -1) return

      const direction = e.key === 'ArrowUp' ? -1 : 1
      const newIndex = taskIndex + direction

      if (newIndex < 0 || newIndex >= tasks.length) return

      // Check if we're moving within the same section
      const currentTask = tasks[taskIndex]
      const targetTask = tasks[newIndex]

      const sameSection = (
        (currentTask.assignee === CURRENT_USER && targetTask.assignee === CURRENT_USER) ||
        (currentTask.assignee !== CURRENT_USER && targetTask.assignee !== CURRENT_USER) ||
        (currentTask.description.includes('From') && targetTask.description.includes('From') &&
         currentTask.description === targetTask.description)
      )

      if (!sameSection) return

      setTasks(prevTasks => {
        const newTasks = [...prevTasks]
        const [movedTask] = newTasks.splice(taskIndex, 1)
        newTasks.splice(newIndex, 0, movedTask)
        return newTasks
      })
    }
  }

  // Keep tasks in their original order - no automatic reordering
  const myTasks = tasks.filter((t) => t.assignee === CURRENT_USER)
  const teamTasks = tasks.filter((t) => t.assignee !== CURRENT_USER)

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
      tasks: group.tasks // Keep original task order within meetings
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
        return <CheckCircle2 size={16} color="var(--brand-primary)" />
      case 'in-progress':
        return <Clock size={16} color="var(--brand-accent)" />
      default:
        return <Circle size={16} color="var(--grey-400)" />
    }
  }

  const TaskCardComponent = ({
    task,
    highlight = false,
    onToggle,
    onDelete,
    onStatusChange,
  }: {
    task: Task;
    highlight?: boolean;
    onToggle?: (taskId: string) => void;
    onDelete?: (taskId: string) => void;
    onStatusChange?: (taskId: string, status: 'todo' | 'in-progress' | 'completed') => void;
  }) => {
    const isDragging = draggedTaskId === task.id
    const isDropTarget = dropTargetId === task.id

    return (
      <TaskCard
        draggable
        highlight={highlight}
        onDragStart={(e) => handleDragStart(e, task.id)}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDragEnter={(e) => handleDragEnter(e, task.id)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, task.id)}
        onKeyDown={(e) => handleKeyDown(e, task.id)}
        tabIndex={0}
        role="button"
        aria-grabbed={isDragging}
        aria-dropeffect="move"
        sx={{
          opacity: task.status === 'completed' ? 0.7 : 1,
          transition: 'all 0.2s ease',
          cursor: isDragging ? 'grabbing' : 'grab',
          transform: 'none',
          borderColor: isDropTarget ? 'var(--brand-primary)' : undefined,
          backgroundColor: isDropTarget ? 'var(--brand-primary-50)' : undefined,
          boxShadow: isDropTarget ? '0 0 0 2px var(--brand-primary-200)' : undefined,
          borderLeft: task.priority === 'high' ? '4px solid var(--priority-high)' :
                     task.priority === 'medium' ? '4px solid var(--priority-medium)' :
                     '4px solid var(--brand-accent)',
          '&:hover': {
            boxShadow: task.priority === 'high' ? '0 8px 24px rgba(239, 68, 68, 0.15)' :
                      task.priority === 'medium' ? '0 8px 24px rgba(245, 158, 11, 0.15)' :
                      '0 8px 24px rgba(75, 163, 195, 0.15)',
          },
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
              <Box
                className={`badge badge-priority-${task.priority}`}
                sx={{ textTransform: 'uppercase', fontSize: '0.75rem' }}
              >
                {task.priority}
              </Box>
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
              <User size={12} color="var(--brand-accent)" />
              <Typography variant="caption" sx={{ color: 'var(--text-secondary)' }}>
                {task.assignee}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Calendar size={12} color="var(--brand-primary)" />
              <Typography variant="caption" sx={{ color: 'var(--text-secondary)' }}>
                {new Date(task.dueDate).toLocaleDateString()}
              </Typography>
            </Box>
          </Box>


        </Box>
      </Box>
    </TaskCard>
    )
  }

  return (
    <MainContainer>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <Box className="icon-container-primary">
          <CheckSquare size={24} color="var(--brand-primary)" />
        </Box>
        <Typography variant="h3" sx={{ fontWeight: 700, color: 'var(--text-primary)' }}>
          Tasks
        </Typography>
      </Box>

      {/* My Action Items */}
      <SectionCard>
        <SectionHeader>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box className="icon-container-primary">
              <User size={18} color="var(--brand-primary)" />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 600, color: 'var(--text-primary)' }}>
              My Action Items ({myTasks.length})
            </Typography>
          </Box>
        </SectionHeader>
        <CardContent>
          {myTasks.length === 0 ? (
            <Box className="empty-state-decoration" sx={{ textAlign: 'center', py: 6, position: 'relative' }}>
              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <CheckSquare size={48} color="var(--brand-primary)" style={{ opacity: 0.3, marginBottom: '16px' }} />
                <Typography variant="body2" sx={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
                  No action items assigned to you.
                </Typography>
                <Typography variant="caption" sx={{ color: 'var(--text-tertiary)', mt: 1, display: 'block' }}>
                  New tasks will appear here when assigned
                </Typography>
              </Box>
            </Box>
          ) : (
            myTasks.map((task) => (
              <TaskCardComponent
                key={task.id}
                task={task}
                onToggle={handleTaskToggle}
                onDelete={handleDeleteTask}
                onStatusChange={handleStatusChange}
              />
            ))
          )}
        </CardContent>
      </SectionCard>

      {/* Team Action Items */}
      <SectionCard>
        <SectionHeader>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box className="icon-container-accent">
              <Users size={18} color="var(--brand-accent)" />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 600, color: 'var(--text-primary)' }}>
              Team Action Items ({teamTasks.length})
            </Typography>
          </Box>
        </SectionHeader>
        <CardContent>
          {teamTasks.length === 0 ? (
            <Box className="empty-state-decoration" sx={{ textAlign: 'center', py: 6, position: 'relative' }}>
              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Users size={48} color="var(--brand-accent)" style={{ opacity: 0.3, marginBottom: '16px' }} />
                <Typography variant="body2" sx={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
                  No team action items.
                </Typography>
                <Typography variant="caption" sx={{ color: 'var(--text-tertiary)', mt: 1, display: 'block' }}>
                  Team tasks will appear here when created
                </Typography>
              </Box>
            </Box>
          ) : (
            teamTasks.map((task) => (
              <TaskCardComponent
                key={task.id}
                task={task}
                onToggle={handleTaskToggle}
                onDelete={handleDeleteTask}
                onStatusChange={handleStatusChange}
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
                    <Box className="icon-container-primary" sx={{ minWidth: 'auto', p: 1 }}>
                      <Video size={16} color="var(--brand-primary)" />
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {meeting.title}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
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
