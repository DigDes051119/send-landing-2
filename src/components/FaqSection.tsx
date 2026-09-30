import React, { useEffect, useRef, useState, useCallback } from 'react';
import Matter from 'matter-js';
import { animate, cubicBezier } from 'animejs';

export interface FaqCapsuleData {
  id: string;
  text: string;
  fullQuestion: string;
  answer: string;
  width: number;
  height: number;
  floatingX: number;
  floatingY: number;
  floatingAngle: number;
  floorX: number;
  floorY: number;
  floorAngle: number;
}

// Capsule dimensions, coordinates and authentic Q&A from Figma block-2-1
const DESKTOP_CAPSULES: FaqCapsuleData[] = [
  {
    id: 'capsule-1',
    text: 'Узнает ли собеседник, если',
    fullQuestion: 'Узнает ли собеседник, если я заблокирую его или добавлю в чёрный список?',
    answer: 'Нет, блокировка происходит абсолютно бесшумно. Заблокированный пользователь не получает никаких уведомлений: для него ваши аватар и статус просто перестают обновляться, а новые сообщения перестают доставляться',
    width: 354,
    height: 64,
    floatingX: 430,
    floatingY: 280,
    floatingAngle: -0.06,
    floorX: 233,
    floorY: 992,
    floorAngle: 0,
  },
  {
    id: 'capsule-2',
    text: 'Увидят ли посторонние текст сообщения',
    fullQuestion: 'Увидят ли посторонние текст сообщения в push-уведомлении?',
    answer: 'Текст и имя отправителя можно полностью скрыть в настройках приватности. Уведомление на заблокированном экране покажет лишь факт нового сообщения без раскрытия личной информации',
    width: 504,
    height: 64,
    floatingX: 1470,
    floatingY: 270,
    floatingAngle: 0.05,
    floorX: 549,
    floorY: 954,
    floorAngle: -0.17, // ~ -9.8°
  },
  {
    id: 'capsule-3',
    text: 'Синхронизируются ли недописанные',
    fullQuestion: 'Синхронизируются ли недописанные сообщения (черновики)?',
    answer: 'Да, черновики мгновенно и безопасно синхронизируются в зашифрованном виде. Вы можете начать набирать ответ на телефоне и закончить на компьютере',
    width: 465,
    height: 64,
    floatingX: 380,
    floatingY: 480,
    floatingAngle: 0.04,
    floorX: 731,
    floorY: 886,
    floorAngle: -0.035, // ~ -2°
  },
  {
    id: 'capsule-4',
    text: 'Что происходит с сообщением',
    fullQuestion: 'Что происходит с сообщением после того, как я нажму «Удалить у всех»?',
    answer: 'Сообщение безвозвратно стирается на всех устройствах участников диалога и серверах без возможности восстановления и без сохранения следов',
    width: 372,
    height: 64,
    floatingX: 1530,
    floatingY: 470,
    floatingAngle: -0.05,
    floorX: 993,
    floorY: 931,
    floorAngle: -0.42, // ~ -24°
  },
  {
    id: 'capsule-5',
    text: 'Если кто-то перешлёт моё сообщение в другой чат',
    fullQuestion: 'Если кто-то перешлёт моё сообщение в другой чат, будет ли виден мой профиль?',
    answer: 'Вы можете отключить ссылку на свой аккаунт при пересылке. В таком случае получатели увидят только текст, но не смогут перейти в ваш профиль',
    width: 620,
    height: 64,
    floatingX: 540,
    floatingY: 690,
    floatingAngle: -0.04,
    floorX: 1304,
    floorY: 946,
    floorAngle: -0.15, // ~ -8.6°
  },
  {
    id: 'capsule-6',
    text: 'Что делать, если я потеряю телефон',
    fullQuestion: 'Что делать, если я потеряю телефон с установленным приложением?',
    answer: 'Вы можете мгновенно завершить активные сессии с любого другого авторизованного устройства или через веб-версию, защитив доступ к переписке',
    width: 454,
    height: 64,
    floatingX: 1410,
    floatingY: 680,
    floatingAngle: 0.06,
    floorX: 1637,
    floorY: 992,
    floorAngle: 0,
  },
];

