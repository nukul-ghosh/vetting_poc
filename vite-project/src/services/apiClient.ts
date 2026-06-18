import type { ValidationResult, VenueData } from '../types/venue';

const API_BASE_URL = 'http://localhost:3001/api';

export interface StreamEvent {
  type: 'connected' | 'message' | 'result' | 'done' | 'error';
  content?: string;
}

/**
 * Validates a venue file
 * @param filePath - The file path to validate
 * @returns Promise resolving to validation results
 * @throws Error if validation request fails
 */
export async function validateVenueFile(filePath: string): Promise<ValidationResult> {
  const response = await fetch(`${API_BASE_URL}/validate-file`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ filePath })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const errorMessage = errorData?.error ?? `HTTP ${response.status}: ${response.statusText}`;
    throw new Error(`Failed to validate venue file: ${errorMessage}`);
  }

  return response.json() as Promise<ValidationResult>;
}

/**
 * Validates venue file with streaming progress updates
 * @param filePath - The file path to validate
 * @param onMessage - Callback for streaming messages
 * @returns Promise resolving to validation results
 * @throws Error if validation fails
 */
export async function validateVenueFileStream(
  filePath: string,
  onMessage: (message: string) => void
): Promise<ValidationResult> {
  return new Promise((resolve, reject) => {
    const encodedPath = encodeURIComponent(filePath);
    const eventSource = new EventSource(`${API_BASE_URL}/validate-file-stream?filePath=${encodedPath}`);

    eventSource.onmessage = (event): void => {
      try {
        const data = JSON.parse(event.data) as StreamEvent;

        if (data.type === 'message' && data.content) {
          onMessage(data.content);
        } else if (data.type === 'result' && data.content) {
          const result = JSON.parse(data.content) as ValidationResult;
          resolve(result);
        } else if (data.type === 'error' && data.content) {
          eventSource.close();
          reject(new Error(data.content));
        } else if (data.type === 'done') {
          eventSource.close();
        }
      } catch (error) {
        eventSource.close();
        if (error instanceof Error) {
          reject(error);
        } else {
          reject(new Error('Unknown error parsing stream data'));
        }
      }
    };

    eventSource.onerror = (): void => {
      eventSource.close();
      reject(new Error('Stream connection error'));
    };
  });
}

/**
 * Extracts structured venue data from file
 * @param filePath - The file path to extract data from
 * @returns Promise resolving to extracted venue data
 * @throws Error if extraction request fails
 */
export async function extractVenueFileData(filePath: string): Promise<VenueData> {
  const response = await fetch(`${API_BASE_URL}/extract-file`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ filePath })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const errorMessage = errorData?.error ?? `HTTP ${response.status}: ${response.statusText}`;
    throw new Error(`Failed to extract venue data from file: ${errorMessage}`);
  }

  return response.json() as Promise<VenueData>;
}

/**
 * Extracts venue data from file with streaming progress updates
 * @param filePath - The file path to extract data from
 * @param onMessage - Callback for streaming messages
 * @returns Promise resolving to extracted venue data
 * @throws Error if extraction fails
 */
export async function extractVenueFileDataStream(
  filePath: string,
  onMessage: (message: string) => void
): Promise<VenueData> {
  return new Promise((resolve, reject) => {
    const encodedPath = encodeURIComponent(filePath);
    const eventSource = new EventSource(`${API_BASE_URL}/extract-file-stream?filePath=${encodedPath}`);

    eventSource.onmessage = (event): void => {
      try {
        const data = JSON.parse(event.data) as StreamEvent;

        if (data.type === 'message' && data.content) {
          onMessage(data.content);
        } else if (data.type === 'result' && data.content) {
          const result = JSON.parse(data.content) as VenueData;
          resolve(result);
        } else if (data.type === 'error' && data.content) {
          eventSource.close();
          reject(new Error(data.content));
        } else if (data.type === 'done') {
          eventSource.close();
        }
      } catch (error) {
        eventSource.close();
        if (error instanceof Error) {
          reject(error);
        } else {
          reject(new Error('Unknown error parsing stream data'));
        }
      }
    };

    eventSource.onerror = (): void => {
      eventSource.close();
      reject(new Error('Stream connection error'));
    };
  });
}

/**
 * Uploads a venue image file to the server
 * @param file - The image file to upload
 * @returns Promise resolving to the server file path
 * @throws Error if upload fails
 */
export async function uploadVenueImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const errorMessage = errorData?.error ?? `HTTP ${response.status}: ${response.statusText}`;
    throw new Error(`Failed to upload image: ${errorMessage}`);
  }

  const result = await response.json() as { filePath: string };
  return result.filePath;
}
