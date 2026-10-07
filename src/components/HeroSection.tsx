import React, { useState, useEffect, useRef } from 'react';

const heroStats = [
  {
    title: 'Говорите открыто',
    desc: 'Полная защита каждого звонка и чата',
  },
  {
    title: 'Делитесь настоящим',
    desc: 'Файлы любого формата без сжатия',
  },
  {
    title: 'Забудьте про шум',
    desc: 'Только важные люди и никакой рекламы',
  },
  {
    title: 'Будьте на связи',
    desc: 'Мгновенная доставка в любой точке мира',
  },
];

interface HeroSectionProps {
  ready?: boolean;
  heroRef?: React.RefObject<HTMLElement | null>;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ ready = true, heroRef }) => {
  const heroPlateRef = useRef<HTMLDivElement>(null);
  const [activeStatIdx, setActiveStatIdx] = useState(0);
  const [bubbleState, setBubbleState] = useState<'hidden' | 'entering' | 'resting' | 'exiting'>('hidden');
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const hasInitialEnteredRef = useRef(false);

  // Smooth mobile speech bubble choreography:
  // 1. First plate emerges from behind phone once phone arrives (~1100ms)
  // 2. Rests at top: 100px for reading (~3200ms)
  // 3. Slides smoothly down behind the phone (~650ms)
  // 4. Switches to the next plate while hidden behind the phone (~150ms pause)
  // 5. Next plate emerges from behind the phone smoothly
  useEffect(() => {
    if (!ready) {
      setBubbleState('hidden');
      hasInitialEnteredRef.current = false;
      return;
    }

    let isMounted = true;

    if (bubbleState === 'hidden') {
      const delay = !hasInitialEnteredRef.current ? 1100 : 150;
      timerRef.current = setTimeout(() => {
        if (!isMounted) return;
        hasInitialEnteredRef.current = true;
        setBubbleState('entering');
      }, delay);
    } else if (bubbleState === 'entering') {
      timerRef.current = setTimeout(() => {
        if (!isMounted) return;
        setBubbleState('resting');
      }, 750);
    } else if (bubbleState === 'resting') {
      timerRef.current = setTimeout(() => {
        if (!isMounted) return;
        setBubbleState('exiting');
      }, 3200);
    } else if (bubbleState === 'exiting') {
      timerRef.current = setTimeout(() => {
        if (!isMounted) return;
        setActiveStatIdx((prev) => (prev + 1) % heroStats.length);
        setBubbleState('hidden');
      }, 650);
    }

    return () => {
      isMounted = false;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [ready, bubbleState]);

  const handleBubbleClick = () => {
    if (bubbleState === 'resting') {
      if (timerRef.current) clearTimeout(timerRef.current);
      setBubbleState('exiting');
    }
  };

  // Parallax subtle interaction on scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || window.pageYOffset;
      const heroHeight = window.innerHeight;
      if (scrollY <= heroHeight * 1.5 && heroPlateRef.current) {
        const progress = Math.min(Math.max(scrollY / heroHeight, 0), 1);
        heroPlateRef.current.style.transform = `translate3d(0, ${(progress * 8).toFixed(2)}%, 0)`;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section id="hero" aria-labelledby="hero-title" ref={heroRef as React.RefObject<HTMLElement>}>
      {/* Background Frame Layer (Exact 1:1 Figma 37:255 Frame 427321496: Ellipses 3, 6, 4, 5) */}
      <div className="hero-bg-wrapper">
        <div className={`hero-figma-canvas ${ready ? 'is-ready' : ''}`} id="hero-plate" ref={heroPlateRef}>
          {/* Top Radial Arc - Ellipse 3 (37:257) */}
          <div className="figma-bg-ellipse ellipse-3"></div>

          {/* Bottom Radial Arc - Ellipse 6 (37:258) */}
          <div className="figma-bg-ellipse ellipse-6"></div>

          {/* Left Radial Highlight - Ellipse 4 (37:259) */}
          <div className="figma-bg-ellipse ellipse-4"></div>

          {/* Right Radial Highlight - Ellipse 5 (37:260) */}
          <div className="figma-bg-ellipse ellipse-5"></div>

          {/* Dynamic Floating Gradient Ellipse */}
          <div className="figma-bg-ellipse ellipse-animated"></div>

          {/* Full-Block Orbiting Gradient Blur Orb */}
          <div className="figma-bg-ellipse ellipse-orbiting"></div>

          {/* Bottom Sweeping Horizontal Blob Ellipse */}
          <div className="figma-bg-ellipse ellipse-bottom-sweep"></div>

          {/* Mobile Dedicated Cyclical Background Text (Figma 175:1153 / 175:1177: SEND MESSENGER) */}
          <div className="hero-mobile-ticker-wrap" aria-hidden="true">
            <div className="hero-mobile-ticker-track">
              <span className="hero-mobile-ticker-text">SEND MESSENGER</span>
              <span className="hero-mobile-ticker-text">SEND MESSENGER</span>
              <span className="hero-mobile-ticker-text">SEND MESSENGER</span>
              <span className="hero-mobile-ticker-text">SEND MESSENGER</span>
            </div>
          </div>

          {/* Monotone noise texture overlay */}
          <div className="figma-bg-noise"></div>
        </div>
      </div>

      {/* Giant Center Title */}
      <div className="hero-main-stage">
        {/* Giant SEND Messenger Typography (199px) */}
        <div className="hero-title-wrap">
          <h1 id="hero-title" className={ready ? 'revealed' : ''}>
            <span className="clip-box">
              <span
                className="clip-inner"
                style={{
                  transform: ready ? 'translateY(0)' : 'translateY(110%)',
                  opacity: ready ? 1 : 0,
                  transition: 'transform 1300ms cubic-bezier(0.16, 1, 0.3, 1), opacity 1300ms cubic-bezier(0.16, 1, 0.3, 1)',
                  transitionDelay: '150ms'
                }}
              >
                SEND Messenger
              </span>
            </span>
          </h1>
        </div>
      </div>

      {/* Mobile Dedicated Figma 175:1153 Layout (Hidden on Desktop >= 641px) */}
      <div className="hero-mobile-layout" aria-hidden="false">
        {/* Mobile Speech Bubble Card (Rectangle 161124266 & Frame 427321498: 234x104px, r: 40px) */}
        <div 
          className={`hero-mobile-bubble is-${bubbleState}`}
          onClick={handleBubbleClick}
          role="button"
          tabIndex={0}
          aria-label="Преимущество: нажмите для переключения"
        >
          <div className="hero-mobile-bubble-inner">
            <div className="hero-mobile-bubble-title">
              {heroStats[activeStatIdx].title}
            </div>
            <div className="hero-mobile-bubble-desc">
              {heroStats[activeStatIdx].desc}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Metrics Row (Figma 37:208 - 4 Metric Items) */}
      <div className={`hero-bottom-stats-row ${ready ? 'revealed' : ''}`}>
        {/* Left Cluster (Frame 427321502: 598x76px, gap 120px) */}
        <div className="hero-stats-cluster cluster-left">
          {/* Stat 1: Говорите открыто */}
          <div className="hero-stat-card stat-item-1">
            <div className="hero-stat-value">Говорите открыто</div>
            <div className="hero-stat-desc">полная защита каждого звонка и чата</div>
          </div>

          {/* Stat 2: Делитесь настоящим */}
          <div className="hero-stat-card stat-item-2">
            <div className="hero-stat-value">Делитесь настоящим</div>
            <div className="hero-stat-desc">файлы любого формата без сжатия</div>
          </div>
        </div>

        {/* Right Cluster (Frame 427321503: 598x76px, gap 120px) */}
        <div className="hero-stats-cluster cluster-right">
          {/* Stat 3: Забудьте про шум */}
          <div className="hero-stat-card stat-item-3">
            <div className="hero-stat-value">
              Забудьте<br />про шум
            </div>
            <div className="hero-stat-desc">только важные люди и никакой рекламы</div>
          </div>

          {/* Stat 4: Будьте на связи */}
          <div className="hero-stat-card stat-item-4">
            <div className="hero-stat-value">
              Будьте<br />на связи
            </div>
            <div className="hero-stat-desc">мгновенная доставка в любой точке мира</div>
          </div>
        </div>
      </div>
    </section>
  );
};
