import { Router, Request, Response } from 'express';
import { validateVenueFile } from '../claude-cli.js';

const router = Router();

/**
 * GET /api/validate-file-stream
 * Validates venue file with Server-Sent Events for real-time streaming
 */
router.get('/validate-file-stream', async (req: Request, res: Response): Promise<void> => {
  try {
    const { filePath } = req.query as { filePath?: string };

    if (!filePath || typeof filePath !== 'string' || filePath.trim().length === 0) {
      res.status(400).json({ error: 'File path is required' });
      return;
    }

    console.log(`📁 [STREAM] Validating venue file: ${filePath}`);

    // Set up SSE headers
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });

    // Send connected message
    res.write(`data: ${JSON.stringify({ type: 'connected' })}\n\n`);

    // Stream progress messages
    const validationResult = await validateVenueFile(filePath, (message: string) => {
      res.write(`data: ${JSON.stringify({ type: 'message', content: message })}\n\n`);
    });

    // Send final result
    res.write(`data: ${JSON.stringify({ type: 'result', content: JSON.stringify(validationResult) })}\n\n`);
    res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);

    console.log('✅ [STREAM] Claude CLI file validation completed');
    res.end();
  } catch (error) {
    if (error instanceof Error) {
      console.error('❌ [STREAM] Claude CLI file validation error:', error.message);
      res.write(`data: ${JSON.stringify({ type: 'error', content: error.message })}\n\n`);
    } else {
      res.write(`data: ${JSON.stringify({ type: 'error', content: 'Unknown error during file validation' })}\n\n`);
    }
    res.end();
  }
});

export default router;
