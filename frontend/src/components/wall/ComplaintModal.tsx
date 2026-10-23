'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, CheckCircle2, AlertCircle, MessageSquareWarning, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { COPY } from '@/lib/copy';
import { getSource, trackClick } from '@/lib/tracking';
import { createComplaint, ComplaintType } from '@/lib/api';
import { normalizePakistaniPhone } from '@/lib/phone';

interface ComplaintModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ComplaintModal: React.FC<ComplaintModalProps> = ({ isOpen, onClose }) => {
  const [type, setType] = useState<ComplaintType>('complaint');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [orderDetails, setOrderDetails] = useState('');
  const [message, setMessage] = useState('');
  const [websiteHoneypot, setWebsiteHoneypot] = useState('');

  // Validation & state
  const [nameError, setNameError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [messageError, setMessageError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [successRef, setSuccessRef] = useState<string | null>(null);
  const [copiedRef, setCopiedRef] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  // Lock body scroll and trap keyboard focus
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Focus initial input
    const timer = setTimeout(() => {
      if (firstInputRef.current) {
        firstInputRef.current.focus();
      }
    }, 100);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timer);
    };
  }, [isOpen, onClose]);

  // Reset form when opening
  useEffect(() => {
    if (isOpen) {
      setNameError(null);
      setPhoneError(null);
      setMessageError(null);
      setGeneralError(null);
      setSuccessRef(null);
      setCopiedRef(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const validate = (): boolean => {
    let isValid = true;
    setNameError(null);
    setPhoneError(null);
    setMessageError(null);
    setGeneralError(null);

    const trimmedName = name.trim();
    if (trimmedName.length < 2 || trimmedName.length > 40) {
      setNameError(COPY.complaints.validationName);
      isValid = false;
    }

    const phoneValidation = normalizePakistaniPhone(phone);
    if (!phoneValidation.valid) {
      setPhoneError(phoneValidation.error || COPY.complaints.validationPhone);
      isValid = false;
    }

    const trimmedMsg = message.trim();
    if (trimmedMsg.length < 10) {
      setMessageError(COPY.complaints.validationMessage);
      isValid = false;
    } else if (trimmedMsg.length > 1000) {
      setMessageError('Paigham 1000 characters se ziada nahi ho sakta.');
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || isLoading) return;

    setIsLoading(true);
    setGeneralError(null);

    try {
      const source = getSource();
      const res = await createComplaint({
        type,
        name: name.trim(),
        phone: phone.trim(),
        order_details: orderDetails.trim() || undefined,
        message: message.trim(),
        source,
        website: websiteHoneypot,
      });

      if (res.error) {
        setGeneralError(res.error.message || COPY.complaints.networkError);
        setIsLoading(false);
        return;
      }

      if (res.data?.reference_number) {
        setSuccessRef(res.data.reference_number);
        trackClick('complaint_submitted');
        // Clear sensitive inputs from component state
        setName('');
        setPhone('');
        setOrderDetails('');
        setMessage('');
        setWebsiteHoneypot('');
      } else {
        setGeneralError(COPY.complaints.networkError);
      }
    } catch {
      setGeneralError(COPY.complaints.networkError);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyReference = () => {
    if (!successRef) return;
    try {
      navigator.clipboard.writeText(successRef);
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2500);
    } catch {
      // Ignore clipboard write restrictions
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="complaint-modal-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-craze-dark/75 backdrop-blur-xs transition-opacity duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={modalRef}
        className="w-full sm:max-w-xl max-h-[90vh] bg-white rounded-t-3xl sm:rounded-3xl border-t-4 sm:border-4 border-craze-amber shadow-2xl flex flex-col overflow-hidden text-craze-dark animate-in fade-in slide-in-from-bottom-4 duration-200"
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-craze-amber/30 bg-[#FDEFDA]/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-craze-red/10 text-craze-red flex items-center justify-center shrink-0">
              <MessageSquareWarning className="w-4 h-4" />
            </div>
            <h2
              id="complaint-modal-title"
              className="font-heading text-xl sm:text-2xl uppercase tracking-wider text-craze-red"
            >
              {COPY.complaints.modalTitle}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="w-10 h-10 rounded-full hover:bg-craze-amber/20 active:bg-craze-amber/30 flex items-center justify-center text-craze-dark/80 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-5">
          {successRef ? (
            /* Thank-You State Card */
            <div className="text-center py-6 sm:py-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 border-2 border-emerald-400 text-emerald-700 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <h3 className="font-heading text-2xl sm:text-3xl uppercase tracking-wider text-craze-red">
                {COPY.complaints.successTitle}
              </h3>

              <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-4 max-w-md mx-auto shadow-xs">
                <p className="font-serif italic text-sm sm:text-base text-emerald-950 font-semibold leading-relaxed">
                  {COPY.complaints.successMessage}
                </p>
              </div>

              {/* Reference Number Box */}
              <div className="my-6 p-4 rounded-2xl bg-[#FDEFDA] border-2 border-craze-amber inline-block min-w-[260px]">
                <span className="block text-xs font-sans font-bold uppercase tracking-wider text-craze-dark/70 mb-1">
                  {COPY.complaints.referenceLabel}
                </span>
                <div className="flex items-center justify-center gap-2">
                  <span className="font-heading text-2xl sm:text-3xl tracking-widest text-craze-red font-bold select-all">
                    {successRef}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyReference}
                    title="Copy reference code"
                    className="p-1.5 rounded-lg bg-white/80 hover:bg-white text-craze-dark transition-colors border border-craze-amber/40"
                  >
                    {copiedRef ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-craze-dark/70" />
                    )}
                  </button>
                </div>
                {copiedRef && (
                  <span className="block text-[11px] font-sans text-emerald-700 font-semibold mt-1">
                    Copied to clipboard
                  </span>
                )}
              </div>

              <p className="text-xs font-sans text-craze-dark/65 max-w-sm mx-auto">
                Rabta karte waqt yeh reference number batayein taake aapka masla foran trace ho sake.
              </p>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto min-w-[200px] min-h-[48px] px-6 py-3 rounded-xl bg-craze-amber text-craze-dark font-heading text-lg uppercase tracking-wider shadow-[0_4px_0_0_#b88225] hover:bg-[#ffc66e] active:translate-y-0.5 transition-all"
                >
                  {COPY.complaints.closeButton}
                </button>
              </div>
            </div>
          ) : (
            /* Complaint Submission Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Reassurance Message */}
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-craze-amber/50 text-xs sm:text-sm font-serif italic text-craze-dark/85 leading-relaxed">
                {COPY.complaints.reassurance}
              </div>

              {/* General / Rate-limit / Server Error Banner */}
              {generalError && (
                <div className="p-3.5 rounded-xl bg-red-100 border border-red-300 text-red-800 text-xs sm:text-sm font-sans flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                    <span>{generalError}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="text-xs font-bold underline hover:text-red-950 shrink-0"
                  >
                    {COPY.complaints.retryButton}
                  </button>
                </div>
              )}

              {/* 1. Type Selector (3 large tap-friendly choices) */}
              <div>
                <label className="block text-xs font-sans font-bold uppercase tracking-wider text-craze-dark/80 mb-2">
                  {COPY.complaints.typeLabel}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      { key: 'complaint', label: COPY.complaints.typeComplaint },
                      { key: 'suggestion', label: COPY.complaints.typeSuggestion },
                      { key: 'other', label: COPY.complaints.typeOther },
                    ] as const
                  ).map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setType(item.key)}
                      className={`min-h-[48px] py-2.5 px-2 rounded-xl font-heading text-sm sm:text-base uppercase tracking-wider border-2 transition-all text-center flex items-center justify-center cursor-pointer ${
                        type === item.key
                          ? 'bg-craze-amber border-craze-amber text-craze-dark font-bold shadow-xs'
                          : 'bg-white border-gray-200 text-gray-700 hover:border-craze-amber/50'
                      }`}
                    >
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Name Field */}
              <div>
                <label
                  htmlFor="complaint-name"
                  className="block text-xs font-sans font-bold uppercase tracking-wider text-craze-dark/80 mb-1"
                >
                  {COPY.complaints.nameLabel} <span className="text-craze-red">*</span>
                </label>
                <input
                  ref={firstInputRef}
                  id="complaint-name"
                  type="text"
                  maxLength={40}
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (nameError) setNameError(null);
                  }}
                  placeholder={COPY.complaints.namePlaceholder}
                  className="w-full min-h-[48px] px-3.5 py-2.5 rounded-xl border-2 border-gray-200 focus:border-craze-amber focus:outline-none text-base text-craze-dark font-sans placeholder:text-gray-400 transition-colors"
                  style={{ fontSize: '16px' }}
                />
                {nameError && (
                  <p className="mt-1 text-xs text-craze-red font-sans font-medium">
                    {nameError}
                  </p>
                )}
              </div>

              {/* 3. Phone Number Field (Pakistani mobile format with numeric keypad) */}
              <div>
                <label
                  htmlFor="complaint-phone"
                  className="block text-xs font-sans font-bold uppercase tracking-wider text-craze-dark/80 mb-1"
                >
                  {COPY.complaints.phoneLabel} <span className="text-craze-red">*</span>
                </label>
                <input
                  id="complaint-phone"
                  type="tel"
                  inputMode="numeric"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (phoneError) setPhoneError(null);
                  }}
                  placeholder={COPY.complaints.phonePlaceholder}
                  className="w-full min-h-[48px] px-3.5 py-2.5 rounded-xl border-2 border-gray-200 focus:border-craze-amber focus:outline-none text-base text-craze-dark font-sans placeholder:text-gray-400 transition-colors"
                  style={{ fontSize: '16px' }}
                />
                {phoneError ? (
                  <p className="mt-1 text-xs text-craze-red font-sans font-medium">
                    {phoneError}
                  </p>
                ) : (
                  <p className="mt-1 text-[11px] text-craze-dark/60 font-sans">
                    Format: 0300 1234567 ya +92 300 1234567
                  </p>
                )}
              </div>

              {/* 4. Order Details Field (Optional) */}
              <div>
                <label
                  htmlFor="complaint-order"
                  className="block text-xs font-sans font-bold uppercase tracking-wider text-craze-dark/80 mb-1"
                >
                  {COPY.complaints.orderDetailsLabel}
                </label>
                <input
                  id="complaint-order"
                  type="text"
                  maxLength={100}
                  value={orderDetails}
                  onChange={(e) => setOrderDetails(e.target.value)}
                  placeholder={COPY.complaints.orderDetailsPlaceholder}
                  className="w-full min-h-[48px] px-3.5 py-2.5 rounded-xl border-2 border-gray-200 focus:border-craze-amber focus:outline-none text-base text-craze-dark font-sans placeholder:text-gray-400 transition-colors"
                  style={{ fontSize: '16px' }}
                />
              </div>

              {/* 5. Message Field (10 to 1000 chars with live counter) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label
                    htmlFor="complaint-message"
                    className="block text-xs font-sans font-bold uppercase tracking-wider text-craze-dark/80"
                  >
                    {COPY.complaints.messageLabel} <span className="text-craze-red">*</span>
                  </label>
                  <span
                    className={`text-[11px] font-sans ${
                      message.length > 950
                        ? 'text-craze-red font-bold'
                        : 'text-craze-dark/60'
                    }`}
                  >
                    {message.length} / 1000
                  </span>
                </div>
                <textarea
                  id="complaint-message"
                  rows={4}
                  maxLength={1000}
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    if (messageError) setMessageError(null);
                  }}
                  placeholder={COPY.complaints.messagePlaceholder}
                  className="w-full p-3.5 rounded-xl border-2 border-gray-200 focus:border-craze-amber focus:outline-none text-base text-craze-dark font-sans placeholder:text-gray-400 resize-none transition-colors"
                  style={{ fontSize: '16px' }}
                />
                {messageError && (
                  <p className="mt-1 text-xs text-craze-red font-sans font-medium">
                    {messageError}
                  </p>
                )}
              </div>

              {/* 6. Hidden Honeypot Spam Trap (Real users never see or fill this) */}
              <div
                aria-hidden="true"
                tabIndex={-1}
                style={{
                  display: 'none',
                  position: 'absolute',
                  left: '-9999px',
                }}
              >
                <label htmlFor="website-field">Website</label>
                <input
                  id="website-field"
                  type="text"
                  name="website"
                  tabIndex={-1}
                  value={websiteHoneypot}
                  onChange={(e) => setWebsiteHoneypot(e.target.value)}
                  autoComplete="off"
                />
              </div>

              {/* 7. Privacy & Consent Note */}
              <p className="text-xs font-sans text-craze-dark/70 leading-relaxed bg-gray-50 p-2.5 rounded-lg border border-gray-200">
                {COPY.complaints.consentText}
              </p>

              {/* 8. Full-Width Submit Button (min 56px tall, no arrows, loading state) */}
              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  disabled={isLoading}
                  className="min-h-[56px] text-lg sm:text-xl font-heading uppercase tracking-wider"
                >
                  <span>
                    {isLoading ? COPY.complaints.submitting : COPY.complaints.submitButton}
                  </span>
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
