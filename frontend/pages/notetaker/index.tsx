import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { notetakerApi, NotetakerSession } from '@/lib/notetakerApi';

export default function NotetakerDashboard() {
  const [sessions, setSessions] = useState<NotetakerSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [meetingLink, setMeetingLink] = useState('');
  const [name, setName] = useState('Nylas Notetaker');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadSessions();
  }, []);

  // Real-time updates using Server-Sent Events (SSE)
  useEffect(() => {
    console.log('🔗 Setting up SSE connection for real-time updates...');

    const eventSource = new EventSource('http://localhost:4000/api/sse/sessions');

    eventSource.onopen = () => {
      console.log('✅ SSE connection established');
    };

    eventSource.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log('📡 Received SSE message:', message.type, message);

        if (message.type === 'session_update') {
          // Update specific session in the list
          setSessions(prevSessions =>
            prevSessions.map(session =>
              session.notetakerId === message.data.notetakerId
                ? { ...session, state: message.data.state, meetingState: message.data.meetingState }
                : session
            )
          );
          console.log('🔄 Updated session:', message.data.notetakerId, 'to state:', message.data.state);
        } else if (message.type === 'transcript_update') {
          // Refresh sessions to show transcript availability
          console.log('📝 Transcript update received, refreshing sessions...');
          loadSessions(false);
        } else if (message.type === 'connected') {
          console.log('🎉 SSE connection confirmed');
        } else if (message.type === 'heartbeat') {
          // Heartbeat - connection is alive
        }
      } catch (error) {
        console.error('Error parsing SSE message:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('❌ SSE connection error:', error);
      // Connection will automatically retry
    };

    // Cleanup on unmount
    return () => {
      console.log('🔌 Closing SSE connection');
      eventSource.close();
    };
  }, []); // Empty dependency array - only run once on mount

  const loadSessions = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      const response = await notetakerApi.getSessions();
      setSessions(response.data);
      setError('');
    } catch (err: any) {
      console.error('Error loading sessions:', err);
      // Only show error on initial load, not during polling
      if (showLoading) {
        setError(err.message);
      }
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!meetingLink.trim()) {
      setError('Please enter a meeting link');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      setSuccess('');

      await notetakerApi.inviteNotetaker({
        meetingLink: meetingLink.trim(),
        name,
      });

      setSuccess('Notetaker invited successfully!');
      setMeetingLink('');
      
      // Reload sessions
      await loadSessions();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this notetaker?')) {
      return;
    }

    try {
      await notetakerApi.cancelNotetaker(id);
      setSuccess('Notetaker cancelled successfully');
      await loadSessions();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleRemove = async (id: string) => {
    if (!confirm('Are you sure you want to remove this notetaker from the meeting?')) {
      return;
    }

    try {
      await notetakerApi.removeNotetaker(id);
      setSuccess('Notetaker removed from meeting');
      await loadSessions();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const getStateBadgeColor = (state: string) => {
    switch (state) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'connecting': return 'bg-yellow-100 text-yellow-800';
      case 'connected': return 'bg-green-100 text-green-800';
      case 'attending': return 'bg-green-100 text-green-800';
      case 'waiting_for_entry': return 'bg-yellow-100 text-yellow-800';
      case 'disconnected': return 'bg-gray-100 text-gray-800';
      case 'failed_entry': return 'bg-red-100 text-red-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStateDisplayName = (state: string) => {
    switch (state) {
      case 'scheduled': return 'Scheduled';
      case 'connecting': return 'Connecting';
      case 'connected': return 'Connected';
      case 'attending': return 'Attending';
      case 'waiting_for_entry': return 'Waiting for Entry';
      case 'disconnected': return 'Disconnected';
      case 'failed_entry': return 'Failed to Enter';
      case 'failed': return 'Failed';
      case 'cancelled': return 'Cancelled';
      case 'completed': return 'Completed';
      default: return state;
    }
  };

  return (
    <>
      <Head>
        <title>Notetaker Dashboard | Fundraise Hackathon</title>
      </Head>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>
        <h1 style={{ fontSize: 32, fontWeight: 'bold', marginBottom: 24 }}>
          Notetaker Dashboard
        </h1>

        {/* Invite Form */}
        <div style={{ 
          backgroundColor: 'white', 
          padding: 24, 
          borderRadius: 8, 
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          marginBottom: 32 
        }}>
          <h2 style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>
            Invite Notetaker to Meeting
          </h2>

          <form onSubmit={handleInvite}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
                Meeting Link *
              </label>
              <input
                type="url"
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
                placeholder="https://zoom.us/j/123456789 or https://meet.google.com/abc-defg-hij"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #ddd',
                  borderRadius: 4,
                  fontSize: 14,
                }}
                required
              />
              <p style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                Supports Zoom, Google Meet, and Microsoft Teams
              </p>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
                Notetaker Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #ddd',
                  borderRadius: 4,
                  fontSize: 14,
                }}
              />
            </div>

            <div style={{ marginBottom: 16, padding: 12, backgroundColor: '#f8f9fa', borderRadius: 4 }}>
              <p style={{ margin: 0, fontSize: 14, color: '#666' }}>
                <strong>Transcription:</strong> Enabled by default for all meetings
              </p>
            </div>

            {error && (
              <div style={{ 
                padding: 12, 
                backgroundColor: '#fee', 
                color: '#c00', 
                borderRadius: 4,
                marginBottom: 16 
              }}>
                {error}
              </div>
            )}

            {success && (
              <div style={{ 
                padding: 12, 
                backgroundColor: '#efe', 
                color: '#060', 
                borderRadius: 4,
                marginBottom: 16 
              }}>
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: '10px 20px',
                backgroundColor: submitting ? '#ccc' : '#0070f3',
                color: 'white',
                border: 'none',
                borderRadius: 4,
                fontSize: 16,
                fontWeight: 500,
                cursor: submitting ? 'not-allowed' : 'pointer',
              }}
            >
              {submitting ? 'Inviting...' : 'Invite Notetaker'}
            </button>
          </form>
        </div>

        {/* Sessions List */}
        <div style={{ 
          backgroundColor: 'white', 
          padding: 24, 
          borderRadius: 8, 
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)' 
        }}>
          <h2 style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>
            Notetaker Sessions
          </h2>

          {loading ? (
            <p>Loading sessions...</p>
          ) : sessions.length === 0 ? (
            <p style={{ color: '#666' }}>No sessions yet. Invite a notetaker to get started!</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #ddd' }}>
                    <th style={{ padding: 12, textAlign: 'left' }}>Name</th>
                    <th style={{ padding: 12, textAlign: 'left' }}>Provider</th>
                    <th style={{ padding: 12, textAlign: 'left' }}>Status</th>
                    <th style={{ padding: 12, textAlign: 'left' }}>Created</th>
                    <th style={{ padding: 12, textAlign: 'left' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((session) => (
                    <tr key={session._id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: 12 }}>{session.name}</td>
                      <td style={{ padding: 12 }}>{session.meetingProvider}</td>
                      <td style={{ padding: 12 }}>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: 4,
                          fontSize: 12,
                          fontWeight: 500,
                        }} className={getStateBadgeColor(session.state)}>
                          {getStateDisplayName(session.state)}
                        </span>
                        {session.meetingState && (
                          <div style={{ fontSize: 10, color: '#666', marginTop: 2 }}>
                            {session.meetingState.replace(/_/g, ' ')}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: 12 }}>
                        {new Date(session.createdAt).toLocaleString()}
                      </td>
                      <td style={{ padding: 12 }}>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <Link href={`/notetaker/transcript/${session.notetakerId}`}>
                            <button style={{
                              padding: '4px 12px',
                              backgroundColor: '#0070f3',
                              color: 'white',
                              border: 'none',
                              borderRadius: 4,
                              fontSize: 12,
                              cursor: 'pointer',
                            }}>
                              View
                            </button>
                          </Link>
                          
                          {session.state === 'scheduled' && (
                            <button
                              onClick={() => handleCancel(session._id)}
                              style={{
                                padding: '4px 12px',
                                backgroundColor: '#f44',
                                color: 'white',
                                border: 'none',
                                borderRadius: 4,
                                fontSize: 12,
                                cursor: 'pointer',
                              }}
                            >
                              Cancel
                            </button>
                          )}

                          {(session.state === 'attending' || session.state === 'waiting_for_entry' || session.state === 'connecting') && (
                            <button
                              onClick={() => handleRemove(session._id)}
                              style={{
                                padding: '4px 12px',
                                backgroundColor: '#f80',
                                color: 'white',
                                border: 'none',
                                borderRadius: 4,
                                fontSize: 12,
                                cursor: 'pointer',
                              }}
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

