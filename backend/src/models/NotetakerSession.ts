import mongoose, { Schema, Document } from 'mongoose';

export interface INotetakerSession extends Document {
  notetakerId: string;
  meetingLink: string;
  meetingProvider: string;
  name: string;
  meetingTitle?: string;
  joinTime?: number;
  state: string;
  meetingState?: string;
  meetingSettings: {
    audioRecording: boolean;
    videoRecording: boolean;
    transcription: boolean;
    summary: boolean;
    actionItems: boolean;
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
    meetingTitle: {
      type: String,
    },
    joinTime: {
      type: Number,
    },
    state: {
      type: String,
      enum: [
        'scheduled',
        'connecting',
        'connected',
        'attending',
        'waiting_for_entry',
        'disconnected',
        'failed_entry',
        'failed',
        'cancelled',
        'completed'
      ],
      default: 'scheduled',
      index: true,
    },
    meetingState: {
      type: String,
      enum: [
        'dispatched',
        'recording_active',
        'waiting_for_entry',
        'entry_denied',
        'no_response',
        'kicked',
        'no_participants',
        'no_meeting_activity',
        'bad_meeting_code',
        'api_request',
        'internal_error',
        'meeting_complete',
        'meeting_ended'
      ],
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

