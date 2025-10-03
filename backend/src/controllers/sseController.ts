import { Request, Response } from 'express';
import { EventEmitter } from 'events';

/**
 * Server-Sent Events Controller
 * Provides real-time updates to frontend when notetaker sessions change
 */

// Global event emitter for session updates
export const sessionUpdateEmitter = new EventEmitter();

// Store active SSE connections
const activeConnections = new Set<Response>();

/**
 * SSE endpoint for real-time session updates
 * GET /api/sse/sessions
 */
export const sessionUpdatesSSE = (req: Request, res: Response): void => {
  console.log('🔗 New SSE connection established');

  // Set SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control',
  });

  // Send initial connection confirmation
  res.write(`data: ${JSON.stringify({ type: 'connected', message: 'SSE connection established' })}\n\n`);

  // Add connection to active connections
  activeConnections.add(res);

  // Listen for session updates
  const handleSessionUpdate = (data: any) => {
    try {
      const message = JSON.stringify({
        type: 'session_update',
        data: data
      });
      res.write(`data: ${message}\n\n`);
      console.log('📡 Sent SSE update:', data.notetakerId, 'state:', data.state);
    } catch (error) {
      console.error('Error sending SSE update:', error);
    }
  };

  // Listen for transcript updates
  const handleTranscriptUpdate = (data: any) => {
    try {
      const message = JSON.stringify({
        type: 'transcript_update',
        data: data
      });
      res.write(`data: ${message}\n\n`);
      console.log('📡 Sent SSE transcript update:', data.notetakerId);
    } catch (error) {
      console.error('Error sending SSE transcript update:', error);
    }
  };

  // Register event listeners
  sessionUpdateEmitter.on('session_updated', handleSessionUpdate);
  sessionUpdateEmitter.on('transcript_updated', handleTranscriptUpdate);

  // Handle client disconnect
  req.on('close', () => {
    console.log('🔌 SSE connection closed');
    activeConnections.delete(res);
    sessionUpdateEmitter.removeListener('session_updated', handleSessionUpdate);
    sessionUpdateEmitter.removeListener('transcript_updated', handleTranscriptUpdate);
  });

  req.on('error', (error) => {
    console.error('SSE connection error:', error);
    activeConnections.delete(res);
    sessionUpdateEmitter.removeListener('session_updated', handleSessionUpdate);
    sessionUpdateEmitter.removeListener('transcript_updated', handleTranscriptUpdate);
  });

  // Keep connection alive with periodic heartbeat
  const heartbeat = setInterval(() => {
    try {
      res.write(`data: ${JSON.stringify({ type: 'heartbeat', timestamp: Date.now() })}\n\n`);
    } catch (error) {
      console.error('Heartbeat error:', error);
      clearInterval(heartbeat);
      activeConnections.delete(res);
    }
  }, 30000); // Send heartbeat every 30 seconds

  // Clean up heartbeat on disconnect
  req.on('close', () => {
    clearInterval(heartbeat);
  });
};

/**
 * Get SSE connection status
 * GET /api/sse/status
 */
export const getSSEStatus = (req: Request, res: Response): void => {
  res.json({
    success: true,
    data: {
      activeConnections: activeConnections.size,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    }
  });
};

/**
 * Emit session update to all connected clients
 */
export const emitSessionUpdate = (sessionData: any): void => {
  console.log('🚀 Emitting session update:', sessionData.notetakerId, 'state:', sessionData.state);
  sessionUpdateEmitter.emit('session_updated', sessionData);
};

/**
 * Emit transcript update to all connected clients
 */
export const emitTranscriptUpdate = (transcriptData: any): void => {
  console.log('🚀 Emitting transcript update:', transcriptData.notetakerId);
  sessionUpdateEmitter.emit('transcript_updated', transcriptData);
};

/**
 * Send test update (for debugging)
 * POST /api/sse/test
 */
export const sendTestUpdate = (req: Request, res: Response): void => {
  const testData = {
    notetakerId: 'test-' + Date.now(),
    state: 'attending',
    timestamp: new Date().toISOString(),
    ...req.body
  };

  emitSessionUpdate(testData);

  res.json({
    success: true,
    message: 'Test update sent',
    data: testData,
    activeConnections: activeConnections.size
  });
};
