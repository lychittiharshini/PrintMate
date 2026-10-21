import React from 'react';
import { motion } from 'motion/react';
import { X, CheckCircle, Search, MousePointerClick, RotateCcw } from 'lucide-react';

interface HowItWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSeeGuides: () => void;
}

export const HowItWorksModal: React.FC<HowItWorksModalProps> = ({
  isOpen,
  onClose,
  onSeeGuides,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.94 }}
        className="modal-card"
        style={{ maxWidth: '540px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3>How PrintMate Works</h3>
          <button onClick={onClose} className="modal-close-btn" aria-label="Close modal">
            <X size={16} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '12px',
                background: 'var(--pastel-lavender)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Search size={18} />
            </div>
            <div>
              <h4 style={{ fontSize: '15px', fontWeight: 600 }}>1. Choose Your Printing Guide</h4>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px', lineHeight: 1.45 }}>
                Filter by category (WhatsApp, Xerox, Aadhaar/IDs, Colour, PDF) or search for the customer&apos;s exact job type.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '12px',
                background: 'var(--pastel-pink)',
                color: '#db2777',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <MousePointerClick size={18} />
            </div>
            <div>
              <h4 style={{ fontSize: '15px', fontWeight: 600 }}>2. Follow Numbered Instructions</h4>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px', lineHeight: 1.45 }}>
                Each checklist provides the exact sequence: file download, print dialog, paper tray selection, and duplex settings.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '12px',
                background: '#dcfce7',
                color: '#15803d',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <CheckCircle size={18} />
            </div>
            <div>
              <h4 style={{ fontSize: '15px', fontWeight: 600 }}>3. Click Steps to Mark Complete</h4>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px', lineHeight: 1.45 }}>
                Clicking any step turns it green with a checkmark. Your progress is saved automatically in the browser.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '12px',
                background: 'var(--pastel-cream)',
                color: '#d97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <RotateCcw size={18} />
            </div>
            <div>
              <h4 style={{ fontSize: '15px', fontWeight: 600 }}>4. Click DONE for the Next Customer</h4>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px', lineHeight: 1.45 }}>
                When finished, click <strong>DONE</strong> to reset the checklist back to 0% ready for the next job.
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
          <button onClick={onClose} className="btn btn-outline-soft">
            Close
          </button>
          <button
            onClick={() => {
              onClose();
              onSeeGuides();
            }}
            className="btn btn-primary"
          >
            Explore Guides
          </button>
        </div>
      </motion.div>
    </div>
  );
};
