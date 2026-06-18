/**
 * Claude CLI Integration Module
 *
 * This module integrates with the actual Claude Code CLI to process venue descriptions
 * using real AI analysis for validation and data extraction.
 */

import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

export type InputMode = 'file';

export interface ValidationResult {
  passed: boolean;
  checkpoints: {
    stageVisible: boolean;
    rowsVisible: boolean;
    seatsVisible: boolean;
    numberingClear: boolean;
  };
  issues: string[];
  source?: InputMode;
}

export interface Section {
  name: string;           // "Orchestra", "Mezzanine", "Balcony"
  level?: number;         // Floor level (1, 2, 3)
  rowRange?: string;      // "A-M", "1-20"
}

export interface AccessibilityFeatures {
  wheelchairSpaces?: number;
  companionSeats?: number;
  accessibleEntrances?: string[];
  elevators?: boolean;
  notes?: string;
}

export interface Amenities {
  restrooms?: number;
  concessions?: string[];  // ["Food", "Beverages", "Merchandise"]
  parking?: string;
  coatCheck?: boolean;
  notes?: string;
}

// Confidence score for individual field
export interface ConfidenceScore {
  value: number;          // 0-100 percentage
  level: 'high' | 'medium' | 'low';  // Derived from value
}

// Confidence scores for all extractable fields
export interface ConfidenceScores {
  overall: ConfidenceScore;
  venueName?: ConfidenceScore;
  stageLocation: ConfidenceScore;
  rows: ConfidenceScore[];  // One per row
  sections?: ConfidenceScore;
  capacity?: ConfidenceScore;
  accessibility?: ConfidenceScore;
  amenities?: ConfidenceScore;
}

export interface Row {
  rowNumber: string;
  seatCount: number;
  direction: 'facing_stage' | 'facing_away' | 'side_view';
  section?: string;
  confidence?: ConfidenceScore;  // NEW
}

export interface VenueData {
  venueName?: string;
  stageLocation: string;
  rows: Row[];
  source?: InputMode;

  // Metadata fields
  sections?: Section[];
  totalCapacity?: number;
  accessibility?: AccessibilityFeatures;
  amenities?: Amenities;

  // Confidence scores
  confidence?: ConfidenceScores;  // NEW
}

/**
 * Callback type for streaming progress updates
 */
export type StreamCallback = (message: string) => void;

/**
 * Executes Claude CLI with streaming output
 *
 * @param prompt - The prompt to send to Claude
 * @param onStream - Callback for streaming messages
 * @param imagePath - Optional path to an image file for visual analysis
 * @returns Promise resolving to Claude's response
 */
