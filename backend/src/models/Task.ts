import mongoose, { Schema, Document, Types } from 'mongoose'

export type TaskStatus = 'todo' | 'in-progress' | 'completed'
export type TaskPriority = 'low' | 'medium' | 'high'

export interface ITask extends Document {
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  assignee?: string
  dueDate?: Date
  meetingId?: Types.ObjectId // ref: NotetakerSession
  transcriptId?: Types.ObjectId // ref: Transcript
  completedAt?: Date
  createdAt: Date
  updatedAt: Date
}

const TaskSchema = new Schema<ITask>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    status: { type: String, enum: ['todo', 'in-progress', 'completed'], default: 'todo', index: true },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    assignee: { type: String, trim: true, index: true },
    dueDate: { type: Date },
    meetingId: { type: Schema.Types.ObjectId, ref: 'NotetakerSession', index: true },
    transcriptId: { type: Schema.Types.ObjectId, ref: 'Transcript', index: true },
    completedAt: { type: Date },
  },
  { timestamps: true }
)

// Indexes for common queries
TaskSchema.index({ meetingId: 1, status: 1 })
TaskSchema.index({ assignee: 1, status: 1 })

const Task = mongoose.models.Task || mongoose.model<ITask>('Task', TaskSchema)
export default Task

