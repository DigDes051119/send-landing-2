import React, { useState, useEffect, useRef } from 'react';

export interface ChatsBlockSectionProps {
  sectionRef?: React.RefObject<HTMLElement | null>;
  activeSlide?: number;
  slideProgress?: number;
  isEntered?: boolean;
  onSelectSlide?: (index: number) => void;
}

interface SlideWord {
  text: string;
  color: string;
  left: string;
  top: string;
  accent?: boolean;
}

interface FloatingImage {
  src: string;
  alt: string;
  className: string;
  dxIn: number;
  dyIn: number;
  dxOut: number;
  dyOut: number;
  rotIn?: number;
  rotOut?: number;
  scaleIn?: number;
  scaleOut?: number;
  delayIn?: number;
  delayOut?: number;
  style: React.CSSProperties;
}

interface SlideData {
  id: number;
  words: SlideWord[];
  title: string;
  description: string;
  cardWidth: number;
  images: FloatingImage[];
}

const SLIDES: SlideData[] = [
  // Slide 1 (Figma block-2-1 / 47:639) - Pattern: Clockwise flow (Bubble -> Input -> Search -> Location)
  {
    id: 0,
    words: [
      { text: 'быстрые', color: '#151515', left: '2.24%', top: '30.74%' },
      { text: 'и', color: '#a4a5c8', left: '34.22%', top: '49.81%' },
      { text: 'удобные', color: '#a4a5c8', left: '59.38%', top: '49.81%' },
      { text: 'чаты', color: '#3063f7', left: '76.67%', top: '68.89%', accent: true },
    ],
    title: 'Общайтесь легко',
    description: 'Поместятся даже самые длинные истории. Отвечайте на реплики, отмечайте друзей и отправляйте ссылки без лишних действий',
    cardWidth: 448,
    images: [
      {
        src: '/block2-bubble-top.webp',
        alt: 'Может встретимся сегодня?',
        className: 'slide-img-bubble-top',
        dxIn: 266,
        dyIn: 281,
        dxOut: -550,
        dyOut: -580,
        rotIn: -3,
        rotOut: -6,
        delayIn: 100,
        delayOut: 0,
        style: { left: '23.59%', top: '9.26%', width: '25.15vw', maxWidth: '483px' },
      },
      {
        src: '/block2-input-bar.webp',
        alt: 'Панель ввода сообщения',
        className: 'slide-img-input-bar',
        dxIn: -420,
        dyIn: 62,
        dxOut: 800,
        dyOut: -100,
        rotIn: 2.5,
        rotOut: 4,
        delayIn: 420,
        delayOut: 180,
        style: { left: '53.0%', top: '29.63%', width: '33.28vw', maxWidth: '639px', opacity: 0.55 },
      },
      {
        src: '/block2-search-import.webp',
        alt: 'Импортировать из Telegram или WhatsApp',
        className: 'slide-img-search-import',
        dxIn: 431,
        dyIn: -295,
        dxOut: -750,
        dyOut: 500,
        rotIn: -2,
        rotOut: -5,
        delayIn: 740,
        delayOut: 360,
        style: { left: '10.0%', top: '55.83%', width: '35.1vw', maxWidth: '674px' },
      },
      {
        src: '/block2-location-card.webp',
        alt: 'Трансляция геопозиции',
        className: 'slide-img-location-card',
        dxIn: -239,
        dyIn: -362,
        dxOut: 450,
        dyOut: 650,
        rotIn: 3,
        rotOut: 6,
        delayIn: 1060,
        delayOut: 540,
        style: { left: '45.36%', top: '67.96%', width: '34.14vw', maxWidth: '655.5px' },
      },
    ],
  },
  // Slide 2 (Figma 2 / 50:3508) - Pattern: Conversational Action (Bubble -> Context Menu -> Audio -> Tabs)
  {
    id: 1,
    words: [
      { text: 'лови', color: '#151515', left: '2.24%', top: '30.74%' },
      { text: 'момент', color: '#3063f7', left: '61.61%', top: '49.81%', accent: true },
    ],
    title: 'Ловите момент',
    description: 'Ставьте быстрые реакции, добавляйте стикеры и делитесь эмоциями без лишних слов',
    cardWidth: 519,
    images: [
      {
        src: '/slide2-bubble.webp',
        alt: 'Привет! Всё хорошо, заканчиваю проект',
        className: 'slide-img-s2-bubble',
        dxIn: -260,
        dyIn: 83,
        dxOut: 600,
        dyOut: -150,
        rotIn: 4,
        rotOut: 5,
        delayIn: 80,
        delayOut: 0,
        style: { left: '52.5%', top: '27.5%', width: '19.84vw', maxWidth: '381px', opacity: 0.55 },
      },
      {
        src: '/slide2-context-menu.webp',
        alt: 'Контекстное меню сообщения с реакциями',
        className: 'slide-img-s2-context',
        dxIn: 338,
        dyIn: -241,
        dxOut: -600,
        dyOut: 450,
        rotIn: -3.5,
        rotOut: -6,
        delayIn: 400,
        delayOut: 180,
        style: { left: '17.6%', top: '46.11%', width: '29.55vw', maxWidth: '567.5px' },
      },
      {
        src: '/slide2-audio.webp',
        alt: 'Аудиосообщение AUD-20260701-WA0005',
        className: 'slide-img-s2-audio',
        dxIn: 374,
        dyIn: 256,
        dxOut: -650,
        dyOut: -450,
        rotIn: -2.5,
        rotOut: -5,
        delayIn: 720,
        delayOut: 360,
        style: { left: '13.96%', top: '12.04%', width: '33.17vw', maxWidth: '637px' },
      },
      {
        src: '/slide2-tabs.webp',
        alt: 'Эмодзи, GIF, Стикеры, Импорт',
        className: 'slide-img-s2-tabs',
        dxIn: -420,
        dyIn: -390,
        dxOut: 700,
        dyOut: 650,
        rotIn: 2,
        rotOut: 5,
        delayIn: 1040,
        delayOut: 540,
        style: { left: '55.36%', top: '74.91%', width: '32.96vw', maxWidth: '633px' },
      },
    ],
  },
  // Slide 3 (Figma 3 / 50:3984) - Pattern: Photo Gallery Cascade (Photo 1 -> Photo 2 -> Photo 3 -> Audio)
  {
    id: 2,
    words: [
      { text: 'Делитесь', color: '#151515', left: '2.24%', top: '30.74%' },
      { text: 'самым', color: '#a4a5c8', left: '8.07%', top: '49.81%' },
      { text: 'важным', color: '#3063f7', left: '61.04%', top: '63.89%', accent: true },
    ],
    title: 'Делитесь самым важным без ограничений',
    description: 'Делитесь большими файлами, видео и альбомами без сжатия. Никаких рамок и ограничений',
    cardWidth: 455,
    images: [
      {
        src: '/slide3-audio.webp',
        alt: 'Аудиофайл',
        className: 'slide-img-s3-audio',
        dxIn: 374,
        dyIn: 256,
        dxOut: -650,
        dyOut: -450,
        rotIn: -3,
        rotOut: -5,
        delayIn: 80,
        delayOut: 0,
        style: { left: '13.96%', top: '12.04%', width: '33.17vw', maxWidth: '637px' },
      },
      {
        src: '/slide3-photo-1.webp',
        alt: 'Фотография заката с отметкой',
        className: 'slide-img-s3-photo1',
        dxIn: -275,
        dyIn: 275,
        dxOut: 550,
        dyOut: -550,
        rotIn: 5,
        rotOut: 8,
        delayIn: 280,
        delayOut: 160,
        style: { left: '56.67%', top: '7.13%', width: '15.31vw', maxWidth: '294px' },
      },
      {
        src: '/slide3-photo-2.webp',
        alt: 'Фотография неба',
        className: 'slide-img-s3-photo2',
        dxIn: 225,
        dyIn: -367,
        dxOut: -450,
        dyOut: 650,
        rotIn: -4,
        rotOut: -7,
        delayIn: 480,
        delayOut: 300,
        style: { left: '30.52%', top: '67.96%', width: '15.57vw', maxWidth: '299px' },
      },
      {
        src: '/slide3-photo-3.webp',
        alt: 'Фотография горного пейзажа',
        className: 'slide-img-s3-photo3',
        dxIn: -257,
        dyIn: -399,
        dxOut: 500,
        dyOut: 700,
        rotIn: 3.5,
        rotOut: 6,
        delayIn: 680,
        delayOut: 440,
        style: { left: '55.47%', top: '73.7%', width: '15.78vw', maxWidth: '303px' },
      },
    ],
  },
  // Slide 4 (Figma 4 / 50:4176) - Pattern: Security Elements (Username -> Phone -> Country -> Voice)
  {
    id: 3,
    words: [
      { text: 'берегите', color: '#151515', left: '2.24%', top: '30.74%' },
      { text: 'личное', color: '#3063f7', left: '61.61%', top: '49.81%', accent: true },
    ],
    title: 'Берегите личное',
    description: 'Вы сами решаете, кто видит вас в сети и слышит ваш голос. Абсолютный покой без чужих глаз',
    cardWidth: 547,
    images: [
      {
        src: '/slide4-username.webp',
        alt: 'Задать имя пользователя send.chat/имя',
        className: 'slide-img-s4-username',
        dxIn: 391,
        dyIn: 288,
        dxOut: -700,
        dyOut: -500,
        rotIn: -3,
        rotOut: -6,
        delayIn: 240,
        delayOut: 0,
        style: { left: '12.34%', top: '7.31%', width: '34.58vw', maxWidth: '664px' },
      },
      {
        src: '/slide4-phone.webp',
        alt: 'Номер телефона +996 778 051 119',
        className: 'slide-img-s4-phone',
        dxIn: 350,
        dyIn: -300,
        dxOut: -650,
        dyOut: 550,
        rotIn: -2,
        rotOut: -4,
        delayIn: 420,
        delayOut: 180,
        style: { left: '14.48%', top: '62.41%', width: '34.6vw', maxWidth: '664.5px' },
      },
      {
        src: '/slide4-country.webp',
        alt: 'Страна Кыргызстан',
        className: 'slide-img-s4-country',
        dxIn: -380,
        dyIn: 123,
        dxOut: 800,
        dyOut: -200,
        rotIn: 3,
        rotOut: 5,
        delayIn: 760,
        delayOut: 360,
        style: { left: '52.5%', top: '21.67%', width: '34.63vw', maxWidth: '665px', opacity: 0.55 },
      },
      {
        src: '/slide4-voice.webp',
        alt: 'Голосовое сообщение 00:03 / 10:05',
        className: 'slide-img-s4-voice',
        dxIn: -385,
        dyIn: -337,
        dxOut: 650,
        dyOut: 600,
        rotIn: 2.5,
        rotOut: 6,
        delayIn: 1100,
        delayOut: 540,
        style: { left: '56.41%', top: '65.83%', width: '27.29vw', maxWidth: '524px' },
      },
    ],
  },
  // Slide 5 (Figma 5 / 51:6333) - Pattern: Smart Automation (Plus trigger -> Toggle switch -> Silent alert -> Input)
  {
    id: 4,
    words: [
      { text: 'умные', color: '#151515', left: '10.78%', top: '30.74%' },
      { text: 'уведом', color: '#a4a5c8', left: '6.46%', top: '49.81%' },
      { text: 'ления', color: '#a4a5c8', left: '60.63%', top: '49.81%' },
    ],
    title: 'Умные уведомления',
    description: 'Настройте «тихие часы» или отключите уведомления для конкретного чата',
    cardWidth: 414,
    images: [
      {
        src: '/slide5-plus.webp',
        alt: 'Кнопка добавления',
        className: 'slide-img-s5-plus',
        dxIn: 272,
        dyIn: 278,
        dxOut: -500,
        dyOut: -500,
        rotIn: -8,
        rotOut: -12,
        delayIn: 70,
        delayOut: 0,
        style: { left: '31.35%', top: '12.5%', width: '8.98vw', maxWidth: '172.5px' },
      },
      {
        src: '/slide5-toggle.webp',
        alt: 'Умные уведомления переключатель',
        className: 'slide-img-s5-toggle',
        dxIn: -428,
        dyIn: -307,
        dxOut: 750,
        dyOut: 550,
        rotIn: 3.5,
        rotOut: 6,
        delayIn: 390,
        delayOut: 180,
        style: { left: '56.51%', top: '65.19%', width: '31.51vw', maxWidth: '605px' },
      },
      {
        src: '/slide5-silent.webp',
        alt: 'Уведомления будут беззвучными',
        className: 'slide-img-s5-silent',
        dxIn: -423,
        dyIn: 102,
        dxOut: 750,
        dyOut: -180,
        rotIn: 2,
        rotOut: 4,
        delayIn: 710,
        delayOut: 360,
        style: { left: '56.67%', top: '25.74%', width: '30.7vw', maxWidth: '589.5px' },
      },
      {
        src: '/slide5-input.webp',
        alt: 'Или давай завтра?',
        className: 'slide-img-s5-input',
        dxIn: 448,
        dyIn: -340,
        dxOut: -750,
        dyOut: 600,
        rotIn: -3,
        rotOut: -6,
        delayIn: 1030,
        delayOut: 540,
        style: { left: '10.26%', top: '66.67%', width: '32.86vw', maxWidth: '631px' },
      },
    ],
  },
];

