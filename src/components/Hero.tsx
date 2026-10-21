import React from 'react';
import { motion } from 'motion/react';
import { MessageSquare, Copy, FileText, ArrowRight, BookOpen, HelpCircle } from 'lucide-react';
import { GuideCategory } from '../types';

interface HeroProps {
  onSeeGuides: () => void;
  onHowItWorks: () => void;
  onSelectServiceCard?: (category: GuideCategory) => void;
}

export const Hero: React.FC<HeroProps> = ({
  onSeeGuides,
  onHowItWorks,
  onSelectServiceCard,
}) => {
  return (
    <section className="hero-section" aria-label="Hero Introduction">
      <div className="hero-grid">
        {/* Left Side: Description and Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="hero-left-content"
        >
          <h1 className="hero-title">
            Simple Printing Guides for Your{' '}
            <span className="hero-title-accent">Everyday Shop Tasks.</span>
          </h1>

          <p className="hero-desc">
            Follow clear, numbered instructions for Xerox, WhatsApp documents, photos, and everyday printing tasks.
          </p>

          <div className="hero-actions-row">
            <button onClick={onSeeGuides} className="btn btn-primary">
              <BookOpen size={16} />
              <span>See Guides</span>
            </button>

            <button onClick={onHowItWorks} className="btn btn-outline-soft">
              <HelpCircle size={16} />
              <span>How It Works</span>
            </button>
          </div>
        </motion.div>

        {/* Right Side: Three Floating Service Cards */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="hero-cards-stack"
        >
          {/* 1. WhatsApp Printing (Pale Lavender) */}
          <div
            onClick={() => onSelectServiceCard?.('WhatsApp')}
            className="service-card card-lavender"
            role="button"
            tabIndex={0}
            aria-label="View WhatsApp Printing guide"
          >
            <div className="service-card-icon-box" style={{ color: '#7c3aed' }}>
              <MessageSquare size={22} />
            </div>
            <div className="service-card-text">
              <h3>WhatsApp Printing</h3>
              <p>Tickets, PDF contracts, receipts & customer photos</p>
            </div>
            <ArrowRight size={18} className="service-card-arrow" />
          </div>

          {/* 2. Xerox (Pale Pink) */}
          <div
            onClick={() => onSelectServiceCard?.('Xerox')}
            className="service-card card-pink"
            role="button"
            tabIndex={0}
            aria-label="View Xerox Photocopy guide"
          >
            <div className="service-card-icon-box" style={{ color: '#db2777' }}>
              <Copy size={22} />
            </div>
            <div className="service-card-text">
              <h3>Xerox</h3>
              <p>Single & double-sided B&W photocopies and ID cards</p>
            </div>
            <ArrowRight size={18} className="service-card-arrow" />
          </div>

          {/* 3. PDF & Photos (Pale Cream / Soft Yellow) */}
          <div
            onClick={() => onSelectServiceCard?.('Email & PDF')}
            className="service-card card-cream"
            role="button"
            tabIndex={0}
            aria-label="View PDF & Photos printing guide"
          >
            <div className="service-card-icon-box" style={{ color: '#d97706' }}>
              <FileText size={22} />
            </div>
            <div className="service-card-text">
              <h3>PDF & Photos</h3>
              <p>Email attachments, glossy color photos & project charts</p>
            </div>
            <ArrowRight size={18} className="service-card-arrow" />
          </div>
        </motion.div>
      </div>
    </section>
  );
};
