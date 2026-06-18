import { Router, Request, Response } from 'express';
import { extractVenueDataFromFile } from '../claude-cli.js';

const router = Router();

/**
 * GET /api/extract-file-stream
 * Extracts venue data from file with Server-Sent Events for real-time streaming
 */
router.get('/extract-file-stream', async (req: Request, res: Response): Promise<void> => {
  try {
    const { filePath } = req.query as { filePath?: string };

    if (!filePath || typeof filePath !== 'string' || filePath.trim().length === 0) {
      res.status(400).json({ error: 'File path is required' });
      return;
    }

    console.log(`📁 [STREAM] Extracting venue data from file: ${filePath}`);

    // Set up SSE headers
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });

    // Send connected message
    res.write(`data: ${JSON.stringify({ type: 'connected' })}\n\n`);

    // Stream progress messages
    const venueData = await extractVenueDataFromFile(filePath, (message: string) => {
      res.write(`data: ${JSON.stringify({ type: 'message', content: message })}\n\n`);
    });

    // Send final result
    res.write(`data: ${JSON.stringify({ type: 'result', content: JSON.stringify(venueData) })}\n\n`);
    res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);

    console.log('✅ [STREAM] Claude CLI file extraction completed');
    res.end();
  } catch (error) {
    if (error instanceof Error) {
      console.error('❌ [STREAM] Claude CLI file extraction error:', error.message);
      res.write(`data: ${JSON.stringify({ type: 'error', content: error.message })}\n\n`);
    } else {
      res.write(`data: ${JSON.stringify({ type: 'error', content: 'Unknown error during file extraction' })}\n\n`);
    }
    res.end();
  }
});

export default router;
