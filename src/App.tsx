import React, { useState, useEffect, useRef, useCallback } from 'react';
import Lenis from 'lenis';
import { LoaderCurtain } from './components/LoaderCurtain';
import { SiteHeader } from './components/SiteHeader';
import { HeroSection } from './components/HeroSection';
import { ChatsBlockSection } from './components/ChatsBlockSection';
import { KeyAdvantagesSection } from './components/KeyAdvantagesSection';
import { FaqSection } from './components/FaqSection';
import { InstallSection } from './components/InstallSection';
import { SiteFooter } from './components/SiteFooter';
import { ContactModal } from './components/ContactModal';
import { MenuOverlay } from './components/MenuOverlay';
import { ScrollPrompt } from './components/ScrollPrompt';

interface MobileCardConfig {
  src: string;
  style: React.CSSProperties;
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
  targetOpacity?: number;
}

interface MobileSlideFloating {
  back: MobileCardConfig[];
  front: MobileCardConfig[];
}

const MOBILE_FLOATING_SLIDES: MobileSlideFloating[] = [
  // Slide 0: "Общайтесь легко" (Exact Figma mobile-2 / Node 185:1158 + Desktop Chaotic Flow)
  {
    back: [
      // 1. Bubble top: swoops from bottom-right (dxIn: +200, dyIn: +210)
      {
        src: '/block2-bubble-top.webp',
        style: { left: '-62px', top: '-17px', width: '236px' },
        dxIn: 200,
        dyIn: 210,
        dxOut: -320,
        dyOut: -320,
        rotIn: -3,
        rotOut: -6,
        delayIn: 100,
        delayOut: 0,
      },
      // 3. Search import: swoops from top-right (dxIn: +260, dyIn: -220)
      {
        src: '/block2-search-import.webp',
        style: { left: '-142px', top: '427px', width: '331px' },
        dxIn: 260,
        dyIn: -220,
        dxOut: -360,
        dyOut: 300,
        rotIn: -2,
        rotOut: -5,
        delayIn: 740,
        delayOut: 360,
      },
    ],
    front: [
      // 2. Input bar: shoots across phone from far left (dxIn: -280, dyIn: +50)
      {
        src: '/block2-input-bar.webp',
        style: { left: '156px', top: '74px', width: '314px' },
        dxIn: -280,
        dyIn: 50,
        dxOut: 380,
        dyOut: -80,
        rotIn: 2.5,
        rotOut: 4,
        delayIn: 420,
        delayOut: 180,
      },
      // 4. Location card: swoops from top-left (dxIn: -180, dyIn: -260)
      {
        src: '/block2-location-card.webp',
        style: { left: '134px', top: '257px', width: '323px' },
        dxIn: -180,
        dyIn: -260,
        dxOut: 320,
        dyOut: 360,
        rotIn: 3,
        rotOut: 6,
        delayIn: 1060,
        delayOut: 540,
      },
    ],
  },

  // Slide 1: "Ловите момент" (Desktop Chaotic Action Pattern)
  {
    back: [
      // 1. Bubble: shoots from left-middle (dxIn: -200, dyIn: +60)
      {
        src: '/slide2-bubble.webp',
        style: { left: '150px', top: '70px', width: '245px' },
        dxIn: -200,
        dyIn: 60,
        dxOut: 340,
        dyOut: -120,
        rotIn: 4,
        rotOut: 5,
        delayIn: 80,
        delayOut: 0,
        targetOpacity: 0.55,
      },
      // 3. Audio note: shoots from bottom-right (dxIn: +250, dyIn: +190)
      {
        src: '/slide2-audio.webp',
        style: { left: '-80px', top: '-15px', width: '320px' },
        dxIn: 250,
        dyIn: 190,
        dxOut: -350,
        dyOut: -260,
        rotIn: -2.5,
        rotOut: -5,
        delayIn: 720,
        delayOut: 360,
      },
    ],
    front: [
      // 2. Context menu: shoots from top-right across phone (dxIn: +240, dyIn: -180)
      {
        src: '/slide2-context-menu.webp',
        style: { left: '-95px', top: '215px', width: '310px' },
        dxIn: 240,
        dyIn: -180,
        dxOut: -340,
        dyOut: 260,
        rotIn: -3.5,
        rotOut: -6,
        delayIn: 400,
        delayOut: 180,
      },
      // 4. Tabs: shoots from top-left (dxIn: -260, dyIn: -250)
      {
        src: '/slide2-tabs.webp',
        style: { left: '125px', top: '335px', width: '320px' },
        dxIn: -260,
        dyIn: -250,
        dxOut: 360,
        dyOut: 350,
        rotIn: 2,
        rotOut: 5,
        delayIn: 1040,
        delayOut: 540,
      },
    ],
  },

  // Slide 2: "Делитесь самым важным без ограничений" (Desktop Photo Cascade Pattern)
  {
    back: [
      // 1. Audio note: shoots from bottom-right (dxIn: +250, dyIn: +190)
      {
        src: '/slide3-audio.webp',
        style: { left: '-80px', top: '-15px', width: '320px' },
        dxIn: 250,
        dyIn: 190,
        dxOut: -350,
        dyOut: -260,
        rotIn: -3,
        rotOut: -5,
        delayIn: 80,
        delayOut: 0,
      },
      // 2. Photo 1: shoots from bottom-left (dxIn: -200, dyIn: +200)
      {
        src: '/slide3-photo-1.webp',
        style: { left: '160px', top: '45px', width: '195px' },
        dxIn: -200,
        dyIn: 200,
        dxOut: 320,
        dyOut: -280,
        rotIn: 5,
        rotOut: 8,
        delayIn: 280,
        delayOut: 160,
      },
    ],
    front: [
      // 3. Photo 2: shoots from top-right (dxIn: +180, dyIn: -250)
      {
        src: '/slide3-photo-2.webp',
        style: { left: '-75px', top: '270px', width: '215px' },
        dxIn: 180,
        dyIn: -250,
        dxOut: -300,
        dyOut: 340,
        rotIn: -4,
        rotOut: -7,
        delayIn: 480,
        delayOut: 300,
      },
      // 4. Photo 3: shoots from top-left (dxIn: -190, dyIn: -260)
      {
        src: '/slide3-photo-3.webp',
        style: { left: '125px', top: '315px', width: '225px' },
        dxIn: -190,
        dyIn: -260,
        dxOut: 320,
        dyOut: 360,
        rotIn: 3.5,
        rotOut: 6,
        delayIn: 680,
        delayOut: 440,
      },
    ],
  },

  // Slide 3: "Берегите личное" (Desktop Security Elements Pattern)
  {
    back: [
      // 1. Username card: shoots from bottom-right (dxIn: +260, dyIn: +210)
      {
        src: '/slide4-username.webp',
        style: { left: '-80px', top: '-20px', width: '325px' },
        dxIn: 260,
        dyIn: 210,
        dxOut: -360,
        dyOut: -280,
        rotIn: -3,
        rotOut: -6,
        delayIn: 240,
        delayOut: 0,
      },
      // 3. Country card: shoots from left-middle (dxIn: -260, dyIn: +90)
      {
        src: '/slide4-country.webp',
        style: { left: '145px', top: '55px', width: '300px' },
        dxIn: -260,
        dyIn: 90,
        dxOut: 380,
        dyOut: -140,
        rotIn: 3,
        rotOut: 5,
        delayIn: 760,
        delayOut: 360,
        targetOpacity: 0.55,
      },
    ],
    front: [
      // 2. Phone number: shoots from top-right (dxIn: +240, dyIn: -210)
      {
        src: '/slide4-phone.webp',
        style: { left: '-115px', top: '305px', width: '330px' },
        dxIn: 240,
        dyIn: -210,
        dxOut: -340,
        dyOut: 300,
        rotIn: -2,
        rotOut: -4,
        delayIn: 420,
        delayOut: 180,
      },
      // 4. Voice player: shoots from top-left (dxIn: -250, dyIn: -230)
      {
        src: '/slide4-voice.webp',
        style: { left: '125px', top: '310px', width: '315px' },
        dxIn: -250,
        dyIn: -230,
        dxOut: 350,
        dyOut: 340,
        rotIn: 2.5,
        rotOut: 6,
        delayIn: 1100,
        delayOut: 540,
      },
    ],
  },

  // Slide 4: "Умные уведомления" (Desktop Smart Automation Pattern)
  {
    back: [
      // 1. Plus trigger: shoots from bottom-right (dxIn: +190, dyIn: +200)
      {
        src: '/slide5-plus.webp',
        style: { left: '-35px', top: '-5px', width: '110px' },
        dxIn: 190,
        dyIn: 200,
        dxOut: -280,
        dyOut: -280,
        rotIn: -8,
        rotOut: -12,
        delayIn: 70,
        delayOut: 0,
      },
      // 3. Silent alert: shoots from left-middle (dxIn: -270, dyIn: +70)
      {
        src: '/slide5-silent.webp',
        style: { left: '140px', top: '50px', width: '310px' },
        dxIn: -270,
        dyIn: 70,
        dxOut: 380,
        dyOut: -120,
        rotIn: 2,
        rotOut: 4,
        delayIn: 710,
        delayOut: 360,
      },
    ],
    front: [
      // 2. Toggle switch: shoots from top-left (dxIn: -270, dyIn: -210)
      {
        src: '/slide5-toggle.webp',
        style: { left: '120px', top: '295px', width: '315px' },
        dxIn: -270,
        dyIn: -210,
        dxOut: 380,
        dyOut: 320,
        rotIn: 3.5,
        rotOut: 6,
        delayIn: 390,
        delayOut: 180,
      },
      // 4. Quick message input: shoots from top-right (dxIn: +280, dyIn: -230)
      {
        src: '/slide5-input.webp',
        style: { left: '-115px', top: '315px', width: '330px' },
        dxIn: 280,
        dyIn: -230,
        dxOut: -380,
        dyOut: 320,
        rotIn: -3,
        rotOut: -6,
        delayIn: 1030,
        delayOut: 540,
      },
    ],
  },
];

