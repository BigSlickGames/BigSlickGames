import React from 'react';

export const VideoBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
      <video
        autoPlay
        muted
        loop
        playsInline
        playbackRate={0.5}
        className="absolute inset-0 w-full h-full object-cover opacity-50"
        style={{ filter: 'brightness(0.8)' }}
        onLoadedData={(e) => {
          const video = e.target as HTMLVideoElement;
          video.playbackRate = 0.5;
        }}
      >
        <source src="/videos/vecteezy_abstract-blue-futuristic-hexagon-surface-pattern-resembling_48669985.mp4" type="video/mp4" />
      </video>
    </div>
  );
};