const API_BASE_URL = 'http://localhost:4000'; // change with .env file

export interface InviteNotetakerRequest {
  meetingLink: string;
  joinTime?: number;
  name?: string;
}

export interface NotetakerSession {
  _id: string;
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
  };
  createdAt: string;
  updatedAt: string;
}

export interface Transcript {
  _id: string;
  notetakerId: string;
  sessionId: string | NotetakerSession;
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
    downloadedAt?: string;
  }>;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

class NotetakerApi {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${API_BASE_URL}/api/notetaker`;
  }

  /**
   * Invite notetaker to a meeting
   */
  async inviteNotetaker(data: InviteNotetakerRequest): Promise<{ success: boolean; data: any }> {
    const response = await fetch(`${this.baseUrl}/invite`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to invite notetaker');
    }

    return response.json();
  }

  /**
   * Get all notetaker sessions
   */
  async getSessions(): Promise<{ success: boolean; data: NotetakerSession[] }> {
    const response = await fetch(`${this.baseUrl}/sessions`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch sessions');
    }

    return response.json();
  }

  /**
   * Get specific session by ID
   */
  async getSession(id: string): Promise<{ success: boolean; data: NotetakerSession }> {
    const response = await fetch(`${this.baseUrl}/sessions/${id}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch session');
    }

    return response.json();
  }

  /**
   * Cancel a scheduled notetaker
   */
  async cancelNotetaker(id: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${this.baseUrl}/sessions/${id}/cancel`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to cancel notetaker');
    }

    return response.json();
  }

  /**
   * Remove notetaker from active meeting
   */
  async removeNotetaker(id: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${this.baseUrl}/sessions/${id}/leave`, {
      method: 'POST',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to remove notetaker');
    }

    return response.json();
  }

  /**
   * Get all transcripts
   */
  async getTranscripts(): Promise<{ success: boolean; data: Transcript[] }> {
    const response = await fetch(`${this.baseUrl}/transcripts`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch transcripts');
    }

    return response.json();
  }

  /**
   * Get specific transcript by ID
   */
  async getTranscript(id: string): Promise<{ success: boolean; data: Transcript }> {
    const response = await fetch(`${this.baseUrl}/transcripts/${id}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch transcript');
    }

    return response.json();
  }

  /**
   * Get transcript by notetaker ID
   */
  async getTranscriptByNotetakerId(notetakerId: string): Promise<{ success: boolean; data: Transcript }> {
    const response = await fetch(`${this.baseUrl}/transcripts/notetaker/${notetakerId}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch transcript');
    }

    return response.json();
  }
}

export const notetakerApi = new NotetakerApi();

