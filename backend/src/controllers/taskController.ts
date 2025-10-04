import { Request, Response } from 'express'
import Task, { TaskStatus, TaskPriority } from '../models/Task'

export const listTasks = async (req: Request, res: Response) => {
  try {
    const { status, assignee, meetingId } = req.query as {
      status?: TaskStatus
      assignee?: string
      meetingId?: string
    }

    const filter: any = {}
    if (status) filter.status = status
    if (assignee) filter.assignee = assignee
    if (meetingId) filter.meetingId = meetingId

    const tasks = await Task.find(filter).sort({ createdAt: -1 }).limit(1000)
    res.json({ success: true, data: tasks })
  } catch (err: any) {
    console.error('listTasks error', err)
    res.status(500).json({ success: false, error: 'Failed to fetch tasks' })
  }
}

export const getTask = async (req: Request, res: Response) => {
  try {
    const task = await Task.findById(req.params.id)
    if (!task) return res.status(404).json({ success: false, error: 'Task not found' })
    res.json({ success: true, data: task })
  } catch (err: any) {
    console.error('getTask error', err)
    res.status(500).json({ success: false, error: 'Failed to fetch task' })
  }
}

export const createTask = async (req: Request, res: Response) => {
  try {
    const { title, description, status, priority, assignee, dueDate, meetingId, transcriptId } = req.body as {
      title: string
      description?: string
      status?: TaskStatus
      priority?: TaskPriority
      assignee?: string
      dueDate?: string | Date
      meetingId?: string
      transcriptId?: string
    }

    if (!title) return res.status(400).json({ success: false, error: 'Title is required' })

    const task = await Task.create({
      title,
      description,
      status: status || 'todo',
      priority: priority || 'medium',
      assignee,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      meetingId,
      transcriptId,
    })

    res.status(201).json({ success: true, data: task })
  } catch (err: any) {
    console.error('createTask error', err)
    res.status(500).json({ success: false, error: 'Failed to create task' })
  }
}

export const updateTask = async (req: Request, res: Response) => {
  try {
    const updates = req.body as Partial<{ title: string; description: string; status: TaskStatus; priority: TaskPriority; assignee: string; dueDate: string | Date }>

    // Convert dueDate string to Date if provided
    const updateData: any = { ...updates }
    if (updates.dueDate && typeof updates.dueDate === 'string') {
      updateData.dueDate = new Date(updates.dueDate)
    }

    // If status is being set to completed, set completedAt
    if (updateData.status === 'completed') {
      updateData.completedAt = new Date()
    }

    const task = await Task.findByIdAndUpdate(req.params.id, updateData as any, { new: true } as any)
    if (!task) return res.status(404).json({ success: false, error: 'Task not found' })
    res.json({ success: true, data: task })
  } catch (err: any) {
    console.error('updateTask error', err)
    res.status(500).json({ success: false, error: 'Failed to update task' })
  }
}

export const deleteTask = async (req: Request, res: Response) => {
  try {
    const deleted = await Task.findByIdAndDelete(req.params.id)
    if (!deleted) return res.status(404).json({ success: false, error: 'Task not found' })
    res.json({ success: true, data: deleted })
  } catch (err: any) {
    console.error('deleteTask error', err)
    res.status(500).json({ success: false, error: 'Failed to delete task' })
  }
}

export const toggleTask = async (req: Request, res: Response) => {
  try {
    const task = await Task.findById(req.params.id)
    if (!task) return res.status(404).json({ success: false, error: 'Task not found' })
    const nextStatus: TaskStatus = task.status === 'completed' ? 'todo' : 'completed'
    task.status = nextStatus
    task.completedAt = nextStatus === 'completed' ? new Date() : undefined
    await task.save()
    res.json({ success: true, data: task })
  } catch (err: any) {
    console.error('toggleTask error', err)
    res.status(500).json({ success: false, error: 'Failed to toggle task' })
  }
}

