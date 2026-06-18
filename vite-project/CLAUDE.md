# Frontend Application Documentation

This document provides detailed guidance for working with the React + TypeScript frontend application.

## Overview

The frontend is a React 18 application built with Vite that provides a multi-step workflow for venue vetting. Users can input venue descriptions as text or upload image files, validate them with AI, extract structured data, review and edit the data, and export a JSON manifest.

## Technology Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite 5 (fast HMR, optimized builds)
- **Type Checking**: TypeScript 5.6+ with strict mode
- **Testing**: Vitest (unit tests)
- **Styling**: Inline styles (POC simplicity)
- **State Management**: Local React state with useState (no external libraries)

## Application Structure

### Main Entry Point

**main.tsx**: Application entry point that renders the root App component into the DOM.

**App.tsx**: Main workflow orchestrator that manages:
- Current step tracking (1-4)
- Input method selection (text vs. image)
- Data flow between steps
- Validation and extraction results
- CLI terminal visibility

### Components

#### Stepper.tsx
Progress indicator showing current step in the workflow.

**Props**:
- `currentStep`: 1-4 (current active step)
- `totalSteps`: Total number of steps (always 4)

**Steps**:
1. Input (Text/Image)
2. Validation
3. Data Review
4. Export

---

#### TextInput.tsx
Text input component with textarea and example generation.

**Features**:
- Large textarea for venue descriptions
- "Generate Example" button (calls `/api/generate-example`)
- "Analyze" button to proceed to validation
- Character counter (optional)
- Real-time validation of non-empty input

**Props**:
- `onSubmit`: Callback with text input when user clicks "Analyze"
- `onCliMessage`: Callback for streaming CLI output during example generation

---

#### ImageUpload.tsx
Image file upload component with drag-and-drop support.

**Supported Formats**: PNG, JPG, JPEG, GIF, BMP, WEBP

**Features**:
- File input button
- Drag-and-drop zone
- Image preview after upload
- File size and type validation
- "Analyze" button to proceed to validation

**Props**:
- `onFileSelect`: Callback with File object when user selects valid image
- `onSubmit`: Callback when user clicks "Analyze" after selecting file

**Validation**:
- Max file size: 10MB
- File type must match supported image formats
- Displays error messages for invalid files

---

#### TextValidation.tsx
Displays text validation results with checkpoint status.

**Checkpoint Display**:
- ✅ Green checkmark for passed checkpoints
- ❌ Red X for failed checkpoints

**Checkpoints**:
- Stage Visible
- Rows Visible
- Seats Visible
- Numbering Clear

**Props**:
- `result`: ValidationResult object from backend
- `onNext`: Callback when user clicks "Continue to Data Extraction"
- `onBack`: Callback when user clicks "Back to Input"
- `onCliMessage`: Callback for streaming CLI output

**Features**:
- Shows list of issues if validation fails
- "Continue" button only enabled if validation passed
- Real-time CLI terminal at bottom

---

#### ImageValidation.tsx
Displays image validation results (similar to TextValidation).

**Additional Info**:
- Shows thumbnail preview of analyzed image
- Indicates visual analysis was performed
- Same checkpoint display as TextValidation

**Props**: Same as TextValidation.tsx

---

#### DataReview.tsx
Editable form for reviewing and modifying extracted venue data.

**Editable Fields**:
- **Venue Name** (optional): Text input
- **Stage Location**: Text input
- **Rows**: Dynamic list with add/remove functionality
  - Row Number: Text input
  - Seat Count: Number input
  - Direction: Dropdown (facing_stage, facing_away, side_view)

**Props**:
- `data`: VenueData object from extraction step
- `onSave`: Callback with edited VenueData when user clicks "Save & Continue"
- `onBack`: Callback when user clicks "Back to Validation"
- `onCliMessage`: Callback for streaming CLI output

**Features**:
- Add row button (appends new empty row)
- Remove row button (deletes specific row)
- Input validation (seat count must be positive)
- Auto-save to local state on every change

---

#### ManifestExport.tsx
Final step for downloading the JSON manifest.

**Features**:
- Preview of JSON manifest (formatted)
- "Download Manifest" button (triggers file download)
- "Start Over" button (resets workflow)
- Displays venue summary statistics

