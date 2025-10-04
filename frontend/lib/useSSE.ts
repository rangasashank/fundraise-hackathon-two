import { useEffect, useRef, useState } from 'react'
import { createSessionUpdatesSSE } from './api'
import type { SessionUpdateEvent, TranscriptUpdateEvent } from './types'

interface UseSSEOptions {
  onSessionUpdate?: (event: SessionUpdateEvent) => void
  onTranscriptUpdate?: (event: TranscriptUpdateEvent) => void
  onError?: (error: Event) => void
  enabled?: boolean
}

/**
 * Custom hook for Server-Sent Events (SSE) real-time updates
 */
export function useSSE(options: UseSSEOptions = {}) {
  const {
    onSessionUpdate,
    onTranscriptUpdate,
    onError,
    enabled = true,
  } = options

  const [connected, setConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const eventSourceRef = useRef<EventSource | null>(null)

  useEffect(() => {
    if (!enabled) {
      return
    }

    console.log('[SSE] Connecting to session updates...')

    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data)
        console.log('[SSE] Received update:', data)

        // Determine event type and call appropriate handler
        if (data.type === 'session_update' && onSessionUpdate) {
          onSessionUpdate(data as SessionUpdateEvent)
        } else if (data.type === 'transcript_update' && onTranscriptUpdate) {
          onTranscriptUpdate(data as TranscriptUpdateEvent)
        }
      } catch (err) {
        console.error('[SSE] Error parsing message:', err)
      }
    }

    const handleError = (err: Event) => {
      console.error('[SSE] Connection error:', err)
      setError('Connection to real-time updates failed')
      setConnected(false)
      
      if (onError) {
        onError(err)
      }
    }

    const handleOpen = () => {
      console.log('[SSE] Connected to session updates')
      setConnected(true)
      setError(null)
    }

    try {
      const eventSource = createSessionUpdatesSSE(handleMessage, handleError)
      eventSource.addEventListener('open', handleOpen)
      eventSourceRef.current = eventSource

      return () => {
        console.log('[SSE] Disconnecting from session updates')
        eventSource.close()
        eventSourceRef.current = null
        setConnected(false)
      }
    } catch (err: any) {
      console.error('[SSE] Failed to create EventSource:', err)
      setError(err.message || 'Failed to connect to real-time updates')
    }
  }, [enabled, onSessionUpdate, onTranscriptUpdate, onError])

  return {
    connected,
    error,
    disconnect: () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
        eventSourceRef.current = null
        setConnected(false)
      }
    },
  }
}