export const ChatsBlockSection: React.FC<ChatsBlockSectionProps> = ({
  sectionRef,
  activeSlide = 0,
  slideProgress = 0,
  isEntered = false,
  onSelectSlide,
}) => {
  const safeActiveIndex = Math.min(Math.max(activeSlide, 0), SLIDES.length - 1);
  const activeSlideData = SLIDES[safeActiveIndex];

  const slideLayersRef = useRef<(HTMLDivElement | null)[]>([]);
  const [contentHeight, setContentHeight] = useState<number | undefined>(undefined);

  useEffect(() => {
    const activeEl = slideLayersRef.current[safeActiveIndex];
    if (!activeEl) return;

    const measure = () => {
      const rect = activeEl.getBoundingClientRect();
      const h = Math.ceil(rect.height || activeEl.offsetHeight || activeEl.scrollHeight);
      if (h > 0) {
        setContentHeight(h);
      }
    };

    measure();

    const ro = new ResizeObserver(() => {
      measure();
    });

    ro.observe(activeEl);
    return () => ro.disconnect();
  }, [safeActiveIndex]);

  // Chaotic Organic Cursor Parallax Engine for Floating Elements
  useEffect(() => {
    const section = (sectionRef as React.RefObject<HTMLElement>)?.current;
    if (!section) return;

    let isVisible = false;
    let rafId: number = 0;
    let targetX = 0;
    let targetY = 0;
    const startTime = performance.now();

    // 4 distinct physics channels with asymmetric lerp, opposing directions, cross-axis coupling, tilt and ambient breathing
    const channels = [
      { lerp: 0.08, currX: 0, currY: 0, baseDx: 34, baseDy: 26, crossX: 10, crossY: -9, maxRot: 3.2, freq: 0.95, phase: 0.2, amp: 5 },
      { lerp: 0.046, currX: 0, currY: 0, baseDx: -30, baseDy: 32, crossX: -13, crossY: 11, maxRot: -3.6, freq: 1.15, phase: 2.1, amp: 6 },
      { lerp: 0.065, currX: 0, currY: 0, baseDx: 38, baseDy: -30, crossX: -11, crossY: 10, maxRot: 3.8, freq: 0.85, phase: 3.9, amp: 4.5 },
      { lerp: 0.038, currX: 0, currY: 0, baseDx: -35, baseDy: -28, crossX: 14, crossY: -12, maxRot: -3.0, freq: 1.3, phase: 5.3, amp: 5.5 },
    ];

    const onMouseMove = (e: MouseEvent) => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      targetX = ((e.clientX - vw / 2) / (vw / 2));
      targetY = ((e.clientY - vh / 2) / (vh / 2));
    };

    const animate = (now: number) => {
      if (!isVisible) return;

      const t = (now - startTime) * 0.001; // seconds

      for (let i = 0; i < channels.length; i++) {
        const ch = channels[i];
        ch.currX += (targetX - ch.currX) * ch.lerp;
        ch.currY += (targetY - ch.currY) * ch.lerp;

        // Harmonic ambient buoyant float
        const ambX = Math.sin(t * ch.freq + ch.phase) * ch.amp;
        const ambY = Math.cos(t * (ch.freq * 0.85) + ch.phase * 1.3) * (ch.amp * 0.85);
        const ambRot = Math.sin(t * (ch.freq * 0.7) + ch.phase) * 1.2;

        // Non-linear cross-coupled trajectory with rotation tilt
        const px = ch.currX * ch.baseDx + ch.currY * ch.crossX + ambX;
        const py = ch.currY * ch.baseDy + ch.currX * ch.crossY + ambY;
        const prot = ch.currX * ch.maxRot + ambRot;

        section.style.setProperty(`--p-x-${i}`, `${px.toFixed(2)}px`);
        section.style.setProperty(`--p-y-${i}`, `${py.toFixed(2)}px`);
        section.style.setProperty(`--p-rot-${i}`, `${prot.toFixed(2)}deg`);
      }

      rafId = requestAnimationFrame(animate);
    };

    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry && entry.isIntersecting) {
          if (!isVisible) {
            isVisible = true;
            rafId = requestAnimationFrame(animate);
          }
        } else {
          isVisible = false;
          cancelAnimationFrame(rafId);
        }
      },
      { threshold: 0 }
    );

    io.observe(section);
    window.addEventListener('mousemove', onMouseMove, { passive: true });

    return () => {
      isVisible = false;
      io.disconnect();
      window.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(rafId);
    };
  }, [sectionRef]);

  return (
    <section
      id="chats-feature"
      ref={sectionRef as React.RefObject<HTMLElement>}
      className={`block2-chats-section ${isEntered ? 'is-entered' : 'is-unentered'}`}
      aria-label="Возможности мессенджера Send"
    >
      <div className="block2-sticky-viewport">
        <div className="block2-container">
          {/* 1. Exact Background Stylized Typography: Header-Menu Style Staggered Lateral Appearance */}
          <div className="block2-typography" aria-hidden="true">
            {SLIDES.map((slide, slideIdx) => {
              const isCurrent = isEntered && slideIdx === safeActiveIndex;
              const isPast = isEntered && slideIdx < safeActiveIndex;
              const statusClass = isCurrent ? 'is-active' : isPast ? 'is-past' : 'is-future';

              return (
                <div
                  key={slide.id}
                  className={`block2-typography-layer ${statusClass}`}
                  aria-hidden={!isCurrent}
                >
                  {slide.words.map((word, wordIdx) => {
                    const delayIn = 200 + wordIdx * 100; // 200ms, 300ms, 400ms, 500ms (starts after past word fades)
                    const currentDelay = isCurrent ? `${delayIn}ms` : '0ms';

                    return (
                      <span
                        key={wordIdx}
                        className={`block2-word ${word.accent ? 'word-accent' : ''} ${statusClass}`}
                        style={{
                          color: word.color,
                          left: word.left,
                          top: word.top,
                          transitionDelay: currentDelay,
                        }}
                      >
                        {word.text}
                      </span>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* 2. Floating Image Layers: True burst-out from behind phone & disperse off-screen */}
          <div className="block2-floating-layers" aria-hidden="true">
            {SLIDES.map((slide, slideIdx) => {
              const isCurrent = isEntered && slideIdx === safeActiveIndex;
              const isPast = isEntered && slideIdx < safeActiveIndex;
              const statusClass = isCurrent ? 'is-active' : isPast ? 'is-past' : 'is-future';

              return (
                <div
                  key={slide.id}
                  className={`block2-floating-set slide-${slide.id} ${statusClass}`}
                >
                  {slide.images.map((img, imgIdx) => {
                    const delayIn = img.delayIn ?? (imgIdx * 240 + 60);
                    const delayOut = img.delayOut ?? (imgIdx * 150);
                    const currentDelay = isCurrent ? `${delayIn}ms` : isPast ? `${delayOut}ms` : '0ms';

                    const chanIdx = imgIdx % 4;

                    return (
                      <div
                        key={imgIdx}
                        className={`block2-floating-item ${img.className} ${statusClass}`}
                        style={{
                          ...img.style,
                          '--target-opacity': img.style.opacity ?? 1,
                          '--dx-in': `${img.dxIn}px`,
                          '--dy-in': `${img.dyIn}px`,
                          '--dx-out': `${img.dxOut}px`,
                          '--dy-out': `${img.dyOut}px`,
                          '--rot-in': `${img.rotIn ?? 0}deg`,
                          '--rot-out': `${img.rotOut ?? 0}deg`,
                          '--scale-in': `${img.scaleIn ?? 0.15}`,
                          '--scale-out': `${img.scaleOut ?? 1.15}`,
                          transitionDelay: currentDelay,
                        } as React.CSSProperties}
                      >
                        <div className={`block2-floating-parallax-wrap p-chan-${chanIdx}`}>
                          <img
                            src={img.src}
                            alt={img.alt}
                            className="block2-floating-img"
                            loading={slideIdx <= 1 ? 'eager' : 'lazy'}
                            decoding="async"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* 3. Top-Right Info Feature Card with Smooth Dynamic Height & Layered Staggered Lateral Reveal */}
          <article
            className={`block2-info-card ${isEntered ? 'is-active' : 'is-future'}`}
          >
            <div
              className="block2-card-content"
              style={{ height: contentHeight ? `${contentHeight}px` : undefined }}
            >
              {SLIDES.map((slide, slideIdx) => {
                const isCurrent = isEntered && slideIdx === safeActiveIndex;
                const isPast = isEntered && slideIdx < safeActiveIndex;
                const statusClass = isCurrent ? 'is-active' : isPast ? 'is-past' : 'is-future';

                const titleWords = slide.title.trim().split(/\s+/);
                const descWords = slide.description.trim().split(/\s+/);

                return (
                  <div
                    key={slide.id}
                    ref={(el) => {
                      slideLayersRef.current[slideIdx] = el;
                    }}
                    className={`block2-card-slide-layer ${statusClass}`}
                    aria-hidden={!isCurrent}
                  >
                    <div className="block2-card-title-wrap">
                      <h2 className="block2-card-title">
                        {titleWords.map((word, wIdx) => {
                          const delayIn = 200 + wIdx * 70; // 200ms, 270ms, 340ms, 410ms
                          const currentDelay = isCurrent ? `${delayIn}ms` : '0ms';

                          return (
                            <React.Fragment key={wIdx}>
                              <span
                                className={`block2-card-word ${statusClass}`}
                                style={{ transitionDelay: currentDelay }}
                              >
                                {word}
                              </span>
                              {wIdx < titleWords.length - 1 ? ' ' : ''}
                            </React.Fragment>
                          );
                        })}
                      </h2>
                    </div>
                    <div className="block2-card-desc-wrap">
                      <p className="block2-card-description">
                        {descWords.map((dword, dwIdx) => {
                          const dDelayIn = 200 + (titleWords.length * 70) + (dwIdx * 14);
                          const currentDDelay = isCurrent ? `${dDelayIn}ms` : '0ms';

                          return (
                            <React.Fragment key={dwIdx}>
                              <span
                                className={`block2-card-desc-word ${statusClass}`}
                                style={{ transitionDelay: currentDDelay }}
                              >
                                {dword}
                              </span>
                              {dwIdx < descWords.length - 1 ? ' ' : ''}
                            </React.Fragment>
                          );
                        })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 5 Progress / Feature Step Bars with Loading Animation */}
            <div className="block2-progress-bars" aria-label={`Слайд ${safeActiveIndex + 1} из 5`}>
              {SLIDES.map((_, idx) => {
                let fillPercent = 0;
                if (idx < safeActiveIndex) {
                  fillPercent = 100;
                } else if (idx === safeActiveIndex) {
                  fillPercent = Math.min(Math.max(slideProgress * 100, 0), 100);
                } else {
                  fillPercent = 0;
                }

                return (
                  <button
                    type="button"
                    key={idx}
                    className={`block2-progress-seg ${idx === safeActiveIndex ? 'active' : ''} ${idx < safeActiveIndex ? 'filled' : ''}`}
                    onClick={() => onSelectSlide?.(idx)}
                    aria-label={`Перейти к шагу ${idx + 1}`}
                  >
                    <span
                      className="block2-progress-fill"
                      style={{ width: `${fillPercent}%` }}
                    />
                  </button>
                );
              })}
            </div>
          </article>
        </div>
      </div>
    </section>
  );
};

export default ChatsBlockSection;
