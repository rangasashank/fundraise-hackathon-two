// TypeScript interfaces matching backend data models

export interface NotetakerSession {
  _id: string
  notetakerId: string
  meetingLink: string
  meetingProvider: string
  name: string
  meetingTitle?: string
  joinTime?: number
  state: 'scheduled' | 'connecting' | 'connected' | 'attending' | 'waiting_for_entry' | 'disconnected' | 'failed_entry' | 'failed' | 'cancelled' | 'completed'
  meetingState?: 'dispatched' | 'recording_active' | 'waiting_for_entry' | 'entry_denied' | 'no_response' | 'kicked' | 'no_participants' | 'no_meeting_activity' | 'bad_meeting_code' | 'api_request' | 'internal_error' | 'meeting_complete' | 'meeting_ended'
  meetingSettings: {
    audioRecording: boolean
    videoRecording: boolean
    transcription: boolean
    summary: boolean
    actionItems: boolean
  }
  grantId?: string
  calendarId?: string
  eventId?: string
  createdAt: string
  updatedAt: string
}

export interface Transcript {
  _id: string
  notetakerId: string
  sessionId: string | NotetakerSession
  transcriptText?: string
  transcriptUrl?: string
  audioUrl?: string
  videoUrl?: string
  summaryText?: string
  summaryUrl?: string
  actionItems?: string[]
  actionItemsUrl?: string
  duration?: number
  participants?: string[]
  status: 'processing' | 'completed' | 'failed' | 'partial'
  mediaFiles: Array<{
    type: 'audio' | 'video' | 'transcript' | 'summary' | 'action_items'
    url: string
    filename?: string
    size?: number
    downloadedAt?: string
  }>
  errorMessage?: string
  createdAt: string
  updatedAt: string
}

// Combined meeting interface for frontend display
export interface Meeting {
  id: string
  title: string
  date: Date
  time: string
  attendees: string[]
  description?: string
  hasTranscript: boolean
  transcript?: string
  notes?: string
  summaryText?: string
  actionItems?: string[]
  // Backend references
  sessionId?: string
  transcriptId?: string
  notetakerId?: string
  state?: NotetakerSession['state']
  meetingState?: NotetakerSession['meetingState']
  meetingLink?: string
  meetingProvider?: string
}


// Task interface (backed by MongoDB Task model)
export interface Task {
  _id: string
  title: string
  description?: string
  status: 'todo' | 'in-progress' | 'completed'
  priority: 'low' | 'medium' | 'high'
  assignee?: string
  dueDate?: string
  meetingId?: string
  transcriptId?: string
  completedAt?: string
  createdAt: string
  updatedAt: string
}

// API Response wrappers
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface ApiListResponse<T> {
  success: boolean
  data: T[]
  error?: string
}

// Request types
export interface InviteNotetakerRequest {
  meetingLink: string
  joinTime?: number
  name?: string
}

export interface ProcessTranscriptRequest {
  transcriptId: string
  processSummary?: boolean
  processActionItems?: boolean
}

// SSE Event types
export interface SessionUpdateEvent {
  notetakerId: string
  state: NotetakerSession['state']
  sessionId: string
  meetingState?: NotetakerSession['meetingState']
  timestamp: string
}

export interface TranscriptUpdateEvent {
  transcriptId: string
  notetakerId: string
  status: Transcript['status']
  hasTranscript: boolean
  hasSummary: boolean
  hasActionItems: boolean
  timestamp: string
}

