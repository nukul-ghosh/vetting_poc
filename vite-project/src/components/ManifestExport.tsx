import type { Manifest } from '../types/venue';
import { downloadManifest } from '../utils/manifestGenerator';

interface ManifestExportProps {
  manifest: Manifest;
  onStartOver: () => void;
}

export function ManifestExport({ manifest, onStartOver }: ManifestExportProps): JSX.Element {
  const handleDownload = (): void => {
    const filename = manifest.venue.venueName
      ? `${manifest.venue.venueName.toLowerCase().replace(/\s+/g, '-')}-manifest.json`
      : undefined;
    downloadManifest(manifest, filename);
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <h2>Export Manifest</h2>
      <p style={{ color: '#666', marginBottom: '2rem' }}>
        Your venue manifest is ready for download
      </p>

      <div
        style={{
          padding: '1.5rem',
          background: '#e8f5e9',
          border: '1px solid #c8e6c9',
          borderRadius: '8px',
          marginBottom: '2rem'
        }}
      >
        <h3 style={{ marginTop: 0 }}>✓ Manifest Generated Successfully</h3>
        <p style={{ margin: 0 }}>
          Generated {manifest.venue.rows.length} row(s) for{' '}
          {manifest.venue.venueName ?? 'venue'} (Stage: {manifest.venue.stageLocation})
        </p>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h3>Manifest Preview:</h3>
        <div
          style={{
            background: '#1e1e1e',
            color: '#d4d4d4',
            padding: '1.5rem',
            borderRadius: '8px',
            overflow: 'auto',
            fontFamily: 'monospace',
            fontSize: '0.875rem',
            maxHeight: '500px'
          }}
        >
          <pre style={{ margin: 0 }}>{JSON.stringify(manifest, null, 2)}</pre>
        </div>
      </div>

      <div
        style={{
          padding: '1rem',
          background: '#f5f5f5',
          borderRadius: '8px',
          marginBottom: '2rem'
        }}
      >
        <h4 style={{ marginTop: 0 }}>Manifest Details:</h4>
        <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
          <li>Version: {manifest.version}</li>
          <li>Generated: {new Date(manifest.generatedAt).toLocaleString()}</li>
          <li>Total Rows: {manifest.venue.rows.length}</li>
          <li>
            Total Capacity: {manifest.venue.totalCapacity ?? manifest.venue.rows.reduce((sum, row) => sum + row.seatCount, 0)} seats
          </li>
          {manifest.venue.sections && manifest.venue.sections.length > 0 && (
            <li>Sections: {manifest.venue.sections.map(s => s.name).join(', ')}</li>
          )}
          {manifest.venue.accessibility && (
            <li>
              Accessibility: {manifest.venue.accessibility.wheelchairSpaces || 0} wheelchair spaces
              {manifest.venue.accessibility.companionSeats ? `, ${manifest.venue.accessibility.companionSeats} companion seats` : ''}
            </li>
          )}
          {manifest.venue.amenities && (
            <li>
              Amenities: {manifest.venue.amenities.restrooms || 0} restrooms
              {manifest.venue.amenities.concessions && manifest.venue.amenities.concessions.length > 0 ? `, ${manifest.venue.amenities.concessions.join(', ')}` : ''}
            </li>
          )}
        </ul>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
        <button
          onClick={onStartOver}
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
          Start Over
        </button>
        <button
          onClick={handleDownload}
          style={{
            padding: '0.75rem 2rem',
            background: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '1rem',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          📥 Download Manifest
        </button>
      </div>
    </div>
  );
}
