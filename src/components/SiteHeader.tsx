import React, { useState, useEffect } from 'react';
import { SendLogo } from './SendLogo';

interface SiteHeaderProps {
  onOpenModal?: () => void;
  onOpenMenu?: () => void;
  ready?: boolean;
  onNavigate?: (sectionId: string) => void;
  isStoreDocked?: boolean;
}

const navItems = [
  { id: 'hero', label: 'Главная', href: '#hero' },
  { id: 'features', label: 'Функции', href: '#features' },
  { id: 'privacy', label: 'Приватность', href: '#privacy' },
  { id: 'faq', label: 'FAQ', href: '#faq' },
];

export const SiteHeader: React.FC<SiteHeaderProps> = ({
  onOpenModal,
  onOpenMenu,
  ready = true,
  onNavigate,
  isStoreDocked = false,
}) => {
  const [activeNav, setActiveNav] = useState('hero');
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || window.pageYOffset;
      // When scrolled past 80px, collapse into sticky fixed floating header
      setIsScrolled(scrollY > 80);

      // Section scroll spy to update active section in header
      const block2El = document.getElementById('chats-feature') || document.getElementById('features');
      const block3El = document.getElementById('privacy');
      const faqEl = document.getElementById('faq');

      if (faqEl && faqEl.getBoundingClientRect().top <= 350) {
        setActiveNav('faq');
      } else if (block3El && block3El.getBoundingClientRect().top <= 350) {
        setActiveNav('privacy');
      } else if (block2El && block2El.getBoundingClientRect().top <= 300) {
        setActiveNav('features');
      } else {
        setActiveNav('hero');
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
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, item: typeof navItems[0]) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveNav(item.id);

    if (onNavigate) {
      onNavigate(item.id);
    } else if ((window as any).scrollToSection) {
      (window as any).scrollToSection(item.id);
    } else {
      const targetEl = document.querySelector(item.href) || document.getElementById(item.id);
      if (targetEl) {
        const lenis = (window as any).lenis;
        if (lenis && typeof lenis.scrollTo === 'function') {
          lenis.scrollTo(targetEl, { offset: -60, duration: 1.0 });
        } else {
          const yOffset = -60;
          const y = targetEl.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
        }
      }
    }
  };

  return (
    <header
      className={`site-header ${ready ? 'is-ready' : 'is-entering'} ${isScrolled ? 'is-scrolled' : ''} ${isStoreDocked ? 'is-store-docked' : ''}`}
    >
      {/* Left Navigation: unified morphing pill (expands to 402px, retracts to 64px circle) */}
      <div className="header-left-slot">
        <div
          className={`header-menu-capsule ${isScrolled ? 'collapsed' : ''}`}
          onClick={(e) => {
            // Trigger onOpenMenu if clicking on burger layer or outside nav links
            if (isScrolled && !(e.target as HTMLElement).closest('.nav-pill-item')) {
              onOpenMenu?.();
            }
          }}
          role={isScrolled ? 'button' : undefined}
          tabIndex={isScrolled ? 0 : undefined}
          aria-label={isScrolled ? 'Открыть меню' : undefined}
        >
          {/* Staggered Burger Icon (Figma 37:301 / 37:319) - slides in with kinetic bezier */}
          <div className="capsule-burger-layer" aria-hidden={!isScrolled}>
            <svg
              className="bars-staggered-icon"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                className="burger-bar-1"
                d="M0 1.5C0 0.67 0.67 0 1.5 0L17.5 0C18.33 0 19 0.67 19 1.5C19 2.33 18.33 3 17.5 3L1.5 3C0.67 3 0 2.33 0 1.5Z"
                fill="#3063F7"
                transform="translate(0, 2.5)"
              />
              <path
                className="burger-bar-2"
                d="M22.5 8L6.5 8C5.67 8 5 8.67 5 9.5C5 10.33 5.67 11 6.5 11L22.5 11C23.33 11 24 10.33 24 9.5C24 8.67 23.33 8 22.5 8Z"
                fill="#3063F7"
                transform="translate(0, 2.5)"
              />
              <path
                className="burger-bar-3"
                d="M17.5 16L1.5 16C0.67 16 0 16.67 0 17.5C0 18.33 0.67 19 1.5 19L17.5 19C18.33 19 19 18.33 19 17.5C19 16.67 18.33 16 17.5 16Z"
                fill="#3063F7"
                transform="translate(0, 2.5)"
              />
            </svg>
          </div>

          {/* Full Navigation Links - always clickable whether header is at top or hovered in collapsed state */}
          <nav className="header-nav-inner" aria-label="Main Navigation">
            {navItems.map((item, idx) => (
              <a
                key={item.id}
                href={item.href}
                className={`nav-pill-item nav-item-${idx} ${activeNav === item.id ? 'active' : ''}`}
                onClick={(e) => handleNavClick(e, item)}
                tabIndex={0}
              >
                <span className="nav-link-text">{item.label}</span>
              </a>
            ))}
          </nav>
        </div>
      </div>

      {/* Center Brand Logo (Send 1 / 37:267: 156x48px) */}
      <a href="#hero" className="header-center" aria-label="Send Messenger Главная" onClick={(e) => handleNavClick(e, navItems[0])}>
        <SendLogo height={42} className="header-send-logo" />
      </a>

      {/* Right Store Buttons (Frame 427321495: 316x64px, gap 12px) */}
      <div className="header-right">
        {/* App Store Download Button (Frame 427321488: 152x64px) */}
        <a
          href="#download-ios"
          className="header-store-btn store-appstore"
          id="btn-header-appstore"
          aria-label="Скачать в App Store"
        >
          <div className="store-btn-icon-wrap" aria-hidden="true">
            <svg
              className="store-btn-svg"
              width="32"
              height="32"
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
          <div className="store-btn-text">
            <span className="store-btn-label">Скачать в</span>
            <span className="store-btn-name">App Store</span>
          </div>
        </a>

        {/* Google Play Download Button (Frame 427321489: 164x64px) */}
        <a
          href="#download-android"
          className="header-store-btn store-googleplay"
          id="btn-header-googleplay"
          aria-label="Скачать в Google Play"
        >
          <div className="store-btn-icon-wrap" aria-hidden="true">
            <svg
              className="store-btn-svg"
              width="32"
              height="32"
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
          <div className="store-btn-text">
            <span className="store-btn-label">Скачать в</span>
            <span className="store-btn-name">Google Play</span>
          </div>
        </a>
      </div>
    </header>
  );
};
