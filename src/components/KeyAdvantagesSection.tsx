import React, { useEffect, useRef } from 'react';

interface AdvCardProps {
  cardClass: string;
  titleClass: string;
  title: string;
  subtitles: string[];
  videoSrc: string;
  dyVar: string;
  opVar: string;
  peVar: string;
}

const KeyAdvCardItem: React.FC<AdvCardProps> = ({
  cardClass,
  titleClass,
  title,
  subtitles,
  videoSrc,
  dyVar,
  opVar,
  peVar,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const cardRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    const card = cardRef.current;
    if (!video || !card) return;

    // Only play video when visible in viewport to prevent mobile GPU and memory lag
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry && entry.isIntersecting) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(card);
    return () => observer.disconnect();
  }, []);

  return (
    <article
      ref={cardRef}
      className={`key-adv-card ${cardClass}`}
      tabIndex={0}
      style={{
        '--card-dy': `var(${dyVar}, 850px)`,
        '--card-op': `var(${opVar}, 0)`,
        '--card-pe': `var(${peVar}, auto)`,
      } as React.CSSProperties}
    >
      <div className="key-adv-card-subtitles">
        {subtitles.map((sub, idx) => (
          <p key={idx} className="key-adv-subtitle-item">
            {sub}
          </p>
        ))}
      </div>

      <h3 className={`key-adv-card-title ${titleClass}`}>{title}</h3>

      <div className="key-adv-card-video-wrap" aria-hidden="true">
        <video
          ref={videoRef}
          src={videoSrc}
          loop
          muted
          playsInline
          preload="none"
          className="key-adv-card-video"
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
      </div>
    </article>
  );
};

