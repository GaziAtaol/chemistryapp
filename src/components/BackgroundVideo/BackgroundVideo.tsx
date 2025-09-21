import React, { useEffect, useRef } from 'react';
import { useSettings } from '../../hooks';

const BackgroundVideo: React.FC = () => {
  const { settings } = useSettings();
  const videoRef = useRef<HTMLVideoElement>(null);

  const videoSrc = settings.theme === 'dark' 
    ? '/blackbackground.mp4' 
    : '/whitebackground.mp4';

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.src = videoSrc;
      videoRef.current.load(); // Force reload the video
    }
  }, [videoSrc]);

  return (
    <div className="background-video-container">
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        className="background-video"
      >
        <source src={videoSrc} type="video/mp4" />
      </video>
    </div>
  );
};

export default BackgroundVideo;