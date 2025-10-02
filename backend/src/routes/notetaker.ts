import express from 'express';
import {
  inviteNotetaker,
  getSessions,
  getSession,
  cancelNotetaker,
  removeNotetaker,
  getTranscripts,
  getTranscript,
  getTranscriptByNotetakerId,
} from '../controllers/notetakerController';

const router = express.Router();

// Notetaker session routes
router.post('/invite', inviteNotetaker);
router.get('/sessions', getSessions);
router.get('/sessions/:id', getSession);
router.delete('/sessions/:id/cancel', cancelNotetaker);
router.post('/sessions/:id/leave', removeNotetaker);

// Transcript routes
router.get('/transcripts', getTranscripts);
router.get('/transcripts/:id', getTranscript);
router.get('/transcripts/notetaker/:notetakerId', getTranscriptByNotetakerId);

export default router;

