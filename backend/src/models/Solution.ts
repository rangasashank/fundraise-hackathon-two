import mongoose, { Schema, Document, Types } from 'mongoose'

export interface ISolution extends Document {
  insightId: Types.ObjectId
  title: string
  description: string
  expectedImpact: string
  nextSteps: string[]
  createdAt: Date
  updatedAt: Date
}

const SolutionSchema = new Schema<ISolution>(
  {
    insightId: {
      type: Schema.Types.ObjectId,
      ref: 'Insight',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    expectedImpact: {
      type: String,
      required: true,
    },
    nextSteps: {
      type: [String],
      required: true,
      default: [],
    },
  },
  {
    timestamps: true,
  }
)

// Index for efficient querying by insight
SolutionSchema.index({ insightId: 1 })

export default mongoose.model<ISolution>('Solution', SolutionSchema)

