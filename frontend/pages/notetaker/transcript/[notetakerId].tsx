import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { notetakerApi, Transcript, NotetakerSession } from '@/lib/notetakerApi';

export default function TranscriptViewer() {
  const router = useRouter();
  const { notetakerId } = router.query;

  const [transcript, setTranscript] = useState<Transcript | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (notetakerId && typeof notetakerId === 'string') {
      loadTranscript(notetakerId);
    }
  }, [notetakerId]);

  const loadTranscript = async (id: string) => {
    try {
      setLoading(true);
      const response = await notetakerApi.getTranscriptByNotetakerId(id);
      setTranscript(response.data);
      setError('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getSession = (): NotetakerSession | null => {
    if (!transcript || !transcript.sessionId) return null;
    if (typeof transcript.sessionId === 'string') return null;
    return transcript.sessionId as NotetakerSession;
  };

  const session = getSession();

  return (
    <>
      <Head>
        <title>Transcript Viewer | Fundraise Hackathon</title>
      </Head>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>
        <div style={{ marginBottom: 24 }}>
          <Link href="/notetaker">
            <button style={{
              padding: '8px 16px',
              backgroundColor: '#f0f0f0',
              border: '1px solid #ddd',
              borderRadius: 4,
              cursor: 'pointer',
            }}>
              ← Back to Dashboard
            </button>
          </Link>
        </div>

        <h1 style={{ fontSize: 32, fontWeight: 'bold', marginBottom: 24 }}>
          Meeting Transcript
        </h1>

        {loading ? (
          <div style={{ 
            backgroundColor: 'white', 
            padding: 48, 
            borderRadius: 8, 
            textAlign: 'center' 
          }}>
            <p>Loading transcript...</p>
          </div>
        ) : error ? (
          <div style={{ 
            backgroundColor: '#fee', 
            padding: 24, 
            borderRadius: 8, 
            color: '#c00' 
          }}>
            <h2 style={{ fontSize: 20, marginBottom: 8 }}>Error</h2>
            <p>{error}</p>
          </div>
        ) : !transcript ? (
          <div style={{ 
            backgroundColor: 'white', 
            padding: 48, 
            borderRadius: 8, 
            textAlign: 'center' 
          }}>
            <p>Transcript not found</p>
          </div>
        ) : (
          <>
            {/* Meeting Info */}
            {session && (
              <div style={{ 
                backgroundColor: 'white', 
                padding: 24, 
                borderRadius: 8, 
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                marginBottom: 24 
              }}>
                <h2 style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>
                  Meeting Information
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <p style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Name</p>
                    <p style={{ fontWeight: 500 }}>{session.name}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Provider</p>
                    <p style={{ fontWeight: 500 }}>{session.meetingProvider}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Status</p>
                    <p style={{ fontWeight: 500 }}>{transcript.status}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Date</p>
                    <p style={{ fontWeight: 500 }}>
                      {new Date(session.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Processing Status */}
            {transcript.status === 'processing' && (
              <div style={{ 
                backgroundColor: '#fff3cd', 
                padding: 24, 
                borderRadius: 8, 
                marginBottom: 24,
                border: '1px solid #ffc107'
              }}>
                <h3 style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>
                  Processing...
                </h3>
                <p>
                  The meeting is being processed. Transcript and media files will appear here when ready.
                </p>
              </div>
            )}

            {/* Error Message */}
            {transcript.errorMessage && (
              <div style={{ 
                backgroundColor: '#fee', 
                padding: 24, 
                borderRadius: 8, 
                marginBottom: 24,
                border: '1px solid #f00'
              }}>
                <h3 style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8, color: '#c00' }}>
                  Error
                </h3>
                <p style={{ color: '#c00' }}>{transcript.errorMessage}</p>
              </div>
            )}

            {/* Summary */}
            {transcript.summaryText && (
              <div style={{ 
                backgroundColor: 'white', 
                padding: 24, 
                borderRadius: 8, 
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                marginBottom: 24 
              }}>
                <h2 style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>
                  AI Summary
                </h2>
                <div style={{ 
                  backgroundColor: '#f8f9fa', 
                  padding: 16, 
                  borderRadius: 4,
                  whiteSpace: 'pre-wrap',
                  lineHeight: 1.6
                }}>
                  {transcript.summaryText}
                </div>
              </div>
            )}

            {/* Action Items */}
            {transcript.actionItems && transcript.actionItems.length > 0 && (
              <div style={{ 
                backgroundColor: 'white', 
                padding: 24, 
                borderRadius: 8, 
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                marginBottom: 24 
              }}>
                <h2 style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>
                  Action Items
                </h2>
                <ul style={{ paddingLeft: 24, lineHeight: 2 }}>
                  {transcript.actionItems.map((item, index) => (
                    <li key={index} style={{ marginBottom: 8 }}>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Transcript */}
            {transcript.transcriptText && (
              <div style={{ 
                backgroundColor: 'white', 
                padding: 24, 
                borderRadius: 8, 
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                marginBottom: 24 
              }}>
                <h2 style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>
                  Full Transcript
                </h2>
                <div style={{ 
                  backgroundColor: '#f8f9fa', 
                  padding: 16, 
                  borderRadius: 4,
                  whiteSpace: 'pre-wrap',
                  lineHeight: 1.8,
                  maxHeight: 600,
                  overflowY: 'auto'
                }}>
                  {transcript.transcriptText}
                </div>
              </div>
            )}

            {/* Media Files */}
            {transcript.mediaFiles && transcript.mediaFiles.length > 0 && (
              <div style={{ 
                backgroundColor: 'white', 
                padding: 24, 
                borderRadius: 8, 
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                marginBottom: 24 
              }}>
                <h2 style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>
                  Media Files
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {transcript.mediaFiles.map((file, index) => (
                    <div 
                      key={index}
                      style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: 12,
                        backgroundColor: '#f8f9fa',
                        borderRadius: 4
                      }}
                    >
                      <div>
                        <p style={{ fontWeight: 500, marginBottom: 4 }}>
                          {file.type.replace('_', ' ').toUpperCase()}
                        </p>
                        {file.downloadedAt && (
                          <p style={{ fontSize: 12, color: '#666' }}>
                            Downloaded: {new Date(file.downloadedAt).toLocaleString()}
                          </p>
                        )}
                      </div>
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          padding: '8px 16px',
                          backgroundColor: '#0070f3',
                          color: 'white',
                          textDecoration: 'none',
                          borderRadius: 4,
                          fontSize: 14,
                        }}
                      >
                        Download
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Participants */}
            {transcript.participants && transcript.participants.length > 0 && (
              <div style={{ 
                backgroundColor: 'white', 
                padding: 24, 
                borderRadius: 8, 
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)' 
              }}>
                <h2 style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>
                  Participants
                </h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {transcript.participants.map((participant, index) => (
                    <span
                      key={index}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#e3f2fd',
                        color: '#1976d2',
                        borderRadius: 16,
                        fontSize: 14,
                      }}
                    >
                      {participant}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

