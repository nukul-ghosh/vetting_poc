import { Router, Request, Response } from 'express';
import { validateVenueFile } from '../claude-cli.js';

const router = Router();

/**
 * POST /api/validate-file
 * Validates venue file against checkpoints
 *
 * Request body:
 * {
 *   "filePath": "/path/to/venue/file"
 * }
 */
router.post('/validate-file', async (req: Request, res: Response): Promise<void> => {
  try {
    const { filePath } = req.body as { filePath?: string };

    if (!filePath || typeof filePath !== 'string' || filePath.trim().length === 0) {
      res.status(400).json({ error: 'File path is required' });
      return;
    }

    console.log(`📁 Validating venue file with Claude CLI: ${filePath}`);

    // Process file to validate venue using real Claude CLI
    const validationResult = await validateVenueFile(filePath);

    console.log('✅ Claude CLI file validation completed');
    res.json(validationResult);
  } catch (error) {
    if (error instanceof Error) {
      console.error('❌ Claude CLI file validation error:', error.message);
      res.status(500).json({
        error: 'Failed to validate venue file',
        details: error.message
      });
    } else {
      res.status(500).json({ error: 'Unknown error during file validation' });
    }
  }
});

export default router;
