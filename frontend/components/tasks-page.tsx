import React, { useState, useEffect, useMemo, useCallback, memo } from 'react'
import { useRouter } from 'next/router'
import { Box, Typography, Container, Checkbox, IconButton, MenuItem, Select, FormControl, CircularProgress, Alert } from '@mui/material'
import { styled } from '@mui/material/styles'
import { Calendar, CheckCircle2, Circle, Clock, User, Trash2, CheckSquare, Users, RefreshCw } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import * as api from '@/lib/api'

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


export default function TasksPage() {
  const router = useRouter()

  // Data state
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  // Drag and drop state
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null)
  const [dropTargetId, setDropTargetId] = useState<string | null>(null)

  // Fetch tasks from backend
  const fetchTasks = useCallback(async () => {
    try {
      setError(null)
      const response = await api.getTasks()
      if (response.success) {
        const mapped = response.data.map((t: any) => ({
          id: t._id,
          title: t.title,
          description: t.description || 'Task',
          assignee: t.assignee || 'Unassigned',
          dueDate: t.dueDate || new Date().toISOString(),
          priority: t.priority,
          status: t.status,
          meetingId: t.meetingId,
          meetingTitle: undefined,
        }))
        setTasks(mapped)
      } else {
        throw new Error('Failed to fetch tasks')
      }
    } catch (err: any) {
      console.error('Error fetching tasks:', err)
      setError(err.message || 'Failed to load tasks. Please try again.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  // Initial data fetch
  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  // Refresh handler
  const handleRefresh = useCallback(() => {
    setRefreshing(true)
    fetchTasks()
  }, [fetchTasks])


  // Function to toggle task completion status (optimistic)
  const handleTaskToggle = useCallback(async (taskId: string) => {
    // Optimistic toggle
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: t.status === 'completed' ? 'todo' : 'completed' } : t))
    try {
      await api.toggleTaskCompletion(taskId)
    } catch (err) {
      console.error('Failed to toggle task', err)
      // Roll back
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: t.status === 'completed' ? 'todo' : 'completed' } : t))
      setError('Failed to update task. Please try again.')
    }
  }, [])

  // Function to delete a task (optimistic)
  const handleDeleteTask = useCallback(async (taskId: string) => {
    const deleted = tasks.find(t => t.id === taskId)
    setTasks(prev => prev.filter(t => t.id !== taskId))
    try {
      await api.deleteTask(taskId)
    } catch (err) {
      console.error('Failed to delete task', err)
      // Roll back by re-adding task at the start to minimize reflow
      if (deleted) setTasks(prev => [deleted, ...prev])
      setError('Failed to delete task. Please try again.')
    }
  }, [tasks])

  // Function to change task status (optimistic)
  const handleStatusChange = useCallback(async (taskId: string, newStatus: 'todo' | 'in-progress' | 'completed') => {
    const prevTask = tasks.find(t => t.id === taskId)
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t))
    try {
      await api.updateTask(taskId, { status: newStatus })
    } catch (err) {
      console.error('Failed to change task status', err)
      // Roll back
      if (prevTask) setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: prevTask.status } : t))
      setError('Failed to update task. Please try again.')
    }
  }, [tasks])

  // Drag and Drop handlers
  const handleDragStart = useCallback((e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', taskId)

    // Add visual feedback to dragged element
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.5'
    }
  }, [])

  const handleDragEnd = useCallback((e: React.DragEvent) => {
    setDraggedTaskId(null)
    setDropTargetId(null)

    // Reset visual feedback
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1'
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }, [])

  const handleDragEnter = useCallback((e: React.DragEvent, targetTaskId: string) => {
    e.preventDefault()
    setDropTargetId(prevId => {
      // Only update if different to avoid unnecessary re-renders
      if (draggedTaskId && draggedTaskId !== targetTaskId && prevId !== targetTaskId) {
        return targetTaskId
      }
      return prevId
    })
  }, [draggedTaskId])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    // Only clear drop target if we're leaving the card entirely
    if (e.currentTarget === e.target) {
      setDropTargetId(null)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent, targetTaskId: string) => {
    e.preventDefault()

    if (!draggedTaskId || draggedTaskId === targetTaskId) {
      return
    }

    // Reorder tasks
    setTasks(prevTasks => {
      const draggedTask = prevTasks.find(t => t.id === draggedTaskId)
      const targetTask = prevTasks.find(t => t.id === targetTaskId)

      if (!draggedTask || !targetTask) {
        return prevTasks
      }

      // Only allow reordering within the same section
      const sameSection = (
        (draggedTask.assignee === CURRENT_USER && targetTask.assignee === CURRENT_USER) ||
        (draggedTask.assignee !== CURRENT_USER && targetTask.assignee !== CURRENT_USER) ||
        (draggedTask.description.includes('From') && targetTask.description.includes('From') &&
         draggedTask.description === targetTask.description)
      )

      if (!sameSection) {
        return prevTasks
      }

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
  }, [draggedTaskId])

  // Keyboard reordering handlers
  const handleKeyDown = useCallback((e: React.KeyboardEvent, taskId: string) => {
    if (e.altKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
      e.preventDefault()

      setTasks(prevTasks => {
        const taskIndex = prevTasks.findIndex(t => t.id === taskId)
        if (taskIndex === -1) return prevTasks

        const direction = e.key === 'ArrowUp' ? -1 : 1
        const newIndex = taskIndex + direction

        if (newIndex < 0 || newIndex >= prevTasks.length) return prevTasks

        // Check if we're moving within the same section
        const currentTask = prevTasks[taskIndex]
        const targetTask = prevTasks[newIndex]

        const sameSection = (
          (currentTask.assignee === CURRENT_USER && targetTask.assignee === CURRENT_USER) ||
          (currentTask.assignee !== CURRENT_USER && targetTask.assignee !== CURRENT_USER) ||
          (currentTask.description.includes('From') && targetTask.description.includes('From') &&
           currentTask.description === targetTask.description)
        )

        if (!sameSection) return prevTasks

        const newTasks = [...prevTasks]
        const [movedTask] = newTasks.splice(taskIndex, 1)
        newTasks.splice(newIndex, 0, movedTask)
        return newTasks
      })
    }
  }, [])

  // Memoize filtered tasks to avoid recalculating on every render
  const myTasks = useMemo(() =>
    tasks.filter((t) => t.assignee === CURRENT_USER),
    [tasks]
  )

  const teamTasks = useMemo(() =>
    tasks.filter((t) => t.assignee !== CURRENT_USER),
    [tasks]
  )



  // Memoized TaskCardComponent to prevent unnecessary re-renders
  const TaskCardComponent = memo(({
    task,
    highlight = false,
    onToggle,
    onDelete,
    onStatusChange,
    isDragging,
    isDropTarget,
    onDragStart,
    onDragEnd,
    onDragOver,
    onDragEnter,
    onDragLeave,
    onDrop,
    onKeyDown,
  }: {
    task: Task;
    highlight?: boolean;
    onToggle?: (taskId: string) => void;
    onDelete?: (taskId: string) => void;
    onStatusChange?: (taskId: string, status: 'todo' | 'in-progress' | 'completed') => void;
    isDragging: boolean;
    isDropTarget: boolean;
    onDragStart: (e: React.DragEvent, taskId: string) => void;
    onDragEnd: (e: React.DragEvent) => void;
    onDragOver: (e: React.DragEvent) => void;
    onDragEnter: (e: React.DragEvent, taskId: string) => void;
    onDragLeave: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent, taskId: string) => void;
    onKeyDown: (e: React.KeyboardEvent, taskId: string) => void;
  }) => {

    return (
      <TaskCard
        draggable
        highlight={highlight}
        onDragStart={(e) => onDragStart(e, task.id)}
        onDragEnd={onDragEnd}
        onDragOver={onDragOver}
        onDragEnter={(e) => onDragEnter(e, task.id)}
        onDragLeave={onDragLeave}
        onDrop={(e) => onDrop(e, task.id)}
        onKeyDown={(e) => onKeyDown(e, task.id)}
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
  })

  return (
    <MainContainer>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box className="icon-container-primary">
            <CheckSquare size={24} color="var(--brand-primary)" />
          </Box>
          <Typography variant="h3" sx={{ fontWeight: 700, color: 'var(--text-primary)' }}>
            Tasks
          </Typography>
        </Box>
        <Button
          onClick={handleRefresh}
          variant="outline"
          size="sm"
          disabled={refreshing}
        >
          <RefreshCw size={16} style={{ marginRight: 8 }} className={refreshing ? 'animate-spin' : ''} />
          Refresh
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : tasks.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="body1" sx={{ color: 'var(--text-secondary)', mb: 2 }}>
            No tasks found. Action items from meetings will appear here.
          </Typography>
          <Button
            onClick={() => router.push('/meetings')}
            variant="outline"
            size="sm"
          >
            Go to Meetings
          </Button>
        </Box>
      ) : (
        <>

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
                isDragging={draggedTaskId === task.id}
                isDropTarget={dropTargetId === task.id}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onKeyDown={handleKeyDown}
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
                isDragging={draggedTaskId === task.id}
                isDropTarget={dropTargetId === task.id}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onKeyDown={handleKeyDown}
              />
            ))
          )}
        </CardContent>
      </SectionCard>


      </>
      )}
    </MainContainer>
  )
}
