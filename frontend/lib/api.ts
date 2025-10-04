import axios, { AxiosInstance, AxiosError } from 'axios'
import type {
  ApiResponse,
  ApiListResponse,
  NotetakerSession,
  Transcript,
  InviteNotetakerRequest,
  ProcessTranscriptRequest,
  Task,
  Insight,
  Solution,
} from './types'

// Get API base URL from environment variable
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

// Create axios instance with default config
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for logging
apiClient.interceptors.request.use(
  (config) => {
    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`)
    return config
  },
  (error) => {
    console.error('[API] Request error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log(`[API] Response from ${response.config.url}:`, response.status)
    return response
  },
  (error: AxiosError) => {
    console.error('[API] Response error:', error.response?.status, error.message)

    // Handle specific error cases
    if (error.response) {
      const status = error.response.status
      const data = error.response.data as any

      if (status === 401) {
        console.error('[API] Authentication error')
      } else if (status === 404) {
        console.error('[API] Resource not found')
      } else if (status === 500) {
        console.error('[API] Server error')
      }

      // Return error message from backend if available
      if (data?.error) {
        return Promise.reject(new Error(data.error))
      }
    }

    return Promise.reject(error)
  }
)

// ============================================================================
// Notetaker Session API
// ============================================================================

/**
 * Invite notetaker to a meeting
 */
export const inviteNotetaker = async (
  request: InviteNotetakerRequest
): Promise<ApiResponse<{ session: NotetakerSession; notetaker: any }>> => {
  const response = await apiClient.post('/api/notetaker/invite', request)
  return response.data
}

/**
 * Get all notetaker sessions
 */
export const getSessions = async (): Promise<ApiListResponse<NotetakerSession>> => {
  const response = await apiClient.get('/api/notetaker/sessions')
  return response.data
}

/**
 * Get specific session by ID
 */
export const getSession = async (id: string): Promise<ApiResponse<NotetakerSession>> => {
  const response = await apiClient.get(`/api/notetaker/sessions/${id}`)
  return response.data
}

/**
 * Cancel a scheduled notetaker
 */
export const cancelNotetaker = async (id: string): Promise<ApiResponse<NotetakerSession>> => {
  const response = await apiClient.delete(`/api/notetaker/sessions/${id}/cancel`)
  return response.data
}

/**
 * Remove notetaker from active meeting
 */
export const removeNotetaker = async (id: string): Promise<ApiResponse<NotetakerSession>> => {
  const response = await apiClient.post(`/api/notetaker/sessions/${id}/leave`)
  return response.data
}

// ============================================================================
// Transcript API
// ============================================================================

/**
 * Get all transcripts
 */
export const getTranscripts = async (): Promise<ApiListResponse<Transcript>> => {
  const response = await apiClient.get('/api/notetaker/transcripts')
  return response.data
}

/**
 * Get specific transcript by ID
 */
export const getTranscript = async (id: string): Promise<ApiResponse<Transcript>> => {
  const response = await apiClient.get(`/api/notetaker/transcripts/${id}`)
  return response.data
}

/**
 * Get transcript by notetaker ID
 */
export const getTranscriptByNotetakerId = async (
  notetakerId: string
): Promise<ApiResponse<Transcript>> => {
  const response = await apiClient.get(`/api/notetaker/transcripts/notetaker/${notetakerId}`)
  return response.data
}

// ============================================================================
// AI Processing API
// ============================================================================

/**
 * Process transcript with AI agents
 */
export const processTranscript = async (
  request: ProcessTranscriptRequest
): Promise<ApiResponse<{ transcript: Transcript; summary?: any; actionItems?: any }>> => {
  const response = await apiClient.post('/api/ai/process-transcript', request)
  return response.data
}

/**
 * Reprocess transcript with AI agents (force reprocessing)
 */
export const reprocessTranscript = async (
  request: ProcessTranscriptRequest
): Promise<ApiResponse<{ transcript: Transcript; summary?: any; actionItems?: any }>> => {
  const response = await apiClient.post('/api/ai/reprocess-transcript', request)
  return response.data
}

// ============================================================================
// Task API
// =========================================================================

export const getTasks = async (filters?: Partial<{ status: 'todo' | 'in-progress' | 'completed'; assignee: string; meetingId: string }>): Promise<ApiListResponse<Task>> => {
  const response = await apiClient.get('/api/tasks', { params: filters })
  return response.data
}

export const getTask = async (id: string): Promise<ApiResponse<Task>> => {
  const response = await apiClient.get(`/api/tasks/${id}`)
  return response.data
}

export const createTask = async (data: Partial<Task> & { title: string }): Promise<ApiResponse<Task>> => {
  const response = await apiClient.post('/api/tasks', data)
  return response.data
}

export const updateTask = async (id: string, data: Partial<Task>): Promise<ApiResponse<Task>> => {
  const response = await apiClient.patch(`/api/tasks/${id}`, data)
  return response.data
}

export const deleteTask = async (id: string): Promise<ApiResponse<Task>> => {
  const response = await apiClient.delete(`/api/tasks/${id}`)
  return response.data
}

export const toggleTaskCompletion = async (id: string): Promise<ApiResponse<Task>> => {
  const response = await apiClient.patch(`/api/tasks/${id}/toggle`)
  return response.data
}


/**
 * Get AI processing status for a transcript
 */
export const getProcessingStatus = async (
  transcriptId: string
): Promise<ApiResponse<{ status: string; hasSummary: boolean; hasActionItems: boolean }>> => {
  const response = await apiClient.get(`/api/ai/status/${transcriptId}`)
  return response.data
}

// ============================================================================
// Server-Sent Events (SSE) for real-time updates
// ============================================================================

/**
 * Create EventSource for session updates
 */
export const createSessionUpdatesSSE = (
  onMessage: (event: MessageEvent) => void,
  onError?: (error: Event) => void
): EventSource => {
  const eventSource = new EventSource(`${API_BASE_URL}/api/sse/sessions`)

  eventSource.onmessage = onMessage

  if (onError) {
    eventSource.onerror = onError
  } else {
    eventSource.onerror = (error) => {
      console.error('[SSE] Connection error:', error)
    }
  }

  return eventSource
}

// ============================================================================
// Helper functions
// ============================================================================

/**
 * Check if backend is reachable
 */
export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    const response = await apiClient.get('/api/setup/status')
    return response.status === 200
  } catch (error) {
    console.error('[API] Backend health check failed:', error)
    return false
  }
}

/**
 * Get API base URL (useful for debugging)
 */
export const getApiBaseUrl = (): string => {
  return API_BASE_URL
}

// ============================================================================
// Insights API
// ============================================================================

export const analyzeAllMeetings = async (): Promise<ApiResponse<Insight[]>> => {
  const response = await apiClient.post('/api/insights/analyze-all')
  return response.data
}

export const getInsights = async (): Promise<ApiListResponse<Insight>> => {
  const response = await apiClient.get('/api/insights')
  return response.data
}

export const getInsight = async (id: string): Promise<ApiResponse<{ insight: Insight; solutions: Solution[] }>> => {
  const response = await apiClient.get(`/api/insights/${id}`)
  return response.data
}

export const brainstormSolutions = async (issueId: string, regenerate = false): Promise<ApiResponse<Solution[]>> => {
  const response = await apiClient.post(`/api/insights/${issueId}/brainstorm`, { regenerate })
  return response.data
}

export const deleteInsight = async (id: string): Promise<ApiResponse<void>> => {
  const response = await apiClient.delete(`/api/insights/${id}`)
  return response.data
}

export default apiClient
