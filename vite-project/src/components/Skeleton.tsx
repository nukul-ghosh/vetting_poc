import React from 'react';

interface SkeletonProps {
  width?: string;
  height?: string;
  rounded?: boolean;
}

/**
 * Base skeleton component with shimmer animation
 */
export function Skeleton({
  width = '100%',
  height = '1rem',
  rounded = false
}: SkeletonProps): JSX.Element {
  const shimmerKeyframes = `
    @keyframes shimmer {
      0% {
        background-position: -1000px 0;
      }
      100% {
        background-position: 1000px 0;
      }
    }
  `;

  return (
    <>
      <style>{shimmerKeyframes}</style>
      <div
        style={{
          width,
          height,
          background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
          backgroundSize: '1000px 100%',
          animation: 'shimmer 2s infinite linear',
          borderRadius: rounded ? '50%' : '4px',
        }}
      />
    </>
  );
}

/**
 * Skeleton for validation checkpoint cards (4 cards with icon + text)
 */
export function CheckpointSkeleton(): JSX.Element {
  const checkpoints = [1, 2, 3, 4];

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <Skeleton width="200px" height="2rem" />
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {checkpoints.map((i) => (
          <div
            key={i}
            style={{
              padding: '1.5rem',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              background: 'white',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <Skeleton width="48px" height="48px" rounded />
              <Skeleton width="120px" height="1.5rem" />
            </div>
            <Skeleton width="100%" height="1rem" />
            <div style={{ marginTop: '0.5rem' }}>
              <Skeleton width="80%" height="1rem" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Skeleton for data review form (fields + row grid)
 */
export function DataReviewSkeleton(): JSX.Element {
  const rows = [1, 2, 3];

  return (
    <div style={{ padding: '2rem' }}>
      {/* Title */}
      <div style={{ marginBottom: '2rem' }}>
        <Skeleton width="300px" height="2rem" />
      </div>

      {/* Venue Name Field */}
      <div style={{ marginBottom: '1.5rem' }}>
        <Skeleton width="150px" height="1rem" />
        <div style={{ marginTop: '0.5rem' }}>
          <Skeleton width="100%" height="2.5rem" />
        </div>
      </div>

      {/* Stage Location Field */}
      <div style={{ marginBottom: '2rem' }}>
        <Skeleton width="150px" height="1rem" />
        <div style={{ marginTop: '0.5rem' }}>
          <Skeleton width="100%" height="2.5rem" />
        </div>
      </div>

      {/* Rows Section */}
      <div style={{ marginBottom: '1rem' }}>
        <Skeleton width="200px" height="1.5rem" />
      </div>

      {/* Row Cards */}
      {rows.map((i) => (
        <div
          key={i}
          style={{
            padding: '1rem',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            background: 'white',
            marginBottom: '1rem',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '1rem',
            }}
          >
            <div>
              <Skeleton width="100px" height="0.875rem" />
              <div style={{ marginTop: '0.5rem' }}>
                <Skeleton width="100%" height="2rem" />
              </div>
            </div>
            <div>
              <Skeleton width="100px" height="0.875rem" />
              <div style={{ marginTop: '0.5rem' }}>
                <Skeleton width="100%" height="2rem" />
              </div>
            </div>
            <div>
              <Skeleton width="100px" height="0.875rem" />
              <div style={{ marginTop: '0.5rem' }}>
                <Skeleton width="100%" height="2rem" />
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
        <Skeleton width="120px" height="2.5rem" />
        <Skeleton width="120px" height="2.5rem" />
      </div>
    </div>
  );
}
