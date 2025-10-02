import mongoose, { Schema, Document } from 'mongoose';

export interface INotetakerSession extends Document {
  notetakerId: string;
  meetingLink: string;
  meetingProvider: string;
  name: string;
  joinTime?: number;
  state: string;
  meetingState?: string;
  meetingSettings: {
    audioRecording: boolean;
    videoRecording: boolean;
    transcription: boolean;
    summary: boolean;
    actionItems: boolean;
    summaryInstructions?: string;
    actionItemsInstructions?: string;
  };
  grantId?: string;
  calendarId?: string;
  eventId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const NotetakerSessionSchema: Schema = new Schema(
  {
    notetakerId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    meetingLink: {
      type: String,
      required: true,
    },
    meetingProvider: {
      type: String,
      default: 'Unknown',
    },
    name: {
      type: String,
      default: 'Nylas Notetaker',
    },
    joinTime: {
      type: Number,
    },
    state: {
      type: String,
      enum: ['scheduled', 'connecting', 'connected', 'disconnected', 'failed', 'cancelled'],
      default: 'scheduled',
      index: true,
    },
    meetingState: {
      type: String,
      enum: ['dispatched', 'joined', 'left', 'failed_entry', 'api_request'],
    },
    meetingSettings: {
      audioRecording: {
        type: Boolean,
        default: true,
      },
      videoRecording: {
        type: Boolean,
        default: false,
      },
      transcription: {
        type: Boolean,
        default: true,
      },
      summary: {
        type: Boolean,
        default: false,
      },
      actionItems: {
        type: Boolean,
        default: false,
      },
      summaryInstructions: {
        type: String,
      },
      actionItemsInstructions: {
        type: String,
      },
    },
    grantId: {
      type: String,
    },
    calendarId: {
      type: String,
    },
    eventId: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index for querying by state
NotetakerSessionSchema.index({ state: 1, createdAt: -1 });

export default mongoose.model<INotetakerSession>('NotetakerSession', NotetakerSessionSchema);