export const FaqSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const capsuleRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [scale, setScale] = useState(1);
  const [isMobile, setIsMobile] = useState(false);

  const engineRef = useRef<Matter.Engine | null>(null);
  const runnerRef = useRef<Matter.Runner | null>(null);
  const bodiesRef = useRef<Matter.Body[]>([]);
  const constraintRef = useRef<Matter.Constraint | null>(null);
  const draggedIndexRef = useRef<number | null>(null);
  const currentCapsulesRef = useRef<FaqCapsuleData[]>(DESKTOP_CAPSULES);
  const boundsRef = useRef({ left: 32, right: 1888, top: 20, bottom: 1024 });

  const [isTitleVisible, setIsTitleVisible] = useState(false);
  const [isPhysicsActive, setIsPhysicsActive] = useState(false);
  const isPhysicsActiveRef = useRef(false);
  const [expandedCapsuleId, setExpandedCapsuleId] = useState<string | null>(null);
  const animatingIndexRef = useRef<number | null>(null);
  const morphCardRef = useRef<HTMLDivElement>(null);
  const morphCapsuleViewRef = useRef<HTMLDivElement>(null);
  const morphFullViewRef = useRef<HTMLDivElement>(null);
  const morphQuestionRef = useRef<HTMLHeadingElement>(null);
  const morphAnswerRef = useRef<HTMLParagraphElement>(null);
  const morphCapTextRef = useRef<HTMLSpanElement>(null);
  const morphGlowRef = useRef<HTMLDivElement>(null);

  const closingCardRef = useRef<HTMLDivElement>(null);
  const closingCapsuleViewRef = useRef<HTMLDivElement>(null);
  const closingFullViewRef = useRef<HTMLDivElement>(null);
  const closingQuestionRef = useRef<HTMLHeadingElement>(null);
  const closingAnswerRef = useRef<HTMLParagraphElement>(null);
  const closingCapTextRef = useRef<HTMLSpanElement>(null);
  const closingGlowRef = useRef<HTMLDivElement>(null);
  const closingIndexRef = useRef<number | null>(null);
  const closingTimeoutRef = useRef<number | null>(null);
  const collapseTimeoutRef = useRef<number | null>(null);
  const isCollapsingRef = useRef(false);

  const morphStartInfoRef = useRef<{
    idx: number;
    startX: number;
    startY: number;
    startW: number;
    startH: number;
    startAngle: number;
    startRadius: number;
    targetX: number;
    targetY: number;
    targetW: number;
    targetH: number;
    targetRadius: number;
  } | null>(null);

  const currentFloatingPosRef = useRef<{ x: number; y: number; angle: number }[]>([]);
  const isReturningRef = useRef(false);
  const returnStartPosRef = useRef<{ x: number; y: number; angle: number }[]>([]);
  const returnStartTimeRef = useRef(0);
  const entranceProgressRef = useRef(0);
  const isTeleportingToFaqRef = useRef(false);

  const titleWrapRef = useRef<HTMLDivElement>(null);
  const liquidContainerRef = useRef<HTMLDivElement>(null);
  const emblemRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);
  const dropletsRef = useRef<HTMLDivElement>(null);
  const turbRef = useRef<SVGFETurbulenceElement>(null);
  const dispRef = useRef<SVGFEDisplacementMapElement>(null);
  const blurRef = useRef<SVGFEGaussianBlurElement>(null);
  const matrixRef = useRef<SVGFEColorMatrixElement>(null);
  const tlRef = useRef<any>(null);
  const progressRef = useRef<{ value: number }>({ value: 0 });
  const hasEnteredRef = useRef(false);

  // Pure continuous frame renderer driven by progress p in [0..1]
  const renderFrame = useCallback((p: number) => {
    const emblem = emblemRef.current;
    const text = textRef.current;
    const dropletsWrap = dropletsRef.current;
    const disp = dispRef.current;
    const blur = blurRef.current;
    const matrix = matrixRef.current;

    if (!emblem || !text || !dropletsWrap || !disp || !blur || !matrix) return;

    const fluidBody = dropletsWrap.children[0] as HTMLElement | undefined;

    // 1. Continuous Parabolic Fluid Wave (peaks at p = 0.5)
    const fluidIntensity = Math.sin(p * Math.PI);

    // 2. Liquid Surface Tension & Viscous Gooey Filter
    const dispScale = 22 * fluidIntensity;
    disp.setAttribute('scale', dispScale.toFixed(2));

    const blurAmount = 10 * fluidIntensity;
    blur.setAttribute('stdDeviation', blurAmount.toFixed(2));

    if (fluidIntensity > 0.03) {
      const alphaMul = 1 + 18 * fluidIntensity;
      const alphaSub = -9 * fluidIntensity;
      matrix.setAttribute(
        'values',
        `1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 ${alphaMul.toFixed(1)} ${alphaSub.toFixed(1)}`
      );
    } else {
      matrix.setAttribute('values', '1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0');
    }

    // 3. Continuous Emblem Liquefaction & Melting (p: 0 -> 1 melts away; p: 1 -> 0 coalesces back)
    const emblemScaleX = 1 + 1.8 * p;
    const emblemScaleY = 1 - 0.25 * fluidIntensity;
    const emblemOpacity = Math.cos(p * Math.PI * 0.5);
    emblem.style.transform = `translate(-50%, -50%) scale(${emblemScaleX.toFixed(3)}, ${emblemScaleY.toFixed(3)})`;
    emblem.style.opacity = emblemOpacity.toFixed(3);

    // 4. Continuous Connecting Fluid Mass
    if (fluidBody) {
      const bridgeScaleX = 0.5 + 1.5 * p;
      const bridgeScaleY = 1 - 0.15 * fluidIntensity;
      const bridgeOpacity = 0.8 * fluidIntensity;
      fluidBody.style.transform = `translate(-50%, -50%) scale(${bridgeScaleX.toFixed(3)}, ${bridgeScaleY.toFixed(3)})`;
      fluidBody.style.opacity = bridgeOpacity.toFixed(3);
    }

    // 5. Continuous FAQ Typography Materialization (Constant optical energy)
    const textOpacity = Math.sin(p * Math.PI * 0.5);
    const textScale = 0.94 + 0.06 * p;
    text.style.transform = `translate(-50%, -50%) scale(${textScale.toFixed(3)})`;
    text.style.opacity = textOpacity.toFixed(3);

    // 6. Consistent Brand Blue Color (#3063F7)
    const currentColor = '#3063F7';
    emblem.style.color = currentColor;
    if (fluidBody) fluidBody.style.backgroundColor = currentColor;
  }, []);

  // Forward Morph Animation (Send Emblem -> Liquid Wave -> FAQ)
  const playForward = useCallback(() => {
    if (tlRef.current) tlRef.current.pause();

    const currentP = progressRef.current.value;
    const remaining = 1 - currentP;
    if (remaining <= 0.001) return;

    const anim = animate(progressRef.current, {
      value: 1,
      duration: Math.max(350, Math.round(1850 * remaining)),
      ease: cubicBezier(0.4, 0, 0.2, 1),
      onUpdate: () => {
        renderFrame(progressRef.current.value);
      },
      onComplete: () => {
        renderFrame(1);
        if (dispRef.current) dispRef.current.setAttribute('scale', '0');
        if (blurRef.current) blurRef.current.setAttribute('stdDeviation', '0');
        if (matrixRef.current) {
          matrixRef.current.setAttribute('values', '1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0');
        }
      },
    });

    tlRef.current = anim;
  }, [renderFrame]);

  // Reverse Morph Animation (FAQ -> Liquid Wave -> Send Emblem)
  const playReverse = useCallback(() => {
    if (tlRef.current) tlRef.current.pause();

    const currentP = progressRef.current.value;
    if (currentP <= 0.001) return;

    const anim = animate(progressRef.current, {
      value: 0,
      duration: Math.max(350, Math.round(1850 * currentP)),
      ease: cubicBezier(0.4, 0, 0.2, 1),
      onUpdate: () => {
        renderFrame(progressRef.current.value);
      },
      onComplete: () => {
        renderFrame(0);
        if (dispRef.current) dispRef.current.setAttribute('scale', '0');
        if (blurRef.current) blurRef.current.setAttribute('stdDeviation', '0');
        if (matrixRef.current) {
          matrixRef.current.setAttribute('values', '1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0');
        }
      },
    });

    tlRef.current = anim;
  }, [renderFrame]);

  // Initial mount state setup
  useEffect(() => {
    renderFrame(0);
  }, [renderFrame]);

  // Trigger bidirectional liquid morph on scroll in-view and out-of-view
  useEffect(() => {
    if (isTitleVisible) {
      hasEnteredRef.current = true;
      const timer = setTimeout(() => {
        playForward();
      }, 350);

      return () => {
        clearTimeout(timer);
        if (tlRef.current) tlRef.current.pause();
      };
    } else {
      if (hasEnteredRef.current) {
        playReverse();
      }
    }
  }, [isTitleVisible, playForward, playReverse]);


  // Resize and scale handling

  useEffect(() => {
    let rafId: number;

    const updateScale = () => {
      const section = sectionRef.current;
      const stage = stageRef.current;
      if (!section || !stage) return;

      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const mobile = vw < 768;
      setIsMobile(mobile);

      if (!mobile) {
        const STAGE_W = 1920;
        const STAGE_H = 1080;
        const scaleW = vw / STAGE_W;
        const scaleH = vh / STAGE_H;
        const computedScale = Math.min(1, Math.min(scaleW, scaleH));
        setScale(computedScale);
        stage.style.transform = `scale(${computedScale.toFixed(4)})`;
        stage.style.transformOrigin = 'center center';
      } else {
        setScale(1);
        stage.style.removeProperty('transform');
        stage.style.removeProperty('transform-origin');
      }
    };

    const handleResize = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updateScale);
    };

    window.addEventListener('resize', handleResize, { passive: true });
    updateScale();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Trigger physics drop when fully scrolled to Block 4
  const triggerPhysicsDrop = useCallback(() => {
    isPhysicsActiveRef.current = true;
    setIsPhysicsActive(true);
    isReturningRef.current = false;

    // Ensure all capsule DOM elements are fully visible
    capsuleRefs.current.forEach((el) => {
      if (el) el.style.opacity = '1';
    });

    const engine = engineRef.current;
    if (!engine) return;

    engine.gravity.scale = 0.001; // Enable gravity

    const bodies = bodiesRef.current;
    const currentFloating = currentFloatingPosRef.current;
    const capsules = currentCapsulesRef.current;

    bodies.forEach((b, idx) => {
      const cap = capsules[idx];
      const floatPos = currentFloating[idx] || (cap ? { x: cap.floatingX, y: cap.floatingY, angle: cap.floatingAngle } : null);
      if (floatPos) {
        Matter.Body.setPosition(b, { x: floatPos.x, y: floatPos.y });
        Matter.Body.setAngle(b, floatPos.angle);
        const vx = (Math.random() - 0.5) * 1.8;
        const vy = 1.0 + Math.random() * 2.0;
        const vRot = (Math.random() - 0.5) * 0.04;
        Matter.Body.setVelocity(b, { x: vx, y: vy });
        Matter.Body.setAngularVelocity(b, vRot);
        Matter.Sleeping.set(b, false);
      }
    });
  }, []);

  // Return smoothly to floating constellation when scrolling away
  const resetToFloating = useCallback(() => {
    isPhysicsActiveRef.current = false;
    setIsPhysicsActive(false);

    const engine = engineRef.current;
    if (engine) {
      engine.gravity.scale = 0; // Disable gravity while floating
    }

    // Freeze physics bodies so they don't drift or collide during floating
    bodiesRef.current.forEach((b) => {
      Matter.Body.setVelocity(b, { x: 0, y: 0 });
      Matter.Body.setAngularVelocity(b, 0);
      Matter.Sleeping.set(b, true);
    });

    isReturningRef.current = true;
    returnStartPosRef.current = bodiesRef.current.map((b, i) => {
      const cap = currentCapsulesRef.current[i];
      // Guard against displaced/offscreen bodies (-4000 from morph card)
      if (b.position.x < -500 || b.position.y < -500) {
        return {
          x: cap ? cap.floatingX : 960,
          y: cap ? cap.floatingY + 60 : 500,
          angle: cap ? cap.floatingAngle : 0,
        };
      }
      return {
        x: b.position.x,
        y: b.position.y,
        angle: b.angle,
      };
    });
    returnStartTimeRef.current = performance.now();
  }, []);

  // Conclude any in-flight closing card immediately so physics stays consistent
  const finishClosingAnimation = useCallback(() => {
    if (closingTimeoutRef.current) {
      clearTimeout(closingTimeoutRef.current);
      closingTimeoutRef.current = null;
    }
    const closeIdx = closingIndexRef.current;
    if (closeIdx !== null) {
      const card = closingCardRef.current;
      if (card) {
        card.style.display = 'none';
      }
      const closeGlow = closingGlowRef.current;
      if (closeGlow) {
        closeGlow.style.opacity = '0';
      }
      const cap = currentCapsulesRef.current[closeIdx];
      const body = bodiesRef.current[closeIdx];
      const origEl = capsuleRefs.current[closeIdx];
      if (body && cap && engineRef.current) {
        const mobile = window.innerWidth < 768;
        const dropX = mobile ? (window.innerWidth - cap.width) / 2 : 1920 / 2 - cap.width / 2;
        const dropY = mobile ? 220 : 380;
        Matter.Body.setPosition(body, {
          x: dropX + cap.width / 2,
          y: dropY + cap.height / 2,
        });
        body.collisionFilter.mask = 0xFFFFFFFF;
        Matter.Body.setVelocity(body, {
          x: (Math.random() - 0.5) * 2,
          y: 5.5,
        });
        Matter.Sleeping.set(body, false);
      }
      if (origEl) {
        origEl.style.opacity = '1';
      }
      closingIndexRef.current = null;
    }
  }, []);

  // Collapse card back into a capsule and drop onto the other capsules with Matter.js gravity
  const handleCollapse = useCallback(() => {
    const idx = animatingIndexRef.current;
    if (idx === null || isCollapsingRef.current) return;
    const cap = currentCapsulesRef.current[idx];
    const info = morphStartInfoRef.current;
    const card = morphCardRef.current;
    const capView = morphCapsuleViewRef.current;
    const fullView = morphFullViewRef.current;
    if (!cap || !info || !card || !capView || !fullView) {
      animatingIndexRef.current = null;
      setExpandedCapsuleId(null);
      isCollapsingRef.current = false;
      return;
    }

    isCollapsingRef.current = true;

    if (collapseTimeoutRef.current) {
      clearTimeout(collapseTimeoutRef.current);
      collapseTimeoutRef.current = null;
    }

    const mobile = window.innerWidth < 768;
    const startW = info.startW;
    const startH = info.startH;
    const startRadius = info.startRadius;

    // Drop position in mid-air center, above the floor pile
    const dropX = mobile ? (window.innerWidth - startW) / 2 : 1920 / 2 - startW / 2;
    const dropY = mobile ? 220 : 380;
    const dropAngle = (Math.random() - 0.5) * 0.14;

    // Header-menu cubic-bezier(0.16, 1, 0.3, 1) transition: snappy initial velocity with cushioned glide
    card.style.transition =
      'left 480ms cubic-bezier(0.16, 1, 0.3, 1), top 480ms cubic-bezier(0.16, 1, 0.3, 1), width 480ms cubic-bezier(0.16, 1, 0.3, 1), height 480ms cubic-bezier(0.16, 1, 0.3, 1), border-radius 480ms cubic-bezier(0.16, 1, 0.3, 1), transform 480ms cubic-bezier(0.16, 1, 0.3, 1)';
    card.style.left = `${dropX.toFixed(2)}px`;
    card.style.top = `${dropY.toFixed(2)}px`;
    card.style.width = `${startW}px`;
    card.style.height = `${startH}px`;
    card.style.borderRadius = `${startRadius}px`;
    card.style.transform = `rotate(${dropAngle.toFixed(4)}rad)`;

    // Smoothly extinguish ambient backlight glow as card shrinks
    const glow = morphGlowRef.current;
    if (glow) {
      glow.style.transition = 'opacity 350ms cubic-bezier(0.16, 1, 0.3, 1)';
      glow.style.opacity = '0';
    }

    fullView.style.transition = 'opacity 180ms cubic-bezier(0.16, 1, 0.3, 1), transform 200ms cubic-bezier(0.16, 1, 0.3, 1)';
    fullView.style.opacity = '0';
    fullView.style.transform = 'translateY(12px)';

    capView.style.transition = 'opacity 280ms cubic-bezier(0.16, 1, 0.3, 1) 120ms';
    capView.style.opacity = '1';

    collapseTimeoutRef.current = window.setTimeout(() => {
      card.style.display = 'none';
      if (glow) {
        glow.style.opacity = '0';
      }

      const body = bodiesRef.current[idx];
      const origEl = capsuleRefs.current[idx];
      const section = sectionRef.current;
      const rect = section?.getBoundingClientRect();
      const vh = window.innerHeight;
      const isStillInFaq = rect && rect.top <= 60 && rect.bottom >= vh * 0.35;

      if (body && engineRef.current) {
        Matter.Body.setPosition(body, {
          x: dropX + startW / 2,
          y: dropY + startH / 2,
        });
        Matter.Body.setAngle(body, dropAngle);
        body.collisionFilter.mask = 0xFFFFFFFF; // Full collisions restored

        if (isStillInFaq && isPhysicsActiveRef.current) {
          Matter.Body.setVelocity(body, {
            x: (Math.random() - 0.5) * 2.2,
            y: 5.5, // Natural downward drop velocity onto pile
          });
          Matter.Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.08);
          Matter.Sleeping.set(body, false);

          // Ensure gravity is running
          engineRef.current.gravity.scale = 0.001;
        } else {
          // If scrolled away/floating, smoothly settle without gravity drop
          Matter.Body.setVelocity(body, { x: 0, y: 0 });
          Matter.Body.setAngularVelocity(body, 0);
        }
      }

      if (origEl) {
        origEl.style.opacity = '1';
      }

      isCollapsingRef.current = false;
      animatingIndexRef.current = null;
      setExpandedCapsuleId(null);
    }, 480);
  }, []);

  // Scroll‑triggered collapse that returns the card to its original floating capsule position
  const handleScrollCollapse = useCallback(() => {
    const idx = animatingIndexRef.current;
    if (idx === null || isCollapsingRef.current) return;
    const cap = currentCapsulesRef.current[idx];
    const info = morphStartInfoRef.current;
    const card = morphCardRef.current;
    const capView = morphCapsuleViewRef.current;
    const fullView = morphFullViewRef.current;
    if (!cap || !info || !card || !capView || !fullView) {
      animatingIndexRef.current = null;
      setExpandedCapsuleId(null);
      isCollapsingRef.current = false;
      return;
    }

    isCollapsingRef.current = true;

    if (collapseTimeoutRef.current) {
      clearTimeout(collapseTimeoutRef.current);
      collapseTimeoutRef.current = null;
    }

    // Compute the live floating constellation position with current parallax
    const entranceP = entranceProgressRef.current;
    const parallaxY = (1 - entranceP) * 120;
    const floatLeft = cap.floatingX - cap.width / 2;
    const floatTop = cap.floatingY - cap.height / 2 + parallaxY;
    const mobile = window.innerWidth < 768;
    const capsuleW = mobile ? Math.min(cap.width * 0.65, window.innerWidth - 48) : cap.width;
    const capsuleH = mobile ? 50 : cap.height;
    const capsuleRadius = capsuleH / 2;

    // Animate back to live floating position in the constellation
    card.style.transition =
      'left 480ms cubic-bezier(0.16, 1, 0.3, 1), top 480ms cubic-bezier(0.16, 1, 0.3, 1), width 480ms cubic-bezier(0.16, 1, 0.3, 1), height 480ms cubic-bezier(0.16, 1, 0.3, 1), border-radius 480ms cubic-bezier(0.16, 1, 0.3, 1), transform 480ms cubic-bezier(0.16, 1, 0.3, 1)';
    card.style.left = `${floatLeft.toFixed(2)}px`;
    card.style.top = `${floatTop.toFixed(2)}px`;
    card.style.width = `${capsuleW}px`;
    card.style.height = `${capsuleH}px`;
    card.style.borderRadius = `${capsuleRadius}px`;
    card.style.transform = `rotate(${cap.floatingAngle.toFixed(4)}rad)`;

    const glow = morphGlowRef.current;
    if (glow) {
      glow.style.transition = 'opacity 350ms cubic-bezier(0.16, 1, 0.3, 1)';
      glow.style.opacity = '0';
    }

    fullView.style.transition = 'opacity 180ms cubic-bezier(0.16, 1, 0.3, 1), transform 200ms cubic-bezier(0.16, 1, 0.3, 1)';
    fullView.style.opacity = '0';
    fullView.style.transform = 'translateY(12px)';

    capView.style.transition = 'opacity 280ms cubic-bezier(0.16, 1, 0.3, 1) 120ms';
    capView.style.opacity = '1';

    collapseTimeoutRef.current = window.setTimeout(() => {
      card.style.display = 'none';
      if (glow) {
        glow.style.opacity = '0';
      }

      const body = bodiesRef.current[idx];
      const origEl = capsuleRefs.current[idx];

      if (body && engineRef.current) {
        // Re-compute live parallax at completion time (scroll may have continued)
        const liveP = entranceProgressRef.current;
        const liveParallaxY = (1 - liveP) * 120;
        // Return body to its floating coordinates with current parallax, no gravity/velocity
        Matter.Body.setPosition(body, { x: cap.floatingX, y: cap.floatingY + liveParallaxY });
        Matter.Body.setAngle(body, cap.floatingAngle);
        body.collisionFilter.mask = 0xFFFFFFFF;
        Matter.Body.setVelocity(body, { x: 0, y: 0 });
        Matter.Body.setAngularVelocity(body, 0);
        Matter.Sleeping.set(body, true);
      }

      if (origEl) {
        origEl.style.opacity = '1';
      }

      isCollapsingRef.current = false;
      animatingIndexRef.current = null;
      setExpandedCapsuleId(null);
    }, 480);
  }, []);

  // Expand capsule into center card; if another capsule is open, smoothly collapse it while expanding new one
  const handleExpand = useCallback(
    (idx: number) => {
      // 1. If clicking the currently active capsule, collapse it
      if (animatingIndexRef.current === idx) {
        handleCollapse();
        return;
      }

      if (collapseTimeoutRef.current) {
        clearTimeout(collapseTimeoutRef.current);
        collapseTimeoutRef.current = null;
      }

      const prevIdx = animatingIndexRef.current;
      const cap = currentCapsulesRef.current[idx];
      if (!cap) return;

      // 2. If another capsule is currently open, smoothly collapse it via closingCardRef
      if (prevIdx !== null && prevIdx !== idx) {
        finishClosingAnimation();

        const prevCap = currentCapsulesRef.current[prevIdx];
        const mainCard = morphCardRef.current;
        const closeCard = closingCardRef.current;
        const closeCapView = closingCapsuleViewRef.current;
        const closeFullView = closingFullViewRef.current;

        if (prevCap && mainCard && closeCard && closeCapView && closeFullView) {
          closingIndexRef.current = prevIdx;

          // Populate closing card with previous capsule texts
          if (closingQuestionRef.current) {
            closingQuestionRef.current.textContent = prevCap.fullQuestion || prevCap.text;
          }
          if (closingAnswerRef.current) {
            closingAnswerRef.current.textContent = prevCap.answer;
          }
          if (closingCapTextRef.current) {
            closingCapTextRef.current.textContent = prevCap.text;
          }

          // Initial placement matching main card position
          const comp = window.getComputedStyle(mainCard);
          closeCard.style.transition = 'none';
          closeCard.style.left = mainCard.style.left || comp.left;
          closeCard.style.top = mainCard.style.top || comp.top;
          closeCard.style.width = mainCard.style.width || comp.width;
          closeCard.style.height = mainCard.style.height || comp.height;
          closeCard.style.borderRadius = mainCard.style.borderRadius || comp.borderRadius;
          closeCard.style.transform = mainCard.style.transform || comp.transform;
          closeCard.style.display = 'block';

          const closeGlow = closingGlowRef.current;
          if (closeGlow) {
            closeGlow.style.transition = 'none';
            closeGlow.style.opacity = '1';
          }

          closeFullView.style.transition = 'none';
          closeFullView.style.opacity = '1';
          closeFullView.style.transform = 'translateY(0)';
          closeCapView.style.transition = 'none';
          closeCapView.style.opacity = '0';

          // Force reflow
          void closeCard.offsetWidth;

          // Target drop coordinates for the closing capsule
          const mobile = window.innerWidth < 768;
          const dropA_W = prevCap.width;
          const dropA_H = prevCap.height;
          const dropA_Radius = dropA_H / 2;
          const dropA_X = mobile ? (window.innerWidth - dropA_W) / 2 : 1920 / 2 - dropA_W / 2;
          const dropA_Y = mobile ? 220 : 380;
          const dropA_Angle = (Math.random() - 0.5) * 0.14;

          closeCard.style.transition =
            'left 480ms cubic-bezier(0.16, 1, 0.3, 1), top 480ms cubic-bezier(0.16, 1, 0.3, 1), width 480ms cubic-bezier(0.16, 1, 0.3, 1), height 480ms cubic-bezier(0.16, 1, 0.3, 1), border-radius 480ms cubic-bezier(0.16, 1, 0.3, 1), transform 480ms cubic-bezier(0.16, 1, 0.3, 1)';
          closeCard.style.left = `${dropA_X.toFixed(2)}px`;
          closeCard.style.top = `${dropA_Y.toFixed(2)}px`;
          closeCard.style.width = `${dropA_W}px`;
          closeCard.style.height = `${dropA_H}px`;
          closeCard.style.borderRadius = `${dropA_Radius}px`;
          closeCard.style.transform = `rotate(${dropA_Angle.toFixed(4)}rad)`;

          if (closeGlow) {
            closeGlow.style.transition = 'opacity 350ms cubic-bezier(0.16, 1, 0.3, 1)';
            closeGlow.style.opacity = '0';
          }

          closeFullView.style.transition = 'opacity 180ms cubic-bezier(0.16, 1, 0.3, 1), transform 200ms cubic-bezier(0.16, 1, 0.3, 1)';
          closeFullView.style.opacity = '0';
          closeFullView.style.transform = 'translateY(12px)';

          closeCapView.style.transition = 'opacity 280ms cubic-bezier(0.16, 1, 0.3, 1) 120ms';
          closeCapView.style.opacity = '1';

          closingTimeoutRef.current = window.setTimeout(() => {
            closeCard.style.display = 'none';
            if (closeGlow) {
              closeGlow.style.opacity = '0';
            }

            const prevBody = bodiesRef.current[prevIdx];
            const prevOrigEl = capsuleRefs.current[prevIdx];
            if (prevBody && engineRef.current) {
              Matter.Body.setPosition(prevBody, {
                x: dropA_X + dropA_W / 2,
                y: dropA_Y + dropA_H / 2,
              });
              Matter.Body.setAngle(prevBody, dropA_Angle);
              prevBody.collisionFilter.mask = 0xFFFFFFFF;
              Matter.Body.setVelocity(prevBody, {
                x: (Math.random() - 0.5) * 2.2,
                y: 5.5,
              });
              Matter.Body.setAngularVelocity(prevBody, (Math.random() - 0.5) * 0.08);
              Matter.Sleeping.set(prevBody, false);
            }

            if (prevOrigEl) {
              prevOrigEl.style.opacity = '1';
            }

            closingIndexRef.current = null;
          }, 480);
        }
      }

      // 3. Expand the newly clicked capsule (idx)
      animatingIndexRef.current = idx;
      setExpandedCapsuleId(cap.id);

      const mobile = window.innerWidth < 768;
      let startX = cap.floatingX - cap.width / 2;
      let startY = cap.floatingY - cap.height / 2;
      let startAngle = cap.floatingAngle;

      if (isPhysicsActiveRef.current && bodiesRef.current[idx]) {
        const b = bodiesRef.current[idx];
        startX = b.position.x - cap.width / 2;
        startY = b.position.y - cap.height / 2;
        startAngle = b.angle;
      } else if (currentFloatingPosRef.current[idx]) {
        const fp = currentFloatingPosRef.current[idx];
        startX = fp.x - cap.width / 2;
        startY = fp.y - cap.height / 2;
        startAngle = fp.angle;
      }

      const startW = mobile ? Math.min(cap.width * 0.65, window.innerWidth - 48) : cap.width;
      const startH = mobile ? 50 : cap.height;
      const startRadius = startH / 2;

      const targetW = mobile ? Math.min(1516, window.innerWidth - 32) : 1516;
      const targetH = mobile ? 480 : 648;
      const targetX = mobile ? (window.innerWidth - targetW) / 2 : 202;
      const targetY = mobile ? 80 : 141;
      const targetRadius = mobile ? 36 : 50;

      morphStartInfoRef.current = {
        idx,
        startX,
        startY,
        startW,
        startH,
        startAngle,
        startRadius,
        targetX,
        targetY,
        targetW,
        targetH,
        targetRadius,
      };

      // In Matter.js:
      // Remove collision support from this capsule and wake up resting capsules to tumble down
      const body = bodiesRef.current[idx];
      if (body) {
        body.collisionFilter.mask = 0;
        Matter.Body.setPosition(body, { x: -4000, y: -4000 });
        Matter.Body.setVelocity(body, { x: 0, y: 0 });
      }

      // If physics wasn't active yet, start it so other capsules drop
      if (!isPhysicsActiveRef.current) {
        triggerPhysicsDrop();
      }

      // Wake up and tumble any capsules that were resting on this capsule
      bodiesRef.current.forEach((otherB, otherIdx) => {
        if (otherIdx !== idx && otherIdx !== closingIndexRef.current) {
          Matter.Sleeping.set(otherB, false);
          Matter.Body.setVelocity(otherB, {
            x: otherB.velocity.x,
            y: Math.max(otherB.velocity.y + 1.2, 1.8),
          });
        }
      });

      // Hide original capsule DOM element
      const origEl = capsuleRefs.current[idx];
      if (origEl) {
        origEl.style.opacity = '0';
      }

      const card = morphCardRef.current;
      const capView = morphCapsuleViewRef.current;
      const fullView = morphFullViewRef.current;
      if (!card || !capView || !fullView) return;

      // Update text in morphCardRef
      if (morphQuestionRef.current) {
        morphQuestionRef.current.textContent = cap.fullQuestion || cap.text;
      }
      if (morphAnswerRef.current) {
        morphAnswerRef.current.textContent = cap.answer;
      }
      if (morphCapTextRef.current) {
        morphCapTextRef.current.textContent = cap.text;
      }

      // Step 1: Set to initial capsule position with no transition
      card.style.transition = 'none';
      card.style.display = 'block';
      card.style.left = `${startX.toFixed(2)}px`;
      card.style.top = `${startY.toFixed(2)}px`;
      card.style.width = `${startW}px`;
      card.style.height = `${startH}px`;
      card.style.borderRadius = `${startRadius}px`;
      card.style.transform = `rotate(${startAngle.toFixed(4)}rad)`;

      const glow = morphGlowRef.current;
      if (glow) {
        glow.style.transition = 'none';
        glow.style.opacity = '0';
      }

      capView.style.transition = 'none';
      capView.style.opacity = '1';

      fullView.style.transition = 'none';
      fullView.style.opacity = '0';
      fullView.style.transform = 'translateY(16px)';

      // Force layout reflow so the starting state is committed
      void card.offsetWidth;

      // Step 2: Animate with exact header-menu curve cubic-bezier(0.16, 1, 0.3, 1) over 700ms
      card.style.transition =
        'left 700ms cubic-bezier(0.16, 1, 0.3, 1), top 700ms cubic-bezier(0.16, 1, 0.3, 1), width 700ms cubic-bezier(0.16, 1, 0.3, 1), height 700ms cubic-bezier(0.16, 1, 0.3, 1), border-radius 700ms cubic-bezier(0.16, 1, 0.3, 1), transform 700ms cubic-bezier(0.16, 1, 0.3, 1)';
      card.style.left = `${targetX.toFixed(2)}px`;
      card.style.top = `${targetY.toFixed(2)}px`;
      card.style.width = `${targetW}px`;
      card.style.height = `${targetH}px`;
      card.style.borderRadius = `${targetRadius}px`;
      card.style.transform = 'rotate(0rad)';

      if (glow) {
        glow.style.transition = 'opacity 550ms cubic-bezier(0.16, 1, 0.3, 1) 120ms';
        glow.style.opacity = '1';
      }

      capView.style.transition = 'opacity 240ms cubic-bezier(0.16, 1, 0.3, 1)';
      capView.style.opacity = '0';

      fullView.style.transition =
        'opacity 450ms cubic-bezier(0.16, 1, 0.3, 1) 150ms, transform 500ms cubic-bezier(0.16, 1, 0.3, 1) 150ms';
      fullView.style.opacity = '1';
      fullView.style.transform = 'translateY(0px)';
    },
    [triggerPhysicsDrop, handleCollapse, finishClosingAnimation]
  );

  useEffect(() => {
    return () => {
      if (collapseTimeoutRef.current) clearTimeout(collapseTimeoutRef.current);
      if (closingTimeoutRef.current) clearTimeout(closingTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCollapse();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleCollapse]);

  // Scroll listener: bottom-up parallax for title/symbol, morph trigger, and physics trigger
  useEffect(() => {
    const section = sectionRef.current;
    const titleWrap = titleWrapRef.current;
    if (!section) return;

    const handleScroll = () => {
      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight;

      // Normalized entrance progress: 0 when rect.top = vh, 1 when rect.top <= 0
      const entranceP = Math.min(Math.max((vh - rect.top) / vh, 0), 1);
      entranceProgressRef.current = entranceP;

      // 1. Parallax Bottom-Up for Symbol and Title
      if (titleWrap) {
        const titleParallaxY = (1 - entranceP) * 180;
        const titleOpacity = Math.min(Math.max((entranceP - 0.1) * 2.4, 0), 1);
        titleWrap.style.transform = `translate(-50%, calc(-50% + ${titleParallaxY.toFixed(1)}px))`;
        titleWrap.style.opacity = titleOpacity.toFixed(3);
      }

      // 2. Trigger Morphing & AI Thinking Shimmer as title approaches (entranceP >= 0.38)
      if (entranceP >= 0.38 && rect.bottom > vh * 0.1) {
        setIsTitleVisible(true);
      } else if (entranceP < 0.22 || rect.bottom <= 0) {
        setIsTitleVisible(false);
      }

      // 3. Trigger Physics Drop when fully scrolled to 4th block (rect.top <= 40px)
      if (rect.top <= 40 && rect.bottom >= vh * 0.35) {
        if (!isPhysicsActiveRef.current && !isTeleportingToFaqRef.current) {
          triggerPhysicsDrop();
        }
      } else if (rect.top > 80) {
        if (isPhysicsActiveRef.current && !isTeleportingToFaqRef.current) {
          resetToFloating();
        }
      }

      // 4. Automatically close expanded card when scrolling up (leaving 4th block) or scrolling past it
      if (rect.top > 70 || rect.bottom <= vh * 0.15) {
        if (animatingIndexRef.current !== null && !isCollapsingRef.current) {
          handleScrollCollapse();
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    const lenis = (window as any).lenis;
    if (lenis) {
      lenis.on('scroll', handleScroll);
    }
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (lenis) {
        lenis.off('scroll', handleScroll);
      }
    };
  }, [triggerPhysicsDrop, resetToFloating, handleScrollCollapse]);

  // Listen for instant teleport navigation to FAQ
  useEffect(() => {
    const handleTeleportToFaq = () => {
      isTeleportingToFaqRef.current = true;
      resetToFloating();
      setIsTitleVisible(true);
      if (titleWrapRef.current) {
        titleWrapRef.current.style.transform = 'translate(-50%, -50%)';
        titleWrapRef.current.style.opacity = '1';
      }
      capsuleRefs.current.forEach((el) => {
        if (el) el.style.opacity = '1';
      });

      // Once the white flash starts clearing, trigger the dynamic physics drop
      setTimeout(() => {
        isTeleportingToFaqRef.current = false;
        triggerPhysicsDrop();
      }, 180);
    };

    window.addEventListener('teleport-to-faq', handleTeleportToFaq);
    return () => window.removeEventListener('teleport-to-faq', handleTeleportToFaq);
  }, [resetToFloating, triggerPhysicsDrop]);

  // Continuous chaotic floating RAF loop around FAQ symbol & title
  useEffect(() => {
    let rafId: number;

    const updateFloating = () => {
      if (!isPhysicsActiveRef.current) {
        const now = performance.now();
        const t = now * 0.001;
        const entranceP = entranceProgressRef.current;
        const capsules = currentCapsulesRef.current;

        const parallaxY = (1 - entranceP) * 120;

        if (isReturningRef.current) {
          const elapsed = (now - returnStartTimeRef.current) / 480;
          const progress = Math.min(Math.max(elapsed, 0), 1);
          // Snappy smooth cubic-bezier(0.16, 1, 0.3, 1) ease
          const easeOut = 1 - Math.pow(1 - progress, 3);

          capsules.forEach((cap, i) => {
            if (animatingIndexRef.current === i || closingIndexRef.current === i) return;
            const start = returnStartPosRef.current[i] || { x: cap.floorX, y: cap.floorY, angle: cap.floorAngle };

            const freq1 = 0.72 + i * 0.13;
            const freq2 = 1.15 + i * 0.17;
            const phase = i * 1.05;

            const noiseX = Math.sin(t * freq1 + phase) * 11 + Math.cos(t * freq2 * 0.5 + phase * 1.5) * 5;
            const noiseY = Math.cos(t * freq1 * 0.9 + phase * 1.2) * 13 + Math.sin(t * freq2 * 0.6 + phase) * 6;
            const noiseRot = Math.sin(t * (freq1 * 0.7) + phase * 2) * 0.035;

            const targetX = cap.floatingX + noiseX;
            const targetY = cap.floatingY + noiseY + parallaxY;
            const targetAngle = cap.floatingAngle + noiseRot;

            const curX = start.x + (targetX - start.x) * easeOut;
            const curY = start.y + (targetY - start.y) * easeOut;
            const curAngle = start.angle + (targetAngle - start.angle) * easeOut;

            currentFloatingPosRef.current[i] = { x: curX, y: curY, angle: curAngle };

            const el = capsuleRefs.current[i];
            if (el) {
              const halfW = cap.width / 2;
              const halfH = cap.height / 2;
              el.style.transform = `translate3d(${(curX - halfW).toFixed(2)}px, ${(curY - halfH).toFixed(2)}px, 0) rotate(${curAngle.toFixed(4)}rad)`;
              el.style.opacity = '1';
            }
          });

          if (progress >= 1) {
            isReturningRef.current = false;
          }
        } else {
          // Organic chaotic floating around symbol & heading
          capsules.forEach((cap, i) => {
            if (animatingIndexRef.current === i || closingIndexRef.current === i) return;
            const freq1 = 0.72 + i * 0.13;
            const freq2 = 1.15 + i * 0.17;
            const phase = i * 1.05;

            const noiseX = Math.sin(t * freq1 + phase) * 11 + Math.cos(t * freq2 * 0.5 + phase * 1.5) * 5;
            const noiseY = Math.cos(t * freq1 * 0.9 + phase * 1.2) * 13 + Math.sin(t * freq2 * 0.6 + phase) * 6;
            const noiseRot = Math.sin(t * (freq1 * 0.7) + phase * 2) * 0.035;

            const curX = cap.floatingX + noiseX;
            const curY = cap.floatingY + noiseY + parallaxY;
            const curAngle = cap.floatingAngle + noiseRot;

            currentFloatingPosRef.current[i] = { x: curX, y: curY, angle: curAngle };

            const el = capsuleRefs.current[i];
            if (el) {
              const halfW = cap.width / 2;
              const halfH = cap.height / 2;
              const opacity = Math.min(Math.max((entranceP - 0.08) * 2.5, 0), 1);
              el.style.transform = `translate3d(${(curX - halfW).toFixed(2)}px, ${(curY - halfH).toFixed(2)}px, 0) rotate(${curAngle.toFixed(4)}rad)`;
              el.style.opacity = opacity.toFixed(3);
            }
          });
        }
      }

      rafId = requestAnimationFrame(updateFloating);
    };

    rafId = requestAnimationFrame(updateFloating);

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, []);

  // Matter.js Physics Setup with Site Grid Boundaries
  useEffect(() => {
    const { Engine, Runner, Bodies, Composite, Events, Body, Sleeping } = Matter;

    const engine = Engine.create({
      gravity: { x: 0, y: 1.1, scale: 0 },
      enableSleeping: false,
    });
    engineRef.current = engine;

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const mobile = vw < 768;

    const stageW = mobile ? vw : 1920;
    const stageH = mobile ? Math.max(vh, 600) : 1080;

    // Site Grid Margins: 32px on desktop (matching 2rem site grid / key-advantages / header), 16px on mobile
    const gridLeft = mobile ? 16 : 32;
    const gridRight = mobile ? stageW - 16 : stageW - 32;
    const floorY = mobile ? stageH - 30 : 1024; // In Figma, bottom of capsules sit at 1024px
    const ceilingY = 10;

    boundsRef.current = { left: gridLeft, right: gridRight, top: ceilingY, bottom: floorY };

    // 1000px Ultra-thick static boundaries: impossible to penetrate or tunnel through
    const WALL_THICKNESS = 1000;

    const floor = Bodies.rectangle(
      stageW / 2,
      floorY + WALL_THICKNESS / 2,
      stageW * 4,
      WALL_THICKNESS,
      {
        isStatic: true,
        friction: 0.9,
        restitution: 0.15,
      }
    );

    const ceiling = Bodies.rectangle(
      stageW / 2,
      ceilingY - WALL_THICKNESS / 2,
      stageW * 4,
      WALL_THICKNESS,
      {
        isStatic: true,
        restitution: 0.2,
      }
    );

    const leftWall = Bodies.rectangle(
      gridLeft - WALL_THICKNESS / 2,
      stageH / 2,
      WALL_THICKNESS,
      stageH * 4,
      {
        isStatic: true,
        friction: 0.7,
        restitution: 0.25,
      }
    );

    const rightWall = Bodies.rectangle(
      gridRight + WALL_THICKNESS / 2,
      stageH / 2,
      WALL_THICKNESS,
      stageH * 4,
      {
        isStatic: true,
        friction: 0.7,
        restitution: 0.25,
      }
    );

    Composite.add(engine.world, [floor, ceiling, leftWall, rightWall]);

    // Create Capsule Rigid Bodies
    const capsules: FaqCapsuleData[] = mobile
      ? DESKTOP_CAPSULES.map((cap, i) => {
          const mobW = Math.min(cap.width * 0.65, vw - 48);
          const mobH = 50;
          const mobFloatingYs = [
            stageH * 0.16,
            stageH * 0.24,
            stageH * 0.54,
            stageH * 0.62,
            stageH * 0.70,
            stageH * 0.78,
          ];
          const mobFloatingXs = [
            vw / 2 - 25,
            vw / 2 + 20,
            vw / 2 - 20,
            vw / 2 + 25,
            vw / 2 - 15,
            vw / 2 + 20,
          ];
          return {
            ...cap,
            width: mobW,
            height: mobH,
            floatingX: mobFloatingXs[i] || vw / 2,
            floatingY: mobFloatingYs[i] || stageH * 0.5,
            floatingAngle: (i % 2 === 0 ? -1 : 1) * 0.04,
            floorX: vw / 2 + (Math.random() - 0.5) * 60,
            floorY: floorY - 50 - i * 60,
            floorAngle: (Math.random() - 0.5) * 0.2,
          };
        })
      : DESKTOP_CAPSULES;

    currentCapsulesRef.current = capsules;

    const bodies: Matter.Body[] = [];
    capsules.forEach((cap) => {
      const body = Bodies.rectangle(cap.floatingX, cap.floatingY, cap.width, cap.height, {
        chamfer: { radius: cap.height / 2 },
        angle: cap.floatingAngle,
        restitution: 0.25,
        friction: 0.85,
        frictionAir: 0.02,
        density: 0.0025,
      });
      bodies.push(body);
    });

    bodiesRef.current = bodies;
    Composite.add(engine.world, bodies);

    // Sync DOM elements and ENFORCE strict boundary clamping on every tick (only when physics is active)
    Events.on(engine, 'afterUpdate', () => {
      if (!isPhysicsActiveRef.current) return;
      bodies.forEach((b, idx) => {
        if (animatingIndexRef.current === idx || closingIndexRef.current === idx) return;
        const cap = capsules[idx];
        const halfW = cap.width / 2;
        const halfH = cap.height / 2;

        const minX = gridLeft + halfW;
        const maxX = gridRight - halfW;
        const minY = ceilingY + halfH;
        const maxY = floorY - halfH;

        let clamped = false;
        let nx = b.position.x;
        let ny = b.position.y;
        let vx = b.velocity.x;
        let vy = b.velocity.y;

        // Hard boundary protection: prevent any capsule from leaving the grid width
        if (nx < minX) {
          nx = minX;
          vx = Math.abs(vx) * 0.4;
          clamped = true;
        } else if (nx > maxX) {
          nx = maxX;
          vx = -Math.abs(vx) * 0.4;
          clamped = true;
        }

        if (ny > maxY) {
          ny = maxY;
          vy = -Math.abs(vy) * 0.2;
          clamped = true;
        } else if (ny < minY) {
          ny = minY;
          vy = Math.abs(vy) * 0.4;
          clamped = true;
        }

        if (clamped) {
          Body.setPosition(b, { x: nx, y: ny });
          Body.setVelocity(b, { x: vx, y: vy });
        }

        const el = capsuleRefs.current[idx];
        if (el) {
          const x = (b.position.x - halfW).toFixed(2);
          const y = (b.position.y - halfH).toFixed(2);
          const rot = b.angle.toFixed(4);
          el.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${rot}rad)`;
          el.style.opacity = '1';
        }
      });
    });

    const runner = Runner.create();
    runnerRef.current = runner;
    Runner.run(runner, engine);

    return () => {
      Runner.stop(runner);
      Composite.clear(engine.world, false);
      Engine.clear(engine);
      engineRef.current = null;
      runnerRef.current = null;
      bodiesRef.current = [];
    };
  }, [isMobile]);

  // Pointer Interaction with Strict Clamping to Site Grid Bounds
  const getStagePoint = useCallback(
    (clientX: number, clientY: number) => {
      const stage = stageRef.current;
      if (!stage) return { x: 0, y: 0 };
      const rect = stage.getBoundingClientRect();
      if (isMobile) {
        return {
          x: clientX - rect.left,
          y: clientY - rect.top,
        };
      }
      return {
        x: (clientX - rect.left) / scale,
        y: (clientY - rect.top) / scale,
      };
    },
    [isMobile, scale]
  );

  const releaseDrag = useCallback(() => {
    const engine = engineRef.current;
    if (constraintRef.current && engine) {
      Matter.Composite.remove(engine.world, constraintRef.current);
      constraintRef.current = null;
      draggedIndexRef.current = null;
    }
  }, []);

  const pendingDragRef = useRef<{
    pt: { x: number; y: number };
    hitBody: Matter.Body;
    hitIdx: number;
    startX: number;
    startY: number;
  } | null>(null);

  const wasDraggingRef = useRef(false);

  const handlePointerDown = (e: React.PointerEvent) => {
    const engine = engineRef.current;
    if (!engine || !isPhysicsActiveRef.current) return;

    const pt = getStagePoint(e.clientX, e.clientY);
    const hits = Matter.Query.point(bodiesRef.current, pt);

    if (hits.length > 0) {
      const hitBody = hits[0];
      const hitIdx = bodiesRef.current.indexOf(hitBody);
      pendingDragRef.current = {
        pt,
        hitBody,
        hitIdx,
        startX: e.clientX,
        startY: e.clientY,
      };
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const engine = engineRef.current;
    if (!engine) return;

    // Only initiate drag constraint if pointer moved more than 12px (intentional drag, not a click)
    if (!constraintRef.current && pendingDragRef.current) {
      const dist = Math.hypot(
        e.clientX - pendingDragRef.current.startX,
        e.clientY - pendingDragRef.current.startY
      );
      if (dist > 12) {
        wasDraggingRef.current = true;
        const { pt, hitBody, hitIdx } = pendingDragRef.current;
        draggedIndexRef.current = hitIdx;
        Matter.Sleeping.set(hitBody, false);

        const constraint = Matter.Constraint.create({
          pointA: { x: pt.x, y: pt.y },
          bodyB: hitBody,
          pointB: { x: pt.x - hitBody.position.x, y: pt.y - hitBody.position.y },
          stiffness: 0.18,
          damping: 0.04,
          length: 0,
        });

        constraintRef.current = constraint;
        Matter.Composite.add(engine.world, constraint);
        try {
          (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
        } catch {
          // Safe fallback
        }
      }
    }

    if (constraintRef.current && draggedIndexRef.current !== null) {
      const pt = getStagePoint(e.clientX, e.clientY);
      const cap = currentCapsulesRef.current[draggedIndexRef.current];
      const halfW = cap ? cap.width / 2 : 150;
      const halfH = cap ? cap.height / 2 : 32;

      // Clamp drag target strictly within the site grid boundaries
      const { left, right, top, bottom } = boundsRef.current;
      const clampedX = Math.max(left + halfW, Math.min(right - halfW, pt.x));
      const clampedY = Math.max(top + halfH, Math.min(bottom - halfH, pt.y));

      constraintRef.current.pointA = { x: clampedX, y: clampedY };
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    pendingDragRef.current = null;
    releaseDrag();
    try {
      (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    } catch {
      // Safe fallback
    }
    // Allow click event to process before clearing drag flag
    setTimeout(() => {
      wasDraggingRef.current = false;
    }, 80);
  };

  // Global window release in case cursor exits viewport
  useEffect(() => {
    const handleGlobalUp = () => releaseDrag();
    window.addEventListener('pointerup', handleGlobalUp);
    window.addEventListener('pointercancel', handleGlobalUp);
    return () => {
      window.removeEventListener('pointerup', handleGlobalUp);
      window.removeEventListener('pointercancel', handleGlobalUp);
    };
  }, [releaseDrag]);

  // Collapse expanded card when clicking anywhere in the FAQ block
  const handleSectionClick = useCallback(
    (e: React.MouseEvent) => {
      if (animatingIndexRef.current === null || isCollapsingRef.current) return;

      // Ignore click if user was dragging a physics capsule
      if (wasDraggingRef.current) {
        wasDraggingRef.current = false;
        return;
      }

      // Do not collapse if user was selecting text (e.g. highlighting text to copy)
      const selection = window.getSelection();
      if (selection && selection.toString().trim().length > 0) {
        return;
      }

      // Capsule clicks are handled individually by their own onClick handlers
      const target = e.target as HTMLElement;
      if (target.closest('.faq-capsule')) {
        return;
      }

      handleCollapse();
    },
    [handleCollapse]
  );

  return (
    <section
      className="faq-section"
      id="faq"
      ref={sectionRef}
      onClick={handleSectionClick}
      aria-label="FAQ — Часто задаваемые вопросы"
    >
      <div
        className="faq-stage"
        ref={stageRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {/* Liquid Substance Morphing Title */}
        <div
          ref={titleWrapRef}
          className={`faq-title faq-center-title-wrap ${isTitleVisible ? 'is-visible' : ''} ${expandedCapsuleId ? 'is-hidden' : ''}`}
          aria-hidden={expandedCapsuleId ? 'true' : 'false'}
        >
          <div ref={liquidContainerRef} className="faq-liquid-morph-stage">
            {/* Liquid SVG Filter for Realistic Water Substance & Fluid Surface Tension */}
            <svg className="faq-liquid-svg-filter" aria-hidden="true">
              <defs>
                <filter
                  id="faq-water-substance-filter"
                  x="-60%"
                  y="-60%"
                  width="220%"
                  height="220%"
                  colorInterpolationFilters="sRGB"
                >
                  <feTurbulence
                    ref={turbRef}
                    type="fractalNoise"
                    baseFrequency="0.012 0.024"
                    numOctaves="2"
                    result="water_noise"
                  />
                  <feDisplacementMap
                    ref={dispRef}
                    in="SourceGraphic"
                    in2="water_noise"
                    scale="0"
                    xChannelSelector="R"
                    yChannelSelector="G"
                    result="displaced"
                  />
                  <feGaussianBlur
                    ref={blurRef}
                    in="displaced"
                    stdDeviation="0"
                    result="blurred"
                  />
                  <feColorMatrix
                    ref={matrixRef}
                    in="blurred"
                    mode="matrix"
                    values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0"
                  />
                </filter>
              </defs>
            </svg>

            {/* Attached Send 'S' Emblem (Initial standing symbol in blue #3063F7) */}
            <div ref={emblemRef} className="faq-liquid-emblem-wrap" aria-hidden="true">
              <svg viewBox="0 0 270 340" className="faq-liquid-emblem-svg">
                <path
                  d="M99.8567 18.4839C94.4601 18.4412 88.8695 18.397 83.8314 18.5923C63.2123 19.5305 43.8262 28.6814 29.9973 44.0044C18.1352 57.0433 10.9128 73.6355 9.45243 91.202C9.09993 95.4698 9.02753 100.171 9.12813 104.476C9.24531 109.516 9.18677 114.632 9.12813 119.757C9.04725 126.827 8.96617 133.913 9.3466 140.84C10.5434 162.813 20.5171 183.385 37.0277 197.936C46.6913 206.683 58.2127 212.964 70.6138 216.381L268.481 18.5131L106.494 18.519C104.353 18.5195 102.122 18.5018 99.8567 18.4839Z"
                  fill="currentColor"
                />
                <path
                  d="M0 337.917L195.619 142.298C197.41 140.507 200.039 139.799 202.436 140.618C216.095 145.286 228.645 153.885 238.4 164.854C250.328 178.28 257.593 195.205 259.109 213.101C259.529 218.006 259.548 224.013 259.403 228.998C259.27 233.6 259.347 238.325 259.424 243.059C259.524 249.259 259.625 255.475 259.256 261.454C258.053 283.23 248.144 303.607 231.758 318.002C221.374 327.135 208.82 333.445 195.296 336.329C193.453 336.725 188.384 337.612 186.565 337.495C183.143 338.059 174.398 338.008 168.893 337.976H168.892C167.809 337.97 166.851 337.964 166.084 337.964L0 337.917Z"
                  fill="currentColor"
                />
              </svg>
            </div>

            {/* Continuous Liquid Substance Core Body */}
            <div ref={dropletsRef} className="faq-liquid-droplets" aria-hidden="true">
              <div className="faq-liquid-fluid-body" />
            </div>

            {/* Crisp, authentic FAQ Typography with continuous AI Thinking Shimmer */}
            <h2 ref={textRef} className="faq-liquid-title-text">
              FAQ
            </h2>
          </div>
        </div>

        {/* Dynamic Morphing Card: lifts, expands from capsule, and shrinks back to drop */}
        {(() => {
          const activeCapsule =
            (animatingIndexRef.current !== null
              ? currentCapsulesRef.current[animatingIndexRef.current]
              : null) ||
            currentCapsulesRef.current.find((c) => c.id === expandedCapsuleId) ||
            currentCapsulesRef.current[0];

          return (
            <>
              <div
                ref={morphCardRef}
                className="faq-morph-card"
                style={{ display: 'none' }}
                role="dialog"
                aria-modal="true"
                aria-label={activeCapsule?.fullQuestion || activeCapsule?.text}
              >
                {/* Soft Ambient Blue Backlight */}
                <div ref={morphGlowRef} className="faq-expanded-card-glow" aria-hidden="true" />

                {/* White Card Frame */}
                <div className="faq-expanded-card">
                  {/* Capsule view shown during early expansion / late collapse */}
                  <div ref={morphCapsuleViewRef} className="faq-morph-capsule-view" aria-hidden="true">
                    <span ref={morphCapTextRef} className="faq-capsule-text">
                      {activeCapsule?.text}
                    </span>
                    <div className="faq-capsule-gradient-overlay" />
                  </div>

                  {/* Full card content shown when expanded */}
                  <div ref={morphFullViewRef} className="faq-morph-full-view">
                    <div className="faq-expanded-top">
                      <h3 ref={morphQuestionRef} className="faq-expanded-question">
                        {activeCapsule?.fullQuestion || activeCapsule?.text}
                      </h3>
                      <p ref={morphAnswerRef} className="faq-expanded-answer">
                        {activeCapsule?.answer}
                      </p>
                    </div>

                    <div className="faq-expanded-bottom">
                      <button
                        type="button"
                        className="faq-collapse-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCollapse();
                        }}
                        aria-label="Свернуть ответ"
                      >
                        <span className="faq-collapse-icon" aria-hidden="true">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3D3D3D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </span>
                        <span className="faq-collapse-text">Свернуть</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Graceful Closing Card: folds previous capsule back down when switching */}
              <div
                ref={closingCardRef}
                className="faq-morph-card faq-closing-card"
                style={{ display: 'none' }}
                aria-hidden="true"
              >
                <div ref={closingGlowRef} className="faq-expanded-card-glow" aria-hidden="true" />
                <div className="faq-expanded-card">
                  <div ref={closingCapsuleViewRef} className="faq-morph-capsule-view" aria-hidden="true">
                    <span ref={closingCapTextRef} className="faq-capsule-text" />
                    <div className="faq-capsule-gradient-overlay" />
                  </div>

                  <div ref={closingFullViewRef} className="faq-morph-full-view">
                    <div className="faq-expanded-top">
                      <h3 ref={closingQuestionRef} className="faq-expanded-question" />
                      <p ref={closingAnswerRef} className="faq-expanded-answer" />
                    </div>

                    <div className="faq-expanded-bottom">
                      <div className="faq-collapse-btn" style={{ pointerEvents: 'none' }}>
                        <span className="faq-collapse-icon" aria-hidden="true">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3D3D3D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </span>
                        <span className="faq-collapse-text">Свернуть</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          );
        })()}

        {/* Physics Capsules Layer */}
        <div className="faq-capsules-layer" aria-label="FAQ topics">
          {DESKTOP_CAPSULES.map((cap, idx) => (
            <div
              key={cap.id}
              ref={(el) => (capsuleRefs.current[idx] = el)}
              className="faq-capsule"
              style={{
                width: isMobile ? `min(${cap.width * 0.65}px, calc(100vw - 48px))` : `${cap.width}px`,
                height: isMobile ? '50px' : `${cap.height}px`,
              }}
              tabIndex={0}
              role="button"
              aria-label={cap.text}
              onClick={(e) => {
                e.stopPropagation();
                handleExpand(idx);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleExpand(idx);
                }
              }}
            >
              {/* Soft blue backlight glow sweeping from beginning to end on hover */}
              <div className="faq-capsule-glow" aria-hidden="true" />
              {/* White capsule body */}
              <div className="faq-capsule-body">
                <span className="faq-capsule-text">{cap.text}</span>
                {/* White linear gradient overlay on top of text — Figma Rectangle 161124272 */}
                <div className="faq-capsule-gradient-overlay" aria-hidden="true" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FaqSection;
