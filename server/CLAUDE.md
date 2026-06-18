# Backend Server Documentation

This document provides detailed guidance for working with the backend Express.js server.

## Overview

The backend is a Node.js Express server that acts as a bridge between the React frontend and Claude Code CLI. It handles text input validation, image file uploads, data extraction, and streaming real-time output to the frontend.

## Technology Stack

- **Runtime**: Node.js with TypeScript
- **Server Framework**: Express.js
- **File Handling**: Direct file path processing (no multipart upload handling)
- **AI Integration**: Claude Code CLI (via child_process spawn)
- **Development Runtime**: tsx (TypeScript execution)
- **Type Checking**: TypeScript 5.6+ with strict mode

## Server Configuration

**Port**: 3001 (configurable in `src/index.ts`)
**CORS**: Enabled for `http://localhost:5173` (Vite dev server)
**File Processing**: Accepts file paths as strings in request body (frontend provides absolute paths)

## API Endpoints

### Text Analysis Endpoints

#### POST /api/validate-text
Validates venue text description against quality checkpoints.

**Request Body**:
```json
{
  "textInput": "string (required)"
}
```

**Response**:
```json
{
  "passed": true,
  "checkpoints": {
    "stageVisible": true,
    "rowsVisible": true,
    "seatsVisible": true,
    "numberingClear": true
  },
  "issues": [],
  "source": "text"
}
```

#### GET /api/validate-text-stream
Server-Sent Events (SSE) endpoint for streaming validation progress.

**Query Parameters**:
- `textInput` (required): URL-encoded venue description text

**Response**: SSE stream with real-time Claude CLI output

---

#### POST /api/extract-data
Extracts structured venue data from text description.

**Request Body**:
```json
{
  "textInput": "string (required)"
}
```

**Response**:
```json
{
  "venueName": "Optional name",
  "stageLocation": "north",
  "rows": [
    {
      "rowNumber": "A",
      "seatCount": 20,
      "direction": "facing_stage"
    }
  ],
  "source": "text"
}
```

#### GET /api/extract-data-stream
Server-Sent Events (SSE) endpoint for streaming data extraction progress.

**Query Parameters**:
- `textInput` (required): URL-encoded venue description text

**Response**: SSE stream with real-time Claude CLI output

---

### File Analysis Endpoints

#### POST /api/validate-file
Validates venue file (image or text-based) against quality checkpoints.

**Content-Type**: `application/json`

**Request Body**:
```json
{
  "filePath": "/absolute/path/to/venue/file.png"
}
```

**Supported Formats**:
- **Images**: PNG, JPG, JPEG, GIF, BMP, WEBP
- **Text**: TXT, JSON, CSV

**Response**: Same as `/api/validate-text` but with `"source": "file"`

**Note**: The frontend is responsible for providing the absolute file path. This endpoint reads the file directly from the filesystem.

#### GET /api/validate-file-stream
Server-Sent Events (SSE) endpoint for streaming file validation progress.

**Query Parameters**:
- `filePath` (required): Server-side file path (returned from upload)

**Response**: SSE stream with real-time Claude CLI output

---

#### POST /api/extract-file
Extracts structured venue data from file.

**Content-Type**: `application/json`

**Request Body**:
```json
{
  "filePath": "/absolute/path/to/venue/file.png"
}
```

**Response**: Same as `/api/extract-data` but with `"source": "file"`

**Note**: The frontend is responsible for providing the absolute file path. This endpoint reads the file directly from the filesystem.

#### GET /api/extract-file-stream
Server-Sent Events (SSE) endpoint for streaming file extraction progress.

**Query Parameters**:
- `filePath` (required): Server-side file path (returned from upload)

**Response**: SSE stream with real-time Claude CLI output

---

### Utility Endpoints

#### POST /api/generate-example
Generates a random venue description example using Claude CLI.

**Request Body**: None (empty POST)