async function executeClaudeCLI(prompt: string, onStream?: StreamCallback, imagePath?: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const workingDir = process.cwd();

    onStream?.('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    onStream?.('🚀 Initializing Claude CLI...');
    onStream?.(`📂 Working Directory: ${workingDir}`);
    onStream?.('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    onStream?.('');

    // If image path is provided, prepend instruction to read it
    let finalPrompt = prompt;
    if (imagePath) {
      onStream?.(`🖼️  Image file: ${imagePath}`);
      onStream?.('');
      finalPrompt = `First, read and analyze the image file at this path: ${imagePath}

Then, ${prompt}`;
    }

    // Show the prompt being sent
    onStream?.('📤 PROMPT SENT TO CLAUDE:');
    onStream?.('─────────────────────────────────────────');
    const promptLines = finalPrompt.split('\n');
    promptLines.forEach(line => {
      onStream?.(line);
    });
    onStream?.('─────────────────────────────────────────');
    onStream?.('');
    onStream?.('⏳ Waiting for Claude response...');
    onStream?.('');
    onStream?.('📥 CLAUDE RESPONSE:');
    onStream?.('─────────────────────────────────────────');

    // Spawn claude CLI process
    const args = ['--dangerously-skip-permissions'];

    const claudeProcess = spawn('claude', args, {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';

    // Handle stdout (streaming output from Claude)
    claudeProcess.stdout.on('data', (data: Buffer) => {
      const text = data.toString();
      stdout += text;

      // Stream ALL output to the client (no filtering)
      if (onStream) {
        const lines = text.split('\n');
        lines.forEach(line => {
          if (line.trim()) {
            onStream(line);
          }
        });
      }
    });

    // Handle stderr
    claudeProcess.stderr.on('data', (data: Buffer) => {
      const text = data.toString();
      stderr += text;

      // Also show stderr in the terminal
      if (onStream) {
        onStream(`[stderr] ${text.trim()}`);
      }
    });

    // Handle process completion
    claudeProcess.on('close', (code: number | null) => {
      onStream?.('─────────────────────────────────────────');
      if (code === 0) {
        onStream?.('');
        onStream?.('✅ Claude CLI completed successfully');
        onStream?.('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        resolve(stdout);
      } else {
        onStream?.('');
        onStream?.(`❌ Claude CLI exited with code ${code}`);
        onStream?.('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        reject(new Error(`Claude CLI exited with code ${code}: ${stderr}`));
      }
    });

    // Handle process errors
    claudeProcess.on('error', (error: Error) => {
      onStream?.('');
      onStream?.(`❌ Failed to start Claude CLI: ${error.message}`);
      onStream?.('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      reject(new Error(`Failed to start Claude CLI: ${error.message}`));
    });

    // Send the prompt to Claude via stdin
    claudeProcess.stdin.write(finalPrompt);
    claudeProcess.stdin.end();
  });
}

/**
 * Extracts JSON from Claude's response
 * Claude often wraps JSON in markdown code blocks or includes explanatory text
 */
function extractJSON(text: string): string {
  // Try to find JSON in markdown code blocks first
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch && codeBlockMatch[1]) {
    return codeBlockMatch[1].trim();
  }

  // Try to find raw JSON objects
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return jsonMatch[0];
  }

  // Return original text if no JSON pattern found
  return text;
}

/**
 * Derive confidence level from numeric score
 */
function deriveConfidenceLevel(value: number): 'high' | 'medium' | 'low' {
  if (value >= 80) return 'high';
  if (value >= 50) return 'medium';
  return 'low';
}

/**
 * Process and validate a single confidence score
 */
function processConfidenceScore(score: { value: number }): ConfidenceScore {
  const clampedValue = Math.max(0, Math.min(100, score.value));
  return {
    value: clampedValue,
    level: deriveConfidenceLevel(clampedValue)
  };
}

/**
 * Process all confidence scores in venue data
 */
function processConfidenceScores(data: any): VenueData {
  if (data.confidence) {
    // Process overall confidence
    if (data.confidence.overall) {
      data.confidence.overall = processConfidenceScore(data.confidence.overall);
    }

    // Process field-level confidences
    const fields: (keyof ConfidenceScores)[] = ['venueName', 'stageLocation', 'sections', 'capacity', 'accessibility', 'amenities'];
    fields.forEach(field => {
      if (data.confidence[field]) {
        data.confidence[field] = processConfidenceScore(data.confidence[field]);
      }
    });

    // Process row-level confidences (array)
    if (Array.isArray(data.confidence.rows)) {
      data.confidence.rows = data.confidence.rows.map(processConfidenceScore);
    }

    // Process individual row confidence properties
    if (Array.isArray(data.rows)) {
      data.rows = data.rows.map((row: any) => {
        if (row.confidence) {
          row.confidence = processConfidenceScore(row.confidence);
        }
        return row;
      });
    }
  }

  return data as VenueData;
}





/**
 * Reads file content based on file type
 *
 * @param filePath - Path to the file
 * @returns Promise resolving to file content as string
 */
async function readFileContent(filePath: string): Promise<{ content: string; isImage: boolean }> {
  const absolutePath = path.isAbsolute(filePath) ? filePath : path.resolve(process.cwd(), filePath);

  if (!fs.existsSync(absolutePath)) {
    throw new Error(`File not found: ${absolutePath}`);
  }

  const ext = path.extname(absolutePath).toLowerCase();
  const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp'];

  // For images, return the path itself (Claude CLI will handle it)
  if (imageExtensions.includes(ext)) {
    return { content: absolutePath, isImage: true };
  }

  // For text-based files, read the content
  try {
    const content = fs.readFileSync(absolutePath, 'utf-8');

    // For JSON files, validate and pretty-print
    if (ext === '.json') {
      try {
        const parsed = JSON.parse(content);
        return { content: JSON.stringify(parsed, null, 2), isImage: false };
      } catch {
        // If JSON is invalid, return as-is
        return { content, isImage: false };
      }
    }

    // For CSV/Excel files, note that we're treating them as text
    // In production, you'd use a library like 'xlsx' to parse these
    if (ext === '.csv' || ext === '.xlsx' || ext === '.xls') {
      // For now, treat CSV as plain text
      if (ext === '.csv') {
        return { content, isImage: false };
      }

      // For Excel files, warn that binary format isn't fully supported
      throw new Error('Excel files (.xlsx, .xls) require binary parsing. Please convert to CSV or JSON format.');
    }

    return { content, isImage: false };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to read file: ${error.message}`);
    }
    throw new Error('Unknown error reading file');
  }
}

/**
 * Validates venue file using Claude CLI
 *
 * @param filePath - Path to the venue file
 * @param onStream - Optional callback for streaming progress
 * @returns Promise resolving to validation results
 */
export async function validateVenueFile(
  filePath: string,
  onStream?: StreamCallback
): Promise<ValidationResult> {
  if (!filePath || filePath.trim().length === 0) {
    throw new Error('File path is required');
  }

  try {
    const { content, isImage } = await readFileContent(filePath);

    if (isImage) {
      // For images, use visual analysis
      const prompt = `You are a venue validation assistant. Analyze the following venue diagram image and validate it against these checkpoints:

1. **stageVisible**: Is the stage or performance area clearly visible in the diagram?
2. **rowsVisible**: Are seating rows or sections shown in the diagram?
3. **seatsVisible**: Is seat count or capacity information visible?
4. **numberingClear**: Is there a row labeling/numbering scheme visible?

Analyze the image and respond with ONLY a JSON object (no markdown, no explanation) in this exact format:
{
  "passed": true/false,
  "checkpoints": {
    "stageVisible": true/false,
    "rowsVisible": true/false,
    "seatsVisible": true/false,
    "numberingClear": true/false
  },
  "issues": ["array of issue descriptions for any failed checkpoints"]
}`;

      const response = await executeClaudeCLI(prompt, onStream, content);
      const jsonText = extractJSON(response);
      const parsed = JSON.parse(jsonText) as ValidationResult;

      // Validate response structure
      if (
        typeof parsed.passed !== 'boolean' ||
        !parsed.checkpoints ||
        typeof parsed.checkpoints.stageVisible !== 'boolean' ||
        typeof parsed.checkpoints.rowsVisible !== 'boolean' ||
        typeof parsed.checkpoints.seatsVisible !== 'boolean' ||
        typeof parsed.checkpoints.numberingClear !== 'boolean' ||
        !Array.isArray(parsed.issues)
      ) {
        throw new Error('Invalid validation response format from Claude');
      }

      parsed.source = 'file';
      return parsed;
    } else {
      // For text-based files
      const prompt = `You are a venue validation assistant. Analyze the following venue file content and validate it against these checkpoints:

1. **stageVisible**: Is the stage or performance area clearly mentioned?
2. **rowsVisible**: Are seating rows or sections described?
3. **seatsVisible**: Is seat count or capacity information provided?
4. **numberingClear**: Is there a row labeling/numbering scheme mentioned?

File Content:
"""
${content}
"""

Respond with ONLY a JSON object (no markdown, no explanation) in this exact format:
{
  "passed": true/false,
  "checkpoints": {
    "stageVisible": true/false,
    "rowsVisible": true/false,
    "seatsVisible": true/false,
    "numberingClear": true/false
  },
  "issues": ["array of issue descriptions for any failed checkpoints"]
}`;

      const response = await executeClaudeCLI(prompt, onStream);
      const jsonText = extractJSON(response);
      const parsed = JSON.parse(jsonText) as ValidationResult;

      // Validate response structure
      if (
        typeof parsed.passed !== 'boolean' ||
        !parsed.checkpoints ||
        typeof parsed.checkpoints.stageVisible !== 'boolean' ||
        typeof parsed.checkpoints.rowsVisible !== 'boolean' ||
        typeof parsed.checkpoints.seatsVisible !== 'boolean' ||
        typeof parsed.checkpoints.numberingClear !== 'boolean' ||
        !Array.isArray(parsed.issues)
      ) {
        throw new Error('Invalid validation response format from Claude');
      }

      parsed.source = 'file';
      return parsed;
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to validate venue file: ${error.message}`);
    }
    throw new Error('Unknown error during venue file validation');
  }
}

/**
 * Extracts structured venue data from file using Claude CLI
 *
 * @param filePath - Path to the venue file
 * @param onStream - Optional callback for streaming progress
 * @returns Promise resolving to extracted venue data
 */
export async function extractVenueDataFromFile(
  filePath: string,
  onStream?: StreamCallback
): Promise<VenueData> {
  if (!filePath || filePath.trim().length === 0) {
    throw new Error('File path is required');
  }

  try {
    const { content, isImage } = await readFileContent(filePath);

    if (isImage) {
      // For images, use visual analysis
      const prompt = `You are a venue data extraction assistant. Extract structured seating data from the following venue diagram image.

Analyze the image and extract:
1. **venueName** (optional): The name of the venue if visible
2. **stageLocation**: Where the stage is located (e.g., "north", "south", "center", "front")
3. **rows**: Array of row objects with:
   - rowNumber: The row identifier (e.g., "A", "1", "Box A")
   - seatCount: Number of seats in that row
   - direction: One of "facing_stage", "facing_away", or "side_view"
   - section: (optional) The section/tier this row belongs to (e.g., "Orchestra", "Mezzanine")

Extract additional metadata if visible:
- **sections**: Array of section/tier objects with name, level, and rowRange
- **totalCapacity**: Total number of seats (if explicitly shown)
- **accessibility**: Object with wheelchair spaces, companion seats, accessible entrances, elevators, and notes
- **amenities**: Object with restrooms count, concessions types (array), parking info, coat check availability, and notes

Additionally, provide confidence scores (0-100) for each extracted field:
- 80-100: High confidence (explicit and clear in image)
- 50-79: Medium confidence (implied or partially visible)
- 0-49: Low confidence (guessed or unclear)

Respond with ONLY a JSON object (no markdown, no explanation) in this exact format:
{
  "venueName": "Optional venue name",
  "stageLocation": "location description",
  "rows": [
    {
      "rowNumber": "A",
      "seatCount": 20,
      "direction": "facing_stage",
      "section": "Orchestra",
      "confidence": { "value": 95 }
    }
  ],
  "sections": [
    {
      "name": "Orchestra",
      "level": 1,
      "rowRange": "A-M"
    }
  ],
  "totalCapacity": 240,
  "accessibility": {
    "wheelchairSpaces": 4,
    "companionSeats": 4,
    "accessibleEntrances": ["Main entrance", "Side entrance"],
    "elevators": true,
    "notes": "Accessible via side entrance"
  },
  "amenities": {
    "restrooms": 6,
    "concessions": ["Food", "Beverages"],
    "parking": "On-site parking available",
    "coatCheck": true,
    "notes": "Concessions on main level"
  },
  "confidence": {
    "overall": { "value": 85 },
    "venueName": { "value": 90 },
    "stageLocation": { "value": 95 },
    "rows": [{ "value": 95 }, { "value": 85 }],
    "sections": { "value": 80 },
    "capacity": { "value": 100 },
    "accessibility": { "value": 60 },
    "amenities": { "value": 70 }
  }
}

If specific data isn't visible, omit those optional fields. If specific row data isn't clearly visible, create reasonable sample rows based on the diagram.`;

      const response = await executeClaudeCLI(prompt, onStream, content);
      const jsonText = extractJSON(response);
      let parsed = JSON.parse(jsonText) as VenueData;

      // Process confidence scores
      parsed = processConfidenceScores(parsed);

      // Auto-calculate capacity if not provided by AI
      if (!parsed.totalCapacity && Array.isArray(parsed.rows)) {
        parsed.totalCapacity = parsed.rows.reduce((sum, row) => sum + (row.seatCount || 0), 0);
      }

      // Validate response structure
      if (
        typeof parsed.stageLocation !== 'string' ||
        !Array.isArray(parsed.rows) ||
        parsed.rows.length === 0
      ) {
        throw new Error('Invalid extraction response format from Claude');
      }

      // Validate each row
      for (const row of parsed.rows) {
        if (
          typeof row.rowNumber !== 'string' ||
          typeof row.seatCount !== 'number' ||
          !['facing_stage', 'facing_away', 'side_view'].includes(row.direction)
        ) {
          throw new Error('Invalid row data in Claude extraction response');
        }
      }

      parsed.source = 'file';
      return parsed;
    } else {
      // For text-based files
      const prompt = `You are a venue data extraction assistant. Extract structured seating data from the following venue file content.

File Content:
"""
${content}
"""

Extract the following information:
1. **venueName** (optional): The name of the venue if mentioned
2. **stageLocation**: Where the stage is located (e.g., "north", "south", "center", "front")
3. **rows**: Array of row objects with:
   - rowNumber: The row identifier (e.g., "A", "1", "Box A")
   - seatCount: Number of seats in that row
   - direction: One of "facing_stage", "facing_away", or "side_view"
   - section: (optional) The section/tier this row belongs to (e.g., "Orchestra", "Mezzanine")

Extract additional metadata if mentioned:
- **sections**: Array of section/tier objects with name, level, and rowRange
- **totalCapacity**: Total number of seats (if explicitly mentioned)
- **accessibility**: Object with wheelchair spaces, companion seats, accessible entrances, elevators, and notes
- **amenities**: Object with restrooms count, concessions types (array), parking info, coat check availability, and notes

Additionally, provide confidence scores (0-100) for each extracted field:
- 80-100: High confidence (explicit and clear in content)
- 50-79: Medium confidence (implied or partially clear)
- 0-49: Low confidence (guessed or unclear)

Respond with ONLY a JSON object (no markdown, no explanation) in this exact format:
{
  "venueName": "Optional venue name",
  "stageLocation": "location description",
  "rows": [
    {
      "rowNumber": "A",
      "seatCount": 20,
      "direction": "facing_stage",
      "section": "Orchestra",
      "confidence": { "value": 95 }
    }
  ],
  "sections": [
    {
      "name": "Orchestra",
      "level": 1,
      "rowRange": "A-M"
    }
  ],
  "totalCapacity": 240,
  "accessibility": {
    "wheelchairSpaces": 4,
    "companionSeats": 4,
    "accessibleEntrances": ["Main entrance", "Side entrance"],
    "elevators": true,
    "notes": "Accessible via side entrance"
  },
  "amenities": {
    "restrooms": 6,
    "concessions": ["Food", "Beverages"],
    "parking": "On-site parking available",
    "coatCheck": true,
    "notes": "Concessions on main level"
  },
  "confidence": {
    "overall": { "value": 85 },
    "venueName": { "value": 90 },
    "stageLocation": { "value": 95 },
    "rows": [{ "value": 95 }, { "value": 85 }],
    "sections": { "value": 80 },
    "capacity": { "value": 100 },
    "accessibility": { "value": 60 },
    "amenities": { "value": 70 }
  }
}

If specific data isn't mentioned, omit those optional fields. If specific row data isn't mentioned, create reasonable sample rows based on the content.`;

      const response = await executeClaudeCLI(prompt, onStream);
      const jsonText = extractJSON(response);
      let parsed = JSON.parse(jsonText) as VenueData;

      // Process confidence scores
      parsed = processConfidenceScores(parsed);

      // Auto-calculate capacity if not provided by AI
      if (!parsed.totalCapacity && Array.isArray(parsed.rows)) {
        parsed.totalCapacity = parsed.rows.reduce((sum, row) => sum + (row.seatCount || 0), 0);
      }

      // Validate response structure
      if (
        typeof parsed.stageLocation !== 'string' ||
        !Array.isArray(parsed.rows) ||
        parsed.rows.length === 0
      ) {
        throw new Error('Invalid extraction response format from Claude');
      }

      // Validate each row
      for (const row of parsed.rows) {
        if (
          typeof row.rowNumber !== 'string' ||
          typeof row.seatCount !== 'number' ||
          !['facing_stage', 'facing_away', 'side_view'].includes(row.direction)
        ) {
          throw new Error('Invalid row data in Claude extraction response');
        }
      }

      parsed.source = 'file';
      return parsed;
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to extract venue data from file: ${error.message}`);
    }
    throw new Error('Unknown error during venue data extraction from file');
  }
}
