/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Guide,
  PrintingCategory,
  ProgressMap,
  ProductCategory,
  Product,
} from './types';
import {
  getSavedGuides,
  saveGuides,
  getSavedPrintingCategories,
  savePrintingCategories,
  getSavedCategories,
  saveCategories,
  getSavedProducts,
  saveProducts,
  getProgressMap,
  toggleStepCompletion,
  resetSingleGuideProgress,
  resetAllGuidesProgress,
  isAdminAuthenticated,
  setAdminAuthenticated,
} from './utils/storage';
import { fetchCentralData, saveCentralData } from './utils/api';

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
  const [printingCategories, setPrintingCategories] = useState<PrintingCategory[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [progressMap, setProgressMap] = useState<ProgressMap>({});
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [activeGuideId, setActiveGuideId] = useState<string | null>(null);
  const [selectedGuideCategory, setSelectedGuideCategory] = useState<string>('All Guides');

  // Sync state
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const lastSyncTimestampRef = useRef<number>(0);

  // Modals
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);

  // Admin Auth State
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  // Pull latest data from central server
  const syncWithServer = useCallback(async (isManual = false) => {
    if (isManual) setIsSyncing(true);
    try {
      const data = await fetchCentralData();
      if (data) {
        // Only update if server data is newer or on manual refresh
        if (isManual || data.lastUpdated > lastSyncTimestampRef.current) {
          lastSyncTimestampRef.current = data.lastUpdated;
          setGuides(data.guides);
          setPrintingCategories(data.printingCategories);
          setCategories(data.categories);
          setProducts(data.products);
          setLastSyncTime(data.lastUpdated);
        }
      }
    } catch (err) {
      console.warn('Sync failed:', err);
    } finally {
      if (isManual) setIsSyncing(false);
    }
  }, []);

  // Initialize data on mount
  useEffect(() => {
    // 1. Instant local load
    setGuides(getSavedGuides());
    setPrintingCategories(getSavedPrintingCategories());
    setCategories(getSavedCategories());
    setProducts(getSavedProducts());
    setProgressMap(getProgressMap());
    setIsAdminLoggedIn(isAdminAuthenticated());

    // 2. Fetch shared data from central server immediately
    syncWithServer(false);

    // 3. Set up background sync interval (every 6 seconds) for cross-device synchronization
    const interval = setInterval(() => {
      syncWithServer(false);
    }, 6000);

    // 4. Also sync when window gains focus (e.g. dad switching to shop PC browser tab)
    const handleFocus = () => {
      syncWithServer(false);
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [syncWithServer]);

  // Update handlers with immediate central database sync
  const handleUpdateGuides = (updated: Guide[]) => {
    setGuides(updated);
    saveGuides(updated);
    saveCentralData({ guides: updated }).then(() => {
      lastSyncTimestampRef.current = Date.now();
      setLastSyncTime(Date.now());
    });
  };

  const handleUpdatePrintingCategories = (updated: PrintingCategory[]) => {
    setPrintingCategories(updated);
    savePrintingCategories(updated);
    saveCentralData({ printingCategories: updated }).then(() => {
      lastSyncTimestampRef.current = Date.now();
      setLastSyncTime(Date.now());
    });
  };

  const handleUpdateCategories = (updated: ProductCategory[]) => {
    setCategories(updated);
    saveCategories(updated);
    saveCentralData({ categories: updated }).then(() => {
      lastSyncTimestampRef.current = Date.now();
      setLastSyncTime(Date.now());
    });
  };

  const handleUpdateProducts = (updated: Product[]) => {
    setProducts(updated);
    saveProducts(updated);
    saveCentralData({ products: updated }).then(() => {
      lastSyncTimestampRef.current = Date.now();
      setLastSyncTime(Date.now());
    });
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

  const handleSelectServiceCard = (cat: string) => {
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

          {/* Printing Guides Checklist Section with Dynamic Printing Categories */}
          <GuidesSection
            guides={guides}
            printingCategories={printingCategories}
            progressMap={progressMap}
            selectedCategory={selectedGuideCategory}
            onSelectCategory={setSelectedGuideCategory}
            onOpenChecklist={handleOpenChecklist}
          />

          {/* Synchronized Public Products & Stationery Section (Only Published Items) */}
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
            printingCategories={printingCategories}
            categories={categories}
            products={products}
            onUpdateGuides={handleUpdateGuides}
            onUpdatePrintingCategories={handleUpdatePrintingCategories}
            onUpdateCategories={handleUpdateCategories}
            onUpdateProducts={handleUpdateProducts}
            onLogout={handleLogout}
            onReturnToSite={() => {
              setCurrentView('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            isSyncing={isSyncing}
            onManualSync={() => syncWithServer(true)}
            lastSyncTime={lastSyncTime}
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
