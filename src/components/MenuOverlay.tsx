import React from 'react';
import { SendLogo } from './SendLogo';

interface MenuOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenModal: () => void;
  onNavigate?: (sectionId: string) => void;
}

export const MenuOverlay: React.FC<MenuOverlayProps> = ({ isOpen, onClose, onOpenModal, onNavigate }) => {
  if (!isOpen) return null;

  const handleItemClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    onClose();
    if (onNavigate) {
      onNavigate(id);
    } else if ((window as any).scrollToSection) {
      (window as any).scrollToSection(id);
    } else {
      (window as any).lenis?.scrollTo(`#${id}`, { offset: -60, duration: 1.0 });
    }
  };

  return (
    <aside id="menu-overlay" className="open" aria-label="Navigation Overlay">
      <div className="menu-backdrop" id="menu-backdrop" onClick={onClose}></div>
      <div className="menu-panel" id="menu-panel">
        <div className="menu-top-row">
          <div className="menu-brand">
            <SendLogo />
          </div>

          <button
            type="button"
            className="menu-close-btn"
            id="menu-close-btn"
            aria-label="Close navigation overlay"
            onClick={onClose}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18"/>
            </svg>
          </button>
        </div>

        <nav className="menu-nav-links" aria-label="Fullscreen Navigation">
          <a
            href="#hero"
            className="menu-nav-item"
            id="menu-item-0"
            onClick={(e) => handleItemClick(e, 'hero')}
          >
            Главная
          </a>
          <a
            href="#features"
            className="menu-nav-item"
            id="menu-item-1"
            onClick={(e) => handleItemClick(e, 'features')}
          >
            Функции
          </a>
          <a
            href="#privacy"
            className="menu-nav-item"
            id="menu-item-2"
            onClick={(e) => handleItemClick(e, 'privacy')}
          >
            Приватность
          </a>
          <a
            href="#faq"
            className="menu-nav-item"
            id="menu-item-3"
            onClick={(e) => handleItemClick(e, 'faq')}
          >
            FAQ
          </a>
        </nav>

        <div className="menu-bottom-row">
          <button
            type="button"
            className="btn-pill light"
            id="btn-menu-book"
            onClick={() => {
              onClose();
              onOpenModal();
            }}
          >
            <span>Book a Visit</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6"/>
            </svg>
          </button>

          <div className="menu-social-links">
            <a href="#instagram">Instagram</a>
            <a href="#x">X</a>
            <a href="#youtube">YouTube</a>
            <a href="#linkedin">LinkedIn</a>
          </div>
        </div>
      </div>
    </aside>
  );
};
