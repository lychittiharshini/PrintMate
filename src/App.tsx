/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Guide, GuideCategory, ProgressMap, ProductCategory, Product } from './types';
import {
  getSavedGuides,
  saveGuides,
  getProgressMap,
  toggleStepCompletion,
  resetSingleGuideProgress,
  resetAllGuidesProgress,
  getSavedCategories,
  saveCategories,
  getSavedProducts,
  saveProducts,
  isAdminAuthenticated,
  setAdminAuthenticated,
} from './utils/storage';

import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { GuidesSection } from './components/GuidesSection';
import { ProductsSection } from './components/ProductsSection';
import { ChecklistView } from './components/ChecklistView';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminDashboard } from './components/AdminDashboard';
import { HowItWorksModal } from './components/HowItWorksModal';
import { Footer } from './components/Footer';

type AppView = 'home' | 'checklist' | 'admin';

export default function App() {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [progressMap, setProgressMap] = useState<ProgressMap>({});
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [activeGuideId, setActiveGuideId] = useState<string | null>(null);
  const [selectedGuideCategory, setSelectedGuideCategory] = useState<GuideCategory | 'All Guides'>('All Guides');

  // Modals
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);

  // Admin Auth State
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  // Initialize data on mount
  useEffect(() => {
    setGuides(getSavedGuides());
    setCategories(getSavedCategories());
    setProducts(getSavedProducts());
    setProgressMap(getProgressMap());
    setIsAdminLoggedIn(isAdminAuthenticated());
  }, []);

  // Update handlers with persistent saving
  const handleUpdateGuides = (updated: Guide[]) => {
    setGuides(updated);
    saveGuides(updated);
  };

  const handleUpdateCategories = (updated: ProductCategory[]) => {
    setCategories(updated);
    saveCategories(updated);
  };

  const handleUpdateProducts = (updated: Product[]) => {
    setProducts(updated);
    saveProducts(updated);
  };

  // Step completion handlers
  const handleToggleStep = (guideId: string, stepId: string) => {
    const updated = toggleStepCompletion(guideId, stepId);
    setProgressMap(updated);
  };

  const handleResetSingleGuide = (guideId: string) => {
    const updated = resetSingleGuideProgress(guideId);
    setProgressMap(updated);
  };

  const handleResetAllGuides = () => {
    const updated = resetAllGuidesProgress();
    setProgressMap(updated);
  };

  // Navigation helpers
  const scrollToGuides = () => {
    if (currentView !== 'home') {
      setCurrentView('home');
      setTimeout(() => {
        document.getElementById('guides-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    } else {
      document.getElementById('guides-section')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectServiceCard = (cat: GuideCategory) => {
    setSelectedGuideCategory(cat);
    scrollToGuides();
  };

  const handleOpenChecklist = (guide: Guide) => {
    setActiveGuideId(guide.id);
    setCurrentView('checklist');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToGuides = () => {
    setCurrentView('home');
    setTimeout(() => {
      document.getElementById('guides-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  // Admin Auth Handlers
  const handleLoginSuccess = () => {
    setAdminAuthenticated(true);
    setIsAdminLoggedIn(true);
    setCurrentView('admin');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    setAdminAuthenticated(false);
    setIsAdminLoggedIn(false);
    setCurrentView('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const activeGuide = guides.find((g) => g.id === activeGuideId) || guides[0];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Header: Logo at top left, Admin Login at top right */}
      <Navbar
        isAdminLoggedIn={isAdminLoggedIn}
        onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
        onOpenAdminDashboard={() => {
          setCurrentView('admin');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onLogout={isAdminLoggedIn ? handleLogout : undefined}
        onGoHome={() => {
          setCurrentView('home');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Main Content View */}
      {currentView === 'home' && (
        <main style={{ flex: 1 }}>
          {/* New Modern Light Pastel Hero with 3 Floating Service Cards */}
          <Hero
            onSeeGuides={scrollToGuides}
            onHowItWorks={() => setIsHowItWorksOpen(true)}
            onSelectServiceCard={handleSelectServiceCard}
          />

          {/* Printing Guides Checklist Section */}
          <GuidesSection
            guides={guides}
            progressMap={progressMap}
            selectedCategory={selectedGuideCategory}
            onSelectCategory={setSelectedGuideCategory}
            onOpenChecklist={handleOpenChecklist}
          />

          {/* Synchronized Public Products & Stationery Section */}
          <ProductsSection
            categories={categories}
            products={products}
          />

          {/* Clean Footer */}
          <Footer />
        </main>
      )}

      {currentView === 'checklist' && activeGuide && (
        <main style={{ flex: 1, backgroundColor: '#ffffff' }}>
          <ChecklistView
            guide={activeGuide}
            completedStepIds={progressMap[activeGuide.id] || []}
            onToggleStep={handleToggleStep}
            onResetGuide={handleResetSingleGuide}
            onResetAll={handleResetAllGuides}
            onBack={handleBackToGuides}
          />
        </main>
      )}

      {currentView === 'admin' && (
        <main style={{ flex: 1, backgroundColor: '#ffffff' }}>
          <AdminDashboard
            guides={guides}
            categories={categories}
            products={products}
            onUpdateGuides={handleUpdateGuides}
            onUpdateCategories={handleUpdateCategories}
            onUpdateProducts={handleUpdateProducts}
            onLogout={handleLogout}
            onReturnToSite={() => {
              setCurrentView('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        </main>
      )}

      {/* Modals */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      <HowItWorksModal
        isOpen={isHowItWorksOpen}
        onClose={() => setIsHowItWorksOpen(false)}
        onSeeGuides={scrollToGuides}
      />
    </div>
  );
}