**Props**:
- `data`: VenueData object to export
- `onReset`: Callback when user clicks "Start Over"

**Export Format**: JSON file with schema:
```json
{
  "version": "1.0",
  "generatedAt": "ISO 8601 timestamp",
  "venue": {
    "venueName": "string",
    "stageLocation": "string",
    "rows": [
      {
        "rowNumber": "string",
        "seatCount": number,
        "direction": "facing_stage | facing_away | side_view"
      }
    ]
  }
}
```

**File Naming**: `venue-manifest-${timestamp}.json`

---

#### CliTerminal.tsx
Real-time terminal view showing Claude CLI streaming output.

**Features**:
- Auto-scrolling message display
- Timestamp for each message
- Monospace font for terminal aesthetic
- Clear button to reset messages
- Collapse/expand button

**Props**:
- `messages`: Array of string messages from SSE stream
- `onClear`: Callback when user clicks "Clear"

**Styling**:
- Black background
- Green text (terminal aesthetic)
- Fixed height with scrollbar
- Sticky to bottom of viewport

---

### Services

#### apiClient.ts
Backend communication service using native fetch API and EventSource (SSE).

**Functions**:

##### validateText(textInput)
POST request to `/api/validate-text`.

**Returns**: Promise<ValidationResult>

---

##### extractData(textInput)
POST request to `/api/extract-data`.

**Returns**: Promise<VenueData>

---

##### validateFile(file)
POST multipart/form-data request to `/api/validate-file`.

**Parameters**:
- `file`: File object from input element

**Returns**: Promise<ValidationResult>

---

##### extractFileData(file)
POST multipart/form-data request to `/api/extract-file`.

**Returns**: Promise<VenueData>

---

##### streamValidateText(textInput, onMessage, onComplete, onError)
SSE request to `/api/validate-text-stream`.

**Parameters**:
- `textInput`: Venue description text
- `onMessage`: Callback for each SSE message
- `onComplete`: Callback with final ValidationResult JSON
- `onError`: Callback for errors

**Lifecycle**:
1. Opens EventSource connection
2. Streams messages via `onMessage`
3. Parses final `[DONE]` message
4. Closes connection
5. Calls `onComplete` with parsed result

---

##### streamExtractData(textInput, onMessage, onComplete, onError)
SSE request to `/api/extract-data-stream`.

**Similar to streamValidateText** but returns VenueData.

---

##### streamValidateFile(filePath, onMessage, onComplete, onError)
SSE request to `/api/validate-file-stream`.

**Parameters**:
- `filePath`: Server-side file path (from file upload response)
- Other parameters same as streamValidateText

---

##### streamExtractFileData(filePath, onMessage, onComplete, onError)
SSE request to `/api/extract-file-stream`.

**Similar to streamValidateFile** but returns VenueData.

---

##### generateExample(onMessage?, onComplete?, onError?)
POST request to `/api/generate-example` with optional SSE streaming.

**Returns**: Promise<string> (generated venue description)

**SSE Support**: If callbacks provided, uses streaming endpoint for real-time generation progress.

---

### Hooks

#### useApi.ts
Custom hook for API calls with loading/error state management.

**Usage**:
```typescript
const { data, error, loading, execute } = useApi<ReturnType>();

// Call API
execute(async () => {
  return await apiClient.someFunction();
});
```

**State Management**:
- `data`: API response (null initially)
- `error`: Error message (null if no error)
- `loading`: Boolean loading state
- `execute`: Function to trigger API call

**Error Handling**: Automatically catches errors and updates error state.

---

### Types

#### venue.ts
Shared TypeScript type definitions.

**Types**:

```typescript
interface Row {
  rowNumber: string;
  seatCount: number;
  direction: 'facing_stage' | 'facing_away' | 'side_view';
}

interface VenueData {
  venueName?: string;
  stageLocation: string;
  rows: Row[];
  source?: 'text' | 'file';
}

interface ValidationCheckpoints {
  stageVisible: boolean;
  rowsVisible: boolean;
  seatsVisible: boolean;
  numberingClear: boolean;
}

interface ValidationResult {
  passed: boolean;
  checkpoints: ValidationCheckpoints;
  issues: string[];
  source?: 'text' | 'file';
}
```

