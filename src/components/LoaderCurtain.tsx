import React, { useEffect, useState } from 'react';
import { SendLogo } from './SendLogo';

interface LoaderCurtainProps {
  onReady: () => void;
}

export const LoaderCurtain: React.FC<LoaderCurtainProps> = ({ onReady }) => {
  const [isSlidingUp, setIsSlidingUp] = useState(false);
  const [isRemoved, setIsRemoved] = useState(false);
  const [isBrandVisible, setIsBrandVisible] = useState(false);

  useEffect(() => {
    const MIN_VISIBLE_MS = 2200;
    const EXIT_MS = 950;

    const brandTimer = setTimeout(() => {
      setIsBrandVisible(true);
    }, 80);

    // End loader after animation finishes
    const exitTimer = setTimeout(() => {
      setIsSlidingUp(true);
      onReady();

      setTimeout(() => {
        setIsRemoved(true);
      }, EXIT_MS);
    }, MIN_VISIBLE_MS);

    return () => {
      clearTimeout(brandTimer);
      clearTimeout(exitTimer);
    };
  }, [onReady]);

  if (isRemoved) return null;

  return (
    <aside
      id="loader-curtain"
      aria-label="Loading Send Messenger"
      style={{
        transform: isSlidingUp ? 'translateY(-105%)' : 'translateY(0%)',
        transition: isSlidingUp ? 'transform 950ms cubic-bezier(0.65, 0, 0.35, 1)' : 'none'
      }}
    >
      <div className={`loader-brand ${isBrandVisible ? 'visible' : ''}`} id="loader-brand">
        <SendLogo animated={isBrandVisible} />
      </div>
    </aside>
  );
};
