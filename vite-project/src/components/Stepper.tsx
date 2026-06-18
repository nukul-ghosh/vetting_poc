import type { WorkflowStep } from '../types/venue';

interface StepperProps {
  currentStep: WorkflowStep;
}

const STEPS = [
  { number: 1 as const, label: 'Upload Image' },
  { number: 2 as const, label: 'Validation' },
  { number: 3 as const, label: 'Data Review' },
  { number: 4 as const, label: 'Export Manifest' }
];

export function Stepper({ currentStep }: StepperProps): JSX.Element {
  return (
    <div style={{ marginBottom: '2rem', padding: '1rem', background: '#f5f5f5', borderRadius: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {STEPS.map((step, index) => (
          <div key={step.number} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <div style={{ textAlign: 'center', flex: 1 }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: currentStep >= step.number ? '#4CAF50' : '#ddd',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto',
                  fontWeight: 'bold'
                }}
              >
                {step.number}
              </div>
              <div
                style={{
                  marginTop: '0.5rem',
                  fontSize: '0.875rem',
                  color: currentStep >= step.number ? '#333' : '#999'
                }}
              >
                {step.label}
              </div>
            </div>
            {index < STEPS.length - 1 && (
              <div
                style={{
                  flex: 1,
                  height: '2px',
                  background: currentStep > step.number ? '#4CAF50' : '#ddd',
                  margin: '0 1rem'
                }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
