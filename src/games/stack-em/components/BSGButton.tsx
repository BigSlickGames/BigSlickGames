import React from 'react';

interface BSGButtonProps {
  className?: string;
  style?: React.CSSProperties;
}

export function BSGButton({ className = "", style }: BSGButtonProps) {
  return (
    <button 
      onClick={() => window.open('https://bigslickgames.com', '_blank')}
      className="hover:scale-110 transition-transform"
    >
      <img 
        src="/images/BSG.png"
        alt="BSG"
        className={`w-[35px] h-[35px] object-contain ${className}`}
        style={style}
      />
    </button>
  );
}