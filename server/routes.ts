import express from 'express';
import { createPaste, getPaste, checkHealth } from '../src/lib/paste-service.js';
import { CreatePasteRequest } from '../src/lib/types.js';
import { PasteNotFoundError, PasteExpiredError, PasteViewLimitError } from '../src/lib/errors.js';

const router = express.Router();

router.get('/healthz', async (req, res) => {
  const isHealthy = await checkHealth();
  if (isHealthy) {
    res.status(200).json({ status: 'ok' });
  } else {
    res.status(503).json({ status: 'error', message: 'Storage unavailable' });
  }
});

router.post('/pastes', async (req, res) => {
  try {
    const body = req.body as CreatePasteRequest;

    // Basic validation
    if (!body.content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const paste = {
      content: body.content,
      created_at: Date.now(),
      ttl_seconds: body.ttl_seconds,
      max_views: body.max_views,
      remaining_views: body.max_views ? body.max_views : null,
      expires_at: body.ttl_seconds ? Date.now() + body.ttl_seconds * 1000 : null
    };

    const id = await createPaste(paste);
    res.status(201).json({ id, url: `/p/${id}` });
  } catch (error) {
    console.error('Create paste error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/pastes/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Extract optional test time from headers
    let effectiveTime: number | undefined;
    const testTimeHeader = req.headers['x-test-now-ms'];
    if (process.env.TEST_MODE === '1' && typeof testTimeHeader === 'string') {
      const parsed = parseInt(testTimeHeader, 10);
      if (!isNaN(parsed)) {
        effectiveTime = parsed;
      }
    }

    const paste = await getPaste(id, effectiveTime);
    res.json(paste);
  } catch (error) {
    if (error instanceof PasteNotFoundError) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'The paste ID provided does not exist.' });
    }
    if (error instanceof PasteExpiredError) {
      return res.status(410).json({ error: 'EXPIRED_TIME', message: 'This paste has expired based on its TTL setting.' });
    }
    if (error instanceof PasteViewLimitError) {
      return res.status(410).json({ error: 'EXPIRED_VIEWS', message: 'This paste has reached its maximum view limit.' });
    }

    console.error('Get paste error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