---

### Utils

#### manifestGenerator.ts
Utility for creating and downloading JSON manifest files.

**Functions**:

##### generateManifest(data: VenueData)
Creates manifest JSON object with version and timestamp.

**Returns**: Manifest object

---

##### downloadManifest(data: VenueData)
Generates manifest and triggers browser download.

**Mechanism**:
1. Creates manifest object
2. Converts to JSON string with formatting
3. Creates Blob with `application/json` type
4. Creates temporary `<a>` element with download attribute
5. Triggers click event
6. Cleans up temporary element

**File Name**: `venue-manifest-${timestamp}.json`

---

## Workflow State Management

The App component manages the entire workflow state:

```typescript
const [step, setStep] = useState(1);
const [inputMethod, setInputMethod] = useState<'text' | 'image' | null>(null);
const [textInput, setTextInput] = useState('');
const [imageFile, setImageFile] = useState<File | null>(null);
const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
const [venueData, setVenueData] = useState<VenueData | null>(null);
const [cliMessages, setCliMessages] = useState<string[]>([]);
```

**State Flow**:
1. User selects input method → `inputMethod` set
2. User submits text/image → `textInput` or `imageFile` set
3. Validation runs → `validationResult` set, `step` increments
4. Extraction runs → `venueData` set, `step` increments
5. User edits data → `venueData` updated
6. User exports → Manifest downloaded

**Reset**: "Start Over" clears all state and returns to step 1.

---

## Styling Conventions

This POC uses inline styles for simplicity. No CSS modules, styled-components, or utility frameworks.

