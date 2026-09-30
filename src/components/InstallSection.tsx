import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { animate, cubicBezier } from 'animejs';

interface InstallSectionProps {
  onDockChange?: (isDocked: boolean) => void;
  onOpenModal?: () => void;
  onOpenMenu?: () => void;
}

export const InstallSection: React.FC<InstallSectionProps> = ({
  onDockChange,
  onOpenModal,
}) => {
  const sectionRef = useRef<HTMLElement>(null);
  const cardAppStoreRef = useRef<HTMLDivElement>(null);
  const cardGooglePlayRef = useRef<HTMLDivElement>(null);

  // Flying morph cards mounted in portal directly on document.body (fixed viewport layer)
  const flyingASRef = useRef<HTMLDivElement>(null);
  const flyingGPRef = useRef<HTMLDivElement>(null);

  const [mounted, setMounted] = useState(false);
  const [isDocked, setIsDocked] = useState(false);
  const isDockedRef = useRef(false);

  const progressRef = useRef({ p: 0 });
  const animRef = useRef<any>(null);

  // Initial captured rects of header buttons when drop starts
  const startRectASRef = useRef<{ left: number; top: number; width: number; height: number }>({
    left: 0,
    top: 0,
    width: 64,
    height: 64,
  });
  const startRectGPRef = useRef<{ left: number; top: number; width: number; height: number }>({
    left: 0,
    top: 0,
    width: 64,
    height: 64,
  });

  // Play forward drop: both buttons synchronously detach and smoothly expand into plates together
  const playDock = useCallback(() => {
    if (animRef.current) animRef.current.pause();

    const btnAS = document.getElementById('btn-header-appstore');
    const btnGP = document.getElementById('btn-header-googleplay');
    const targetAS = cardAppStoreRef.current;
    const targetGP = cardGooglePlayRef.current;
    const flyingAS = flyingASRef.current;
    const flyingGP = flyingGPRef.current;

    if (!btnAS || !btnGP || !targetAS || !targetGP || !flyingAS || !flyingGP) {
      if (targetAS) targetAS.style.opacity = '1';
      if (targetGP) targetGP.style.opacity = '1';
      return;
    }

    const rAS = btnAS.getBoundingClientRect();
    const rGP = btnGP.getBoundingClientRect();
    startRectASRef.current = { left: rAS.left, top: rAS.top, width: rAS.width, height: rAS.height };
    startRectGPRef.current = { left: rGP.left, top: rGP.top, width: rGP.width, height: rGP.height };

    const easeCurve = cubicBezier(0.16, 1, 0.3, 1);

    // Synchronously hide stationary header buttons and target slots
    btnAS.style.opacity = '0';
    btnGP.style.opacity = '0';
    targetAS.style.opacity = '0';
    targetGP.style.opacity = '0';

    flyingAS.style.display = 'block';
    flyingGP.style.display = 'block';
    flyingAS.style.opacity = '1';
    flyingGP.style.opacity = '1';

    const currentP = progressRef.current.p;
    animRef.current = animate(progressRef.current, {
      p: 1,
      duration: Math.max(380, Math.round(720 * (1 - currentP))),
      ease: easeCurve,
      onUpdate: () => {
        const p = progressRef.current.p;
        const liveAS = targetAS.getBoundingClientRect();
        const liveGP = targetGP.getBoundingClientRect();
        const startAS = startRectASRef.current;
        const startGP = startRectGPRef.current;

        // Individual Y interpolation for each card to its exact slot
        const yAS = startAS.top + (liveAS.top - startAS.top) * p;
        const yGP = startGP.top + (liveGP.top - startGP.top) * p;

        // Interpolate horizontal positions and dimensions continuously
        const xAS = startAS.left + (liveAS.left - startAS.left) * p;
        const wAS = startAS.width + (liveAS.width - startAS.width) * p;
        const hAS = startAS.height + (liveAS.height - startAS.height) * p;

        const xGP = startGP.left + (liveGP.left - startGP.left) * p;
        const wGP = startGP.width + (liveGP.width - startGP.width) * p;
        const hGP = startGP.height + (liveGP.height - startGP.height) * p;

        const r = 32 + (50 - 32) * p;
        // Fade out button shadow quickly as it expands into plate (only present for p <= 0.18)
        const shadowAlpha = p <= 0.18 ? 0.14 * (1 - p / 0.18) : 0;
        const shadowStyle = shadowAlpha > 0.01 ? `0 6px 24px rgba(10, 30, 80, ${shadowAlpha.toFixed(3)})` : 'none';

        flyingAS.style.left = `${xAS.toFixed(1)}px`;
        flyingAS.style.top = `${yAS.toFixed(1)}px`;
        flyingAS.style.width = `${wAS.toFixed(1)}px`;
        flyingAS.style.height = `${hAS.toFixed(1)}px`;
        flyingAS.style.borderRadius = `${r.toFixed(1)}px`;
        flyingAS.style.boxShadow = shadowStyle;

        flyingGP.style.left = `${xGP.toFixed(1)}px`;
        flyingGP.style.top = `${yGP.toFixed(1)}px`;
        flyingGP.style.width = `${wGP.toFixed(1)}px`;
        flyingGP.style.height = `${hGP.toFixed(1)}px`;
        flyingGP.style.borderRadius = `${r.toFixed(1)}px`;
        flyingGP.style.boxShadow = shadowStyle;

        // Smooth content fade: title and bottom button fade in gently
        const contentP = Math.max(0, Math.min(1, (p - 0.12) / 0.82));
        const contentDY = (1 - contentP) * 14;

        // Continuous smooth badge positioning inside card
        const badgeTop = 16 + (32 - 16) * p;
        const badgeRight = 16 + (32 - 16) * p;
        const badgeSize = 32 + (88 - 32) * p;
        const svgSize = 32 + (40 - 32) * p;
        const badgeBgOpacity = p;
        const badgeRadius = 6.4 + (60 - 6.4) * p;

        const badgeAS = flyingAS.querySelector<HTMLElement>('.install-plate-badge');
        const titleAS = flyingAS.querySelector<HTMLElement>('.install-plate-title');
        const bottomAS = flyingAS.querySelector<HTMLElement>('.install-plate-bottom');
        if (badgeAS) {
          badgeAS.style.top = `${badgeTop.toFixed(1)}px`;
          badgeAS.style.right = `${badgeRight.toFixed(1)}px`;
          badgeAS.style.width = `${badgeSize.toFixed(1)}px`;
          badgeAS.style.height = `${badgeSize.toFixed(1)}px`;
          badgeAS.style.borderRadius = `${badgeRadius.toFixed(1)}px`;
          badgeAS.style.backgroundColor = `rgba(242, 242, 247, ${badgeBgOpacity.toFixed(3)})`;
          const svg = badgeAS.querySelector<SVGElement>('svg');
          if (svg) {
            svg.setAttribute('width', `${svgSize.toFixed(1)}`);
            svg.setAttribute('height', `${svgSize.toFixed(1)}`);
          }
        }
        if (titleAS) {
          titleAS.style.opacity = contentP.toFixed(3);
          titleAS.style.transform = `translate3d(0, ${contentDY.toFixed(1)}px, 0)`;
        }
        if (bottomAS) {
          bottomAS.style.opacity = contentP.toFixed(3);
          bottomAS.style.transform = `translate3d(0, ${contentDY.toFixed(1)}px, 0)`;
        }

        const badgeGP = flyingGP.querySelector<HTMLElement>('.install-plate-badge');
        const titleGP = flyingGP.querySelector<HTMLElement>('.install-plate-title');
        const bottomGP = flyingGP.querySelector<HTMLElement>('.install-plate-bottom');
        if (badgeGP) {
          badgeGP.style.top = `${badgeTop.toFixed(1)}px`;
          badgeGP.style.right = `${badgeRight.toFixed(1)}px`;
          badgeGP.style.width = `${badgeSize.toFixed(1)}px`;
          badgeGP.style.height = `${badgeSize.toFixed(1)}px`;
          badgeGP.style.borderRadius = `${badgeRadius.toFixed(1)}px`;
          badgeGP.style.backgroundColor = `rgba(242, 242, 247, ${badgeBgOpacity.toFixed(3)})`;
          const svg = badgeGP.querySelector<SVGElement>('svg');
          if (svg) {
            svg.setAttribute('width', `${svgSize.toFixed(1)}`);
            svg.setAttribute('height', `${svgSize.toFixed(1)}`);
          }
        }
        if (titleGP) {
          titleGP.style.opacity = contentP.toFixed(3);
          titleGP.style.transform = `translate3d(0, ${contentDY.toFixed(1)}px, 0)`;
        }
        if (bottomGP) {
          bottomGP.style.opacity = contentP.toFixed(3);
          bottomGP.style.transform = `translate3d(0, ${contentDY.toFixed(1)}px, 0)`;
        }
      },
      onComplete: () => {
        // Simultaneous clean handoff to static cards
        targetAS.style.opacity = '1';
        targetGP.style.opacity = '1';
        flyingAS.style.display = 'none';
        flyingGP.style.display = 'none';
        flyingAS.style.boxShadow = 'none';
        flyingGP.style.boxShadow = 'none';
      },
    });
  }, []);

  // Play reverse undock: plates shrink back into circular buttons and fly back up into the header together
  const playUndock = useCallback(() => {
    if (animRef.current) animRef.current.pause();

    const btnAS = document.getElementById('btn-header-appstore');
    const btnGP = document.getElementById('btn-header-googleplay');
    const targetAS = cardAppStoreRef.current;
    const targetGP = cardGooglePlayRef.current;
    const flyingAS = flyingASRef.current;
    const flyingGP = flyingGPRef.current;

    if (!btnAS || !btnGP || !targetAS || !targetGP || !flyingAS || !flyingGP) {
      if (btnAS) btnAS.style.opacity = '1';
      if (btnGP) btnGP.style.opacity = '1';
      return;
    }

    const easeCurve = cubicBezier(0.16, 1, 0.3, 1);

    // Hide stationary block cards and keep header buttons hidden while flying back
    targetAS.style.opacity = '0';
    targetGP.style.opacity = '0';
    btnAS.style.opacity = '0';
    btnGP.style.opacity = '0';

    flyingAS.style.display = 'block';
    flyingGP.style.display = 'block';
    flyingAS.style.opacity = '1';
    flyingGP.style.opacity = '1';

    const currentP = progressRef.current.p;
    animRef.current = animate(progressRef.current, {
      p: 0,
      duration: Math.max(280, Math.round(520 * currentP)),
      ease: easeCurve,
      onUpdate: () => {
        const p = progressRef.current.p;
        const liveAS = targetAS.getBoundingClientRect();
        const liveGP = targetGP.getBoundingClientRect();
        const liveHeaderAS = btnAS.getBoundingClientRect();
        const liveHeaderGP = btnGP.getBoundingClientRect();

        const yAS = liveHeaderAS.top + (liveAS.top - liveHeaderAS.top) * p;
        const yGP = liveHeaderGP.top + (liveGP.top - liveHeaderGP.top) * p;

        const xAS = liveHeaderAS.left + (liveAS.left - liveHeaderAS.left) * p;
        const wAS = liveHeaderAS.width + (liveAS.width - liveHeaderAS.width) * p;
        const hAS = liveHeaderAS.height + (liveAS.height - liveHeaderAS.height) * p;

        const xGP = liveHeaderGP.left + (liveGP.left - liveHeaderGP.left) * p;
        const wGP = liveHeaderGP.width + (liveGP.width - liveHeaderGP.width) * p;
        const hGP = liveHeaderGP.height + (liveGP.height - liveHeaderGP.height) * p;

        const r = 32 + (50 - 32) * p;
        // Fade in button shadow smoothly only in the final phase as plate reaches button dimensions (p <= 0.18)
        const shadowAlpha = p <= 0.18 ? 0.14 * (1 - p / 0.18) : 0;
        const shadowStyle = shadowAlpha > 0.01 ? `0 6px 24px rgba(10, 30, 80, ${shadowAlpha.toFixed(3)})` : 'none';

        flyingAS.style.left = `${xAS.toFixed(1)}px`;
        flyingAS.style.top = `${yAS.toFixed(1)}px`;
        flyingAS.style.width = `${wAS.toFixed(1)}px`;
        flyingAS.style.height = `${hAS.toFixed(1)}px`;
        flyingAS.style.borderRadius = `${r.toFixed(1)}px`;
        flyingAS.style.boxShadow = shadowStyle;

        flyingGP.style.left = `${xGP.toFixed(1)}px`;
        flyingGP.style.top = `${yGP.toFixed(1)}px`;
        flyingGP.style.width = `${wGP.toFixed(1)}px`;
        flyingGP.style.height = `${hGP.toFixed(1)}px`;
        flyingGP.style.borderRadius = `${r.toFixed(1)}px`;
        flyingGP.style.boxShadow = shadowStyle;

        const contentP = Math.max(0, Math.min(1, (p - 0.12) / 0.82));
        const contentDY = (1 - contentP) * 14;

        const badgeTop = 16 + (32 - 16) * p;
        const badgeRight = 16 + (32 - 16) * p;
        const badgeSize = 32 + (88 - 32) * p;
        const svgSize = 32 + (40 - 32) * p;
        const badgeBgOpacity = p;
        const badgeRadius = 6.4 + (60 - 6.4) * p;

        const badgeAS = flyingAS.querySelector<HTMLElement>('.install-plate-badge');
        const titleAS = flyingAS.querySelector<HTMLElement>('.install-plate-title');
        const bottomAS = flyingAS.querySelector<HTMLElement>('.install-plate-bottom');
        if (badgeAS) {
          badgeAS.style.top = `${badgeTop.toFixed(1)}px`;
          badgeAS.style.right = `${badgeRight.toFixed(1)}px`;
          badgeAS.style.width = `${badgeSize.toFixed(1)}px`;
          badgeAS.style.height = `${badgeSize.toFixed(1)}px`;
          badgeAS.style.borderRadius = `${badgeRadius.toFixed(1)}px`;
          badgeAS.style.backgroundColor = `rgba(242, 242, 247, ${badgeBgOpacity.toFixed(3)})`;
          const svg = badgeAS.querySelector<SVGElement>('svg');
          if (svg) {
            svg.setAttribute('width', `${svgSize.toFixed(1)}`);
            svg.setAttribute('height', `${svgSize.toFixed(1)}`);
          }
        }
        if (titleAS) {
          titleAS.style.opacity = contentP.toFixed(3);
          titleAS.style.transform = `translate3d(0, ${contentDY.toFixed(1)}px, 0)`;
        }
        if (bottomAS) {
          bottomAS.style.opacity = contentP.toFixed(3);
          bottomAS.style.transform = `translate3d(0, ${contentDY.toFixed(1)}px, 0)`;
        }

        const badgeGP = flyingGP.querySelector<HTMLElement>('.install-plate-badge');
        const titleGP = flyingGP.querySelector<HTMLElement>('.install-plate-title');
        const bottomGP = flyingGP.querySelector<HTMLElement>('.install-plate-bottom');
        if (badgeGP) {
          badgeGP.style.top = `${badgeTop.toFixed(1)}px`;
          badgeGP.style.right = `${badgeRight.toFixed(1)}px`;
          badgeGP.style.width = `${badgeSize.toFixed(1)}px`;
          badgeGP.style.height = `${badgeSize.toFixed(1)}px`;
          badgeGP.style.borderRadius = `${badgeRadius.toFixed(1)}px`;
          badgeGP.style.backgroundColor = `rgba(242, 242, 247, ${badgeBgOpacity.toFixed(3)})`;
          const svg = badgeGP.querySelector<SVGElement>('svg');
          if (svg) {
            svg.setAttribute('width', `${svgSize.toFixed(1)}`);
            svg.setAttribute('height', `${svgSize.toFixed(1)}`);
          }
        }
        if (titleGP) {
          titleGP.style.opacity = contentP.toFixed(3);
          titleGP.style.transform = `translate3d(0, ${contentDY.toFixed(1)}px, 0)`;
        }
        if (bottomGP) {
          bottomGP.style.opacity = contentP.toFixed(3);
          bottomGP.style.transform = `translate3d(0, ${contentDY.toFixed(1)}px, 0)`;
        }
      },
      onComplete: () => {
        // Atomic handoff: reveal buttons and hide flying plates in the exact same frame
        btnAS.style.opacity = '1';
        btnGP.style.opacity = '1';
        flyingAS.style.display = 'none';
        flyingGP.style.display = 'none';
        flyingAS.style.boxShadow = 'none';
        flyingGP.style.boxShadow = 'none';
        onDockChange?.(false);
        requestAnimationFrame(() => {
          btnAS.style.opacity = '';
          btnGP.style.opacity = '';
        });
      },
    });
  }, [onDockChange]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    // Check initial scroll state: dock if scrolled to or past the Install block entrance
    const rect = section.getBoundingClientRect();
    const initialDockThreshold = Math.min(360, window.innerHeight * 0.45);
    const initialDock = rect.top <= initialDockThreshold;

    if (initialDock) {
      isDockedRef.current = true;
      setIsDocked(true);
      onDockChange?.(true);
      progressRef.current.p = 1;
      if (cardAppStoreRef.current) cardAppStoreRef.current.style.opacity = '1';
      if (cardGooglePlayRef.current) cardGooglePlayRef.current.style.opacity = '1';
      const btnAS = document.getElementById('btn-header-appstore');
      const btnGP = document.getElementById('btn-header-googleplay');
      if (btnAS) btnAS.style.opacity = '0';
      if (btnGP) btnGP.style.opacity = '0';
    } else {
      if (cardAppStoreRef.current) cardAppStoreRef.current.style.opacity = '0';
      if (cardGooglePlayRef.current) cardGooglePlayRef.current.style.opacity = '0';
    }

    const handleScroll = () => {
      const liveRect = section.getBoundingClientRect();
      // Start dock animation earlier as the block enters the viewport (<= 360px)
      // Return back to header buttons when scrolling up into FAQ (> 440px) for smooth hysteresis
      const dockThreshold = Math.min(360, window.innerHeight * 0.45);
      const undockThreshold = dockThreshold + 80;
      const shouldDock = isDockedRef.current
        ? liveRect.top <= undockThreshold
        : liveRect.top <= dockThreshold;

      if (shouldDock !== isDockedRef.current) {
        isDockedRef.current = shouldDock;
        setIsDocked(shouldDock);

        if (shouldDock) {
          onDockChange?.(true);
          playDock();
        } else {
          playUndock();
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    const lenis = (window as any).lenis;
    if (lenis) {
      lenis.on('scroll', handleScroll);
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      if (lenis) {
        lenis.off('scroll', handleScroll);
      }
      if (animRef.current) animRef.current.pause();
    };
  }, [onDockChange, playDock, playUndock]);

  return (
    <>
      <section
        className={`install-section ${isDocked ? 'is-docked' : ''}`}
        id="install"
        ref={sectionRef}
        aria-label="Установка Send Messenger"
      >
        <div className="install-stage">
          {/* Card: Send Web (Figma Group 23 / 156:1171) */}
          <article
            className="install-plate install-plate-web"
            aria-label="Send Web — Очень скоро"
          >
            <div className="install-plate-top">
              <span className="install-plate-title">Send Web</span>
              <div className="install-plate-badge" aria-hidden="true">
                <div className="install-badge-icon">
                  <img
                    src="/icon-send-web@2x.webp"
                    alt="Send Web"
                    width="40"
                    height="40"
                    className="install-badge-web-img"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              </div>
            </div>

            <div className="install-hover-icon" aria-hidden="true">
              <img
                src="/hover-sendweb.webp"
                alt=""
                width="280"
                height="280"
                className="install-hover-icon-img"
                loading="lazy"
                decoding="async"
              />
            </div>

            <div className="install-plate-bottom">
              <div className="install-soon-pill">
                <span>Очень скоро</span>
              </div>
            </div>
          </article>

          {/* Static Cards Row: destination anchor slots */}
          <div className="install-cards-row">
            {/* Card 1: App Store (Figma Rectangle 161124268) */}
            <div
              ref={cardAppStoreRef}
              className="install-plate install-plate-appstore"
              style={{ opacity: 0 }}
            >
              <div className="install-plate-top">
                <span className="install-plate-title">App Store</span>
                <div className="install-plate-badge" aria-hidden="true">
                  <div className="install-badge-icon">
                    <svg
                      width="40"
                      height="40"
                      viewBox="0 0 32 32"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M25.532 0.00158691H6.46267C2.892 0.00158691 0 2.89359 0 6.46559V25.5389C0 29.1069 2.892 31.9989 6.46267 31.9989H25.536C29.104 31.9989 31.9987 29.1069 31.9987 25.5363V6.46559C31.996 2.89359 29.104 0.00158691 25.532 0.00158691ZM8.84667 25.3349C8.44667 26.0349 7.55467 26.2709 6.85467 25.8709C6.15467 25.4709 5.91867 24.5789 6.31867 23.8789L7.35867 22.0789C8.53467 21.7149 9.48933 21.9949 10.2467 22.9069L8.84667 25.3349ZM18.9573 21.4083H5.72C4.912 21.4083 4.264 20.7603 4.264 19.9523C4.264 19.1443 4.912 18.4963 5.72 18.4963H9.43067L14.1827 10.2616L12.6987 7.68559C12.2987 6.98559 12.5347 6.10159 13.2347 5.69359C13.9347 5.29359 14.8187 5.52959 15.2267 6.22959L15.8627 7.35359L16.5107 6.23359C16.9107 5.53359 17.8027 5.29759 18.5027 5.69759C19.2027 6.09759 19.4387 6.98959 19.0387 7.68825L12.796 18.4949H17.312C18.7733 18.4963 19.5933 20.2163 18.9573 21.4083ZM26.0893 21.4163H23.9853L25.4053 23.8789C25.8053 24.5789 25.5693 25.4629 24.8693 25.8709C24.1693 26.2709 23.2853 26.0349 22.8773 25.3349C20.4867 21.1869 18.6893 18.0843 17.4987 16.0163C16.2787 13.9123 17.1507 11.8003 18.0107 11.0843C18.9667 12.7243 20.3947 15.2003 22.3013 18.5043H26.0893C26.8973 18.5043 27.5453 19.1523 27.5453 19.9603C27.544 20.7683 26.8973 21.4163 26.0893 21.4163Z"
                        fill="#3063F7"
                      />
                      <path
                        d="M18.957 21.408H5.71967C4.91167 21.408 4.26367 20.76 4.26367 19.952C4.26367 19.144 4.91167 18.496 5.71967 18.496H9.43034L14.1823 10.2613L12.6983 7.68533C12.2983 6.98533 12.5343 6.10133 13.2343 5.69333C13.9343 5.29333 14.8183 5.52933 15.2263 6.22933L15.8623 7.35333L16.5103 6.23333C16.9103 5.53333 17.8023 5.29733 18.5023 5.69733C19.2023 6.09733 19.4383 6.98933 19.0383 7.688L12.7957 18.4947H17.3117C18.773 18.496 19.593 20.216 18.957 21.408Z"
                        fill="white"
                      />
                      <path
                        d="M26.089 21.416H23.985L25.405 23.8787C25.805 24.5787 25.569 25.4627 24.869 25.8707C24.169 26.2707 23.285 26.0347 22.877 25.3347C20.4863 21.1867 18.689 18.084 17.4983 16.016C16.2783 13.912 17.1503 11.8 18.0103 11.084C18.9663 12.724 20.3943 15.2 22.301 18.504H26.089C26.897 18.504 27.545 19.152 27.545 19.96C27.5437 20.768 26.897 21.416 26.089 21.416Z"
                        fill="white"
                      />
                      <path
                        d="M8.84634 25.3347C8.44634 26.0347 7.55434 26.2707 6.85434 25.8707C6.15434 25.4707 5.91834 24.5787 6.31834 23.8787L7.35834 22.0787C8.53434 21.7147 9.48901 21.9947 10.2463 22.9067L8.84634 25.3347Z"
                        fill="white"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="install-hover-icon" aria-hidden="true">
                <img
                  src="/hover-appstore.webp"
                  alt=""
                  width="280"
                  height="280"
                  className="install-hover-icon-img"
                  loading="lazy"
                  decoding="async"
                />
              </div>

              <div className="install-plate-bottom">
                <a
                  href="#download-ios"
                  className="install-action-btn btn-ios"
                  onClick={(e) => {
                    e.preventDefault();
                    onOpenModal?.();
                  }}
                >
                  <span>Скачать для iOS</span>
                </a>
              </div>
            </div>

            {/* Card 2: Google Play (Figma Rectangle 161124267) */}
            <div
              ref={cardGooglePlayRef}
              className="install-plate install-plate-googleplay"
              style={{ opacity: 0 }}
            >
              <div className="install-plate-top">
                <span className="install-plate-title">Google Play</span>
                <div className="install-plate-badge" aria-hidden="true">
                  <div className="install-badge-icon">
                    <svg
                      width="40"
                      height="40"
                      viewBox="0 0 32 32"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <rect width="32" height="32" rx="6.4375" fill="#3063F7" />
                      <path
                        d="M25.3391 14.0313L8.98767 4.88172C8.29791 4.43591 7.42351 4.39956 6.69836 4.78701C5.96364 5.1802 5.50635 5.94267 5.50635 6.77688V25.2234C5.50635 26.0576 5.96268 26.8191 6.69836 27.2123C7.42064 27.5988 8.29408 27.5663 8.98767 27.1186L25.3391 17.969C26.0623 17.5643 26.4938 16.8286 26.4938 16.0001C26.4938 15.1717 26.0623 14.436 25.3391 14.0313ZM19.8421 12.6795L17.5843 14.9373L9.59229 6.9443L19.8421 12.6795ZM7.01119 25.4769V6.52336L16.5214 16.0001L7.01119 25.4769ZM9.59229 25.0569L17.5853 17.064L19.843 19.3217L9.59229 25.0569ZM24.6044 16.6574L21.2063 18.5583L18.6481 16.0001L21.2063 13.442L24.6044 15.3429C24.9516 15.5371 24.9889 15.8672 24.9889 15.9992C24.9889 16.1312 24.9516 16.4613 24.6044 16.6555V16.6574Z"
                        fill="white"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="install-hover-icon" aria-hidden="true">
                <img
                  src="/hover-googleplay.webp"
                  alt=""
                  width="280"
                  height="280"
                  className="install-hover-icon-img"
                  loading="lazy"
                  decoding="async"
                />
              </div>

              <div className="install-plate-bottom">
                <a
                  href="#download-android"
                  className="install-action-btn btn-android"
                  onClick={(e) => {
                    e.preventDefault();
                    onOpenModal?.();
                  }}
                >
                  <span>Скачать для Android</span>
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Giant Typography: УСТАНОВКА SEND (Figma 144:1173 / 144:1192) */}
          <div className="install-bottom-row" aria-hidden="true">
            <span className="install-giant-text text-install">УСТАНОВКА</span>
            <span className="install-giant-text text-send">SEND</span>
          </div>
        </div>
      </section>

      {/* Fullscreen High-Z-Index Flight Portal: buttons literally fly from the header down across the screen into the block */}
      {mounted &&
        createPortal(
          <div className="store-morph-overlay" aria-hidden="true">
            {/* Flying Card 1: App Store */}
            <div
              ref={flyingASRef}
              className="install-plate install-plate-appstore flying-plate"
              style={{ display: 'none' }}
            >
              <div className="install-plate-top">
                <span className="install-plate-title" style={{ opacity: 0 }}>
                  App Store
                </span>
                <div className="install-plate-badge">
                  <div className="install-badge-icon">
                    <svg
                      width="40"
                      height="40"
                      viewBox="0 0 32 32"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M25.532 0.00158691H6.46267C2.892 0.00158691 0 2.89359 0 6.46559V25.5389C0 29.1069 2.892 31.9989 6.46267 31.9989H25.536C29.104 31.9989 31.9987 29.1069 31.9987 25.5363V6.46559C31.996 2.89359 29.104 0.00158691 25.532 0.00158691ZM8.84667 25.3349C8.44667 26.0349 7.55467 26.2709 6.85467 25.8709C6.15467 25.4709 5.91867 24.5789 6.31867 23.8789L7.35867 22.0789C8.53467 21.7149 9.48933 21.9949 10.2467 22.9069L8.84667 25.3349ZM18.9573 21.4083H5.72C4.912 21.4083 4.264 20.7603 4.264 19.9523C4.264 19.1443 4.912 18.4963 5.72 18.4963H9.43067L14.1827 10.2616L12.6987 7.68559C12.2987 6.98559 12.5347 6.10159 13.2347 5.69359C13.9347 5.29359 14.8187 5.52959 15.2267 6.22959L15.8627 7.35359L16.5107 6.23359C16.9107 5.53359 17.8027 5.29759 18.5027 5.69759C19.2027 6.09759 19.4387 6.98959 19.0387 7.68825L12.796 18.4949H17.312C18.7733 18.4963 19.5933 20.2163 18.9573 21.4083ZM26.0893 21.4163H23.9853L25.4053 23.8789C25.8053 24.5789 25.5693 25.4629 24.8693 25.8709C24.1693 26.2709 23.2853 26.0349 22.8773 25.3349C20.4867 21.1869 18.6893 18.0843 17.4987 16.0163C16.2787 13.9123 17.1507 11.8003 18.0107 11.0843C18.9667 12.7243 20.3947 15.2003 22.3013 18.5043H26.0893C26.8973 18.5043 27.5453 19.1523 27.5453 19.9603C27.544 20.7683 26.8973 21.4163 26.0893 21.4163Z"
                        fill="#3063F7"
                      />
                      <path
                        d="M18.957 21.408H5.71967C4.91167 21.408 4.26367 20.76 4.26367 19.952C4.26367 19.144 4.91167 18.496 5.71967 18.496H9.43034L14.1823 10.2613L12.6983 7.68533C12.2983 6.98533 12.5343 6.10133 13.2343 5.69333C13.9343 5.29333 14.8183 5.52933 15.2263 6.22933L15.8623 7.35333L16.5103 6.23333C16.9103 5.53333 17.8023 5.29733 18.5023 5.69733C19.2023 6.09733 19.4383 6.98933 19.0383 7.688L12.7957 18.4947H17.3117C18.773 18.496 19.593 20.216 18.957 21.408Z"
                        fill="white"
                      />
                      <path
                        d="M26.089 21.416H23.985L25.405 23.8787C25.805 24.5787 25.569 25.4627 24.869 25.8707C24.169 26.2707 23.285 26.0347 22.877 25.3347C20.4863 21.1867 18.689 18.084 17.4983 16.016C16.2783 13.912 17.1503 11.8 18.0103 11.084C18.9663 12.724 20.3943 15.2 22.301 18.504H26.089C26.897 18.504 27.545 19.152 27.545 19.96C27.5437 20.768 26.897 21.416 26.089 21.416Z"
                        fill="white"
                      />
                      <path
                        d="M8.84634 25.3347C8.44634 26.0347 7.55434 26.2707 6.85434 25.8707C6.15434 25.4707 5.91834 24.5787 6.31834 23.8787L7.35834 22.0787C8.53434 21.7147 9.48901 21.9947 10.2463 22.9067L8.84634 25.3347Z"
                        fill="white"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="install-hover-icon" aria-hidden="true">
                <img
                  src="/hover-appstore.webp"
                  alt=""
                  width="280"
                  height="280"
                  className="install-hover-icon-img"
                  loading="lazy"
                  decoding="async"
                />
              </div>

              <div className="install-plate-bottom" style={{ opacity: 0 }}>
                <div className="install-action-btn btn-ios">
                  <span>Скачать для iOS</span>
                </div>
              </div>
            </div>

            {/* Flying Card 2: Google Play */}
            <div
              ref={flyingGPRef}
              className="install-plate install-plate-googleplay flying-plate"
              style={{ display: 'none' }}
            >
              <div className="install-plate-top">
                <span className="install-plate-title" style={{ opacity: 0 }}>
                  Google Play
                </span>
                <div className="install-plate-badge">
                  <div className="install-badge-icon">
                    <svg
                      width="40"
                      height="40"
                      viewBox="0 0 32 32"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <rect width="32" height="32" rx="6.4375" fill="#3063F7" />
                      <path
                        d="M25.3391 14.0313L8.98767 4.88172C8.29791 4.43591 7.42351 4.39956 6.69836 4.78701C5.96364 5.1802 5.50635 5.94267 5.50635 6.77688V25.2234C5.50635 26.0576 5.96268 26.8191 6.69836 27.2123C7.42064 27.5988 8.29408 27.5663 8.98767 27.1186L25.3391 17.969C26.0623 17.5643 26.4938 16.8286 26.4938 16.0001C26.4938 15.1717 26.0623 14.436 25.3391 14.0313ZM19.8421 12.6795L17.5843 14.9373L9.59229 6.9443L19.8421 12.6795ZM7.01119 25.4769V6.52336L16.5214 16.0001L7.01119 25.4769ZM9.59229 25.0569L17.5853 17.064L19.843 19.3217L9.59229 25.0569ZM24.6044 16.6574L21.2063 18.5583L18.6481 16.0001L21.2063 13.442L24.6044 15.3429C24.9516 15.5371 24.9889 15.8672 24.9889 15.9992C24.9889 16.1312 24.9516 16.4613 24.6044 16.6555V16.6574Z"
                        fill="white"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="install-hover-icon" aria-hidden="true">
                <img
                  src="/hover-googleplay.webp"
                  alt=""
                  width="280"
                  height="280"
                  className="install-hover-icon-img"
                  loading="lazy"
                  decoding="async"
                />
              </div>

              <div className="install-plate-bottom" style={{ opacity: 0 }}>
                <div className="install-action-btn btn-android">
                  <span>Скачать для Android</span>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};

export default InstallSection;
