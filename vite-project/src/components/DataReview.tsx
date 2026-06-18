import { useState, useEffect, type ChangeEvent } from 'react';
import { extractVenueFileDataStream } from '../services/apiClient';
import type { VenueData, Row, Section, AccessibilityFeatures, Amenities, ConfidenceScore } from '../types/venue';
import { DataReviewSkeleton } from './Skeleton';
import { ConfidenceIndicator, ConfidenceBadge } from './ConfidenceIndicator';

interface DataReviewProps {
  filePath: string;
  onDataReady: (data: VenueData) => void;
  onBack: () => void;
  onNext: () => void;
  onCliMessage: (message: string) => void;
}

export function DataReview({
  filePath,
  onDataReady,
  onBack,
  onNext,
  onCliMessage
}: DataReviewProps): JSX.Element {
  const [venueData, setVenueData] = useState<VenueData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<VenueData | null>(null);

  useEffect(() => {
    let isSubscribed = true;

    const performExtraction = async (): Promise<void> => {
      if (filePath && filePath.trim().length > 0) {
        try {
          setLoading(true);
          setError(null);

          const result = await extractVenueFileDataStream(filePath, (message: string) => {
            if (isSubscribed) {
              onCliMessage(message);
            }
          });

          if (isSubscribed) {
            setVenueData(result);
            setEditingData(result);
            onDataReady(result);
            setLoading(false);
          }
        } catch (err) {
          if (isSubscribed) {
            setError(err instanceof Error ? err.message : 'Unknown error during file extraction');
            setLoading(false);
          }
        }
      }
    };

    performExtraction();

    return (): void => {
      isSubscribed = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  const handleRetry = (): void => {
    setLoading(true);
    setError(null);
    extractVenueFileDataStream(filePath, onCliMessage)
      .then((result) => {
        setVenueData(result);
        setEditingData(result);
        onDataReady(result);
        setLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setLoading(false);
      });
  };

  const handleVenueNameChange = (event: ChangeEvent<HTMLInputElement>): void => {
    if (!editingData) return;
    const updated = { ...editingData, venueName: event.target.value };
    setEditingData(updated);
    onDataReady(updated);
  };

  const handleStageLocationChange = (event: ChangeEvent<HTMLInputElement>): void => {
    if (!editingData) return;
    const updated = { ...editingData, stageLocation: event.target.value };
    setEditingData(updated);
    onDataReady(updated);
  };

  const handleRowChange = (index: number, field: keyof Row, value: string | number): void => {
    if (!editingData) return;
    const updatedRows = [...editingData.rows];
    const row = updatedRows[index];
    if (!row) return;

    updatedRows[index] = { ...row, [field]: value };
    const updated = { ...editingData, rows: updatedRows };
    setEditingData(updated);
    onDataReady(updated);
  };

  const handleAddRow = (): void => {
    if (!editingData) return;
    const newRow: Row = {
      rowNumber: '',
      seatCount: 0,
      direction: 'facing_stage'
    };
    const updated = { ...editingData, rows: [...editingData.rows, newRow] };
    setEditingData(updated);
    onDataReady(updated);
  };

  const handleRemoveRow = (index: number): void => {
    if (!editingData) return;
    const updatedRows = editingData.rows.filter((_, i) => i !== index);
    const updated = { ...editingData, rows: updatedRows };
    setEditingData(updated);
    onDataReady(updated);
  };

  // Metadata handlers
  const handleAddSection = (): void => {
    if (!editingData) return;
    const newSection: Section = { name: '', level: 1, rowRange: '' };
    const currentSections = editingData.sections || [];
    const updated = { ...editingData, sections: [...currentSections, newSection] };
    setEditingData(updated);
    onDataReady(updated);
  };

  const handleRemoveSection = (index: number): void => {
    if (!editingData || !editingData.sections) return;
    const updatedSections = editingData.sections.filter((_, i) => i !== index);
    const updated = { ...editingData, sections: updatedSections.length > 0 ? updatedSections : undefined };
    setEditingData(updated);
    onDataReady(updated);
  };

  const handleSectionChange = (index: number, field: keyof Section, value: string | number): void => {
    if (!editingData || !editingData.sections) return;
    const updatedSections = [...editingData.sections];
    const section = updatedSections[index];
    if (!section) return;

    updatedSections[index] = { ...section, [field]: value };
    const updated = { ...editingData, sections: updatedSections };
    setEditingData(updated);
    onDataReady(updated);
  };

  const handleAccessibilityChange = (field: keyof AccessibilityFeatures, value: string | number | boolean | string[]): void => {
    if (!editingData) return;
    const currentAccessibility = editingData.accessibility || {};
    const updated = { ...editingData, accessibility: { ...currentAccessibility, [field]: value } };
    setEditingData(updated);
    onDataReady(updated);
  };

  const handleAmenitiesChange = (field: keyof Amenities, value: string | number | boolean | string[]): void => {
    if (!editingData) return;
    const currentAmenities = editingData.amenities || {};
    const updated = { ...editingData, amenities: { ...currentAmenities, [field]: value } };
    setEditingData(updated);
    onDataReady(updated);
  };

  if (loading && !venueData) {
    return <DataReviewSkeleton />;
  }

  if (error) {
    return (
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Step 3: Review & Edit Data</h2>
          <p style={{ color: '#666' }}>Extract structured data from your venue diagram</p>
        </div>

        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '60px',
              height: '60px',
              background: '#fee2e2',
              borderRadius: '50%',
              marginBottom: '1rem'
            }}
          >
            <span style={{ fontSize: '2rem' }}>❌</span>
          </div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#dc2626' }}>
            File Extraction Failed
          </h3>
          <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>{error}</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
            <button
              onClick={onBack}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#f3f4f6',
                color: '#374151',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              ← Back
            </button>
            <button
              onClick={handleRetry}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Step 3: Review & Edit Data</h2>
        <p style={{ color: '#666' }}>Review the extracted data and make any necessary corrections</p>
      </div>

      {/* Editing Form */}
      {editingData && (
        <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#f9fafb', borderRadius: '8px' }}>
          <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>
            📁 Extracted from Image
          </h3>

          {/* Overall Confidence Card */}
          {editingData?.confidence && (
            <div style={{
              padding: '1rem',
              background: editingData.confidence.overall.level === 'high' ? '#dcfce7' :
                        editingData.confidence.overall.level === 'medium' ? '#fef3c7' : '#fee2e2',
              border: `2px solid ${editingData.confidence.overall.level === 'high' ? '#22c55e' :
                                  editingData.confidence.overall.level === 'medium' ? '#d97706' : '#dc2626'}`,
              borderRadius: '8px',
              marginBottom: '1.5rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>AI Extraction Confidence</h4>
                <ConfidenceIndicator confidence={editingData.confidence.overall} size="large" />
              </div>
              {editingData.confidence.overall.level !== 'high' && (
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#4b5563' }}>
                  ⚠️ {editingData.confidence.overall.level === 'medium'
                    ? 'Some data extracted with medium confidence. Please review carefully.'
                    : 'Low confidence extraction. Please verify all fields carefully.'}
                </p>
              )}
            </div>
          )}

          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                Venue Name (Optional):
              </label>
              {editingData?.confidence?.venueName && (
                <ConfidenceBadge confidence={editingData.confidence.venueName} />
              )}
            </div>
            <input
              type="text"
              value={editingData.venueName ?? ''}
              onChange={handleVenueNameChange}
              placeholder="Enter venue name"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '1rem'
              }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                Stage Location:
              </label>
              {editingData?.confidence?.stageLocation && (
                <ConfidenceBadge confidence={editingData.confidence.stageLocation} />
              )}
            </div>
            <input
              type="text"
              value={editingData.stageLocation}
              onChange={handleStageLocationChange}
              placeholder="e.g., north, center"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '1rem'
              }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Rows:</h4>
              <button
                onClick={handleAddRow}
                style={{
                  padding: '0.5rem 1rem',
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: 600
                }}
              >
                + Add Row
              </button>
            </div>

            {editingData.rows.map((row, index) => {
              const rowConfidence: ConfidenceScore | undefined = row.confidence ||
                (editingData.confidence?.rows && editingData.confidence.rows[index]);

              return (
                <div
                  key={index}
                  style={{
                    padding: '1rem',
                    border: rowConfidence?.level === 'low' ? '2px solid #fca5a5' : '1px solid #d1d5db',
                    borderRadius: '8px',
                    marginBottom: '1rem',
                    background: rowConfidence?.level === 'low' ? '#fef2f2' : 'white'
                  }}
                >
                  {rowConfidence && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.5rem' }}>
                      <ConfidenceBadge confidence={rowConfidence} />
                    </div>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr auto', gap: '1rem', alignItems: 'end' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.75rem', fontWeight: 600 }}>
                      Row Number:
                    </label>
                    <input
                      type="text"
                      value={row.rowNumber}
                      onChange={(e): void => handleRowChange(index, 'rowNumber', e.target.value)}
                      placeholder="A"
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.75rem', fontWeight: 600 }}>
                      Seat Count:
                    </label>
                    <input
                      type="number"
                      value={row.seatCount}
                      onChange={(e): void => handleRowChange(index, 'seatCount', Number(e.target.value))}
                      min="0"
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.75rem', fontWeight: 600 }}>
                      Direction:
                    </label>
                    <select
                      value={row.direction}
                      onChange={(e): void => handleRowChange(index, 'direction', e.target.value as Row['direction'])}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px'
                      }}
                    >
                      <option value="facing_stage">Facing Stage</option>
                      <option value="facing_away">Facing Away</option>
                      <option value="side_view">Side View</option>
                    </select>
                  </div>

                  <button
                    onClick={(): void => handleRemoveRow(index)}
                    style={{
                      padding: '0.5rem 1rem',
                      background: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: 600
                    }}
                  >
                    Remove
                  </button>
                </div>

                {rowConfidence?.level === 'low' && (
                  <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: '#fee2e2', borderRadius: '4px' }}>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#dc2626' }}>
                      ⚠️ Low confidence - please verify this row
                    </p>
                  </div>
                )}
              </div>
              );
            })}

            {editingData.rows.length === 0 && (
              <p style={{ textAlign: 'center', color: '#9ca3af', padding: '2rem', background: 'white', borderRadius: '8px', border: '1px dashed #d1d5db' }}>
                No rows added yet. Click "+ Add Row" to begin.
              </p>
            )}
          </div>

          {/* Total Capacity Display */}
          <div style={{
            padding: '1rem',
            background: '#eff6ff',
            border: '2px solid #3b82f6',
            borderRadius: '8px',
            marginBottom: '1.5rem'
          }}>
            <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: '#1e40af' }}>
              📊 Total Capacity: {editingData.totalCapacity || editingData.rows.reduce((sum, row) => sum + (row.seatCount || 0), 0)} seats
            </h4>
          </div>

          {/* Sections/Tiers - Collapsible */}
          <details style={{
            padding: '1rem',
            background: 'white',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            marginBottom: '1.5rem'
          }}>
            <summary style={{ fontWeight: 600, cursor: 'pointer', fontSize: '1rem' }}>
              📍 Sections & Tiers (Optional)
            </summary>
            <div style={{ marginTop: '1rem' }}>
              <button
                onClick={handleAddSection}
                style={{
                  padding: '0.5rem 1rem',
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  marginBottom: '1rem'
                }}
              >
                + Add Section
              </button>

              {editingData.sections && editingData.sections.map((section, index) => (
                <div
                  key={index}
                  style={{
                    padding: '1rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    marginBottom: '1rem',
                    background: '#f9fafb'
                  }}
                >
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 2fr auto', gap: '1rem', alignItems: 'end' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.75rem', fontWeight: 600 }}>
                        Section Name:
                      </label>
                      <input
                        type="text"
                        value={section.name}
                        onChange={(e): void => handleSectionChange(index, 'name', e.target.value)}
                        placeholder="Orchestra"
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '4px'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.75rem', fontWeight: 600 }}>
                        Level:
                      </label>
                      <input
                        type="number"
                        value={section.level || ''}
                        onChange={(e): void => handleSectionChange(index, 'level', Number(e.target.value))}
                        placeholder="1"
                        min="1"
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '4px'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.75rem', fontWeight: 600 }}>
                        Row Range:
                      </label>
                      <input
                        type="text"
                        value={section.rowRange || ''}
                        onChange={(e): void => handleSectionChange(index, 'rowRange', e.target.value)}
                        placeholder="A-M"
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '4px'
                        }}
                      />
                    </div>

                    <button
                      onClick={(): void => handleRemoveSection(index)}
                      style={{
                        padding: '0.5rem 1rem',
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: 600
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </details>

          {/* Accessibility - Collapsible */}
          <details style={{
            padding: '1rem',
            background: 'white',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            marginBottom: '1.5rem'
          }}>
            <summary style={{ fontWeight: 600, cursor: 'pointer', fontSize: '1rem' }}>
              ♿ Accessibility (Optional)
            </summary>
            <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.75rem', fontWeight: 600 }}>
                  Wheelchair Spaces:
                </label>
                <input
                  type="number"
                  value={editingData.accessibility?.wheelchairSpaces || ''}
                  onChange={(e): void => handleAccessibilityChange('wheelchairSpaces', Number(e.target.value))}
                  placeholder="0"
                  min="0"
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.75rem', fontWeight: 600 }}>
                  Companion Seats:
                </label>
                <input
                  type="number"
                  value={editingData.accessibility?.companionSeats || ''}
                  onChange={(e): void => handleAccessibilityChange('companionSeats', Number(e.target.value))}
                  placeholder="0"
                  min="0"
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px'
                  }}
                />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.75rem', fontWeight: 600 }}>
                  Accessible Entrances (comma-separated):
                </label>
                <input
                  type="text"
                  value={editingData.accessibility?.accessibleEntrances?.join(', ') || ''}
                  onChange={(e): void => handleAccessibilityChange('accessibleEntrances', e.target.value.split(',').map(s => s.trim()).filter(s => s.length > 0))}
                  placeholder="Main entrance, Side entrance"
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'flex', alignItems: 'center', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={editingData.accessibility?.elevators || false}
                    onChange={(e): void => handleAccessibilityChange('elevators', e.target.checked)}
                    style={{ marginRight: '0.5rem' }}
                  />
                  Elevators Available
                </label>
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.75rem', fontWeight: 600 }}>
                  Accessibility Notes:
                </label>
                <textarea
                  value={editingData.accessibility?.notes || ''}
                  onChange={(e): void => handleAccessibilityChange('notes', e.target.value)}
                  placeholder="Additional accessibility information..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontFamily: 'inherit',
                    fontSize: '0.875rem'
                  }}
                />
              </div>
            </div>
          </details>

          {/* Amenities - Collapsible */}
          <details style={{
            padding: '1rem',
            background: 'white',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            marginBottom: '1.5rem'
          }}>
            <summary style={{ fontWeight: 600, cursor: 'pointer', fontSize: '1rem' }}>
              🏢 Amenities (Optional)
            </summary>
            <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.75rem', fontWeight: 600 }}>
                  Restrooms:
                </label>
                <input
                  type="number"
                  value={editingData.amenities?.restrooms || ''}
                  onChange={(e): void => handleAmenitiesChange('restrooms', Number(e.target.value))}
                  placeholder="0"
                  min="0"
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'flex', alignItems: 'center', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={editingData.amenities?.coatCheck || false}
                    onChange={(e): void => handleAmenitiesChange('coatCheck', e.target.checked)}
                    style={{ marginRight: '0.5rem' }}
                  />
                  Coat Check
                </label>
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.75rem', fontWeight: 600 }}>
                  Concessions (comma-separated):
                </label>
                <input
                  type="text"
                  value={editingData.amenities?.concessions?.join(', ') || ''}
                  onChange={(e): void => handleAmenitiesChange('concessions', e.target.value.split(',').map(s => s.trim()).filter(s => s.length > 0))}
                  placeholder="Food, Beverages, Merchandise"
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px'
                  }}
                />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.75rem', fontWeight: 600 }}>
                  Parking:
                </label>
                <input
                  type="text"
                  value={editingData.amenities?.parking || ''}
                  onChange={(e): void => handleAmenitiesChange('parking', e.target.value)}
                  placeholder="On-site parking available"
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px'
                  }}
                />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.75rem', fontWeight: 600 }}>
                  Amenities Notes:
                </label>
                <textarea
                  value={editingData.amenities?.notes || ''}
                  onChange={(e): void => handleAmenitiesChange('notes', e.target.value)}
                  placeholder="Additional amenities information..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontFamily: 'inherit',
                    fontSize: '0.875rem'
                  }}
                />
              </div>
            </div>
          </details>
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
        <button
          onClick={onBack}
          style={{
            padding: '0.75rem 2rem',
            background: '#f3f4f6',
            color: '#374151',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'background 0.2s'
          }}
          onMouseEnter={(e): void => {
            e.currentTarget.style.background = '#e5e7eb';
          }}
          onMouseLeave={(e): void => {
            e.currentTarget.style.background = '#f3f4f6';
          }}
        >
          ← Back
        </button>
        <button
          onClick={onNext}
          disabled={!editingData || editingData.rows.length === 0}
          style={{
            padding: '0.75rem 2rem',
            background: editingData && editingData.rows.length > 0 ? '#3b82f6' : '#9ca3af',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: editingData && editingData.rows.length > 0 ? 'pointer' : 'not-allowed',
            transition: 'background 0.2s'
          }}
          onMouseEnter={(e): void => {
            if (editingData && editingData.rows.length > 0) {
              e.currentTarget.style.background = '#2563eb';
            }
          }}
          onMouseLeave={(e): void => {
            if (editingData && editingData.rows.length > 0) {
              e.currentTarget.style.background = '#3b82f6';
            }
          }}
        >
          Generate Manifest →
        </button>
      </div>
    </div>
  );
}

