import mongoose, { Schema, Document } from 'mongoose'

// Store aggregated context to avoid re-processing all meetings
export interface IInsightContext extends Document {
  contextType: 'full_analysis'
  summary: string
  totalMeetingsAnalyzed: number
  lastAnalyzedMeetingId: string
  lastAnalyzedDate: Date
  createdAt: Date
  updatedAt: Date
}

const InsightContextSchema = new Schema<IInsightContext>(
  {
    contextType: {
      type: String,
      required: true,
      default: 'full_analysis',
    },
    summary: {
      type: String,
      required: true,
    },
    totalMeetingsAnalyzed: {
      type: Number,
      required: true,
      default: 0,
    },
    lastAnalyzedMeetingId: {
      type: String,
      required: true,
    },
    lastAnalyzedDate: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

export default mongoose.model<IInsightContext>('InsightContext', InsightContextSchema)

