# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Type**: React + TypeScript proof-of-concept application built with Vite + Express.js bridge server

**Purpose**: A venue vetting POC that allows users to upload venue/theater/stadium diagrams and floor plans as **image files** (PNG, JPG, JPEG, GIF, BMP, WEBP), validates them against checkpoints using AI visual analysis, extracts venue data (rows, seats, directions, stage orientation), and generates a JSON manifest file. Uses Claude Code CLI via a local Node.js bridge server for AI-powered visual analysis with real-time streaming output.

**Image Analysis**: The application leverages Claude's visual analysis capabilities via the Read tool to analyze venue diagrams and floor plans, extracting structured seating data from visual representations.

## Essential Commands

### Development

**Backend Server** (must start first):
```bash
cd server
npm run dev              # Start bridge server on http://localhost:3001
```

**Frontend App**:
```bash
cd vite-project
npm run dev              # Start development server on http://localhost:5173
npm run type-check       # Run TypeScript type checking without emitting files
```

### Building
```bash
npm run build           # Type check and build for production (output to dist/)
npm run preview         # Preview production build locally
```

### Code Quality
```bash
npm run lint            # Run ESLint with TypeScript support
npm run test            # Run tests with Vitest
npm run test:ui         # Run tests with Vitest UI
```

### Running Single Test
```bash
npx vitest run <test-file-path>      # Run a specific test file
npx vitest run -t "<test-name>"      # Run tests matching a pattern
```

## Architecture

### Tech Stack

**Frontend**:
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite 5
- **Testing**: Vitest
- **Type Checking**: TypeScript 5.6+ with strict mode enabled

