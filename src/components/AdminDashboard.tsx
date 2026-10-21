import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Edit2,
  ArrowUp,
  ArrowDown,
  LogOut,
  Save,
  X,
  CheckCircle2,
  Layers,
  ShoppingBag,
  BookOpen,
  Search,
  AlertTriangle,
  Package,
  Eye,
  EyeOff,
  Globe,
  Lock,
  RefreshCw,
  Tag,
} from 'lucide-react';
import {
  Guide,
  GuideStep,
  PrintingCategory,
  ProductCategory,
  Product,
  PastelColor,
  ProductStatus,
  ProductVisibility,
} from '../types';
import { generateUniqueId, compressImageFile } from '../utils/storage';

interface AdminDashboardProps {
  guides: Guide[];
  printingCategories: PrintingCategory[];
  categories: ProductCategory[];
  products: Product[];
  onUpdateGuides: (updatedGuides: Guide[]) => void;
  onUpdatePrintingCategories: (updatedCategories: PrintingCategory[]) => void;
  onUpdateCategories: (updatedCategories: ProductCategory[]) => void;
  onUpdateProducts: (updatedProducts: Product[]) => void;
  onLogout: () => void;
  onReturnToSite: () => void;
  isSyncing?: boolean;
  onManualSync?: () => void;
  lastSyncTime?: number | null;
}

type AdminTab = 'guides' | 'printing_categories' | 'products' | 'categories';