**Response**:
```json
{
  "example": "string (generated venue description)"
}
```

## Core Module: claude-cli.ts

The `claude-cli.ts` module is the heart of the backend's AI integration. It provides functions to interact with Claude Code CLI for validation, extraction, and example generation.

### Key Functions

#### executeClaudeCLI(prompt, onStream?, imagePath?)
Internal function that spawns Claude CLI process and handles I/O.

**Image Handling**: If `imagePath` is provided, prepends the prompt with:
```
First, read and analyze the image file at this path: ${imagePath}

Then, ${prompt}
```

This leverages Claude Code's Read tool for visual analysis. **No command-line flags** are used for image attachment.

**Parameters**:
- `prompt`: The instruction/question for Claude
- `onStream`: Optional callback for streaming output (SSE)
- `imagePath`: Optional absolute path to image file

**Returns**: Promise<string> (Claude's full response)

---

#### validateVenueText(textInput, onStream?)
Validates text description against quality checkpoints.

**Prompting Strategy**: Instructs Claude to analyze text and return JSON with checkpoint results.

---

#### validateVenueFile(filePath, onStream?)
Validates uploaded file (image or text) against quality checkpoints.

**Image Processing**: Uses `executeClaudeCLI` with `imagePath` parameter to enable visual analysis via Read tool.

**Text File Processing**: Reads file content and includes it in the prompt.

---

#### extractVenueDataFromDescription(textInput, onStream?)
Extracts structured venue data from text description.

**Output**: Returns VenueData object with venue name, stage location, and row details.

---

#### extractVenueDataFromFile(filePath, onStream?)
Extracts structured venue data from uploaded file.

**Image Processing**: Uses visual analysis to extract row numbers, seat counts, and directions from diagrams.

---

#### generateVenueExample(onStream?)
Generates a random, creative venue description for testing.

**Output**: Plain text description (50-150 words) of a fictional venue.

---

### JSON Extraction

The `extractJSON()` helper function parses Claude's responses, which may include:
- Markdown code blocks with ```json``` syntax
- Raw JSON objects
- Explanatory text before/after JSON

This ensures robust parsing even when Claude adds extra context.

## File Path Handling

### How It Works

The backend receives **absolute file paths** as strings in the request body, not file uploads. The frontend is responsible for:
1. Getting the file from the user (via file input or drag-and-drop)
2. Extracting the absolute file path from the File object
3. Sending the file path as a string to the backend

### File Type Detection

The server uses file extensions to determine processing strategy:
- **Images** (`.png`, `.jpg`, `.jpeg`, `.gif`, `.bmp`, `.webp`): Pass file path to Claude CLI with Read tool instruction
- **Text files** (`.txt`, `.json`, `.csv`): Read content and include in prompt
- **Excel files** (`.xlsx`, `.xls`): Currently unsupported (returns error suggesting CSV conversion)

### Security Considerations

Since the backend accepts arbitrary file paths:
- Validate that file paths are absolute and exist
- Ensure file has read permissions
- Consider implementing path whitelisting for production
- Sanitize file paths to prevent directory traversal attacks

**For Production**: Consider implementing proper file upload handling with multipart/form-data if accepting files from untrusted sources.

## Streaming with Server-Sent Events (SSE)

All streaming endpoints (`*-stream`) use SSE to push real-time updates to the frontend.

**SSE Headers**:
```javascript
res.setHeader('Content-Type', 'text/event-stream');
res.setHeader('Cache-Control', 'no-cache');
res.setHeader('Connection', 'keep-alive');
```

**Message Format**:
```
data: [MESSAGE]\n\n
```

**Completion Signal**:
```
data: [DONE]\n\n
```

**Error Signal**:
```
data: [ERROR] error message\n\n
```

## Error Handling

### Common Error Scenarios

1. **Claude CLI not found**: Ensure `claude` command is in PATH
2. **Claude CLI authentication**: Run `claude login` if not authenticated
3. **File not found**: Verify file path and permissions
4. **Invalid JSON response**: Claude may wrap JSON in markdown or add extra text
5. **Process spawn failure**: Check that `claude` binary is executable

### Error Response Format

```json
{
  "error": "string (error message)"
}
```

## Development Workflow

### Starting the Server

```bash
cd server
npm run dev    # Runs tsx src/index.ts with watch mode
```

### Environment Variables

Currently no environment variables are required. For production deployment with Claude API:

```bash
ANTHROPIC_API_KEY=sk-...    # Required for direct API usage
PORT=3001                    # Optional (default: 3001)
```

### Adding New Endpoints

1. Create route file in `src/routes/` (e.g., `new-feature.ts`)
2. Define Express route handler with TypeScript types
3. Use functions from `claude-cli.ts` for AI integration
4. Register route in `src/index.ts` using `app.post()` or `app.get()`
5. Update this documentation with endpoint details

## Testing the Backend

### Manual Testing with curl

**Text Validation**:
```bash
curl -X POST http://localhost:3001/api/validate-text \
  -H "Content-Type: application/json" \
  -d '{"textInput": "The concert hall has a stage at the front with 10 rows of 20 seats each."}'
```

**File Validation**:
```bash
curl -X POST http://localhost:3001/api/validate-file \
  -H "Content-Type: application/json" \
  -d '{"filePath": "/absolute/path/to/venue-diagram.png"}'
```

**Streaming (SSE)**:
```bash
curl -N "http://localhost:3001/api/validate-text-stream?textInput=Test%20venue"
```

### Integration Testing

The backend can be tested independently of the frontend by using curl or Postman to send requests. Verify:
- Claude CLI is correctly spawned
- Streaming output appears in real-time
- JSON responses match expected schema
- File uploads are stored and processed correctly

## Production Considerations

### Migration to Claude API

To replace Claude CLI with direct Anthropic API calls:

1. Install SDK: `npm install @anthropic-ai/sdk`
2. Replace `spawn()` calls in `claude-cli.ts` with SDK methods
3. Use streaming API for SSE endpoints: `client.messages.stream()`
4. Remove `--dangerously-skip-permissions` flag logic
5. Add `ANTHROPIC_API_KEY` environment variable
6. Update error handling for API-specific errors

### Security Improvements

- Implement file upload validation (magic number checking)
- Add rate limiting to prevent abuse
- Sanitize file paths to prevent directory traversal
- Implement authentication/authorization if needed
- Use signed URLs for file access instead of direct paths
- Add request body size limits
- Implement CSRF protection

### Scalability

- Move file storage to cloud (S3, GCS, Azure Blob)
- Implement queueing system for long-running AI requests
- Add caching layer for repeated queries
- Horizontal scaling with load balancer
- Separate AI processing to worker services

## Troubleshooting

### Server won't start
- Check if port 3001 is already in use: `lsof -i :3001`
- Verify Node.js version: `node --version` (requires v18+)
- Ensure dependencies are installed: `npm install`

### Claude CLI errors
- Verify installation: `which claude`
- Check authentication: `claude --version`
- Test manually: `echo "test prompt" | claude --dangerously-skip-permissions`
- Check internet connection (Claude CLI requires API access)

### File path processing failures
- Verify file path is absolute and accessible
- Check file permissions (must be readable by server process)
- Ensure file exists at the specified path
- Verify file format is supported (check file extension)

### SSE connection issues
- Verify SSE headers are set correctly
- Check that response is not buffered by reverse proxy
- Ensure client handles EventSource reconnection
- Verify CORS allows SSE connections

## Code Conventions

Follow the conventions defined in the root CLAUDE.md:
- Explicit return types for all functions
- Type-only imports using `import type`
- Verbose, descriptive variable names
- Type hints/annotations for all parameters
- Comments explaining complex logic (the "why", not the "what")
- Proper error handling with specific error types (no silent failures)
