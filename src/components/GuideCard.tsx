import React from 'react';
import { motion } from 'motion/react';
import {
  MessageSquareText,
  Image,
  CreditCard,
  Copy,
  Printer,
  Mail,
  ArrowRight,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import { Guide } from '../types';

interface GuideCardProps {
  guide: Guide;
  completedStepIds: string[];
  onOpenChecklist: (guide: Guide) => void;
}

export const GuideCard: React.FC<GuideCardProps> = ({
  guide,
  completedStepIds,
  onOpenChecklist,
}) => {
  const totalSteps = guide.steps ? guide.steps.length : 0;
  const validCompletedCount = guide.steps.filter((s) =>
    completedStepIds.includes(s.id)
  ).length;

  const percentage =
    totalSteps > 0 ? Math.round((validCompletedCount / totalSteps) * 100) : 0;
  const isAllDone = totalSteps > 0 && validCompletedCount === totalSteps;

  const renderIcon = (name: string) => {
    const props = { size: 22, strokeWidth: 1.8 };
    switch (name) {
      case 'MessageSquareText':
        return <MessageSquareText {...props} />;
      case 'Image':
        return <Image {...props} />;
      case 'CreditCard':
        return <CreditCard {...props} />;
      case 'Copy':
        return <Copy {...props} />;
      case 'Printer':
        return <Printer {...props} />;
      case 'Mail':
        return <Mail {...props} />;
      default:
        return <FileText {...props} />;
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="guide-card"
    >
      <div>
        <div className="guide-card-header">
          <div className="guide-icon-pill">{renderIcon(guide.iconName)}</div>
          <span className="guide-cat-badge">{guide.category}</span>
        </div>

        <div className="guide-card-content">
          <h3>{guide.title}</h3>
          {guide.description && guide.description.trim() ? (
            <p>{guide.description}</p>
          ) : null}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* Progress Bar & Counters */}
        <div className="guide-progress-bar-wrap">
          <div className="guide-progress-labels">
            <span>
              {validCompletedCount} of {totalSteps} steps completed
            </span>
            <span style={{ fontWeight: 600 }}>{percentage}%</span>
          </div>
          <div
            className="guide-progress-track"
            role="progressbar"
            aria-valuenow={percentage}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className={`guide-progress-fill ${isAllDone ? 'complete' : ''}`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {/* Open Checklist Button */}
        <button
          onClick={() => onOpenChecklist(guide)}
          className={`btn ${isAllDone ? 'btn-outline-soft' : 'btn-primary'}`}
          style={{ width: '100%', justifyContent: 'space-between' }}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            {isAllDone && <CheckCircle2 size={15} color="#16a34a" />}
            {isAllDone ? 'Review Checklist' : 'Open Checklist'}
          </span>
          <ArrowRight size={15} />
        </button>
      </div>
    </motion.div>
  );
};
