import React, { useState, useMemo } from 'react';
import { Search, X, BookOpen } from 'lucide-react';
import { Guide, PrintingCategory, ProgressMap } from '../types';
import { GuideCard } from './GuideCard';

interface GuidesSectionProps {
  guides: Guide[];
  printingCategories?: PrintingCategory[];
  progressMap: ProgressMap;
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  onOpenChecklist: (guide: Guide) => void;
}

export const GuidesSection: React.FC<GuidesSectionProps> = ({
  guides,
  printingCategories = [],
  progressMap,
  selectedCategory,
  onSelectCategory,
  onOpenChecklist,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Dynamically derive all category options
  const categoryOptions = useMemo(() => {
    const list: string[] = ['All Guides'];
    if (printingCategories && printingCategories.length > 0) {
      printingCategories.forEach((c) => {
        if (!list.includes(c.name)) list.push(c.name);
      });
    }
    // Also include any unique categories used by guides
    guides.forEach((g) => {
      if (g.category && !list.includes(g.category)) {
        list.push(g.category);
      }
    });
    return list;
  }, [printingCategories, guides]);

  // Combined search and category filtering
  const filteredGuides = useMemo(() => {
    return guides.filter((guide) => {
      // Category match
      const matchesCategory =
        selectedCategory === 'All Guides' || guide.category === selectedCategory;

      if (!matchesCategory) return false;

      // Search match
      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase().trim();
      const inTitle = guide.title.toLowerCase().includes(q);
      const inDesc = guide.description?.toLowerCase().includes(q) || false;
      const inCat = guide.category.toLowerCase().includes(q);
      const inSteps = guide.steps?.some((s) =>
        s.instruction.toLowerCase().includes(q) || (s.description?.toLowerCase().includes(q) ?? false)
      );

      return inTitle || inDesc || inCat || inSteps;
    });
  }, [guides, selectedCategory, searchQuery]);

  return (
    <section id="guides-section" className="guides-section" aria-label="Printing Guides">
      {/* Section Header Row */}
      <div className="section-header">
        <div>
          <span
            style={{
              fontSize: '12px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--primary)',
            }}
          >
            Shop Guides
          </span>
          <h2>Printing Instructions</h2>
          <p>Follow numbered instructions for Xerox, WhatsApp documents, photos, and everyday printing tasks.</p>
        </div>

        {/* Search Bar */}
        <div className="search-box">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search printing guides..."
            aria-label="Search printing guides"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="search-clear"
              aria-label="Clear search input"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Dynamic Category Filter Bar */}
      <div className="category-filter-bar" role="tablist" aria-label="Filter guides by category">
        {categoryOptions.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              role="tab"
              aria-selected={isActive}
              onClick={() => onSelectCategory(cat)}
              className={`btn btn-pill ${isActive ? 'active' : ''}`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Guides Grid or Empty State */}
      {guides.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '50px 20px',
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            border: '1px dashed var(--border-medium)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)',
            }}
          >
            <BookOpen size={24} />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: 600 }}>No Printing Tasks Added Yet</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '400px' }}>
            The administrator has not added any printing tasks yet. New tasks created in the admin dashboard will appear here immediately for shop customers.
          </p>
        </div>
      ) : filteredGuides.length > 0 ? (
        <div className="guides-grid">
          {filteredGuides.map((guide) => (
            <GuideCard
              key={guide.id}
              guide={guide}
              completedStepIds={progressMap[guide.id] || []}
              onOpenChecklist={onOpenChecklist}
            />
          ))}
        </div>
      ) : (
        <div
          style={{
            textAlign: 'center',
            padding: '50px 20px',
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            border: '1px dashed var(--border-medium)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)',
            }}
          >
            <Search size={20} />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: 600 }}>No matching guides found</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '400px' }}>
            We couldn&apos;t find any guides matching &ldquo;{searchQuery}&rdquo; in {selectedCategory}.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              onSelectCategory('All Guides');
            }}
            className="btn btn-outline-soft"
            style={{ marginTop: '8px' }}
          >
            Reset Filters
          </button>
        </div>
      )}
    </section>
  );
};
