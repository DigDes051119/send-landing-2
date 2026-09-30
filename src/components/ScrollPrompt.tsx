import React from 'react';

interface ScrollPromptProps {
  visible: boolean;
}

export const ScrollPrompt: React.FC<ScrollPromptProps> = ({ visible }) => {
  return (
    <div
      className={`scroll-prompt-pill ${visible ? 'is-visible' : ''}`}
      aria-hidden="true"
    >
      <span className="scroll-prompt-icon-wrap" aria-hidden="true">
        <svg
          className="scroll-prompt-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#3063F7"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="12" y1="4" x2="12" y2="20" />
          <polyline points="6 14 12 20 18 14" />
        </svg>
      </span>
      <span className="scroll-prompt-text">Листайте вниз</span>
    </div>
  );
};
