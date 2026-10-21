import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  CheckCircle2,
  RotateCcw,
  Trash2,
  Check,
  AlertCircle,
} from 'lucide-react';
import { Guide } from '../types';

interface ChecklistViewProps {
  guide: Guide;
  completedStepIds: string[];
  onToggleStep: (guideId: string, stepId: string) => void;
  onResetGuide: (guideId: string) => void;
  onResetAll: () => void;
  onBack: () => void;
}

export const ChecklistView: React.FC<ChecklistViewProps> = ({
  guide,
  completedStepIds,
  onToggleStep,
  onResetGuide,
  onResetAll,
  onBack,
}) => {
  const [showDoneConfirm, setShowDoneConfirm] = useState(false);
  const [showClearAllConfirm, setShowClearAllConfirm] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const totalSteps = guide.steps ? guide.steps.length : 0;
  const validCompletedCount = guide.steps.filter((s) =>
    completedStepIds.includes(s.id)
  ).length;

  const percentage =
    totalSteps > 0 ? Math.round((validCompletedCount / totalSteps) * 100) : 0;
  const isAllComplete = totalSteps > 0 && validCompletedCount === totalSteps;

  const handleConfirmDone = () => {
    onResetGuide(guide.id);
    setShowDoneConfirm(false);
    setNotification('Progress for this guide has been reset to zero.');
    setTimeout(() => setNotification(null), 3500);
  };

  const handleConfirmClearAll = () => {
    onResetAll();
    setShowClearAllConfirm(false);
    setNotification('All guide progress has been cleared across the shop.');
    setTimeout(() => setNotification(null), 3500);
  };

  return (
    <div className="checklist-container">
      {/* Top Navigation */}
      <div style={{ marginBottom: '28px' }}>
        <button
          onClick={onBack}
          className="btn btn-outline-soft"
          style={{ padding: '6px 14px', fontSize: '13px', marginBottom: '16px' }}
          aria-label="Back to printing guides list"
        >
          <ArrowLeft size={15} />
          <span>Back to Guides</span>
        </button>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span className="guide-cat-badge">{guide.category}</span>
            {isAllComplete && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#15803d',
                  backgroundColor: '#dcfce7',
                  padding: '3px 8px',
                  borderRadius: '9999px',
                }}
              >
                <Check size={12} strokeWidth={3} /> Completed
              </span>
            )}
          </div>
          <h1 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', color: 'var(--text-main)' }}>
            {guide.title}
          </h1>
          {guide.description && guide.description.trim() ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '15px', marginTop: '6px', lineHeight: 1.5 }}>
              {guide.description}
            </p>
          ) : null}
        </div>
      </div>

      {/* Progress Card */}
      <div
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid var(--border-card)',
          borderRadius: '20px',
          padding: '20px',
          marginBottom: '28px',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)' }}>
            {validCompletedCount} of {totalSteps} steps completed
          </div>
          <div
            style={{
              fontSize: '13px',
              fontWeight: 700,
              padding: '3px 10px',
              borderRadius: '9999px',
              backgroundColor: isAllComplete ? '#dcfce7' : 'var(--primary-light)',
              color: isAllComplete ? '#15803d' : 'var(--primary)',
            }}
          >
            {percentage}%
          </div>
        </div>
        <div
          className="guide-progress-track"
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <motion.div
            className={`guide-progress-fill ${isAllComplete ? 'complete' : ''}`}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
      </div>

      {/* Success / Notification Banner */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="success-banner"
            style={{ marginBottom: '20px' }}
          >
            <CheckCircle2 size={16} />
            <span>{notification}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Steps List */}
      {totalSteps === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '48px 20px',
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            color: 'var(--text-muted)',
            marginBottom: '32px',
            border: '1px dashed var(--border-medium)',
          }}
        >
          <p>No steps found in this guide yet.</p>
          <p style={{ fontSize: '12px', marginTop: '4px' }}>
            The administrator can add steps in the Admin Dashboard.
          </p>
        </div>
      ) : (
        <div role="list" style={{ marginBottom: '36px' }}>
          {guide.steps.map((step, index) => {
            const isCompleted = completedStepIds.includes(step.id);
            return (
              <motion.div
                key={step.id}
                role="listitem"
                tabIndex={0}
                aria-checked={isCompleted}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onToggleStep(guide.id, step.id);
                  }
                }}
                onClick={() => onToggleStep(guide.id, step.id)}
                className={`step-item ${isCompleted ? 'is-completed' : ''}`}
                whileTap={{ scale: 0.99 }}
              >
                <div className="step-number-box">
                  {isCompleted ? <Check size={16} strokeWidth={3} /> : index + 1}
                </div>
                <div className="step-text">
                  <div style={{ fontWeight: 500 }}>{step.instruction}</div>
                  {(step.description || step.note) && (
                    <div
                      style={{
                        fontSize: '13px',
                        marginTop: '4px',
                        fontWeight: 400,
                        lineHeight: 1.4,
                        color: isCompleted ? '#166534' : 'var(--text-muted)',
                      }}
                    >
                      {step.description || step.note}
                    </div>
                  )}
                </div>
                {isCompleted && (
                  <div style={{ color: '#16a34a', flexShrink: 0, paddingTop: '4px' }}>
                    <CheckCircle2 size={20} />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Bottom Action Bar: DONE & CLEAR ALL */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          padding: '20px',
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          border: '1px solid var(--border-card)',
          flexWrap: 'wrap',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          Click any step to toggle completion. Progress is auto-saved.
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* DONE: resets current guide */}
          <button
            onClick={() => setShowDoneConfirm(true)}
            className="btn btn-primary"
            aria-label="Mark task done and reset this guide's progress"
          >
            <RotateCcw size={14} />
            <span>DONE</span>
          </button>

          {/* CLEAR ALL: resets all guides */}
          <button
            onClick={() => setShowClearAllConfirm(true)}
            className="btn btn-outline-soft"
            style={{ color: '#b91c1c', borderColor: '#fca5a5' }}
            aria-label="Clear all completed marks across every guide"
          >
            <Trash2 size={14} />
            <span>CLEAR ALL</span>
          </button>
        </div>
      </div>

      {/* Confirmation Modal for DONE (Current Guide Only) */}
      <AnimatePresence>
        {showDoneConfirm && (
          <div className="modal-overlay" onClick={() => setShowDoneConfirm(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              className="modal-card"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h3>Reset This Guide?</h3>
              </div>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Selecting <strong>DONE</strong> will clear all step completion marks for{' '}
                <strong>&ldquo;{guide.title}&rdquo;</strong> and reset its progress to 0%.
                The guide instructions will remain intact.
              </p>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  onClick={() => setShowDoneConfirm(false)}
                  className="btn btn-outline-soft"
                >
                  Cancel
                </button>
                <button onClick={handleConfirmDone} className="btn btn-primary">
                  Yes, Reset Guide
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal for CLEAR ALL (All Guides) */}
      <AnimatePresence>
        {showClearAllConfirm && (
          <div className="modal-overlay" onClick={() => setShowClearAllConfirm(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              className="modal-card"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertCircle size={20} color="#b91c1c" />
                  <h3 style={{ color: '#b91c1c' }}>Clear All Guides Progress?</h3>
                </div>
              </div>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                This will reset completion marks across <strong>every printing guide</strong> in the
                shop. No guides or instructions will be deleted.
              </p>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  onClick={() => setShowClearAllConfirm(false)}
                  className="btn btn-outline-soft"
                >
                  Cancel
                </button>
                <button onClick={handleConfirmClearAll} className="btn btn-danger">
                  Clear All Progress
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