**Common Styles**:
- **Primary Button**: Blue background, white text, rounded corners
- **Secondary Button**: Gray background, white text
- **Danger Button**: Red background, white text
- **Success Indicator**: Green color (#4CAF50)
- **Error Indicator**: Red color (#f44336)
- **Container**: Max width 1200px, centered, padding 20px

**Responsive Design**: Not currently implemented (POC simplicity). For production, add media queries or use a CSS framework.

---

## Component Communication

### Props Drilling
Data flows from App → Child components via props. No context or Redux needed for this linear workflow.

### Callback Props
Children communicate back to parent via callback props:
- `onSubmit`: Data submission
- `onNext`: Proceed to next step
- `onBack`: Return to previous step
- `onCliMessage`: Stream CLI output to terminal

### Example Flow
```
App (state)
  ↓ props
TextInput
  ↓ callback (onSubmit)
App (setState, step++)
  ↓ props
TextValidation
  ↓ callback (onNext)
App (setState, step++)
  ↓ props
DataReview
  ↓ callback (onSave)
App (setState, step++)
  ↓ props
ManifestExport
```

---

## Error Handling

### API Errors
The `useApi` hook catches errors and sets error state. Components display error messages to users.

**User-Friendly Messages**:
- "Failed to connect to server. Please ensure the backend is running."
- "Invalid file format. Please upload an image file (PNG, JPG, etc.)."
- "Validation failed. Please check your input and try again."

### Validation Errors
Input validation is performed before API calls:
- Text must not be empty
- Image file must be valid format and size
- Row data must have positive seat counts

### Network Errors
EventSource (SSE) errors are caught and displayed. Connection failures trigger error callbacks.

---

## Development Workflow

### Starting the Frontend

```bash
cd vite-project
npm run dev    # Starts Vite dev server on http://localhost:5173
```

### Hot Module Replacement (HMR)

Vite provides instant HMR for React components. Changes to `.tsx` files automatically reflect in the browser without full page reload.

**State Preservation**: React Fast Refresh preserves component state during HMR when possible.

---

## Environment Variables

Prefix environment variables with `VITE_` to expose them to client code.

**Example (.env file)**:
```bash
VITE_API_BASE_URL=http://localhost:3001
```

**Usage**:
```typescript
const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
```

**Security**: Never commit `.env` files with sensitive data. Use `.env.example` for documentation.

---

## Testing

### Unit Tests (Vitest)

Test files are co-located with components: `ComponentName.test.tsx`

**Example Test Structure**:
```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import TextInput from './TextInput';

describe('TextInput', () => {
  it('renders textarea', () => {
    render(<TextInput onSubmit={() => {}} onCliMessage={() => {}} />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });
});
```

**Running Tests**:
```bash
npm run test        # Run tests in watch mode
npm run test:ui     # Run tests with Vitest UI
```

---

## Build and Deployment

### Production Build

```bash
npm run build    # Creates dist/ folder with optimized bundle
```

**Output**: `dist/` directory with:
- `index.html`: Entry point
- `assets/`: JS, CSS, and other assets with content hashes

### Preview Build

```bash
npm run preview    # Serves production build locally
```

### Deployment Options

**Static Hosting**:
- Vercel: `vercel deploy`
- Netlify: `netlify deploy --dir=dist`
- GitHub Pages: Push `dist/` to gh-pages branch
- AWS S3 + CloudFront: Upload `dist/` to S3 bucket

**Environment Configuration**:
Update `VITE_API_BASE_URL` to point to production backend URL.

---

## Common Issues

### Backend connection fails
- Ensure backend server is running on port 3001
- Check CORS configuration allows `http://localhost:5173`
- Verify `API_BASE_URL` in `apiClient.ts` matches backend URL

### SSE connection issues
- Check browser console for EventSource errors
- Verify backend sends proper SSE headers
- Ensure no reverse proxy buffers SSE responses

### File upload fails
- Check file size is under 10MB
- Verify file type is supported (PNG, JPG, etc.)
- Ensure backend `/api/validate-file` endpoint is accessible
- Check browser console for CORS errors

### Build errors
- Run `npm run type-check` to find TypeScript errors
- Ensure all dependencies are installed: `npm install`
- Clear Vite cache: `rm -rf node_modules/.vite`

---

## Code Conventions

Follow the conventions defined in the root CLAUDE.md:
- **Component Naming**: PascalCase (e.g., `TextInput`, `DataReview`)
- **File Naming**: PascalCase matching component name (e.g., `TextInput.tsx`)
- **Props Interface**: `{ComponentName}Props` pattern
- **Event Handlers**: `handleEventName` for internal, `onEventName` for props
- **Type Imports**: Use `import type` for type-only imports
- **Function Return Types**: All functions must have explicit return types
- **Import Ordering**:
  1. React imports
  2. Third-party library imports
  3. Local component imports
  4. Type imports
  5. Utility/service imports

---

## Future Enhancements

### Planned Features
- [ ] Drag-and-drop for row reordering in DataReview
- [ ] Undo/redo for data edits
- [ ] Save draft to localStorage
- [ ] Multiple venue comparison view
- [ ] Export to multiple formats (CSV, Excel)
- [ ] Print-friendly view
- [ ] Accessibility improvements (ARIA labels, keyboard navigation)
- [ ] Dark mode toggle
- [ ] Responsive mobile layout

### Technical Improvements
- [ ] Add comprehensive unit tests for all components
- [ ] Implement E2E tests with Playwright
- [ ] Add error boundary components
- [ ] Implement proper loading skeletons
- [ ] Add toast notifications for user feedback
- [ ] Optimize bundle size with code splitting
- [ ] Add performance monitoring
- [ ] Implement service worker for offline support

---

## Best Practices

### Component Design
- Keep components focused on single responsibility
- Prefer function components with hooks over class components
- Use TypeScript interfaces for all props
- Extract reusable logic into custom hooks
- Avoid prop drilling beyond 2-3 levels

### State Management
- Keep state as close to where it's needed as possible
- Lift state up only when necessary for sibling communication
- Use local state for UI concerns (form inputs, toggles)
- Consider Context API if prop drilling becomes excessive

### Performance
- Use React.memo for expensive renders
- Implement virtualization for long lists
- Lazy load routes and heavy components
- Optimize images (use WebP, lazy loading)
- Debounce API calls for search/filter inputs

### Accessibility
- Use semantic HTML elements
- Add ARIA labels where necessary
- Ensure keyboard navigation works
- Test with screen readers
- Maintain sufficient color contrast

### Security
- Sanitize user inputs before rendering
- Validate file uploads on both client and server
- Never expose sensitive data in client code
- Use HTTPS in production
- Implement CSP headers
