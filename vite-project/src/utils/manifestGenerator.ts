import type { VenueData, Manifest } from '../types/venue';

/**
 * Generates a standardized manifest JSON from venue data
 * @param venueData - The venue data to convert
 * @returns Manifest object ready for export
 */
export function generateManifest(venueData: VenueData): Manifest {
  return {
    version: '1.0',
    generatedAt: new Date().toISOString(),
    venue: venueData
  };
}

/**
 * Downloads manifest as JSON file
 * @param manifest - The manifest to download
 * @param filename - Optional filename (defaults to venue-manifest-{timestamp}.json)
 */
export function downloadManifest(manifest: Manifest, filename?: string): void {
  const defaultFilename = `venue-manifest-${Date.now()}.json`;
  const finalFilename = filename ?? defaultFilename;

  const json = JSON.stringify(manifest, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = finalFilename;
  document.body.appendChild(link);
  link.click();

  // Cleanup
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
