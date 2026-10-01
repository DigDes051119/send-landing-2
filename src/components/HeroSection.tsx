import React, { useEffect, useRef } from 'react';

interface HeroSectionProps {
  ready?: boolean;
  heroRef?: React.RefObject<HTMLElement | null>;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ ready = true, heroRef }) => {
  const heroPlateRef = useRef<HTMLDivElement>(null);

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