export const App: React.FC = () => {
  const [ready, setReady] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isStoreDocked, setIsStoreDocked] = useState(false);
  const [lenisInstance, setLenisInstance] = useState<Lenis | null>(null);

  // Block 2 multi-slide state
  const [activeSlide, setActiveSlide] = useState(0);
  const [slideProgress, setSlideProgress] = useState(0);
  const [isBlock2Entered, setIsBlock2Entered] = useState(false);

  const stageRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const block2Ref = useRef<HTMLElement>(null);
  const phoneWrapRef = useRef<HTMLDivElement>(null);

  // Fast Teleport state for instantaneous header navigation with white blur flash
  const [teleportPhase, setTeleportPhase] = useState<'is-entering' | 'is-leaving' | ''>('');
  const isTeleportingRef = useRef(false);
  const [showScrollPrompt, setShowScrollPrompt] = useState(false);
  const initialScrollAfterTeleportRef = useRef(0);

  // 1. Adaptive Rem Scaling: scale-up above 1920px
  useEffect(() => {
    const htmlEl = document.documentElement;
    const FONT_BASE = 16, BASE_W = 1920, COEF = 0.6666;

    const applyAdaptiveScale = () => {
      const reduction = ((BASE_W - window.innerWidth) / BASE_W) * 100 * COEF;
      const size = FONT_BASE - (FONT_BASE * reduction) / 100;
      if (size > FONT_BASE) {
        htmlEl.style.fontSize = size + 'px';
      } else {
        htmlEl.style.removeProperty('font-size');
      }
    };

    window.addEventListener('resize', applyAdaptiveScale, { passive: true });
    applyAdaptiveScale();
    return () => window.removeEventListener('resize', applyAdaptiveScale);
  }, []);

  // 2. Lenis Smooth Scrolling Engine
  useEffect(() => {
    window.scrollTo(0, 0);

    const lenis = new Lenis({
      smoothWheel: true,
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
    });

    setLenisInstance(lenis);
    (window as any).lenis = lenis;

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    // Stop Lenis while loader is visible
    lenis.stop();

    // Unified Anchor smooth scroll listener
    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a[href^="#"]');
      if (!target) return;
      const href = target.getAttribute('href');
      if (href && href !== '#') {
        const id = href.replace(/^#/, '');
        if (id === 'hero' || id === 'features' || id === 'privacy' || id === 'faq') {
          e.preventDefault();
          setIsMenuOpen(false);
          if ((window as any).scrollToSection) {
            (window as any).scrollToSection(id);
          } else {
            lenis.scrollTo(href, { offset: -20, duration: 1.0 });
          }
        }
      }
    };

    document.addEventListener('click', handleAnchorClick);

    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener('click', handleAnchorClick);
      lenis.destroy();
    };
  }, []);

  // Start Lenis when loader is ready
  useEffect(() => {
    if (ready && lenisInstance && !isModalOpen && !isMenuOpen) {
      lenisInstance.start();
    }
  }, [ready, lenisInstance, isModalOpen, isMenuOpen]);

  // Lock / Unlock Scroll on Modal or Menu open
  const lockScroll = () => {
    lenisInstance?.stop();
    document.documentElement.style.position = 'relative';
    document.documentElement.style.overflow = 'hidden';
    document.documentElement.style.height = '100%';
  };

  const unlockScroll = () => {
    if (ready) lenisInstance?.start();
    document.documentElement.style.removeProperty('position');
    document.documentElement.style.removeProperty('overflow');
    document.documentElement.style.removeProperty('height');
  };

  const openModal = () => {
    setIsModalOpen(true);
    lockScroll();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    unlockScroll();
  };

  const openMenu = () => {
    setIsMenuOpen(true);
    lockScroll();
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
    unlockScroll();
  };

  // Keyboard Escape Handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isModalOpen) closeModal();
        if (isMenuOpen) closeMenu();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, isMenuOpen]);

  // In-View IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const target = entry.target as HTMLElement;
          target.classList.add('is-inview');
          if (target.classList.contains('clip-box')) {
            target.classList.add('revealed');
          }
          target.querySelectorAll('.clip-box').forEach((child) => {
            child.classList.add('revealed');
          });
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.clip-box').forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  // ====================================================================
  // Phone Scroll Pinning & 5-Slide Sequential Animation Logic
  // ====================================================================
  useEffect(() => {
    const phone = phoneWrapRef.current;
    const hero = heroRef.current;
    const block2 = block2Ref.current;
    const stage = stageRef.current;
    if (!phone || !hero || !block2 || !stage) return;

    let rafId: number | null = null;
    let isScheduled = false;

    // Cache to prevent excessive React state re-renders on every single scroll pixel
    let lastSlideIdx = -1;
    let lastProgressRounded = -1;
    let lastBlock2Entered = false;

    const update = () => {
      isScheduled = false;
      // If jumping across sections via header menu, skip churning intermediate 5-slide state
      if ((window as any).__isMenuNavigating) return;

      const isMobile = window.innerWidth <= 640;
      const vh = window.innerHeight;

      const heroRect = hero.getBoundingClientRect();
      const block2Rect = block2.getBoundingClientRect();
      const stageRect = stage.getBoundingClientRect();

      // Avoid forced layout thrashing (phone.offsetHeight causes synchronous reflow)
      const phoneHeight = isMobile ? 600 : (phone.offsetHeight || 600);

      // On desktop, phone sits at hero.offsetTop + heroRect.height / 2
      // On mobile (Figma 175:1153), phone top starts at hero.offsetTop + 219px.
      // Since phone has transform: translate(-50%, -50%), its center in hero is at:
      // hero.offsetTop + 219 + phoneHeight / 2
      const heroPhoneCenterY = isMobile
        ? heroRect.top + 219 + phoneHeight / 2
        : heroRect.top + heroRect.height / 2;

      // 1. Hero to Block 2 Entry Transition
      const entryDelta = heroPhoneCenterY - (block2Rect.top + vh / 2);
      const entryProgress = entryDelta !== 0 
        ? Math.min(Math.max((vh / 2 - heroPhoneCenterY) / -entryDelta, 0), 1)
        : 0;
      phone.style.setProperty('--block2-progress', entryProgress.toFixed(3));

      // Block 2 entered when user scrolls into second block (on mobile, triggers exactly when reaching block 2)
      const hasEnteredBlock2 = isMobile
        ? (block2Rect.top <= 20)
        : (entryProgress >= 0.75 || block2Rect.top <= vh * 0.4);
      if (lastBlock2Entered !== hasEnteredBlock2) {
        lastBlock2Entered = hasEnteredBlock2;
        setIsBlock2Entered(hasEnteredBlock2);
      }

      // 2. Block 2 Multi-Slide Sequence Tracking
      const block2Scrollable = Math.max(block2Rect.height - vh, 1);
      const block2Scrolled = Math.max(-block2Rect.top, 0);
      const totalBlock2Progress = Math.min(Math.max(block2Scrolled / block2Scrollable, 0), 1);

      // 5 sequential slides (0, 1, 2, 3, 4)
      const TOTAL_SLIDES = 5;
      const scaledStep = totalBlock2Progress * (TOTAL_SLIDES - 0.001);
      const currentSlideIdx = Math.min(Math.floor(scaledStep), TOTAL_SLIDES - 1);
      const currentSlideProg = scaledStep - currentSlideIdx;

      if (lastSlideIdx !== currentSlideIdx) {
        lastSlideIdx = currentSlideIdx;
        setActiveSlide(currentSlideIdx);
      }

      // Discrete progress step update (step: 0.025 on desktop, step: 0.1 on mobile) to avoid mobile frame drops
      const stepSize = isMobile ? 0.1 : 0.025;
      const progRounded = Math.round(currentSlideProg / stepSize) * stepSize;
      if (Math.abs(lastProgressRounded - progRounded) >= stepSize) {
        lastProgressRounded = progRounded;
        setSlideProgress(progRounded);
      }

      // 3. Phone Pinned Positioning States
      const stageBottomY = stageRect.bottom;
      const fixedCenterY = isMobile ? 108 : (vh / 2);

      if (isMobile) {
        // Mobile Hero: Phone starts below white plate (speech bubble) at hero.offsetTop + 219px (239px).
        // Header bottom is 88px (24px top padding + 64px height).
        // Fixed phone top below header is 108px (88px + 20px gap).
        // Pin threshold is when phone top reaches target fixed top on scroll:
        // 239 - scrollY = 108 -> scrollY = 131px
        const initialMobilePhoneTop = hero.offsetTop + 219;
        const targetFixedTop = 108;
        const mobilePinScrollThreshold = initialMobilePhoneTop - targetFixedTop;

        if (window.scrollY < mobilePinScrollThreshold) {
          // Phase 1: Inside Hero, phone stays below white speech bubble plate
          if (phone.classList.contains('is-fixed') || phone.classList.contains('is-stuck-bottom') || !phone.style.top) {
            phone.classList.remove('is-fixed', 'is-stuck-bottom');
            phone.style.top = initialMobilePhoneTop + 'px';
            phone.style.removeProperty('bottom');
          }
        } else if (stageBottomY <= vh) {
          // Phase 3: Docked at bottom of Block 2
          if (!phone.classList.contains('is-stuck-bottom')) {
            phone.classList.remove('is-fixed');
            phone.classList.add('is-stuck-bottom');
            phone.style.top = (stage.offsetHeight - (vh - targetFixedTop)) + 'px';
            phone.style.removeProperty('bottom');
          }
        } else {
          // Phase 2: Fixed 20px below header across Block 2
          if (!phone.classList.contains('is-fixed')) {
            phone.classList.add('is-fixed');
            phone.classList.remove('is-stuck-bottom');
            phone.style.removeProperty('top');
            phone.style.removeProperty('bottom');
          }
        }
      } else {
        // Desktop: Center viewport pinning
        if (heroPhoneCenterY >= fixedCenterY) {
          if (phone.classList.contains('is-fixed') || phone.classList.contains('is-stuck-bottom') || !phone.style.top) {
            phone.classList.remove('is-fixed', 'is-stuck-bottom');
            const heroCenter = hero.offsetTop + heroRect.height / 2;
            phone.style.top = heroCenter + 'px';
            phone.style.removeProperty('bottom');
          }
        } else if (stageBottomY <= vh) {
          if (!phone.classList.contains('is-stuck-bottom')) {
            phone.classList.remove('is-fixed');
            phone.classList.add('is-stuck-bottom');
            phone.style.top = (stage.offsetHeight - fixedCenterY) + 'px';
            phone.style.removeProperty('bottom');
          }
        } else {
          if (!phone.classList.contains('is-fixed')) {
            phone.classList.add('is-fixed');
            phone.classList.remove('is-stuck-bottom');
            phone.style.removeProperty('top');
            phone.style.removeProperty('bottom');
          }
        }
      }
    };

    const scheduleUpdate = () => {
      if (!isScheduled) {
        isScheduled = true;
        rafId = requestAnimationFrame(update);
      }
    };

    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate, { passive: true });
    update();

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
    };
  }, [ready]);

  // Fast Teleport Section Navigation with white blur flash transition
  const scrollToSection = useCallback((sectionId: string) => {
    if (isTeleportingRef.current) return;
    isTeleportingRef.current = true;

    setIsMenuOpen(false);
    setTeleportPhase('is-entering');

    // Peak flash reached at 140ms: instantly teleport coordinates
    setTimeout(() => {
      const lenis = lenisInstance || (window as any).lenis;
      const vh = window.innerHeight;

      let targetScroll = 0;
      if (sectionId === 'hero') {
        targetScroll = 0;
      } else if (sectionId === 'features') {
        const featEl = document.getElementById('features') || document.getElementById('chats-feature');
        if (featEl) {
          const rect = featEl.getBoundingClientRect();
          targetScroll = Math.max(0, rect.top + window.scrollY);
        }
      } else if (sectionId === 'privacy') {
        const privEl = document.getElementById('privacy');
        if (privEl) {
          const rect = privEl.getBoundingClientRect();
          targetScroll = Math.max(0, rect.top + window.scrollY);
        }
      } else if (sectionId === 'faq') {
        const faqEl = document.getElementById('faq');
        if (faqEl) {
          const rect = faqEl.getBoundingClientRect();
          targetScroll = Math.max(0, rect.top + window.scrollY);
        }
        window.dispatchEvent(new CustomEvent('teleport-to-faq'));
      }

      // 1. Instant jump on Lenis and native window
      if (lenis && typeof lenis.scrollTo === 'function') {
        lenis.scrollTo(targetScroll, { immediate: true });
      }
      window.scrollTo(0, targetScroll);

      // 2. Snap phone mockup coordinates immediately while hidden behind the flash
      const phone = phoneWrapRef.current;
      const stage = stageRef.current;
      const hero = heroRef.current;

      if (phone && stage && hero) {
        if (sectionId === 'hero') {
          phone.classList.remove('is-fixed', 'is-stuck-bottom');
          const heroCenter = hero.offsetTop + hero.offsetHeight / 2;
          phone.style.top = heroCenter + 'px';
          phone.style.removeProperty('bottom');
        } else if (sectionId === 'privacy' || sectionId === 'faq') {
          phone.classList.remove('is-fixed');
          phone.classList.add('is-stuck-bottom');
          phone.style.top = (stage.offsetHeight - vh / 2) + 'px';
          phone.style.removeProperty('bottom');
        } else if (sectionId === 'features') {
          phone.classList.add('is-fixed');
          phone.classList.remove('is-stuck-bottom');
          phone.style.removeProperty('top');
          phone.style.removeProperty('bottom');
        }
      }

      // 3. Immediately trigger scroll event so section components update their state
      window.dispatchEvent(new Event('scroll'));

      // 4. Begin smooth exit dissolve of the white blur curtain
      setTimeout(() => {
        setTeleportPhase('is-leaving');
      }, 30);

      // 5. Complete teleport and reveal "Листайте вниз" prompt only on "privacy" section
      setTimeout(() => {
        setTeleportPhase('');
        isTeleportingRef.current = false;
        initialScrollAfterTeleportRef.current = window.scrollY;
        if (sectionId === 'privacy') {
          setShowScrollPrompt(true);
        } else {
          setShowScrollPrompt(false);
        }
      }, 260);
    }, 140);
  }, [lenisInstance]);

  // Dismiss "Листайте вниз" prompt on user scroll, wheel, or touchmove
  useEffect(() => {
    if (!showScrollPrompt) return;

    const handleDismiss = () => {
      setShowScrollPrompt(false);
    };

    const handleScroll = () => {
      if (Math.abs(window.scrollY - initialScrollAfterTeleportRef.current) > 10) {
        setShowScrollPrompt(false);
      }
    };

    window.addEventListener('wheel', handleDismiss, { passive: true });
    window.addEventListener('touchmove', handleDismiss, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('wheel', handleDismiss);
      window.removeEventListener('touchmove', handleDismiss);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [showScrollPrompt]);

  // Export globally for any anchor or button
  useEffect(() => {
    (window as any).scrollToSection = scrollToSection;
  }, [scrollToSection]);

  // Click on progress bar to jump to slide
  const handleSelectSlide = useCallback((index: number) => {
    const block2 = block2Ref.current;
    if (!block2 || !lenisInstance) return;

    const block2Top = block2.getBoundingClientRect().top + window.scrollY;
    const vh = window.innerHeight;
    const block2Scrollable = Math.max(block2.offsetHeight - vh, 1);
    const targetScroll = block2Top + (index / 4.5) * block2Scrollable;

    lenisInstance.scrollTo(targetScroll, { duration: 1.0 });
  }, [lenisInstance]);

  return (
    <>
      {/* Intro Loader Curtain */}
      <LoaderCurtain onReady={() => setReady(true)} />

      {/* Fast Teleport Blur Flash Overlay */}
      <div 
        className={`teleport-flash-overlay ${teleportPhase}`} 
        aria-hidden="true" 
      />

      {/* "Листайте вниз" Floating Scroll Prompt (Figma Node 135:1153) */}
      <ScrollPrompt visible={showScrollPrompt} />

      {/* Permanently Top-Level Fixed Site Header */}
      <SiteHeader
        onOpenModal={openModal}
        onOpenMenu={openMenu}
        ready={ready}
        onNavigate={scrollToSection}
        isStoreDocked={isStoreDocked}
      />

      {/* Main Page Shell */}
      <main id="main-content">
        <div className="hero-trust-pinned-stage" ref={stageRef}>
          {/* Shared Phone that pins across Hero & Block 2 */}
          <div
            className={`pinned-phone-wrap ${ready ? 'is-ready' : ''} ${isBlock2Entered ? 'is-block2-entered' : ''}`}
            ref={phoneWrapRef}
            aria-hidden="true"
          >
            <div className={`pinned-phone-entrance-box ${ready ? 'is-entered' : 'is-entering'}`}>
              {/* Mobile floating cards BEHIND phone */}
              <div className="mobile-floating-layer layer-back" aria-hidden="true">
                {MOBILE_FLOATING_SLIDES.map((slide, sIdx) => {
                  const isCurrent = isBlock2Entered && activeSlide === sIdx;
                  const isPast = isBlock2Entered && activeSlide > sIdx;
                  const statusClass = isCurrent ? 'is-active' : isPast ? 'is-past' : 'is-future';

                  return (
                    <div
                      key={`m-back-${sIdx}`}
                      className={`mobile-cards-slide slide-${sIdx} ${statusClass}`}
                    >
                      {slide.back.map((card, cIdx) => {
                        const currentDelay = isCurrent
                          ? `${card.delayIn ?? 0}ms`
                          : isPast
                            ? `${card.delayOut ?? 0}ms`
                            : '0ms';

                        return (
                          <div
                            key={cIdx}
                            className={`mobile-floating-card card-back ${statusClass}`}
                            style={{
                              ...card.style,
                              '--target-opacity': card.targetOpacity ?? 1,
                              '--dx-in': `${card.dxIn}px`,
                              '--dy-in': `${card.dyIn}px`,
                              '--dx-out': `${card.dxOut}px`,
                              '--dy-out': `${card.dyOut}px`,
                              '--rot-in': `${card.rotIn ?? 0}deg`,
                              '--rot-out': `${card.rotOut ?? 0}deg`,
                              '--scale-in': `${card.scaleIn ?? 0.15}`,
                              '--scale-out': `${card.scaleOut ?? 1.15}`,
                              transitionDelay: currentDelay,
                            } as React.CSSProperties}
                          >
                            <div className={`mobile-floating-float-wrap chan-${cIdx % 4}`}>
                              <img
                                src={card.src}
                                alt=""
                                className="mobile-floating-img"
                                loading="eager"
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

              {/* Permanent white background underneath all switching screens */}
              <div className="pinned-phone-screen-slot slot-base" aria-hidden="true" />

              {/* Screen 0: Chat List (Visible in Hero block, smoothly fades out when entering Block 2) */}
              <div 
                className={`pinned-phone-screen-slot slot-hero ${isBlock2Entered ? 'is-faded' : ''}`} 
                aria-hidden={isBlock2Entered}
              >
                <img
                  src="/figma-1540841b2d.webp"
                  alt="Send Messenger - Список чатов"
                  className="pinned-phone-screen-img"
                  fetchPriority="high"
                  loading="eager"
                  decoding="async"
                />
              </div>

              {/* Screen 1: Slide 1 Active Chat Screen */}
              <div 
                className={`pinned-phone-screen-slot slot-slide-0 ${isBlock2Entered && activeSlide === 0 ? 'is-active' : ''}`} 
                aria-hidden={!isBlock2Entered || activeSlide !== 0}
              >
                <img
                  src="/figma-6dc9c6c99d.webp"
                  alt="Send Messenger - Диалог"
                  className="pinned-phone-screen-img"
                  fetchPriority="high"
                  loading="eager"
                  decoding="async"
                />
              </div>

              {/* Screen 2: Slide 2 Context Menu Screen */}
              <div 
                className={`pinned-phone-screen-slot slot-slide-1 ${isBlock2Entered && activeSlide === 1 ? 'is-active' : ''}`} 
                aria-hidden={!isBlock2Entered || activeSlide !== 1}
              >
                <img
                  src="/figma-5295e5c095.webp"
                  alt="Send Messenger - Слайд 2"
                  className="pinned-phone-screen-img"
                  fetchPriority="high"
                  loading="eager"
                  decoding="async"
                />
              </div>

              {/* Screen 3: Slide 3 Attachments Screen */}
              <div 
                className={`pinned-phone-screen-slot slot-slide-2 ${isBlock2Entered && activeSlide === 2 ? 'is-active' : ''}`} 
                aria-hidden={!isBlock2Entered || activeSlide !== 2}
              >
                <img
                  src="/figma-d8b9316cdc.webp"
                  alt="Send Messenger - Слайд 3"
                  className="pinned-phone-screen-img"
                  fetchPriority="high"
                  loading="eager"
                  decoding="async"
                />
              </div>

              {/* Screen 4: Slide 4 Profile Screen */}
              <div 
                className={`pinned-phone-screen-slot slot-slide-3 ${isBlock2Entered && activeSlide === 3 ? 'is-active' : ''}`} 
                aria-hidden={!isBlock2Entered || activeSlide !== 3}
              >
                <img
                  src="/figma-f1b3bbd956.webp"
                  alt="Send Messenger - Слайд 4"
                  className="pinned-phone-screen-img"
                  fetchPriority="high"
                  loading="eager"
                  decoding="async"
                />
              </div>

              {/* Screen 5: Slide 5 Settings Screen */}
              <div 
                className={`pinned-phone-screen-slot slot-slide-4 ${isBlock2Entered && activeSlide === 4 ? 'is-active' : ''}`} 
                aria-hidden={!isBlock2Entered || activeSlide !== 4}
              >
                <img
                  src="/figma-abbbc2c9dd.webp"
                  alt="Send Messenger - Слайд 5"
                  className="pinned-phone-screen-img"
                  fetchPriority="high"
                  loading="eager"
                  decoding="async"
                />
              </div>

              {/* Single Physical Phone Mockup Frame */}
              <img
                src="/hero-phone.webp"
                alt="Send Messenger App Interface"
                className="pinned-phone-img"
                fetchPriority="high"
                loading="eager"
              />

              {/* Mobile floating cards OVER / IN FRONT OF phone */}
              <div className="mobile-floating-layer layer-front" aria-hidden="true">
                {MOBILE_FLOATING_SLIDES.map((slide, sIdx) => {
                  const isCurrent = isBlock2Entered && activeSlide === sIdx;
                  const isPast = isBlock2Entered && activeSlide > sIdx;
                  const statusClass = isCurrent ? 'is-active' : isPast ? 'is-past' : 'is-future';

                  return (
                    <div
                      key={`m-front-${sIdx}`}
                      className={`mobile-cards-slide slide-${sIdx} ${statusClass}`}
                    >
                      {slide.front.map((card, cIdx) => {
                        const currentDelay = isCurrent
                          ? `${card.delayIn ?? 0}ms`
                          : isPast
                            ? `${card.delayOut ?? 0}ms`
                            : '0ms';

                        return (
                          <div
                            key={cIdx}
                            className={`mobile-floating-card card-front ${statusClass}`}
                            style={{
                              ...card.style,
                              '--target-opacity': card.targetOpacity ?? 1,
                              '--dx-in': `${card.dxIn}px`,
                              '--dy-in': `${card.dyIn}px`,
                              '--dx-out': `${card.dxOut}px`,
                              '--dy-out': `${card.dyOut}px`,
                              '--rot-in': `${card.rotIn ?? 0}deg`,
                              '--rot-out': `${card.rotOut ?? 0}deg`,
                              '--scale-in': `${card.scaleIn ?? 0.15}`,
                              '--scale-out': `${card.scaleOut ?? 1.15}`,
                              transitionDelay: currentDelay,
                            } as React.CSSProperties}
                          >
                            <div className={`mobile-floating-float-wrap chan-${cIdx % 4}`}>
                              <img
                                src={card.src}
                                alt=""
                                className="mobile-floating-img"
                                loading="eager"
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
            </div>
          </div>

          <HeroSection
            ready={ready}
            heroRef={heroRef}
          />
          <div id="features" style={{ position: 'relative', top: '-80px', height: 0, pointerEvents: 'none' }} />
          <ChatsBlockSection 
            sectionRef={block2Ref} 
            activeSlide={activeSlide}
            slideProgress={slideProgress}
            isEntered={isBlock2Entered}
            onSelectSlide={handleSelectSlide}
          />
        </div>

        {/* Block 3: Key Advantages (Figma block-2-1 / Node 81:1156) */}
        <KeyAdvantagesSection />

        {/* Block 4: FAQ with physics capsules (Figma block-2-1 / Node 106:1153) */}
        <FaqSection />

        {/* Block 5: Install & Download Send Messenger (Figma block-2-1 / Node 144:1172) */}
        <InstallSection
          onDockChange={setIsStoreDocked}
          onOpenModal={openModal}
          onOpenMenu={openMenu}
        />

        <SiteFooter onNavigate={scrollToSection} />
      </main>

      {/* Contact Modal */}
      <ContactModal isOpen={isModalOpen} onClose={closeModal} />

      {/* Fullscreen Menu Overlay */}
      <MenuOverlay isOpen={isMenuOpen} onClose={closeMenu} onOpenModal={openModal} onNavigate={scrollToSection} />
    </>
  );
};

export default App;
