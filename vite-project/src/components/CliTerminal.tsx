import { useEffect, useRef } from 'react';

export interface CliTerminalProps {
  messages: string[];
  isCollapsed: boolean;
  onToggle: () => void;
}

const TERMINAL_HEIGHT = '350px'; // Increased height to show full prompts and responses

/**
 * CLI Terminal Component
 * Displays real-time streaming output from Claude Code processing
 * Shows both the prompt sent to Claude and all responses received
 * Dark terminal theme with collapsible functionality
 */
export function CliTerminal({ messages, isCollapsed, onToggle }: CliTerminalProps): JSX.Element {
  const terminalContentRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (terminalContentRef.current && !isCollapsed) {
      terminalContentRef.current.scrollTop = terminalContentRef.current.scrollHeight;
    }
  }, [messages, isCollapsed]);

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: '#1a1a1a',
        borderTop: '2px solid #333',
        boxShadow: '0 -4px 12px rgba(0,0,0,0.5)',
        zIndex: 1000,
        fontFamily: "'Courier New', Courier, monospace",
        transition: 'height 0.3s ease'
      }}
    >
      {/* Header Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.5rem 1rem',
          background: '#0d0d0d',
          borderBottom: '1px solid #333',
          cursor: 'pointer'
        }}
        onClick={onToggle}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '8px',
              height: '8px',
              background: '#22c55e',
              borderRadius: '50%',
              boxShadow: '0 0 8px #22c55e',
              animation: messages.length > 0 && !isCollapsed ? 'pulse 2s ease-in-out infinite' : 'none'
            }}
          />
          <span style={{ color: '#22c55e', fontSize: '0.875rem', fontWeight: 600 }}>
            CLAUDE CODE CLI
          </span>
          {messages.length > 0 && (
            <>
              <span style={{ color: '#666', fontSize: '0.75rem' }}>
                ({messages.length} messages)
              </span>
              {/* Extract and show working directory from messages */}
              {(() => {
                const workingDirMessage = messages.find(msg => msg.includes('📂 Working Directory:'));
                if (workingDirMessage) {
                  const workingDir = workingDirMessage.replace('📂 Working Directory:', '').trim();
                  return (
                    <span style={{ color: '#3b82f6', fontSize: '0.75rem', marginLeft: '0.5rem' }}>
                      • {workingDir}
                    </span>
                  );
                }
                return null;
              })()}
            </>
          )}
        </div>
        <button
          onClick={(e): void => {
            e.stopPropagation();
            onToggle();
          }}
          style={{
            background: 'transparent',
            border: '1px solid #444',
            color: '#888',
            padding: '0.25rem 0.75rem',
            borderRadius: '4px',
            fontSize: '0.75rem',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e): void => {
            e.currentTarget.style.borderColor = '#666';
            e.currentTarget.style.color = '#aaa';
          }}
          onMouseLeave={(e): void => {
            e.currentTarget.style.borderColor = '#444';
            e.currentTarget.style.color = '#888';
          }}
        >
          {isCollapsed ? '▲ Show' : '▼ Hide'}
        </button>
      </div>

      {/* Terminal Content */}
      {!isCollapsed && (
        <div
          ref={terminalContentRef}
          style={{
            height: TERMINAL_HEIGHT,
            overflowY: 'auto',
            padding: '1rem',
            background: '#0d0d0d',
            color: '#22c55e',
            fontSize: '0.875rem',
            lineHeight: '1.6',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word'
          }}
        >
          {messages.length === 0 ? (
            <div style={{ color: '#666', fontStyle: 'italic' }}>
              Waiting for Claude Code to process...
            </div>
          ) : (
            messages.map((message, index) => {
              // Determine message styling based on content
              let color = '#22c55e'; // Default green
              let prefix = '>> ';

              // Section headers
              if (message.includes('━━━━━')) {
                color = '#3b82f6'; // Blue for major separators
                prefix = '';
              } else if (message.includes('─────')) {
                color = '#6b7280'; // Gray for minor separators
                prefix = '';
              }
              // Prompts and responses
              else if (message.includes('📤 PROMPT') || message.includes('📥 CLAUDE RESPONSE')) {
                color = '#fbbf24'; // Yellow for headers
                prefix = '';
              }
              // Status messages
              else if (message.includes('🚀') || message.includes('⏳')) {
                color = '#60a5fa'; // Light blue for status
                prefix = '';
              }
              // Success
              else if (message.includes('✅')) {
                color = '#10b981'; // Bright green for success
                prefix = '';
              }
              // Errors
              else if (message.includes('❌') || message.includes('[stderr]')) {
                color = '#ef4444'; // Red for errors
                prefix = '';
              }
              // JSON content
              else if (message.trim().startsWith('{') || message.trim().startsWith('}') ||
                       message.includes('"') || message.includes(':')) {
                color = '#a78bfa'; // Purple for JSON
              }

              return (
                <div key={index} style={{ marginBottom: '0.25rem' }}>
                  {prefix && <span style={{ color: '#666' }}>{prefix}</span>}
                  <span style={{ color }}>{message}</span>
                </div>
              );
            })
          )}
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
