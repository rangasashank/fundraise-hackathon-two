import mongoose, { Schema, Document } from 'mongoose';

export interface IWebhookEvent extends Document {
  eventId: string;
  eventType: string;
  notetakerId?: string;
  payload: any;
  processed: boolean;
  processedAt?: Date;
  errorMessage?: string;
  retryCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const WebhookEventSchema: Schema = new Schema(
  {
    eventId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    eventType: {
      type: String,
      required: true,
      index: true,
    },
    notetakerId: {
      type: String,
      index: true,
    },
    payload: {
      type: Schema.Types.Mixed,
      required: true,
    },
    processed: {
      type: Boolean,
      default: false,
      index: true,
    },
    processedAt: {
      type: Date,
    },
    errorMessage: {
      type: String,
    },
    retryCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for querying unprocessed events
WebhookEventSchema.index({ processed: 1, createdAt: 1 });

export default mongoose.model<IWebhookEvent>('WebhookEvent', WebhookEventSchema);