**Backend**:
- **Server**: Express.js with TypeScript
- **AI Integration**: Claude Code CLI (via child_process)
- **Runtime**: tsx (for development)
- **File Handling**: Direct file path processing (images analyzed via Claude's Read tool)

### System Architecture

```
┌──────────────────────────────────────────────────────────┐
│  React App (Vite, Port 5173)                             │
│  - Multi-step workflow UI                                │
│  - Image upload with drag-and-drop                       │
│  - Visual validation results                             │
│  - Data review and editing                               │
│  - Manifest generation and export                        │
│  - Real-time CLI terminal view                           │
└─────────────────┬────────────────────────────────────────┘
                  │ HTTP (fetch + SSE) + File Upload
                  ↓
┌──────────────────────────────────────────────────────────┐
│  Local Bridge Server (Express, Port 3001)                │
│  - POST /api/upload (multipart/form-data)                │
│  - POST /api/validate-file (JSON with filePath)          │
│  - GET  /api/validate-file-stream (SSE)                  │
│  - POST /api/extract-file (JSON with filePath)           │
│  - GET  /api/extract-file-stream (SSE)                   │
└─────────────────┬────────────────────────────────────────┘
                  │ Child process (spawn)
                  ↓
┌──────────────────────────────────────────────────────────┐
│  Claude Code CLI (Real AI)                               │
│  - Analyzes image files via Read tool                    │
│  - Validates venue diagrams visually                     │
│  - Extracts structured venue data from images            │
│  - Streams real-time processing output                   │
└──────────────────────────────────────────────────────────┘
```

### Project Structure

```
vetting_poc/
├── CLAUDE.md                       # This file (project overview)
├── server/                         # Backend bridge server
│   ├── CLAUDE.md                  # Backend-specific documentation
│   ├── src/
│   │   ├── index.ts               # Express server entry point
│   │   ├── claude-cli.ts          # Claude CLI integration (spawn + Read tool)
│   │   └── routes/
│   │       ├── validate.ts        # Text validation endpoint
│   │       ├── validate-stream.ts # Streaming text validation (SSE)
│   │       ├── extract.ts         # Text data extraction endpoint
│   │       ├── extract-stream.ts  # Streaming text extraction (SSE)
│   │       ├── validate-file.ts   # File validation endpoint (accepts filePath)
│   │       ├── validate-file-stream.ts # Streaming file validation (SSE)
│   │       ├── extract-file.ts    # File data extraction endpoint (accepts filePath)
│   │       ├── extract-file-stream.ts # Streaming file extraction (SSE)
│   │       └── generate-example.ts # Random venue example generator
│   ├── package.json               # Server dependencies
│   └── tsconfig.json              # Server TypeScript config
│
└── vite-project/                  # Frontend React app
    ├── CLAUDE.md                  # Frontend-specific documentation
    ├── src/
    │   ├── components/
    │   │   ├── ImageUpload.tsx    # Step 1: Image file upload with drag-and-drop
    │   │   ├── ImageValidation.tsx # Step 2: Image validation results
    │   │   ├── DataReview.tsx     # Step 3: Editable venue data form
    │   │   ├── ManifestExport.tsx # Step 4: Download manifest
    │   │   ├── Stepper.tsx        # Progress indicator
    │   │   └── CliTerminal.tsx    # Real-time CLI streaming view
    │   ├── hooks/
    │   │   └── useApi.ts          # Custom hook for API calls
    │   ├── services/
    │   │   └── apiClient.ts       # Backend communication (fetch + SSE)
    │   ├── types/
    │   │   └── venue.ts           # TypeScript type definitions
    │   ├── utils/
    │   │   └── manifestGenerator.ts # Manifest creation/download
    │   ├── App.tsx                # Main workflow orchestrator
    │   └── main.tsx               # Application entry point
    └── package.json               # Frontend dependencies
```

### Architectural Decisions

**State Management**: Local React state with `useState` in App.tsx. No external state library needed for this POC's linear workflow.

**API Communication**: Native `fetch` API wrapped in a custom `useApi` hook for loading/error state management. No axios needed.

**Component Organization**: Feature-based workflow components (TextInput, TextValidation, DataReview, ManifestExport) orchestrated by App.tsx. CliTerminal provides real-time streaming output visibility.

**Custom Hooks**: `useApi` hook abstracts API call patterns with loading, error, and data state.

**Utility Functions**: Manifest generation and file download logic isolated in `utils/manifestGenerator.ts`.

**Type Safety**: Shared TypeScript types in `types/venue.ts` ensure consistency between frontend and backend.

**Real-time Streaming**: Server-Sent Events (SSE) for streaming Claude CLI output to frontend terminal view.

**Image Processing**: Claude CLI integration uses prompt-based instructions to read image files via Claude's Read tool. No command-line flags are used for image attachment; instead, the prompt is prepended with: `First, read and analyze the image file at this path: ${imagePath}`. This leverages Claude Code's built-in file reading capabilities for visual analysis.

## TypeScript Configuration

This project uses **strict mode** TypeScript with additional safety features:
- `noUncheckedIndexedAccess: true` - Array/object index access returns `T | undefined`
- `noUnusedLocals: true` - Errors on unused local variables
- `noUnusedParameters: true` - Errors on unused function parameters
- `noFallthroughCasesInSwitch: true` - Requires explicit breaks in switch statements

When writing code, ensure:
- All functions have explicit return types
- Array access is properly guarded or uses optional chaining
- No unused variables or parameters remain in code

## Vite-Specific Notes

### Hot Module Replacement (HMR)
Vite provides fast HMR out of the box. Changes to `.tsx` and `.css` files automatically reflect in the browser without full page reload.

### Environment Variables
- Prefix environment variables with `VITE_` to expose them to client code
- Access via `import.meta.env.VITE_YOUR_VAR`
- Never commit `.env` files with sensitive data

### Static Assets
- Place static assets in `public/` directory
- Reference them with absolute paths starting with `/`
- Assets imported in code (e.g., `import logo from './logo.svg'`) are processed by Vite

## Testing Guidelines

[TODO: Document testing patterns once tests are added:
- Unit test location (e.g., `__tests__` folder vs co-located `.test.tsx` files)
- Integration test approach
- Mocking strategies for API calls
- Test utilities and custom render functions]

## Key Conventions

**Component Naming**: PascalCase for all React components (e.g., `ImageUpload`, `DataReview`, `CliTerminal`)

**File Naming**: PascalCase for component files matching component name (e.g., `ImageUpload.tsx`)

**Props Interface Naming**: `{ComponentName}Props` pattern (e.g., `ImageUploadProps`)

**Event Handler Naming**:
- Internal handlers: `handleEventName` (e.g., `handleFileUpload`, `handleNext`)
- Callback props: `onEventName` (e.g., `onSubmit`, `onValidationComplete`, `onCliMessage`)

**Function Return Types**: All functions must have explicit return types per TypeScript standard

**Type Imports**: Use `import type` for type-only imports (e.g., `import type { VenueData } from '../types/venue'`)

**Styling Approach**: Inline styles for POC simplicity. No CSS modules or styled-components.

**API Error Handling**: All API functions throw errors; components handle errors via `useApi` hook's error state

**Import Ordering**:
1. React imports
2. Third-party library imports
3. Local component imports
4. Type imports
5. Utility/service imports
6. CSS imports

## Common Issues & Solutions

**Backend server not responding**:
- Ensure Claude Code CLI is installed and accessible in PATH: `which claude`
- Check that server is running on port 3001
- Verify Claude CLI is authenticated and working: `claude --version`

**CORS errors**:
- Backend server has CORS enabled for `http://localhost:5173` only
- If frontend runs on different port, update CORS config in `server/src/index.ts`

**Image validation/extraction fails**:
- Verify Claude CLI is working: `claude --version`
- Check server logs for detailed error messages from Claude CLI
- Ensure image file is valid and accessible
- Claude CLI requires internet connection for API calls
- Check that `--dangerously-skip-permissions` flag is working
- For images, ensure file path is accessible and format is supported
- Verify Read tool instruction is properly prepended to prompt

**Image file processing issues**:
- Verify file path is absolute and accessible to backend server
- Verify supported formats: PNG, JPG, JPEG, GIF, BMP, WEBP
- Check that file path is being passed correctly to Claude CLI
- Verify image analysis uses Read tool via prompt instruction, not command-line flags
- Ensure file has read permissions for the server process

**CLI terminal not showing output**:
- Check browser console for SSE connection errors
- Verify streaming endpoints are registered in `server/src/index.ts`
- Ensure EventSource is supported in your browser
- Check that onCliMessage callbacks are properly connected

**Port 5173 or 3001 already in use**:
- Frontend: Change port in `vite-project/vite.config.ts`
- Backend: Change PORT constant in `server/src/index.ts`
- If changing backend port, update `API_BASE_URL` in `vite-project/src/services/apiClient.ts`

**TypeScript errors after changes**:
- Run `npm run type-check` to verify
- Ensure all function parameters and return types are explicitly typed
- Check that shared types in `types/venue.ts` match between frontend and backend

## Migration to Production (Claude API)

When migrating from Claude CLI to direct Claude API:

1. **Replace CLI integration** (`server/src/claude-cli.ts`):
   - Install `@anthropic-ai/sdk` package
   - Replace `spawn` calls with Anthropic SDK API calls
   - Use streaming API for real-time output
   - Same function signatures, no frontend changes needed

2. **Environment variables**:
   - Add `ANTHROPIC_API_KEY` to server environment
   - Never commit API keys to repository
   - Use `.env` file for local development

3. **API endpoints remain unchanged**:
   - Frontend requires zero modifications
   - Same request/response formats
   - SSE streaming continues to work

4. **Deploy backend**:
   - Deploy to cloud service (AWS Lambda, Google Cloud Run, etc.)
   - Update `API_BASE_URL` in frontend to production URL
   - Ensure API key is securely stored in environment

## Workflow Steps

1. **Image Upload** - User uploads venue diagram/floor plan (PNG, JPG, JPEG, GIF, BMP, WEBP) with drag-and-drop support
2. **Visual Validation** - Claude CLI analyzes image via Read tool for quality checkpoints:
   - Stage visible in diagram
   - Rows clearly marked
   - Seats visible
   - Numbering/labeling clear
3. **Data Extraction** - Claude CLI extracts structured data from image using visual analysis:
   - Venue name (if visible)
   - Stage location
   - Row numbers and seat counts
   - Seat directions
   - Sections/tiers (if applicable)
   - Accessibility features (if visible)
   - Amenities (if shown)
4. **Data Review** - User reviews and edits extracted data in interactive form with confidence indicators
5. **Manifest Export** - Generate and download standardized JSON manifest

**CLI Terminal View**: Steps 2 & 3 show real-time streaming output from Claude CLI at the bottom of the screen, providing transparency into AI visual analysis processing.

## Manifest Schema

```json
{
  "version": "1.0",
  "generatedAt": "ISO 8601 timestamp",
  "venue": {
    "venueName": "Optional venue name",
    "stageLocation": "Stage location (e.g., north, center)",
    "rows": [
      {
        "rowNumber": "Row identifier (e.g., A, 1)",
        "seatCount": 20,
        "direction": "facing_stage | facing_away | side_view"
      }
    ]
  }
}
```
