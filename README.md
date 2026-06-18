# Venue Vetting POC

A proof-of-concept application for validating and extracting data from venue/theater/stadium seating diagrams using AI-powered image analysis.

## Features

- 📤 Upload venue diagrams (PNG/JPEG format)
- ✅ Validate image quality against checkpoints
- 🔍 Extract structured venue data (rows, seats, directions)
- ✏️ Review and edit extracted data
- 📥 Generate and download standardized JSON manifest

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Express.js + TypeScript
- **AI**: Claude Code CLI (local integration)

## Quick Start

### Prerequisites

- Node.js 18+ installed
- Claude Code CLI installed and configured
- npm or yarn package manager

### Installation

1. **Install backend dependencies**:
```bash
cd server
npm install
```

2. **Install frontend dependencies** (if needed):
```bash
cd vite-project
npm install
```

### Running the Application

**Option 1: Use the startup script** (Recommended):

```bash
./start-dev.sh
```

This will automatically start both the backend server (port 3001) and frontend app (port 5173).

**Option 2: Manual startup**:

**Important**: Start the backend server first, then the frontend.

1. **Start the backend server** (Terminal 1):
```bash
cd server
npm run dev
```

Server will start on `http://localhost:3001`

2. **Start the frontend app** (Terminal 2):
```bash
cd vite-project
npm run dev
```

Frontend will start on `http://localhost:5173`

3. **Open your browser**: Navigate to `http://localhost:5173`

## Usage

1. **Upload Image**: Drag and drop or select a venue diagram image
2. **Validation**: Wait for Claude to analyze the image quality
3. **Review Data**: Edit the extracted venue data as needed
4. **Export**: Download the generated JSON manifest

## Project Structure

```
vetting_poc/
├── server/              # Backend Express server
│   ├── src/
│   │   ├── index.ts    # Server entry point
│   │   ├── claude-cli.ts  # Claude CLI integration
│   │   └── routes/     # API endpoints
│   └── uploads/        # Temporary image storage
│
└── vite-project/       # Frontend React app
    └── src/
        ├── components/ # React components
        ├── hooks/      # Custom hooks
        ├── services/   # API client
        ├── types/      # TypeScript types
        └── utils/      # Utility functions
```

## API Endpoints

- `POST /api/validate-image` - Validate uploaded venue image
- `POST /api/extract-data` - Extract venue data from image
- `GET /health` - Health check endpoint

## Output Format

The application generates a JSON manifest file with the following structure:

```json
{
  "version": "1.0",
  "generatedAt": "2026-02-20T10:30:00Z",
  "venue": {
    "venueName": "Example Theater",
    "stageLocation": "north",
    "rows": [
      {
        "rowNumber": "A",
        "seatCount": 20,
        "direction": "facing_stage"
      }
    ]
  }
}
```

## Development

### Type Checking

```bash
cd vite-project
npm run type-check
```

### Building for Production

**Frontend**:
```bash
cd vite-project
npm run build
```

**Backend**:
```bash
cd server
npm run build
```

## Troubleshooting

### "Claude CLI not found"
- Ensure Claude Code CLI is installed: `claude --version`
- Add Claude to your PATH if necessary

### "Port already in use"
- Frontend: Change port in `vite-project/vite.config.ts`
- Backend: Change PORT in `server/src/index.ts`

### CORS errors
- Ensure backend is running on port 3001
- Check CORS configuration in `server/src/index.ts`

### Image validation/extraction fails
- Verify image is valid PNG/JPEG
- Check server console for detailed error messages
- Ensure Claude CLI has internet connectivity

## Migration to Production

This POC uses Claude Code CLI locally. For production:

1. Replace `server/src/claude-cli.ts` with Anthropic API integration
2. Install `@anthropic-ai/sdk` package
3. Use API key instead of CLI
4. No frontend changes required

## License

This is a proof-of-concept application for demonstration purposes.
