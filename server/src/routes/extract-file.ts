import { Router, Request, Response } from 'express';
import { extractVenueDataFromFile } from '../claude-cli.js';

const router = Router();

/**
 * POST /api/extract-file
 * Extracts structured venue data from file
 *
 * Request body:
 * {
 *   "filePath": "/path/to/venue/file"
 * }
 */
router.post('/extract-file', async (req: Request, res: Response): Promise<void> => {
  try {
    const { filePath } = req.body as { filePath?: string };

    if (!filePath || typeof filePath !== 'string' || filePath.trim().length === 0) {
      res.status(400).json({ error: 'File path is required' });
      return;
    }

    console.log(`📁 Extracting venue data from file with Claude CLI: ${filePath}`);

    // Process file to extract venue data using real Claude CLI
    const venueData = await extractVenueDataFromFile(filePath);

    console.log('✅ Claude CLI file extraction completed');
    res.json(venueData);
  } catch (error) {
    if (error instanceof Error) {
      console.error('❌ Claude CLI file extraction error:', error.message);
      res.status(500).json({
        error: 'Failed to extract venue data from file',
        details: error.message
      });
    } else {
      res.status(500).json({ error: 'Unknown error during file extraction' });
    }
  }
});

export default router;
