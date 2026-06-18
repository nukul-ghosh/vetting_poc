import { useState } from 'react';
import { Stepper } from './components/Stepper';
import { ImageUpload } from './components/ImageUpload';
import { ImageValidation } from './components/ImageValidation';
import { DataReview } from './components/DataReview';
import { ManifestExport } from './components/ManifestExport';
import { CliTerminal } from './components/CliTerminal';
import { generateManifest } from './utils/manifestGenerator';
import type { WorkflowStep, ValidationResult, VenueData, Manifest } from './types/venue';
import './App.css';

function App(): JSX.Element {
  const [currentStep, setCurrentStep] = useState<WorkflowStep>(1);
  const [filePath, setFilePath] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [venueData, setVenueData] = useState<VenueData | null>(null);
  const [manifest, setManifest] = useState<Manifest | null>(null);

  // CLI Terminal state
  const [cliMessages, setCliMessages] = useState<string[]>([]);
  const [isCliCollapsed, setIsCliCollapsed] = useState<boolean>(false);

  const handleFileUpload = (uploadedFilePath: string, file: File): void => {
    setFilePath(uploadedFilePath);
    setImageFile(file);
  };

  const handleValidationComplete = (result: ValidationResult): void => {
    setValidationResult(result);
  };

  const handleDataReady = (data: VenueData): void => {
    setVenueData(data);
  };

  const handleGenerateManifest = (): void => {
    if (venueData) {
      const generatedManifest = generateManifest(venueData);
      setManifest(generatedManifest);
      setCurrentStep(4);
    }
  };

  const handleStartOver = (): void => {
    setCurrentStep(1);
    setFilePath('');
    setImageFile(null);
    setValidationResult(null);
    setVenueData(null);
    setManifest(null);
    setCliMessages([]);
  };

  const handleCliMessage = (message: string): void => {
    setCliMessages((prev) => [...prev, message]);
  };

  const handleClearCliMessages = (): void => {
    setCliMessages([]);
  };

  const toggleCliCollapsed = (): void => {
    setIsCliCollapsed((prev) => !prev);
  };

  // Show CLI terminal on steps 2 and 3 (validation and extraction)
  const showCliTerminal = currentStep === 2 || currentStep === 3;

  return (
    <div style={{ padding: '2rem', minHeight: '100vh', background: '#fafafa' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Venue Vetting POC</h1>
          <p style={{ fontSize: '1.125rem', color: '#666' }}>
            Upload your venue diagram, validate quality, and extract seating data with AI
          </p>
        </header>

        <Stepper currentStep={currentStep} />

        <main style={{ background: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          {currentStep === 1 && (
            <ImageUpload
              onUpload={handleFileUpload}
              onNext={() => {
                setCurrentStep(2);
                handleClearCliMessages();
              }}
            />
          )}

          {currentStep === 2 && filePath && (
            <ImageValidation
              filePath={filePath}
              onValidationComplete={handleValidationComplete}
              onBack={() => {
                setCurrentStep(1);
                handleClearCliMessages();
              }}
              onNext={() => {
                setCurrentStep(3);
                handleClearCliMessages();
              }}
              onCliMessage={handleCliMessage}
            />
          )}

          {currentStep === 3 && (
            <DataReview
              filePath={filePath}
              onDataReady={handleDataReady}
              onBack={() => setCurrentStep(2)}
              onNext={handleGenerateManifest}
              onCliMessage={handleCliMessage}
            />
          )}

          {currentStep === 4 && manifest && (
            <ManifestExport
              manifest={manifest}
              onStartOver={handleStartOver}
            />
          )}
        </main>

        <footer style={{ textAlign: 'center', marginTop: '3rem', color: '#999', fontSize: '0.875rem', marginBottom: showCliTerminal ? '400px' : '0' }}>
          <p>Powered by Claude AI Processing • {new Date().getFullYear()}</p>
        </footer>
      </div>

      {/* CLI Terminal - Only shown during validation and extraction steps */}
      {showCliTerminal && (
        <CliTerminal
          messages={cliMessages}
          isCollapsed={isCliCollapsed}
          onToggle={toggleCliCollapsed}
        />
      )}
    </div>
  );
}

export default App;
