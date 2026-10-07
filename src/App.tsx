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

      // Block 2 entered when user scrolls into second block (earlier smooth trigger on mobile)
      const hasEnteredBlock2 = isMobile
        ? (block2Rect.top <= vh * 0.7)
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
      const fixedCenterY = isMobile ? 116 : (vh / 2);

      if (isMobile) {
        // Mobile: exact 20px gap below header (header bottom: 32px + 64px = 96px -> top: 116px)
        if (stageBottomY <= vh) {
          // Phase 3: Docked at bottom of Block 2
          if (!phone.classList.contains('is-stuck-bottom')) {
            phone.classList.remove('is-fixed');
            phone.classList.add('is-stuck-bottom');
            phone.style.top = (stage.offsetHeight - (vh - 116)) + 'px';
            phone.style.removeProperty('bottom');
          }
        } else {
          // Phase 1 & 2: Fixed with exact 20px gap from header across Hero & Block 2
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
