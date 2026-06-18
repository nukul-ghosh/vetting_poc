import { useState, useRef, type ChangeEvent, type DragEvent } from 'react';
import { uploadVenueImage } from '../services/apiClient';

interface ImageUploadProps {
  onUpload: (filePath: string, file: File) => void;
  onNext: () => void;
}

export function ImageUpload({ onUpload, onNext }: ImageUploadProps): JSX.Element {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [serverFilePath, setServerFilePath] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File): Promise<void> => {
    // Client-side validation
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/bmp', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please select an image file (PNG, JPG, JPEG, GIF, BMP, or WEBP)');
      return;
    }

    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('File size must be less than 10MB');
      return;
    }

    // Reset error state
    setUploadError(null);
    setSelectedFile(file);

    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    // Upload file immediately
    try {
      setUploading(true);
      const filePath = await uploadVenueImage(file);
      setServerFilePath(filePath);
      onUpload(filePath, file);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload file';
      setUploadError(errorMessage);
      setServerFilePath(null);
    } finally {
      setUploading(false);
    }
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>): void => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (): void => {
    setIsDragging(false);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>): void => {
    event.preventDefault();
    setIsDragging(false);

    const file = event.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleBrowseClick = (): void => {
    fileInputRef.current?.click();
  };

  const handleNext = (): void => {
    if (selectedFile) {
      onNext();
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h2>Upload Venue Diagram</h2>
      <p style={{ color: '#666', marginBottom: '2rem' }}>
        Upload a clear image of your venue/theater/stadium seating diagram (PNG or JPEG format)
      </p>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          border: `2px dashed ${isDragging ? '#4CAF50' : '#ccc'}`,
          borderRadius: '8px',
          padding: '3rem',
          textAlign: 'center',
          background: isDragging ? '#f0f8f0' : '#fafafa',
          cursor: 'pointer',
          marginBottom: '2rem'
        }}
        onClick={handleBrowseClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg"
          onChange={handleInputChange}
          style={{ display: 'none' }}
        />
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📁</div>
        <p style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>
          {isDragging ? 'Drop image here' : 'Drag and drop image here'}
        </p>
        <p style={{ color: '#999' }}>or click to browse</p>
      </div>

      {previewUrl && (
        <div style={{ marginBottom: '2rem' }}>
          <h3>Preview:</h3>
          <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '1rem', background: 'white' }}>
            <img
              src={previewUrl}
              alt="Venue diagram preview"
              style={{ maxWidth: '100%', height: 'auto', display: 'block', margin: '0 auto' }}
            />
          </div>
          <p style={{ marginTop: '1rem', color: '#666' }}>
            <strong>File:</strong> {selectedFile?.name} ({Math.round((selectedFile?.size ?? 0) / 1024)} KB)
          </p>
        </div>
      )}

      {uploading && (
        <div style={{
          padding: '1rem',
          background: '#e3f2fd',
          border: '1px solid #2196F3',
          borderRadius: '4px',
          marginBottom: '1rem',
          textAlign: 'center'
        }}>
          <p style={{ margin: 0, color: '#1976D2' }}>
            📤 Uploading file to server...
          </p>
        </div>
      )}

      {uploadError && (
        <div style={{
          padding: '1rem',
          background: '#ffebee',
          border: '1px solid #f44336',
          borderRadius: '4px',
          marginBottom: '1rem'
        }}>
          <p style={{ margin: '0 0 0.5rem 0', color: '#d32f2f', fontWeight: 'bold' }}>
            ❌ Upload Failed
          </p>
          <p style={{ margin: '0 0 1rem 0', color: '#d32f2f' }}>
            {uploadError}
          </p>
          <button
            onClick={() => {
              if (selectedFile) {
                handleFileSelect(selectedFile);
              }
            }}
            style={{
              padding: '0.5rem 1rem',
              background: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.875rem'
            }}
          >
            Try Again
          </button>
        </div>
      )}

      {serverFilePath && !uploadError && !uploading && (
        <div style={{
          padding: '1rem',
          background: '#e8f5e9',
          border: '1px solid #4CAF50',
          borderRadius: '4px',
          marginBottom: '1rem'
        }}>
          <p style={{ margin: 0, color: '#2E7D32' }}>
            ✅ File uploaded successfully! Ready for validation.
          </p>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
        <button
          onClick={handleNext}
          disabled={!selectedFile || uploading || !!uploadError || !serverFilePath}
          style={{
            padding: '0.75rem 2rem',
            background: (selectedFile && !uploading && !uploadError && serverFilePath) ? '#4CAF50' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '1rem',
            cursor: (selectedFile && !uploading && !uploadError && serverFilePath) ? 'pointer' : 'not-allowed',
            fontWeight: 'bold'
          }}
        >
          {uploading ? 'Uploading...' : 'Next: Validate Image'}
        </button>
      </div>
    </div>
  );
}
