import mongoose, { Schema, Document } from 'mongoose';

export interface ITranscript extends Document {
  notetakerId: string;
  sessionId: mongoose.Types.ObjectId;
  transcriptText?: string;
  transcriptUrl?: string;
  audioUrl?: string;
  videoUrl?: string;
  summaryText?: string;
  summaryUrl?: string;
  actionItems?: string[];
  actionItemsUrl?: string;
  duration?: number;
  participants?: string[];
  status: string;
  mediaFiles: Array<{
    type: string;
    url: string;
    filename?: string;
    size?: number;
    downloadedAt?: Date;
  }>;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TranscriptSchema: Schema = new Schema(
  {
    notetakerId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    sessionId: {
      type: Schema.Types.ObjectId,
      ref: 'NotetakerSession',
      required: true,
      index: true,
    },
    transcriptText: {
      type: String,
    },
    transcriptUrl: {
      type: String,
    },
    audioUrl: {
      type: String,
    },
    videoUrl: {
      type: String,
    },
    summaryText: {
      type: String,
    },
    summaryUrl: {
      type: String,
    },
    actionItems: {
      type: [String],
      default: [],
    },
    actionItemsUrl: {
      type: String,
    },
    duration: {
      type: Number,
    },
    participants: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['processing', 'completed', 'failed', 'partial'],
      default: 'processing',
      index: true,
    },
    mediaFiles: [
      {
        type: {
          type: String,
          enum: ['audio', 'video', 'transcript', 'summary', 'action_items'],
        },
        url: String,
        filename: String,
        size: Number,
        downloadedAt: Date,
      },
    ],
    errorMessage: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index for querying by status
TranscriptSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model<ITranscript>('Transcript', TranscriptSchema);

