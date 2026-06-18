import React from 'react';
import type { ConfidenceScore } from '../types/venue';

interface ConfidenceIndicatorProps {
  confidence: ConfidenceScore;
  showPercentage?: boolean;
  size?: 'small' | 'medium' | 'large';
}

/**
 * Get color scheme based on confidence level
 */
function getColorScheme(level: 'high' | 'medium' | 'low'): { color: string; background: string; icon: string } {
  switch (level) {
    case 'high':
      return {
        color: '#22c55e',
        background: '#dcfce7',
        icon: '✓'
      };
    case 'medium':
      return {
        color: '#d97706',
        background: '#fef3c7',
        icon: '!'
      };
    case 'low':
      return {
        color: '#dc2626',
        background: '#fee2e2',
        icon: '✗'
      };
  }
}

/**
 * Full confidence display with icon, percentage, progress bar, level label
 */
export function ConfidenceIndicator({
  confidence,
  showPercentage = true,
  size = 'medium'
}: ConfidenceIndicatorProps): JSX.Element {
  const colors = getColorScheme(confidence.level);

  const sizeStyles = {
    small: { fontSize: '0.75rem', iconSize: '14px', height: '4px' },
    medium: { fontSize: '0.875rem', iconSize: '16px', height: '6px' },
    large: { fontSize: '1rem', iconSize: '20px', height: '8px' }
  };

  const style = sizeStyles[size];

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    }}>
      <div style={{
        width: style.iconSize,
        height: style.iconSize,
        borderRadius: '50%',
        background: colors.color,
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: style.fontSize,
        fontWeight: 'bold'
      }}>
        {colors.icon}
      </div>

      {showPercentage && (
        <span style={{
          fontSize: style.fontSize,
          fontWeight: 600,
          color: colors.color
        }}>
          {confidence.value}%
        </span>
      )}

      <div style={{
        flex: 1,
        height: style.height,
        background: '#e5e7eb',
        borderRadius: '4px',
        overflow: 'hidden',
        minWidth: '60px'
      }}>
        <div style={{
          width: `${confidence.value}%`,
          height: '100%',
          background: colors.color,
          transition: 'width 0.3s ease'
        }} />
      </div>

      <span style={{
        fontSize: style.fontSize,
        fontWeight: 600,
        color: colors.color,
        textTransform: 'capitalize'
      }}>
        {confidence.level}
      </span>
    </div>
  );
}

/**
 * Compact badge for field labels (icon + level text in colored pill)
 */
export function ConfidenceBadge({ confidence }: { confidence: ConfidenceScore }): JSX.Element {
  const colors = getColorScheme(confidence.level);

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.25rem',
      padding: '0.25rem 0.5rem',
      background: colors.background,
      border: `1px solid ${colors.color}`,
      borderRadius: '12px',
      fontSize: '0.75rem',
      fontWeight: 600,
      color: colors.color
    }}>
      <span>{colors.icon}</span>
      <span style={{ textTransform: 'capitalize' }}>{confidence.level} ({confidence.value}%)</span>
    </span>
  );
}
