export type InputMode = 'file' | 'upload';

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

export interface Manifest {
  version: '1.0';
  generatedAt: string;
  venue: VenueData;
}

export type WorkflowStep = 1 | 2 | 3 | 4;