const PASTEL_COLORS: { label: string; value: PastelColor; bg: string; border: string }[] = [
  { label: 'Lavender', value: 'lavender', bg: '#f3e8ff', border: '#e9d5ff' },
  { label: 'Pink', value: 'pink', bg: '#fce7f3', border: '#fbcfe8' },
  { label: 'Cream', value: 'cream', bg: '#fef9c3', border: '#fef08a' },
  { label: 'Mint', value: 'mint', bg: '#dcfce7', border: '#bbf7d0' },
  { label: 'Sky Blue', value: 'sky', bg: '#e0f2fe', border: '#bae6fd' },
  { label: 'Peach', value: 'peach', bg: '#ffedd5', border: '#fed7aa' },
];

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  guides,
  printingCategories,
  categories,
  products,
  onUpdateGuides,
  onUpdatePrintingCategories,
  onUpdateCategories,
  onUpdateProducts,
  onLogout,
  onReturnToSite,
  isSyncing = false,
  onManualSync,
  lastSyncTime,
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('guides');
  const [notification, setNotification] = useState<string | null>(null);

  const triggerNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // ==========================================
  // PRINTING CATEGORIES STATE & HANDLERS
  // ==========================================
  const [pcatSearch, setPcatSearch] = useState('');
  const [isAddingPcat, setIsAddingPcat] = useState(false);
  const [newPcatName, setNewPcatName] = useState('');
  const [newPcatDesc, setNewPcatDesc] = useState('');
  const [newPcatIcon, setNewPcatIcon] = useState('Printer');
  const [newPcatColor, setNewPcatColor] = useState<PastelColor>('lavender');

  const [editingPcat, setEditingPcat] = useState<PrintingCategory | null>(null);
  const [pcatToDelete, setPcatToDelete] = useState<PrintingCategory | null>(null);

  const filteredPrintingCategories = useMemo(() => {
    if (!pcatSearch.trim()) return printingCategories;
    const q = pcatSearch.toLowerCase().trim();
    return printingCategories.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.description?.toLowerCase().includes(q) ?? false)
    );
  }, [printingCategories, pcatSearch]);

  const handleCreatePrintingCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPcatName.trim()) return;

    const newCategory: PrintingCategory = {
      id: generateUniqueId('pcat'),
      name: newPcatName.trim(),
      description: newPcatDesc.trim() || undefined,
      icon: newPcatIcon.trim() || 'Printer',
      color: newPcatColor,
      createdAt: Date.now(),
    };

    onUpdatePrintingCategories([...printingCategories, newCategory]);
    setIsAddingPcat(false);
    setNewPcatName('');
    setNewPcatDesc('');
    triggerNotification(`Created printing category "${newCategory.name}".`);
  };

  const handleSavePrintingCategoryEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPcat || !editingPcat.name.trim()) return;

    const oldName = printingCategories.find((c) => c.id === editingPcat.id)?.name;
    const newName = editingPcat.name.trim();

    const updated = printingCategories.map((c) =>
      c.id === editingPcat.id
        ? { ...editingPcat, name: newName, updatedAt: Date.now() }
        : c
    );
    onUpdatePrintingCategories(updated);

    // If category name changed, update existing guides using old category name!
    if (oldName && oldName !== newName) {
      const updatedGuides = guides.map((g) =>
        g.category === oldName ? { ...g, category: newName, updatedAt: Date.now() } : g
      );
      onUpdateGuides(updatedGuides);
    }

    setEditingPcat(null);
    triggerNotification('Printing category updated successfully.');
  };

  const handleConfirmDeletePrintingCategory = () => {
    if (!pcatToDelete) return;
    const catName = pcatToDelete.name;
    const remaining = printingCategories.filter((c) => c.id !== pcatToDelete.id);
    onUpdatePrintingCategories(remaining);

    // Reassign guides to another category if available or keep them
    const fallbackCategory = remaining[0]?.name || 'General';
    const updatedGuides = guides.map((g) =>
      g.category === catName ? { ...g, category: fallbackCategory, updatedAt: Date.now() } : g
    );
    if (updatedGuides.some((g) => g.category !== catName)) {
      onUpdateGuides(updatedGuides);
    }

    setPcatToDelete(null);
    triggerNotification(`Deleted printing category "${catName}".`);
  };

  // ==========================================
  // PRINTING GUIDES / TASKS STATE & HANDLERS
  // ==========================================
  const [guideSearch, setGuideSearch] = useState('');
  const [guideFilterCat, setGuideFilterCat] = useState<string>('all');
  const [selectedGuideId, setSelectedGuideId] = useState<string>(
    guides[0]?.id || ''
  );

  const selectedGuide = useMemo(() => {
    return guides.find((g) => g.id === selectedGuideId) || guides[0] || null;
  }, [guides, selectedGuideId]);

  const [newGuideTitle, setNewGuideTitle] = useState('');
  const [newGuideDesc, setNewGuideDesc] = useState('');
  const [newGuideCat, setNewGuideCat] = useState<string>(
    printingCategories[0]?.name || 'WhatsApp'
  );
  const [newGuideIcon, setNewGuideIcon] = useState('Printer');
  const [isAddingGuide, setIsAddingGuide] = useState(false);

  const [editingGuide, setEditingGuide] = useState<Guide | null>(null);
  const [guideToDelete, setGuideToDelete] = useState<Guide | null>(null);

  const [newStepText, setNewStepText] = useState('');
  const [newStepDesc, setNewStepDesc] = useState('');
  const [editingStep, setEditingStep] = useState<GuideStep | null>(null);
  const [stepToDelete, setStepToDelete] = useState<{
    guideId: string;
    stepId: string;
  } | null>(null);

  const filteredGuides = useMemo(() => {
    return guides.filter((g) => {
      if (guideFilterCat !== 'all' && g.category !== guideFilterCat) return false;
      if (!guideSearch.trim()) return true;
      const q = guideSearch.toLowerCase().trim();
      return (
        g.title.toLowerCase().includes(q) ||
        (g.description?.toLowerCase().includes(q) ?? false) ||
        g.category.toLowerCase().includes(q)
      );
    });
  }, [guides, guideFilterCat, guideSearch]);

  const handleMoveGuide = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= guides.length) return;
    const reordered = [...guides];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);
    onUpdateGuides(reordered);
    triggerNotification('Printing task order updated.');
  };

  const handleCreateGuide = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGuideTitle.trim()) return;

    const descValue = newGuideDesc.trim() ? newGuideDesc.trim() : undefined;
    const chosenCat = newGuideCat || printingCategories[0]?.name || 'WhatsApp';

    const newGuide: Guide = {
      id: generateUniqueId('guide'),
      title: newGuideTitle.trim(),
      description: descValue,
      category: chosenCat,
      iconName: newGuideIcon || 'Printer',
      steps: [
        { id: generateUniqueId('step'), instruction: 'Download and open document.' },
        { id: generateUniqueId('step'), instruction: 'Check printer paper tray and color mode.' },
        { id: generateUniqueId('step'), instruction: 'Print and verify customer copy.' },
      ],
      updatedAt: Date.now(),
    };

    onUpdateGuides([...guides, newGuide]);
    setSelectedGuideId(newGuide.id);
    setIsAddingGuide(false);
    setNewGuideTitle('');
    setNewGuideDesc('');
    triggerNotification(`Created printing task "${newGuide.title}".`);
  };

  const handleSaveGuideEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGuide || !editingGuide.title.trim()) return;

    const descValue = editingGuide.description?.trim()
      ? editingGuide.description.trim()
      : undefined;

    const updated = guides.map((g) =>
      g.id === editingGuide.id
        ? { ...editingGuide, description: descValue, updatedAt: Date.now() }
        : g
    );
    onUpdateGuides(updated);
    setEditingGuide(null);
    triggerNotification('Task updated successfully.');
  };

  const handleConfirmDeleteGuide = () => {
    if (!guideToDelete) return;
    const remaining = guides.filter((g) => g.id !== guideToDelete.id);
    onUpdateGuides(remaining);
    if (selectedGuideId === guideToDelete.id) {
      setSelectedGuideId(remaining[0]?.id || '');
    }
    setGuideToDelete(null);
    triggerNotification('Printing task deleted permanently from shared database.');
  };

  const handleAddStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGuide || !newStepText.trim()) return;
    const newStep: GuideStep = {
      id: generateUniqueId('step'),
      instruction: newStepText.trim(),
      description: newStepDesc.trim() ? newStepDesc.trim() : undefined,
    };
    const updated = guides.map((g) => {
      if (g.id === selectedGuide.id) {
        return { ...g, steps: [...g.steps, newStep], updatedAt: Date.now() };
      }
      return g;
    });
    onUpdateGuides(updated);
    setNewStepText('');
    setNewStepDesc('');
    triggerNotification('Step added.');
  };

  const handleSaveStepEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGuide || !editingStep || !editingStep.instruction.trim()) return;
    const descValue = editingStep.description?.trim()
      ? editingStep.description.trim()
      : undefined;

    const updated = guides.map((g) => {
      if (g.id === selectedGuide.id) {
        return {
          ...g,
          steps: g.steps.map((s) =>
            s.id === editingStep.id
              ? { ...editingStep, description: descValue }
              : s
          ),
          updatedAt: Date.now(),
        };
      }
      return g;
    });
    onUpdateGuides(updated);
    setEditingStep(null);
    triggerNotification('Step updated.');
  };

  const handleConfirmDeleteStep = () => {
    if (!stepToDelete || !selectedGuide) return;
    const updated = guides.map((g) => {
      if (g.id === stepToDelete.guideId) {
        return {
          ...g,
          steps: g.steps.filter((s) => s.id !== stepToDelete.stepId),
          updatedAt: Date.now(),
        };
      }
      return g;
    });
    onUpdateGuides(updated);
    setStepToDelete(null);
    triggerNotification('Step deleted.');
  };

  const handleMoveStep = (stepIndex: number, direction: 'up' | 'down') => {
    if (!selectedGuide) return;
    const targetIndex = direction === 'up' ? stepIndex - 1 : stepIndex + 1;
    if (targetIndex < 0 || targetIndex >= selectedGuide.steps.length) return;
    const newSteps = [...selectedGuide.steps];
    const [moved] = newSteps.splice(stepIndex, 1);
    newSteps.splice(targetIndex, 0, moved);
    const updated = guides.map((g) => {
      if (g.id === selectedGuide.id) {
        return { ...g, steps: newSteps, updatedAt: Date.now() };
      }
      return g;
    });
    onUpdateGuides(updated);
  };

  // ==========================================
  // STATIONERY CATEGORIES STATE & HANDLERS
  // ==========================================
  const [catSearch, setCatSearch] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('📦');
  const [newCatColor, setNewCatColor] = useState<PastelColor>('lavender');

  const [editingCategory, setEditingCategory] = useState<ProductCategory | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<ProductCategory | null>(null);

  const filteredCategories = useMemo(() => {
    if (!catSearch.trim()) return categories;
    const q = catSearch.toLowerCase().trim();
    return categories.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.description?.toLowerCase().includes(q) ?? false)
    );
  }, [categories, catSearch]);

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const newCat: ProductCategory = {
      id: generateUniqueId('cat'),
      name: newCatName.trim(),
      description: newCatDesc.trim() || undefined,
      icon: newCatIcon.trim() || '📦',
      color: newCatColor,
      createdAt: Date.now(),
    };

    onUpdateCategories([...categories, newCat]);
    setIsAddingCategory(false);
    setNewCatName('');
    setNewCatDesc('');
    setNewCatIcon('📦');
    triggerNotification(`Created stationery category "${newCat.name}".`);
  };

  const handleSaveCategoryEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory || !editingCategory.name.trim()) return;

    const updated = categories.map((c) =>
      c.id === editingCategory.id
        ? { ...editingCategory, updatedAt: Date.now() }
        : c
    );
    onUpdateCategories(updated);
    setEditingCategory(null);
    triggerNotification('Stationery category updated successfully.');
  };

  const handleConfirmDeleteCategory = () => {
    if (!categoryToDelete) return;
    const catId = categoryToDelete.id;
    const remainingCats = categories.filter((c) => c.id !== catId);
    onUpdateCategories(remainingCats);

    const remainingProds = products.filter((p) => p.categoryId !== catId);
    if (remainingProds.length !== products.length) {
      onUpdateProducts(remainingProds);
    }

    setCategoryToDelete(null);
    triggerNotification(`Category "${categoryToDelete.name}" removed.`);
  };

  // ==========================================
  // PRODUCTS STATE & HANDLERS (Private by default)
  // ==========================================
  const [prodSearch, setProdSearch] = useState('');
  const [prodFilterCat, setProdFilterCat] = useState<string>('all');
  const [prodFilterVisibility, setProdFilterVisibility] = useState<string>('all');
  const [isAddingProduct, setIsAddingProduct] = useState(false);

  const [newProdName, setNewProdName] = useState('');
  const [newProdCatId, setNewProdCatId] = useState('');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdPrice, setNewProdPrice] = useState<number | ''>('');
  const [newProdSalePrice, setNewProdSalePrice] = useState<number | ''>('');
  const [newProdStatus, setNewProdStatus] = useState<ProductStatus>('in_stock');
  const [newProdVisibility, setNewProdVisibility] = useState<ProductVisibility>('private');
  const [newProdImage, setNewProdImage] = useState<string>('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      const matchesCat =
        prodFilterCat === 'all' || prod.categoryId === prodFilterCat;
      if (!matchesCat) return false;

      const matchesVis =
        prodFilterVisibility === 'all' ||
        prod.visibility === prodFilterVisibility;
      if (!matchesVis) return false;

      if (!prodSearch.trim()) return true;
      const q = prodSearch.toLowerCase().trim();
      const inName = prod.name.toLowerCase().includes(q);
      const inDesc = prod.description?.toLowerCase().includes(q) || false;
      return inName || inDesc;
    });
  }, [products, prodFilterCat, prodFilterVisibility, prodSearch]);

  const handleImageFileChange = async (
    file: File | null,
    target: 'new' | 'edit'
  ) => {
    if (!file) return;
    setImageUploadError(null);
    setIsUploadingImage(true);
    try {
      const compressedDataUrl = await compressImageFile(file, 380, 0.75);
      if (target === 'new') {
        setNewProdImage(compressedDataUrl);
      } else if (editingProduct) {
        setEditingProduct({ ...editingProduct, imageUrl: compressedDataUrl });
      }
    } catch (err: any) {
      setImageUploadError(err.message || 'Image processing failed.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleOpenAddProduct = (catId?: string) => {
    setNewProdCatId(catId || (categories[0]?.id || ''));
    setNewProdName('');
    setNewProdDesc('');
    setNewProdPrice('');
    setNewProdSalePrice('');
    setNewProdStatus('in_stock');
    setNewProdVisibility('private');
    setNewProdImage('');
    setImageUploadError(null);
    setIsAddingProduct(true);
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim() || newProdPrice === '') return;
    const priceNum = Number(newProdPrice);
    if (priceNum < 0) return;

    const saleNum =
      newProdSalePrice !== '' ? Number(newProdSalePrice) : undefined;
    if (saleNum !== undefined && saleNum < 0) return;

    const newProd: Product = {
      id: generateUniqueId('prod'),
      name: newProdName.trim(),
      categoryId: newProdCatId || (categories[0]?.id || ''),
      description: newProdDesc.trim() || undefined,
      price: priceNum,
      salePrice: saleNum,
      imageUrl: newProdImage || undefined,
      status: newProdStatus,
      visibility: newProdVisibility,
      createdAt: Date.now(),
    };

    onUpdateProducts([...products, newProd]);
    setIsAddingProduct(false);
    triggerNotification(
      `Added "${newProd.name}" (${newProd.visibility === 'published' ? 'Published' : 'Private'}).`
    );
  };

  const handleSaveProductEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || !editingProduct.name.trim()) return;

    const updated = products.map((p) =>
      p.id === editingProduct.id
        ? { ...editingProduct, updatedAt: Date.now() }
        : p
    );
    onUpdateProducts(updated);
    setEditingProduct(null);
    triggerNotification(`Saved changes to "${editingProduct.name}".`);
  };

  const handleTogglePublishProduct = (prodId: string) => {
    const updated = products.map((p) => {
      if (p.id === prodId) {
        const nextVis: ProductVisibility =
          p.visibility === 'published' ? 'private' : 'published';
        return { ...p, visibility: nextVis, updatedAt: Date.now() };
      }
      return p;
    });
    onUpdateProducts(updated);
    const target = updated.find((p) => p.id === prodId);
    if (target?.visibility === 'published') {
      triggerNotification(`Published "${target.name}" to public site.`);
    } else {
      triggerNotification(`Unpublished "${target?.name}" (now private to admin).`);
    }
  };

  const handleConfirmDeleteProduct = () => {
    if (!productToDelete) return;
    const remaining = products.filter((p) => p.id !== productToDelete.id);
    onUpdateProducts(remaining);
    setProductToDelete(null);
    triggerNotification('Product deleted from inventory.');
  };

  return (
    <div className="admin-container">
      {/* Top Header */}
      <div className="admin-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                backgroundColor: 'var(--primary-light)',
                color: 'var(--primary)',
                padding: '3px 9px',
                borderRadius: '9999px',
              }}
            >
              Shop Administrator
            </span>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Logged in as harshini
            </span>
          </div>
          <h1 style={{ fontSize: '28px', color: 'var(--text-main)' }}>PrintMate Management</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
            Central administration for printing shop tasks, categories, and private stationery inventory.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button onClick={onReturnToSite} className="btn btn-outline-soft">
            <ArrowLeft size={14} />
            <span>Public Website</span>
          </button>
          <button
            onClick={onLogout}
            className="btn btn-outline-soft"
            style={{ color: '#b91c1c', borderColor: '#fca5a5' }}
          >
            <LogOut size={14} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Central Database Live Synchronization Status Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          padding: '12px 18px',
          backgroundColor: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: '16px',
          marginBottom: '20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: '#16a34a',
              boxShadow: '0 0 0 3px rgba(34, 197, 94, 0.2)',
            }}
          />
          <div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#166534' }}>
              Central Shared Database Active
            </div>
            <div style={{ fontSize: '12px', color: '#15803d' }}>
              All edits and additions are saved centrally and sync across all phones, computers, and shop PCs.
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {lastSyncTime && (
            <span style={{ fontSize: '11px', color: '#166534' }}>
              Last synced: {new Date(lastSyncTime).toLocaleTimeString()}
            </span>
          )}
          {onManualSync && (
            <button
              onClick={onManualSync}
              disabled={isSyncing}
              className="btn btn-outline-soft"
              style={{
                padding: '4px 10px',
                fontSize: '11px',
                borderColor: '#86efac',
                backgroundColor: '#ffffff',
                color: '#166534',
              }}
            >
              <RefreshCw size={12} className={isSyncing ? 'animate-spin' : ''} />
              <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="success-banner"
            style={{ marginBottom: '20px' }}
          >
            <CheckCircle2 size={16} />
            <span>{notification}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Admin Navigation Tabs */}
      <div className="admin-nav-tabs" role="tablist">
        <button
          role="tab"
          aria-selected={activeTab === 'guides'}
          onClick={() => setActiveTab('guides')}
          className={`admin-nav-tab ${activeTab === 'guides' ? 'active' : ''}`}
        >
          <BookOpen size={16} />
          <span>Printing Tasks &amp; Guides ({guides.length})</span>
        </button>

        <button
          role="tab"
          aria-selected={activeTab === 'printing_categories'}
          onClick={() => setActiveTab('printing_categories')}
          className={`admin-nav-tab ${activeTab === 'printing_categories' ? 'active' : ''}`}
        >
          <Tag size={16} />
          <span>Printing Categories ({printingCategories.length})</span>
        </button>

        <button
          role="tab"
          aria-selected={activeTab === 'products'}
          onClick={() => setActiveTab('products')}
          className={`admin-nav-tab ${activeTab === 'products' ? 'active' : ''}`}
        >
          <ShoppingBag size={16} />
          <span>Stationery Products ({products.length})</span>
        </button>

        <button
          role="tab"
          aria-selected={activeTab === 'categories'}
          onClick={() => setActiveTab('categories')}
          className={`admin-nav-tab ${activeTab === 'categories' ? 'active' : ''}`}
        >
          <Layers size={16} />
          <span>Stationery Categories ({categories.length})</span>
        </button>
      </div>

      {/* TAB 1: PRINTING TASKS & GUIDES */}
      {activeTab === 'guides' && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '28px',
          }}
        >
          {/* Left Column: All Guides List */}
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px',
              }}
            >
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 600 }}>Printing Tasks ({guides.length})</h2>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Numbered instructions shown on the shop PC
                </p>
              </div>
              <button
                onClick={() => {
                  setNewGuideTitle('');
                  setNewGuideDesc('');
                  setNewGuideCat(printingCategories[0]?.name || 'WhatsApp');
                  setNewGuideIcon('Printer');
                  setIsAddingGuide(true);
                }}
                className="btn btn-primary"
                style={{ padding: '6px 14px', fontSize: '12px' }}
              >
                <Plus size={14} />
                <span>Add Task</span>
              </button>
            </div>

            {/* Filter and Search Bar */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <div className="search-box" style={{ flex: 1 }}>
                <Search size={14} className="search-icon" />
                <input
                  type="text"
                  placeholder="Filter tasks..."
                  value={guideSearch}
                  onChange={(e) => setGuideSearch(e.target.value)}
                  style={{ fontSize: '12px', padding: '6px 10px 6px 30px' }}
                />
              </div>

              <select
                value={guideFilterCat}
                onChange={(e) => setGuideFilterCat(e.target.value)}
                className="form-select"
                style={{ width: 'auto', fontSize: '12px', padding: '6px 10px' }}
              >
                <option value="all">All Categories</option>
                {printingCategories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {guides.length === 0 ? (
              <div
                style={{
                  padding: '30px',
                  textAlign: 'center',
                  backgroundColor: '#ffffff',
                  borderRadius: '16px',
                  border: '1px dashed var(--border-medium)',
                }}
              >
                <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                  No printing tasks exist. Click &ldquo;Add Task&rdquo; above to create one.
                </p>
              </div>
            ) : filteredGuides.length === 0 ? (
              <div
                style={{
                  padding: '24px',
                  textAlign: 'center',
                  backgroundColor: '#ffffff',
                  borderRadius: '16px',
                  border: '1px dashed var(--border-medium)',
                }}
              >
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  No tasks match &ldquo;{guideSearch}&rdquo;.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {filteredGuides.map((guide, idx) => {
                  const isSelected = selectedGuide?.id === guide.id;
                  return (
                    <div
                      key={guide.id}
                      onClick={() => setSelectedGuideId(guide.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '14px 16px',
                        borderRadius: '16px',
                        border: isSelected
                          ? '2px solid var(--primary)'
                          : '1px solid var(--border-card)',
                        backgroundColor: isSelected ? 'var(--primary-light)' : '#ffffff',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0, paddingRight: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                          <span className="guide-cat-badge" style={{ fontSize: '10px', padding: '2px 8px' }}>
                            {guide.category}
                          </span>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                            {guide.steps.length} steps
                          </span>
                        </div>
                        <div
                          style={{
                            fontSize: '14px',
                            fontWeight: 600,
                            color: 'var(--text-main)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {guide.title}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '4px' }} onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleMoveGuide(idx, 'up')}
                          disabled={idx === 0}
                          className="btn btn-outline-soft"
                          style={{ padding: '4px 6px' }}
                          title="Move Up"
                        >
                          <ArrowUp size={13} />
                        </button>
                        <button
                          onClick={() => handleMoveGuide(idx, 'down')}
                          disabled={idx === guides.length - 1}
                          className="btn btn-outline-soft"
                          style={{ padding: '4px 6px' }}
                          title="Move Down"
                        >
                          <ArrowDown size={13} />
                        </button>
                        <button
                          onClick={() => setEditingGuide(guide)}
                          className="btn btn-outline-soft"
                          style={{ padding: '4px 6px' }}
                          title="Edit Task"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => setGuideToDelete(guide)}
                          className="btn btn-outline-soft"
                          style={{ padding: '4px 6px', color: '#b91c1c' }}
                          title="Delete Task"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Steps for Selected Guide */}
          <div>
            {selectedGuide ? (
              <div
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid var(--border-card)',
                  borderRadius: '20px',
                  padding: '24px',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    marginBottom: '16px',
                    paddingBottom: '16px',
                    borderBottom: '1px solid var(--border-subtle)',
                  }}
                >
                  <div>
                    <span className="guide-cat-badge">{selectedGuide.category}</span>
                    <h3 style={{ fontSize: '18px', fontWeight: 600, marginTop: '6px' }}>
                      {selectedGuide.title}
                    </h3>
                    {selectedGuide.description && selectedGuide.description.trim() ? (
                      <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                        {selectedGuide.description}
                      </p>
                    ) : null}
                  </div>
                  <button
                    onClick={() => setEditingGuide(selectedGuide)}
                    className="btn btn-outline-soft"
                    style={{ padding: '6px 12px', fontSize: '12px' }}
                  >
                    <Edit2 size={13} />
                    <span>Edit Task</span>
                  </button>
                </div>

                {/* Steps List */}
                <div style={{ marginBottom: '20px' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '10px',
                    }}
                  >
                    <h4 style={{ fontSize: '14px', fontWeight: 600 }}>
                      Numbered Steps ({selectedGuide.steps.length})
                    </h4>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      Click arrows to reorder
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {selectedGuide.steps.map((step, sIdx) => (
                      <div
                        key={step.id}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          justifyContent: 'space-between',
                          padding: '12px',
                          borderRadius: '12px',
                          backgroundColor: 'var(--bg-pill)',
                          gap: '10px',
                        }}
                      >
                        <div style={{ display: 'flex', gap: '10px', flex: 1, minWidth: 0 }}>
                          <span
                            style={{
                              width: '22px',
                              height: '22px',
                              borderRadius: '50%',
                              backgroundColor: 'var(--primary)',
                              color: '#ffffff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '11px',
                              fontWeight: 700,
                              flexShrink: 0,
                            }}
                          >
                            {sIdx + 1}
                          </span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '13px', color: 'var(--text-main)', lineHeight: 1.4 }}>
                              {step.instruction}
                            </div>
                            {step.description && step.description.trim() ? (
                              <div
                                style={{
                                  fontSize: '12px',
                                  color: 'var(--text-muted)',
                                  marginTop: '2px',
                                  fontStyle: 'italic',
                                }}
                              >
                                Tip: {step.description}
                              </div>
                            ) : null}
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                          <button
                            onClick={() => handleMoveStep(sIdx, 'up')}
                            disabled={sIdx === 0}
                            className="btn btn-outline-soft"
                            style={{ padding: '3px 5px' }}
                            title="Move step up"
                          >
                            <ArrowUp size={12} />
                          </button>
                          <button
                            onClick={() => handleMoveStep(sIdx, 'down')}
                            disabled={sIdx === selectedGuide.steps.length - 1}
                            className="btn btn-outline-soft"
                            style={{ padding: '3px 5px' }}
                            title="Move step down"
                          >
                            <ArrowDown size={12} />
                          </button>
                          <button
                            onClick={() => setEditingStep(step)}
                            className="btn btn-outline-soft"
                            style={{ padding: '3px 5px' }}
                            title="Edit step"
                          >
                            <Edit2 size={12} />
                          </button>
                          <button
                            onClick={() =>
                              setStepToDelete({
                                guideId: selectedGuide.id,
                                stepId: step.id,
                              })
                            }
                            className="btn btn-outline-soft"
                            style={{ padding: '3px 5px', color: '#b91c1c' }}
                            title="Delete step"
                            disabled={selectedGuide.steps.length <= 1}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Add Step Form */}
                <form
                  onSubmit={handleAddStep}
                  style={{
                    backgroundColor: 'var(--primary-light)',
                    padding: '16px',
                    borderRadius: '14px',
                    border: '1px solid var(--border-card)',
                  }}
                >
                  <h5 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>
                    + Add New Numbered Step
                  </h5>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <input
                      type="text"
                      required
                      value={newStepText}
                      onChange={(e) => setNewStepText(e.target.value)}
                      placeholder="e.g. Select glossy photo paper from Tray 2"
                      className="form-input"
                      style={{ backgroundColor: '#ffffff', fontSize: '13px' }}
                    />
                    <input
                      type="text"
                      value={newStepDesc}
                      onChange={(e) => setNewStepDesc(e.target.value)}
                      placeholder="Description / Tip (Optional)"
                      className="form-input"
                      style={{ backgroundColor: '#ffffff', fontSize: '13px' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                      <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ padding: '6px 14px', fontSize: '12px' }}
                      >
                        Add Step
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            ) : (
              <div
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid var(--border-card)',
                  borderRadius: '20px',
                  padding: '30px',
                  textAlign: 'center',
                }}
              >
                <p style={{ color: 'var(--text-muted)' }}>
                  Select or create a printing task to view and edit its numbered steps.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: PRINTING CATEGORIES MANAGEMENT */}
      {activeTab === 'printing_categories' && (
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 600 }}>Printing Categories ({printingCategories.length})</h2>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
                Categories organize your printing guides and show as filter pills on the customer homepage.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div className="search-box">
                <Search size={14} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search printing categories..."
                  value={pcatSearch}
                  onChange={(e) => setPcatSearch(e.target.value)}
                  style={{ fontSize: '13px' }}
                />
              </div>

              <button
                onClick={() => {
                  setNewPcatName('');
                  setNewPcatDesc('');
                  setNewPcatIcon('Printer');
                  setNewPcatColor('lavender');
                  setIsAddingPcat(true);
                }}
                className="btn btn-primary"
              >
                <Plus size={16} />
                <span>Add Printing Category</span>
              </button>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '16px',
            }}
          >
            {filteredPrintingCategories.map((pcat) => {
              const guideCount = guides.filter((g) => g.category === pcat.name).length;
              return (
                <div
                  key={pcat.id}
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid var(--border-card)',
                    borderRadius: '16px',
                    padding: '20px',
                    boxShadow: 'var(--shadow-sm)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '14px',
                  }}
                >
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '8px',
                      }}
                    >
                      <span className="guide-cat-badge" style={{ fontSize: '11px' }}>
                        {pcat.name}
                      </span>
                      <span
                        style={{
                          fontSize: '12px',
                          color: 'var(--text-muted)',
                          fontWeight: 500,
                        }}
                      >
                        {guideCount} {guideCount === 1 ? 'task' : 'tasks'}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-main)' }}>
                      {pcat.name}
                    </h3>

                    {pcat.description && (
                      <p
                        style={{
                          fontSize: '13px',
                          color: 'var(--text-muted)',
                          marginTop: '6px',
                          lineHeight: 1.4,
                        }}
                      >
                        {pcat.description}
                      </p>
                    )}
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      gap: '8px',
                      paddingTop: '12px',
                      borderTop: '1px solid var(--border-subtle)',
                    }}
                  >
                    <button
                      onClick={() => setEditingPcat(pcat)}
                      className="btn btn-outline-soft"
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                    >
                      <Edit2 size={13} />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => setPcatToDelete(pcat)}
                      className="btn btn-outline-soft"
                      style={{ padding: '6px 12px', fontSize: '12px', color: '#b91c1c' }}
                    >
                      <Trash2 size={13} />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: STATIONERY PRODUCTS MANAGEMENT */}
      {activeTab === 'products' && (
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 600 }}>Stationery Inventory ({products.length})</h2>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    backgroundColor: '#fef3c7',
                    color: '#92400e',
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Lock size={11} />
                  Private by Default
                </span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
                Manage items, prices, and stock. Products remain private to the admin until published.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <div className="search-box">
                <Search size={14} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={prodSearch}
                  onChange={(e) => setProdSearch(e.target.value)}
                  style={{ fontSize: '13px' }}
                />
              </div>

              <select
                value={prodFilterVisibility}
                onChange={(e) => setProdFilterVisibility(e.target.value)}
                className="form-select"
                style={{ width: 'auto', fontSize: '13px' }}
              >
                <option value="all">All Visibility</option>
                <option value="private">🔒 Private Only</option>
                <option value="published">🌐 Published Only</option>
              </select>

              <select
                value={prodFilterCat}
                onChange={(e) => setProdFilterCat(e.target.value)}
                className="form-select"
                style={{ width: 'auto', fontSize: '13px' }}
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icon ? `${c.icon} ` : ''}
                    {c.name}
                  </option>
                ))}
              </select>

              <button onClick={() => handleOpenAddProduct()} className="btn btn-primary">
                <Plus size={16} />
                <span>Add Product</span>
              </button>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '16px',
            }}
          >
            {filteredProducts.map((prod) => {
              const cat = categories.find((c) => c.id === prod.categoryId);
              const isPublished = prod.visibility === 'published';
              return (
                <div
                  key={prod.id}
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid var(--border-card)',
                    borderRadius: '16px',
                    padding: '16px',
                    boxShadow: 'var(--shadow-sm)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '12px',
                  }}
                >
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '8px',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 600,
                          padding: '3px 8px',
                          borderRadius: '9999px',
                          backgroundColor: isPublished ? '#dcfce7' : '#f3f4f6',
                          color: isPublished ? '#15803d' : '#4b5563',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        {isPublished ? <Globe size={11} /> : <Lock size={11} />}
                        {isPublished ? 'Published' : 'Private'}
                      </span>

                      {cat && (
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          {cat.icon ? `${cat.icon} ` : ''}
                          {cat.name}
                        </span>
                      )}
                    </div>

                    <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-main)' }}>
                      {prod.name}
                    </h4>

                    {prod.description && (
                      <p
                        style={{
                          fontSize: '12px',
                          color: 'var(--text-muted)',
                          marginTop: '4px',
                          lineHeight: 1.4,
                        }}
                      >
                        {prod.description}
                      </p>
                    )}

                    <div
                      style={{
                        marginTop: '10px',
                        display: 'flex',
                        alignItems: 'baseline',
                        gap: '8px',
                      }}
                    >
                      <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--primary)' }}>
                        ₹{prod.salePrice ?? prod.price}
                      </span>
                      {prod.salePrice && (
                        <span
                          style={{
                            fontSize: '13px',
                            color: 'var(--text-muted)',
                            textDecoration: 'line-through',
                          }}
                        >
                          ₹{prod.price}
                        </span>
                      )}
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingTop: '10px',
                      borderTop: '1px solid var(--border-subtle)',
                    }}
                  >
                    <button
                      onClick={() => handleTogglePublishProduct(prod.id)}
                      className="btn btn-outline-soft"
                      style={{
                        padding: '4px 10px',
                        fontSize: '11px',
                        color: isPublished ? '#b91c1c' : '#15803d',
                      }}
                    >
                      {isPublished ? <EyeOff size={12} /> : <Eye size={12} />}
                      <span>{isPublished ? 'Unpublish' : 'Publish'}</span>
                    </button>

                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        onClick={() => setEditingProduct(prod)}
                        className="btn btn-outline-soft"
                        style={{ padding: '4px 8px' }}
                      >
                        <Edit2 size={12} />
                      </button>
                      <button
                        onClick={() => setProductToDelete(prod)}
                        className="btn btn-outline-soft"
                        style={{ padding: '4px 8px', color: '#b91c1c' }}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: STATIONERY CATEGORIES MANAGEMENT */}
      {activeTab === 'categories' && (
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 600 }}>Stationery Categories ({categories.length})</h2>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
                Categories for sorting shop stationery and supplies inventory.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div className="search-box">
                <Search size={14} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search stationery categories..."
                  value={catSearch}
                  onChange={(e) => setCatSearch(e.target.value)}
                  style={{ fontSize: '13px' }}
                />
              </div>

              <button
                onClick={() => {
                  setNewCatName('');
                  setNewCatDesc('');
                  setNewCatIcon('📦');
                  setNewCatColor('lavender');
                  setIsAddingCategory(true);
                }}
                className="btn btn-primary"
              >
                <Plus size={16} />
                <span>Add Stationery Category</span>
              </button>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '16px',
            }}
          >
            {filteredCategories.map((cat) => {
              const prodCount = products.filter((p) => p.categoryId === cat.id).length;
              return (
                <div
                  key={cat.id}
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid var(--border-card)',
                    borderRadius: '16px',
                    padding: '20px',
                    boxShadow: 'var(--shadow-sm)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '14px',
                  }}
                >
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '8px',
                      }}
                    >
                      <span style={{ fontSize: '24px' }}>{cat.icon || '📦'}</span>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {prodCount} products
                      </span>
                    </div>

                    <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-main)' }}>
                      {cat.name}
                    </h3>

                    {cat.description && (
                      <p
                        style={{
                          fontSize: '13px',
                          color: 'var(--text-muted)',
                          marginTop: '6px',
                          lineHeight: 1.4,
                        }}
                      >
                        {cat.description}
                      </p>
                    )}
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      gap: '8px',
                      paddingTop: '12px',
                      borderTop: '1px solid var(--border-subtle)',
                    }}
                  >
                    <button
                      onClick={() => setEditingCategory(cat)}
                      className="btn btn-outline-soft"
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                    >
                      <Edit2 size={13} />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => setCategoryToDelete(cat)}
                      className="btn btn-outline-soft"
                      style={{ padding: '6px 12px', fontSize: '12px', color: '#b91c1c' }}
                    >
                      <Trash2 size={13} />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ==========================================
          MODALS FOR ALL ACTIONS
         ========================================== */}

      {/* ADD PRINTING CATEGORY MODAL */}
      <AnimatePresence>
        {isAddingPcat && (
          <div className="modal-overlay" onClick={() => setIsAddingPcat(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              className="modal-card"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h3>Add Printing Category</h3>
                <button onClick={() => setIsAddingPcat(false)} className="modal-close-btn">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleCreatePrintingCategory} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Category Name *</label>
                  <input
                    type="text"
                    required
                    value={newPcatName}
                    onChange={(e) => setNewPcatName(e.target.value)}
                    placeholder="e.g. Passport Photos, Lamination, Aadhaar Services"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description (Optional)</label>
                  <textarea
                    rows={2}
                    value={newPcatDesc}
                    onChange={(e) => setNewPcatDesc(e.target.value)}
                    placeholder="Brief description for customer guides in this category"
                    className="form-textarea"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Pastel Accent</label>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {PASTEL_COLORS.map((col) => (
                      <button
                        type="button"
                        key={col.value}
                        onClick={() => setNewPcatColor(col.value)}
                        style={{
                          backgroundColor: col.bg,
                          border:
                            newPcatColor === col.value
                              ? '2px solid var(--primary)'
                              : `1px solid ${col.border}`,
                          padding: '6px 12px',
                          borderRadius: '9999px',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        {col.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                  <button type="button" onClick={() => setIsAddingPcat(false)} className="btn btn-outline-soft">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Create Category
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EDIT PRINTING CATEGORY MODAL */}
      <AnimatePresence>
        {editingPcat && (
          <div className="modal-overlay" onClick={() => setEditingPcat(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              className="modal-card"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h3>Edit Printing Category</h3>
                <button onClick={() => setEditingPcat(null)} className="modal-close-btn">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSavePrintingCategoryEdit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Category Name *</label>
                  <input
                    type="text"
                    required
                    value={editingPcat.name}
                    onChange={(e) => setEditingPcat({ ...editingPcat, name: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description (Optional)</label>
                  <textarea
                    rows={2}
                    value={editingPcat.description || ''}
                    onChange={(e) => setEditingPcat({ ...editingPcat, description: e.target.value })}
                    className="form-textarea"
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                  <button type="button" onClick={() => setEditingPcat(null)} className="btn btn-outline-soft">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    <Save size={14} />
                    <span>Save Changes</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE PRINTING CATEGORY MODAL */}
      <AnimatePresence>
        {pcatToDelete && (
          <div className="modal-overlay" onClick={() => setPcatToDelete(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              className="modal-card"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertTriangle size={18} color="#b91c1c" />
                  <h3 style={{ color: '#b91c1c' }}>Delete Printing Category?</h3>
                </div>
              </div>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Are you sure you want to delete category <strong>&ldquo;{pcatToDelete.name}&rdquo;</strong>?
              </p>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                <button onClick={() => setPcatToDelete(null)} className="btn btn-outline-soft">
                  Cancel
                </button>
                <button onClick={handleConfirmDeletePrintingCategory} className="btn btn-danger">
                  Delete Category
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ADD GUIDE / TASK MODAL */}
      <AnimatePresence>
        {isAddingGuide && (
          <div className="modal-overlay" onClick={() => setIsAddingGuide(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              className="modal-card"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h3>Add New Printing Task</h3>
                <button onClick={() => setIsAddingGuide(false)} className="modal-close-btn">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleCreateGuide} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Task Title *</label>
                  <input
                    type="text"
                    required
                    value={newGuideTitle}
                    onChange={(e) => setNewGuideTitle(e.target.value)}
                    placeholder="e.g. Aadhaar Card Printing, Passport Photo Sheet"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description (Optional)</label>
                  <textarea
                    rows={2}
                    value={newGuideDesc}
                    onChange={(e) => setNewGuideDesc(e.target.value)}
                    placeholder="Optional notes or instructions summary"
                    className="form-textarea"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select
                    value={newGuideCat}
                    onChange={(e) => setNewGuideCat(e.target.value)}
                    className="form-select"
                  >
                    {printingCategories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                  <button type="button" onClick={() => setIsAddingGuide(false)} className="btn btn-outline-soft">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Create Task
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EDIT GUIDE / TASK MODAL */}
      <AnimatePresence>
        {editingGuide && (
          <div className="modal-overlay" onClick={() => setEditingGuide(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              className="modal-card"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h3>Edit Printing Task</h3>
                <button onClick={() => setEditingGuide(null)} className="modal-close-btn">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSaveGuideEdit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Task Title *</label>
                  <input
                    type="text"
                    required
                    value={editingGuide.title}
                    onChange={(e) => setEditingGuide({ ...editingGuide, title: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description (Optional)</label>
                  <textarea
                    rows={2}
                    value={editingGuide.description || ''}
                    onChange={(e) => setEditingGuide({ ...editingGuide, description: e.target.value })}
                    placeholder="Leave empty or enter description"
                    className="form-textarea"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select
                    value={editingGuide.category}
                    onChange={(e) => setEditingGuide({ ...editingGuide, category: e.target.value })}
                    className="form-select"
                  >
                    {printingCategories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                  <button type="button" onClick={() => setEditingGuide(null)} className="btn btn-outline-soft">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    <Save size={14} />
                    <span>Save Changes</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE GUIDE CONFIRM */}
      <AnimatePresence>
        {guideToDelete && (
          <div className="modal-overlay" onClick={() => setGuideToDelete(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              className="modal-card"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertTriangle size={18} color="#b91c1c" />
                  <h3 style={{ color: '#b91c1c' }}>Delete Task?</h3>
                </div>
              </div>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Are you sure you want to delete <strong>&ldquo;{guideToDelete.title}&rdquo;</strong>? This task will be removed from the shared central database immediately.
              </p>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                <button onClick={() => setGuideToDelete(null)} className="btn btn-outline-soft">
                  Cancel
                </button>
                <button onClick={handleConfirmDeleteGuide} className="btn btn-danger">
                  Delete Task
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EDIT STEP MODAL */}
      <AnimatePresence>
        {editingStep && (
          <div className="modal-overlay" onClick={() => setEditingStep(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              className="modal-card"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h3>Edit Step Instruction</h3>
                <button onClick={() => setEditingStep(null)} className="modal-close-btn">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSaveStepEdit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Instruction Text *</label>
                  <textarea
                    rows={2}
                    required
                    value={editingStep.instruction}
                    onChange={(e) => setEditingStep({ ...editingStep, instruction: e.target.value })}
                    className="form-textarea"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description (Optional)</label>
                  <textarea
                    rows={2}
                    value={editingStep.description || ''}
                    onChange={(e) => setEditingStep({ ...editingStep, description: e.target.value })}
                    placeholder="Optional tips, notes, or printer tray details"
                    className="form-textarea"
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button type="button" onClick={() => setEditingStep(null)} className="btn btn-outline-soft">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    <Save size={14} />
                    <span>Save Step</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE STEP CONFIRM */}
      <AnimatePresence>
        {stepToDelete && (
          <div className="modal-overlay" onClick={() => setStepToDelete(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              className="modal-card"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertTriangle size={18} color="#b91c1c" />
                  <h3 style={{ color: '#b91c1c' }}>Delete Step?</h3>
                </div>
              </div>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                Are you sure you want to remove this step from the printing task?
              </p>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                <button onClick={() => setStepToDelete(null)} className="btn btn-outline-soft">
                  Cancel
                </button>
                <button onClick={handleConfirmDeleteStep} className="btn btn-danger">
                  Delete Step
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ADD STATIONERY CATEGORY MODAL */}
      <AnimatePresence>
        {isAddingCategory && (
          <div className="modal-overlay" onClick={() => setIsAddingCategory(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              className="modal-card"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h3>Add Stationery Category</h3>
                <button onClick={() => setIsAddingCategory(false)} className="modal-close-btn">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleCreateCategory} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Category Name *</label>
                  <input
                    type="text"
                    required
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    placeholder="e.g. Combo Packs, Spiral Notebooks"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description (Optional)</label>
                  <textarea
                    rows={2}
                    value={newCatDesc}
                    onChange={(e) => setNewCatDesc(e.target.value)}
                    placeholder="Brief description for category"
                    className="form-textarea"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Emoji / Icon (Optional)</label>
                  <input
                    type="text"
                    value={newCatIcon}
                    onChange={(e) => setNewCatIcon(e.target.value)}
                    placeholder="e.g. 📓, 🎨, 📐"
                    className="form-input"
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                  <button type="button" onClick={() => setIsAddingCategory(false)} className="btn btn-outline-soft">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Create Category
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EDIT STATIONERY CATEGORY MODAL */}
      <AnimatePresence>
        {editingCategory && (
          <div className="modal-overlay" onClick={() => setEditingCategory(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              className="modal-card"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h3>Edit Stationery Category</h3>
                <button onClick={() => setEditingCategory(null)} className="modal-close-btn">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSaveCategoryEdit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Category Name *</label>
                  <input
                    type="text"
                    required
                    value={editingCategory.name}
                    onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description (Optional)</label>
                  <textarea
                    rows={2}
                    value={editingCategory.description || ''}
                    onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                    className="form-textarea"
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                  <button type="button" onClick={() => setEditingCategory(null)} className="btn btn-outline-soft">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    <Save size={14} />
                    <span>Save Changes</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE STATIONERY CATEGORY CONFIRM */}
      <AnimatePresence>
        {categoryToDelete && (
          <div className="modal-overlay" onClick={() => setCategoryToDelete(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              className="modal-card"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertTriangle size={18} color="#b91c1c" />
                  <h3 style={{ color: '#b91c1c' }}>Delete Category?</h3>
                </div>
              </div>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Are you sure you want to delete category <strong>&ldquo;{categoryToDelete.name}&rdquo;</strong>?
              </p>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                <button onClick={() => setCategoryToDelete(null)} className="btn btn-outline-soft">
                  Cancel
                </button>
                <button onClick={handleConfirmDeleteCategory} className="btn btn-danger">
                  Delete Category
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ADD PRODUCT MODAL */}
      <AnimatePresence>
        {isAddingProduct && (
          <div className="modal-overlay" onClick={() => setIsAddingProduct(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              className="modal-card"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Package size={18} />
                  <h3>Add New Product</h3>
                </div>
                <button onClick={() => setIsAddingProduct(false)} className="modal-close-btn">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleCreateProduct} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={newProdName}
                    onChange={(e) => setNewProdName(e.target.value)}
                    placeholder="e.g. Deluxe A4 Ruled Register"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select
                    value={newProdCatId}
                    onChange={(e) => setNewProdCatId(e.target.value)}
                    className="form-select"
                    required
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.icon ? `${c.icon} ` : ''}
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Visibility Status *</label>
                  <select
                    value={newProdVisibility}
                    onChange={(e) => setNewProdVisibility(e.target.value as ProductVisibility)}
                    className="form-select"
                  >
                    <option value="private">🔒 Private (Admin Only - Default)</option>
                    <option value="published">🌐 Published (Visible to Customers)</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Price (₹) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="1"
                      value={newProdPrice}
                      onChange={(e) => setNewProdPrice(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="0"
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Sale Price (₹ Optional)</label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={newProdSalePrice}
                      onChange={(e) => setNewProdSalePrice(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="Optional"
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Description (Optional)</label>
                  <textarea
                    rows={2}
                    value={newProdDesc}
                    onChange={(e) => setNewProdDesc(e.target.value)}
                    placeholder="Product details, specifications"
                    className="form-textarea"
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                  <button type="button" onClick={() => setIsAddingProduct(false)} className="btn btn-outline-soft">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Add Product
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EDIT PRODUCT MODAL */}
      <AnimatePresence>
        {editingProduct && (
          <div className="modal-overlay" onClick={() => setEditingProduct(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              className="modal-card"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h3>Edit Product</h3>
                <button onClick={() => setEditingProduct(null)} className="modal-close-btn">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSaveProductEdit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select
                    value={editingProduct.categoryId}
                    onChange={(e) => setEditingProduct({ ...editingProduct, categoryId: e.target.value })}
                    className="form-select"
                    required
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.icon ? `${c.icon} ` : ''}
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Visibility Status *</label>
                  <select
                    value={editingProduct.visibility}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        visibility: e.target.value as ProductVisibility,
                      })
                    }
                    className="form-select"
                  >
                    <option value="private">🔒 Private (Admin Only)</option>
                    <option value="published">🌐 Published (Visible to Customers)</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Price (₹) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="1"
                      value={editingProduct.price}
                      onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Sale Price (₹ Optional)</label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={editingProduct.salePrice || ''}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          salePrice: e.target.value === '' ? undefined : Number(e.target.value),
                        })
                      }
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Description (Optional)</label>
                  <textarea
                    rows={2}
                    value={editingProduct.description || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                    className="form-textarea"
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                  <button type="button" onClick={() => setEditingProduct(null)} className="btn btn-outline-soft">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    <Save size={14} />
                    <span>Save Changes</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE PRODUCT CONFIRM */}
      <AnimatePresence>
        {productToDelete && (
          <div className="modal-overlay" onClick={() => setProductToDelete(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              className="modal-card"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertTriangle size={18} color="#b91c1c" />
                  <h3 style={{ color: '#b91c1c' }}>Delete Product?</h3>
                </div>
              </div>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Are you sure you want to remove <strong>&ldquo;{productToDelete.name}&rdquo;</strong> from shop inventory?
              </p>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                <button onClick={() => setProductToDelete(null)} className="btn btn-outline-soft">
                  Cancel
                </button>
                <button onClick={handleConfirmDeleteProduct} className="btn btn-danger">
                  Delete Product
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