export const KeyAdvantagesSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let rafId: number;
    const section = sectionRef.current;
    const stage = stageRef.current;
    if (!section || !stage) return;

    const isMobileOrTablet = typeof window !== 'undefined' && window.innerWidth <= 1024;

    if (isMobileOrTablet) {
      // Mobile & tablet: cards flow naturally via static CSS. Zero scroll listener overhead.
      stage.style.removeProperty('transform');
      stage.style.removeProperty('transform-origin');
      section.style.setProperty('--c3-dy', '0px');
      section.style.setProperty('--c3-op', '1');
      section.style.setProperty('--c3-pe', 'auto');
      section.style.setProperty('--c2-dy', '0px');
      section.style.setProperty('--c2-op', '1');
      section.style.setProperty('--c2-pe', 'auto');
      section.style.setProperty('--c1-dy', '0px');
      section.style.setProperty('--c1-op', '1');
      section.style.setProperty('--c1-pe', 'auto');
      section.style.setProperty('--w1-dx', '0px');
      section.style.setProperty('--w1-op', '1');
      section.style.setProperty('--w2-dx', '0px');
      section.style.setProperty('--w2-op', '1');

      const handleResize = () => {
        if (window.innerWidth > 1024) {
          window.location.reload();
        }
      };
      window.addEventListener('resize', handleResize, { passive: true });
      return () => window.removeEventListener('resize', handleResize);
    }

    const updateScaleAndScroll = () => {
      const vh = window.innerHeight;
      const vw = window.innerWidth;

      // Responsive Stage Scaling on Desktop so lowered cards are never cropped vertically or horizontally
      if (vw > 1024) {
        const STAGE_W = 1920;
        const STAGE_H = 1140; // Extended height so lowest card never touches or gets cut off at bottom
        const scaleW = vw / STAGE_W;
        const scaleH = (vh - 32) / STAGE_H;
        const scale = Math.min(1, Math.min(scaleW, scaleH));
        stage.style.transform = `scale(${scale.toFixed(4)})`;
        stage.style.transformOrigin = 'center center';
      } else {
        return;
      }

      const rect = section.getBoundingClientRect();
      const scrollable = Math.max(rect.height - vh, 1);
      const scrolled = -rect.top;

      // Normalized scroll progress inside this sticky section: 0 to 1
      const p = Math.min(Math.max(scrolled / scrollable, 0), 1);

      // Smooth cubic ease-out
      const ease = (t: number) => {
        const ct = Math.min(Math.max(t, 0), 1);
        return 1 - Math.pow(1 - ct, 3);
      };
      const clamp = (val: number) => Math.min(Math.max(val, 0), 1);

      // Large initial travel distance so cards visibly emerge from below the canvas
      const RISE_DIST = 850;

      // 1. Background typography reveals first (p: 0.00 to 0.12)
      // "КЛЮЧЕВЫЕ" on left slides from -50px, "ПРЕИМУЩЕСТВА" on right slides from +50px
      const pw = ease(p / 0.12);
      section.style.setProperty('--w1-dx', `${((1 - pw) * -50).toFixed(1)}px`);
      section.style.setProperty('--w1-op', `${clamp(pw * 1.5).toFixed(3)}`);
      section.style.setProperty('--w2-dx', `${((1 - pw) * 50).toFixed(1)}px`);
      section.style.setProperty('--w2-op', `${clamp(pw * 1.5).toFixed(3)}`);

      // 2. Card 3 (Right, chit.mp4) - First to emerge:
      // Entrance: p from 0.08 to 0.32
      const p3In = ease((p - 0.08) / 0.24);
      const dy3In = (1 - p3In) * RISE_DIST;
      // Parallax upward drift once entered: p from 0.32 to 0.90 (moves up by -95px)
      const p3Drift = ease((p - 0.32) / 0.58);
      const dy3Drift = p3In >= 1 ? -95 * p3Drift : 0;
      const c3Dy = dy3In + dy3Drift;
      section.style.setProperty('--c3-dy', `${c3Dy.toFixed(1)}px`);
      section.style.setProperty('--c3-op', `${clamp(p3In * 2).toFixed(3)}`);
      section.style.setProperty('--c3-pe', p3In > 0.8 ? 'auto' : 'none');

      // 3. Card 2 (Middle, rot.mp4) - Second to emerge:
      // Entrance: p from 0.34 to 0.58
      const p2In = ease((p - 0.34) / 0.24);
      const dy2In = (1 - p2In) * RISE_DIST;
      // Parallax upward drift once entered: p from 0.58 to 0.90 (moves up by -80px)
      const p2Drift = ease((p - 0.58) / 0.32);
      const dy2Drift = p2In >= 1 ? -80 * p2Drift : 0;
      const c2Dy = dy2In + dy2Drift;
      section.style.setProperty('--c2-dy', `${c2Dy.toFixed(1)}px`);
      section.style.setProperty('--c2-op', `${clamp(p2In * 2).toFixed(3)}`);
      section.style.setProperty('--c2-pe', p2In > 0.8 ? 'auto' : 'none');

      // 4. Card 1 (Left, lock.mp4) - Third to emerge:
      // Entrance: p from 0.60 to 0.82
      const p1In = ease((p - 0.60) / 0.22);
      const dy1In = (1 - p1In) * RISE_DIST;
      // Parallax upward drift once entered: p from 0.82 to 0.94 (moves up by -65px)
      const p1Drift = ease((p - 0.82) / 0.12);
      const dy1Drift = p1In >= 1 ? -65 * p1Drift : 0;
      const c1Dy = dy1In + dy1Drift;
      section.style.setProperty('--c1-dy', `${c1Dy.toFixed(1)}px`);
      section.style.setProperty('--c1-op', `${clamp(p1In * 2).toFixed(3)}`);
      section.style.setProperty('--c1-pe', p1In > 0.8 ? 'auto' : 'none');
    };

    const handleScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updateScaleAndScroll);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    updateScaleAndScroll();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  return (
    <section 
      id="privacy" 
      ref={sectionRef} 
      className="key-advantages-section"
      aria-label="Ключевые преимущества"
    >
      <div className="key-advantages-sticky">
        {/* Large Typographic Background Layer - spans full viewport width matching site-header */}
        <div className="key-advantages-bg-text-wrap" aria-hidden="true">
          <span 
            className="key-adv-word-accent"
            style={{
              transform: 'translate3d(var(--w2-dx, 0px), 0, 0)',
              opacity: 'var(--w2-op, 1)',
            }}
          >
            ПРЕИМУЩЕСТВА
          </span>
          <span 
            className="key-adv-word-dark"
            style={{
              transform: 'translate3d(var(--w1-dx, 0px), 0, 0)',
              opacity: 'var(--w1-op, 1)',
            }}
          >
            КЛЮЧЕВЫЕ
          </span>
        </div>

        {/* 3 Staggered White Bento Cards Stage */}
        <div ref={stageRef} className="key-advantages-stage">
          <div className="key-advantages-cards">
            {/* Card 1 - Left: lock.mp4 (Appears 3rd) */}
            <KeyAdvCardItem
              cardClass="card-1"
              titleClass="title-card-1"
              title="Полный контроль над перепиской"
              subtitles={[
                'Приложение разворачивается на независимой, защищенной платформе',
                'Никакие сторонние корпорации или рекламные трекеры не имеют доступа к вашей истории общения'
              ]}
              videoSrc="/video/lock.mp4"
              dyVar="--c1-dy"
              opVar="--c1-op"
              peVar="--c1-pe"
            />

            {/* Card 2 - Middle: rot.mp4 (Appears 2nd) */}
            <KeyAdvCardItem
              cardClass="card-2"
              titleClass="title-card-2"
              title="Абсолютное уважение к тайне общения"
              subtitles={[
                'Даже администраторы платформы не могут читать ваши личные чаты',
                'Им доступны только технические настройки и сообщения, на которые вы сами отправили жалобу при столкновении со спамом'
              ]}
              videoSrc="/video/rot.mp4"
              dyVar="--c2-dy"
              opVar="--c2-op"
              peVar="--c2-pe"
            />

            {/* Card 3 - Right: chit.mp4 (Appears 1st) */}
            <KeyAdvCardItem
              cardClass="card-3"
              titleClass="title-card-3"
              title="Защита ваших данных на устройстве"
              subtitles={[
                'Локальная база данных на вашем телефоне полностью зашифрована',
                'Приложение строго запрещает логировать текст ваших сообщений или коды подтверждения для исключения утечек'
              ]}
              videoSrc="/video/chit.mp4"
              dyVar="--c3-dy"
              opVar="--c3-op"
              peVar="--c3-pe"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

