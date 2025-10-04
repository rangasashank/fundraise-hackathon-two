import type { NotetakerSession, Transcript, Meeting } from './types'

/**
 * Convert backend session and transcript data to frontend Meeting interface
 */
export const transformToMeeting = (
  session: NotetakerSession,
  transcript?: Transcript
): Meeting => {
  // Extract meeting title from meeting link or use provider name
  const getMeetingTitle = (): string => {
    if (session.name && session.name !== 'Nylas Notetaker') {
      return session.name
    }
    
    // Try to extract from meeting link
    const link = session.meetingLink
    if (link.includes('zoom.us')) {
      return 'Zoom Meeting'
    } else if (link.includes('meet.google.com')) {
      return 'Google Meet'
    } else if (link.includes('teams.microsoft.com')) {
      return 'Microsoft Teams Meeting'
    }
    
    return `${session.meetingProvider} Meeting`
  }

  // Parse date from createdAt or joinTime
  const getMeetingDate = (): Date => {
    if (session.joinTime) {
      return new Date(session.joinTime * 1000) // Convert Unix timestamp to Date
    }
    return new Date(session.createdAt)
  }

  // Format time string
  const getMeetingTime = (): string => {
    const date = getMeetingDate()
    const startTime = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
    
    // Estimate end time (add 1 hour)
    const endDate = new Date(date.getTime() + 60 * 60 * 1000)
    const endTime = endDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
    
    return `${startTime} - ${endTime}`
  }

  // Extract attendees from transcript participants or use default
  const getAttendees = (): string[] => {
    if (transcript?.participants && transcript.participants.length > 0) {
      return transcript.participants
    }
    return ['Meeting Participants']
  }

  // Generate description
  const getDescription = (): string => {
    const provider = session.meetingProvider || 'Unknown'
    const state = session.state
    
    if (state === 'completed') {
      return `Completed ${provider} meeting with transcript and notes available.`
    } else if (state === 'attending' || state === 'connected') {
      return `Currently recording ${provider} meeting.`
    } else if (state === 'scheduled') {
      return `Scheduled ${provider} meeting.`
    }
    
    return `${provider} meeting - ${state}`
  }

  // Determine if meeting has transcript
  const hasTranscript = Boolean(
    transcript &&
    transcript.status === 'completed' &&
    transcript.transcriptText
  )

  // Create notes from summary if available
  const getNotes = (): string | undefined => {
    if (!transcript) return undefined
    
    let notes = ''
    
    if (transcript.summaryText) {
      notes += `Summary:\n${transcript.summaryText}\n\n`
    }
    
    if (transcript.actionItems && transcript.actionItems.length > 0) {
      notes += `Action Items:\n${transcript.actionItems.map((item, i) => `${i + 1}. ${item}`).join('\n')}`
    }
    
    return notes || undefined
  }

  return {
    id: session._id,
    title: getMeetingTitle(),
    date: getMeetingDate(),
    time: getMeetingTime(),
    attendees: getAttendees(),
    description: getDescription(),
    hasTranscript,
    transcript: transcript?.transcriptText,
    notes: getNotes(),
    summaryText: transcript?.summaryText,
    actionItems: transcript?.actionItems,
    // Backend references
    sessionId: session._id,
    transcriptId: transcript?._id,
    notetakerId: session.notetakerId,
    state: session.state,
    meetingState: session.meetingState,
    meetingLink: session.meetingLink,
    meetingProvider: session.meetingProvider,
  }
}

/**
 * Convert array of sessions and transcripts to meetings
 */
export const transformToMeetings = (
  sessions: NotetakerSession[],
  transcripts: Transcript[]
): Meeting[] => {
  // Create a map of transcripts by notetakerId for quick lookup
  const transcriptMap = new Map<string, Transcript>()
  transcripts.forEach((transcript) => {
    transcriptMap.set(transcript.notetakerId, transcript)
  })

  // Transform each session to a meeting
  return sessions.map((session) => {
    const transcript = transcriptMap.get(session.notetakerId)
    return transformToMeeting(session, transcript)
  })
}

/**
 * Separate meetings into upcoming and past based on state
 */
export const separateMeetings = (
  meetings: Meeting[]
): { upcoming: Meeting[]; past: Meeting[] } => {
  const upcoming: Meeting[] = []
  const past: Meeting[] = []

  meetings.forEach((meeting) => {
    // Consider meetings as past if they are completed or have transcripts
    if (
      meeting.state === 'completed' ||
      meeting.state === 'disconnected' ||
      meeting.state === 'cancelled' ||
      meeting.hasTranscript
    ) {
      past.push(meeting)
    } else {
      upcoming.push(meeting)
    }
  })

  // Sort upcoming by date (earliest first)
  upcoming.sort((a, b) => a.date.getTime() - b.date.getTime())

  // Sort past by date (most recent first)
  past.sort((a, b) => b.date.getTime() - a.date.getTime())

  return { upcoming, past }
}

/**
 * Filter meetings by search query
 */
export const filterMeetings = (meetings: Meeting[], query: string): Meeting[] => {
  if (!query.trim()) return meetings

  const lowerQuery = query.toLowerCase()

  return meetings.filter((meeting) => {
    return (
      meeting.title.toLowerCase().includes(lowerQuery) ||
      meeting.description?.toLowerCase().includes(lowerQuery) ||
      meeting.attendees.some((attendee) =>
        attendee.toLowerCase().includes(lowerQuery)
      ) ||
      meeting.transcript?.toLowerCase().includes(lowerQuery) ||
      meeting.summaryText?.toLowerCase().includes(lowerQuery)
    )
  })
}

