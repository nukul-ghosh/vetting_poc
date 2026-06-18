import { useEffect, useState } from 'react';
import { validateVenueFileStream } from '../services/apiClient';
import type { ValidationResult } from '../types/venue';

interface ImageValidationProps {
  filePath: string;
  onValidationComplete: (result: ValidationResult) => void;
  onBack: () => void;
  onNext: () => void;
  onCliMessage: (message: string) => void;
}

export function ImageValidation({
  filePath,
  onValidationComplete,
  onBack,
  onNext,
  onCliMessage
}: ImageValidationProps): JSX.Element {
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Automatically start validation when component mounts
    performValidation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const performValidation = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const result = await validateVenueFileStream(filePath, (message: string) => {
        onCliMessage(message);
      });

      setValidationResult(result);
      onValidationComplete(result);
      setLoading(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown validation error';
      setError(errorMessage);
      setLoading(false);
    }
  };

  const handleRetry = (): void => {
    performValidation();
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h2>Image Validation</h2>
      <p style={{ color: '#666', marginBottom: '2rem' }}>
        Checking if your venue diagram meets quality requirements...
      </p>

      {loading && (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
          <p style={{ fontSize: '1.125rem' }}>Analyzing image with Claude...</p>
          <p style={{ color: '#999' }}>This may take a moment</p>
        </div>
      )}

      {error && (
        <div
          style={{
            padding: '1.5rem',
            background: '#fee',
            border: '1px solid #fcc',
            borderRadius: '8px',
            marginBottom: '2rem'
          }}
        >
          <h3 style={{ color: '#c00', marginTop: 0 }}>Validation Failed</h3>
          <p style={{ marginBottom: '1rem' }}>{error}</p>
          <button
            onClick={handleRetry}
            style={{
              padding: '0.5rem 1.5rem',
              background: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Retry Validation
          </button>
        </div>
      )}

      {validationResult && (
        <div>
          {/* Validation Status Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              padding: '1.5rem',
              background: validationResult.passed ? '#dcfce7' : '#fef3c7',
              border: `2px solid ${validationResult.passed ? '#86efac' : '#fcd34d'}`,
              borderRadius: '12px',
              marginBottom: '2rem'
            }}
          >
            <span style={{ fontSize: '2.5rem', flexShrink: 0 }}>
              {validationResult.passed ? '✓' : '⚠'}
            </span>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: validationResult.passed ? '#166534' : '#92400e' }}>
                {validationResult.passed ? 'Image Validation Passed' : 'Image Validation Issues Found'}
              </h3>
              <p style={{ fontSize: '0.875rem', color: validationResult.passed ? '#166534' : '#92400e', margin: 0 }}>
                {validationResult.passed
                  ? 'Your venue diagram meets all quality checkpoints'
                  : 'Please address the issues below or proceed with caution'}
              </p>
            </div>
          </div>

          {/* Checkpoints */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>Checkpoints</h3>
            <div style={{ display: 'grid', gap: '1rem' }}>
              <CheckpointItem
                label="Stage Visible in Diagram"
                passed={validationResult.checkpoints.stageVisible}
                description="Stage or performance area is clearly visible in the image"
              />
              <CheckpointItem
                label="Rows Clearly Marked"
                passed={validationResult.checkpoints.rowsVisible}
                description="Seating rows or sections are visibly marked in the diagram"
              />
              <CheckpointItem
                label="Seats Visible"
                passed={validationResult.checkpoints.seatsVisible}
                description="Individual seats or seat counts are visible in the image"
              />
              <CheckpointItem
                label="Numbering/Labeling Clear"
                passed={validationResult.checkpoints.numberingClear}
                description="Row labels or seat numbers are clearly visible and readable"
              />
            </div>
          </div>

          {/* Issues List */}
          {validationResult.issues.length > 0 && (
            <div
              style={{
                padding: '1rem',
                background: '#fef2f2',
                border: '1px solid #fca5a5',
                borderRadius: '8px',
                marginBottom: '1rem'
              }}
            >
              <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#dc2626', marginBottom: '0.5rem' }}>
                Issues to Address:
              </h4>
              <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#991b1b' }}>
                {validationResult.issues.map((issue, index) => (
                  <li key={index} style={{ marginBottom: '0.25rem' }}>
                    {issue}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Warning Note */}
          {!validationResult.passed && (
            <div
              style={{
                padding: '1rem',
                background: '#f0f9ff',
                border: '1px solid #bae6fd',
                borderRadius: '8px',
                marginBottom: '2rem'
              }}
            >
              <p style={{ margin: 0, color: '#075985' }}>
                <strong>💡 Note:</strong> You can proceed to data extraction even if validation fails, but the results may be less accurate.
              </p>
            </div>
          )}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
        <button
          onClick={onBack}
          style={{
            padding: '0.75rem 2rem',
            background: 'white',
            color: '#333',
            border: '1px solid #ccc',
            borderRadius: '4px',
            fontSize: '1rem',
            cursor: 'pointer'
          }}
        >
          Back
        </button>
        <button
          onClick={onNext}
          disabled={!validationResult}
          style={{
            padding: '0.75rem 2rem',
            background: validationResult ? '#4CAF50' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '1rem',
            cursor: validationResult ? 'pointer' : 'not-allowed',
            fontWeight: 'bold'
          }}
        >
          {validationResult?.passed ? 'Proceed to Data Extraction' : 'Proceed Anyway'}
        </button>
      </div>
    </div>
  );
}

interface CheckpointItemProps {
  label: string;
  passed: boolean;
  description: string;
}

function CheckpointItem({ label, passed, description }: CheckpointItemProps): JSX.Element {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '1rem',
        padding: '1rem',
        background: '#f9fafb',
        borderLeft: `4px solid ${passed ? '#86efac' : '#fca5a5'}`,
        borderRadius: '4px'
      }}
    >
      <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>{passed ? '✓' : '✗'}</span>
      <div>
        <h4
          style={{
            fontSize: '1rem',
            fontWeight: 600,
            color: passed ? '#16a34a' : '#dc2626',
            marginBottom: '0.25rem'
          }}
        >
          {label}
        </h4>
        <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>{description}</p>
      </div>
    </div>
  );
}
