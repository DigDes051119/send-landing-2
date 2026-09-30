import React, { useState } from 'react';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formError, setFormError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message })
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || 'Не удалось отправить сообщение. Попробуйте позже.');
      }
      setIsSuccess(true);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Не удалось отправить сообщение. Попробуйте позже.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDone = () => {
    setName('');
    setEmail('');
    setMessage('');
    setIsSuccess(false);
    setFormError('');
    onClose();
  };

  if (!isOpen) return null;

  const firstName = name.trim() ? name.trim().split(' ')[0] : 'there';

  return (
    <div id="contact-modal" className="open" role="dialog" aria-modal="true" aria-labelledby="modal-title-head">
      <div className="modal-backdrop" id="modal-backdrop" onClick={handleDone}></div>
      <div className="modal-panel" id="modal-panel">
        <div className="modal-header">
          <div>
            <div className="eyebrow dark">
              <span className="eyebrow-dot"></span>
              <span>Связаться</span>
            </div>
            <h2 id="modal-title-head" className="modal-title">
              <span className="clip-box"><span className="clip-inner">Напишите</span></span>
              <span className="clip-box"><span className="clip-inner">нам</span></span>
            </h2>
          </div>

          <button
            type="button"
            className="modal-close-btn"
            id="modal-close-btn"
            aria-label="Закрыть форму связи"
            onClick={handleDone}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18"/>
            </svg>
          </button>
        </div>

        {!isSuccess ? (
          <form className="contact-form" id="contact-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="contact-name" className="form-label">Имя</label>
              <input
                type="text"
                id="contact-name"
                name="name"
                className="form-input"
                placeholder="Ваше имя"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="contact-email" className="form-label">Электронная почта</label>
              <input
                type="email"
                id="contact-email"
                name="email"
                className="form-input"
                placeholder="name@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="contact-message" className="form-label">Сообщение</label>
              <textarea
                id="contact-message"
                name="message"
                className="form-textarea"
                rows={3}
                placeholder="Напишите ваш вопрос…"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>

            {formError && <p className="form-error" role="alert">{formError}</p>}

            <button
              type="submit"
              className="form-submit-btn"
              id="form-submit-btn"
              disabled={submitting}
            >
              {submitting ? 'Отправка…' : 'Отправить'}
            </button>
          </form>
        ) : (
          <div className="success-panel visible" id="success-panel">
            <div className="success-check-circle" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 13l4 4L19 7"/>
              </svg>
            </div>
            <div className="success-title">Сообщение отправлено</div>
            <p className="success-subtext" id="success-message">
              Спасибо, {firstName}. Ваше сообщение принято.
            </p>
            <button type="button" className="btn-pill solid" id="modal-done-btn" onClick={handleDone}>
              Готово
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
