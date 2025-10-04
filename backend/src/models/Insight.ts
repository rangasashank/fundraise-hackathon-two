import mongoose, { Schema, Document, Types } from 'mongoose'

export interface IInsight extends Document {
  issueTitle: string
  score: number
  rationale: string
  occurrenceCount: number
  firstSeenDate: Date
  lastSeenDate: Date
  relatedMeetingIds: Types.ObjectId[]
  createdAt: Date
  updatedAt: Date
}

const InsightSchema = new Schema<IInsight>(
  {
    issueTitle: {
      type: String,
      required: true,
      trim: true,
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    rationale: {
      type: String,
      required: true,
    },
    occurrenceCount: {
      type: Number,
      required: true,
      default: 1,
    },
    firstSeenDate: {
      type: Date,
      required: true,
    },
    lastSeenDate: {
      type: Date,
      required: true,
    },
    relatedMeetingIds: {
      type: [Schema.Types.ObjectId],
      ref: 'NotetakerSession',
      default: [],
    },
  },
  {
    timestamps: true,
  }
)

// Indexes for efficient querying
InsightSchema.index({ score: -1 })
InsightSchema.index({ lastSeenDate: -1 })
InsightSchema.index({ issueTitle: 1 })

export default mongoose.model<IInsight>('Insight', InsightSchema)

