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
} from 'lucide-react';
import {
  Guide,
  GuideCategory,
  GuideStep,
  ProductCategory,
  Product,
  PastelColor,
  ProductStatus,
  ProductVisibility,
} from '../types';
import { generateUniqueId, compressImageFile } from '../utils/storage';

interface AdminDashboardProps {
  guides: Guide[];
  categories: ProductCategory[];
  products: Product[];
  onUpdateGuides: (updatedGuides: Guide[]) => void;
  onUpdateCategories: (updatedCategories: ProductCategory[]) => void;
  onUpdateProducts: (updatedProducts: Product[]) => void;
  onLogout: () => void;
  onReturnToSite: () => void;
}

type AdminTab = 'categories' | 'products' | 'guides';

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
  categories,
  products,
  onUpdateGuides,
  onUpdateCategories,
  onUpdateProducts,
  onLogout,
  onReturnToSite,
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('categories');
  const [notification, setNotification] = useState<string | null>(null);

  const triggerNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // ==========================================
  // CATEGORIES STATE & HANDLERS
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
        c.description?.toLowerCase().includes(q)
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
    triggerNotification(`Created category "${newCat.name}".`);
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
    triggerNotification('Category updated successfully.');
  };

  const handleConfirmDeleteCategory = () => {
    if (!categoryToDelete) return;
    const catId = categoryToDelete.id;
    // Remove category
    const remainingCats = categories.filter((c) => c.id !== catId);
    onUpdateCategories(remainingCats);

    // Also remove associated products to prevent orphaned data
    const remainingProds = products.filter((p) => p.categoryId !== catId);
    if (remainingProds.length !== products.length) {
      onUpdateProducts(remainingProds);
    }

    setCategoryToDelete(null);
    triggerNotification(`Category "${categoryToDelete.name}" and its products removed.`);
  };

  // ==========================================
  // PRODUCTS STATE & HANDLERS
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
      // Category filter
      const matchesCat =
        prodFilterCat === 'all' || prod.categoryId === prodFilterCat;
      if (!matchesCat) return false;

      // Visibility filter
      const matchesVis =
        prodFilterVisibility === 'all' ||
        prod.visibility === prodFilterVisibility;
      if (!matchesVis) return false;

      // Search query
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
    setNewProdVisibility('private'); // Private by default!
    setNewProdImage('');
    setImageUploadError(null);
    setIsAddingProduct(true);
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim() || newProdPrice === '') return;
    const priceNum = Number(newProdPrice);
    if (priceNum < 0) {
      alert('Price cannot be negative.');
      return;
    }

    const saleNum =
      newProdSalePrice !== '' ? Number(newProdSalePrice) : undefined;
    if (saleNum !== undefined && saleNum < 0) {
      alert('Sale price cannot be negative.');
      return;
    }

    const newProd: Product = {
      id: generateUniqueId('prod'),
      name: newProdName.trim(),
      categoryId: newProdCatId || (categories[0]?.id || ''),
      description: newProdDesc.trim() || undefined,
      price: priceNum,
      salePrice: saleNum,
      imageUrl: newProdImage || undefined,
      status: newProdStatus,
      visibility: newProdVisibility, // Defaults to private
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

    if (editingProduct.price < 0) {
      alert('Price cannot be negative.');
      return;
    }

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
      triggerNotification(`Published "${target.name}" to customer website.`);
    } else {
      triggerNotification(`Unpublished "${target?.name}" (now private to admin).`);
    }
  };

  const handleConfirmDeleteProduct = () => {
    if (!productToDelete) return;
    const remaining = products.filter((p) => p.id !== productToDelete.id);
    onUpdateProducts(remaining);
    setProductToDelete(null);
    triggerNotification('Product deleted.');
  };

  // ==========================================
  // GUIDES STATE & HANDLERS (PRESERVED & OPTIONAL DESCRIPTION)
  // ==========================================
  const [selectedGuideId, setSelectedGuideId] = useState<string>(
    guides[0]?.id || ''
  );
  const selectedGuide = guides.find((g) => g.id === selectedGuideId) || guides[0];

  const [newGuideTitle, setNewGuideTitle] = useState('');
  const [newGuideDesc, setNewGuideDesc] = useState('');
  const [newGuideCat, setNewGuideCat] = useState<GuideCategory>('WhatsApp');
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

  const handleMoveGuide = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= guides.length) return;
    const reordered = [...guides];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);
    onUpdateGuides(reordered);
    triggerNotification('Guide order updated.');
  };

  const handleCreateGuide = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGuideTitle.trim()) return;

    // Optional description: save empty if omitted, without placeholders or required errors
    const descValue = newGuideDesc.trim() ? newGuideDesc.trim() : undefined;

    const newGuide: Guide = {
      id: generateUniqueId('guide'),
      title: newGuideTitle.trim(),
      description: descValue,
      category: newGuideCat,
      iconName: newGuideIcon,
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
    triggerNotification(`Created guide "${newGuide.title}".`);
  };

  const handleSaveGuideEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGuide || !editingGuide.title.trim()) return;

    // Optional description: trim and allow empty
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
    triggerNotification('Guide updated.');
  };

  const handleConfirmDeleteGuide = () => {
    if (!guideToDelete) return;
    const remaining = guides.filter((g) => g.id !== guideToDelete.id);
    onUpdateGuides(remaining);
    if (selectedGuideId === guideToDelete.id && remaining.length > 0) {
      setSelectedGuideId(remaining[0].id);
    }
    setGuideToDelete(null);
    triggerNotification('Guide removed.');
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
            Private shop management for Dad &amp; Harshini. Products remain private by default until published.
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
          aria-selected={activeTab === 'categories'}
          onClick={() => setActiveTab('categories')}
          className={`admin-nav-tab ${activeTab === 'categories' ? 'active' : ''}`}
        >
          <Layers size={16} />
          <span>Categories ({categories.length})</span>
        </button>

        <button
          role="tab"
          aria-selected={activeTab === 'products'}
          onClick={() => setActiveTab('products')}
          className={`admin-nav-tab ${activeTab === 'products' ? 'active' : ''}`}
        >
          <ShoppingBag size={16} />
          <span>Products &amp; Stock ({products.length})</span>
        </button>

        <button
          role="tab"
          aria-selected={activeTab === 'guides'}
          onClick={() => setActiveTab('guides')}
          className={`admin-nav-tab ${activeTab === 'guides' ? 'active' : ''}`}
        >
          <BookOpen size={16} />
          <span>Printing Guides &amp; Tasks ({guides.length})</span>
        </button>
      </div>

      {/* TAB 1: CATEGORIES MANAGEMENT */}
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
            <div className="search-box" style={{ maxWidth: '300px' }}>
              <Search size={16} className="search-icon" />
              <input
                type="text"
                value={catSearch}
                onChange={(e) => setCatSearch(e.target.value)}
                placeholder="Search categories..."
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
              <Plus size={15} />
              <span>Add Category</span>
            </button>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '18px',
            }}
          >
            {filteredCategories.map((cat) => {
              const catProducts = products.filter((p) => p.categoryId === cat.id);
              const publishedCount = catProducts.filter((p) => p.visibility === 'published').length;
              return (
                <div
                  key={cat.id}
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid var(--border-card)',
                    borderRadius: '18px',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                >
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '12px',
                      }}
                    >
                      <span style={{ fontSize: '24px' }}>{cat.icon || '📦'}</span>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 600,
                          padding: '3px 10px',
                          borderRadius: '9999px',
                          backgroundColor: 'var(--primary-light)',
                          color: 'var(--primary)',
                        }}
                      >
                        {cat.color}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '6px' }}>
                      {cat.name}
                    </h3>
                    {cat.description && (
                      <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.45 }}>
                        {cat.description}
                      </p>
                    )}
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginTop: '18px',
                      paddingTop: '14px',
                      borderTop: '1px solid var(--border-subtle)',
                    }}
                  >
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {catProducts.length} items ({publishedCount} public)
                    </span>

                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={() => handleOpenAddProduct(cat.id)}
                        className="btn btn-outline-soft"
                        style={{ padding: '6px 10px', fontSize: '12px' }}
                        title="Add product to this category"
                      >
                        <Plus size={13} />
                        <span>Add Item</span>
                      </button>
                      <button
                        onClick={() => setEditingCategory(cat)}
                        className="btn btn-outline-soft"
                        style={{ padding: '6px 10px', fontSize: '12px' }}
                        title="Edit category"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => setCategoryToDelete(cat)}
                        className="btn btn-outline-soft"
                        style={{ padding: '6px 10px', fontSize: '12px', color: '#b91c1c' }}
                        title="Delete category"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: PRODUCTS & STOCK MANAGEMENT (PRIVATE BY DEFAULT) */}
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
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
              <div className="search-box" style={{ maxWidth: '240px' }}>
                <Search size={16} className="search-icon" />
                <input
                  type="text"
                  value={prodSearch}
                  onChange={(e) => setProdSearch(e.target.value)}
                  placeholder="Search products..."
                />
              </div>

              <select
                value={prodFilterCat}
                onChange={(e) => setProdFilterCat(e.target.value)}
                className="form-select"
                style={{ width: 'auto', padding: '8px 14px' }}
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icon ? `${c.icon} ` : ''}
                    {c.name}
                  </option>
                ))}
              </select>

              <select
                value={prodFilterVisibility}
                onChange={(e) => setProdFilterVisibility(e.target.value)}
                className="form-select"
                style={{ width: 'auto', padding: '8px 14px' }}
              >
                <option value="all">All Visibility</option>
                <option value="private">🔒 Private Only</option>
                <option value="published">🌐 Published Only</option>
              </select>
            </div>

            <button onClick={() => handleOpenAddProduct()} className="btn btn-primary">
              <Plus size={15} />
              <span>Add Product</span>
            </button>
          </div>

          <div
            style={{
              padding: '12px 16px',
              backgroundColor: '#f3e8ff',
              borderRadius: '12px',
              marginBottom: '20px',
              fontSize: '13px',
              color: '#581c87',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '8px',
            }}
          >
            <span>
              🔒 Products are <strong>Private by default</strong> and hidden from customers. Click <strong>Publish</strong> on an item when you want it displayed publicly.
            </span>
            <span style={{ fontWeight: 600 }}>
              {products.filter((p) => p.visibility === 'published').length} of {products.length} published
            </span>
          </div>

          {filteredProducts.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '48px',
                backgroundColor: '#ffffff',
                borderRadius: '20px',
                border: '1px dashed var(--border-medium)',
                color: 'var(--text-muted)',
              }}
            >
              No products match this filter. Click &quot;Add Product&quot; to register a new item!
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
                gap: '20px',
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
                      border: isPublished
                        ? '1px solid #86efac'
                        : '1px solid var(--border-card)',
                      borderRadius: '18px',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      boxShadow: 'var(--shadow-sm)',
                      position: 'relative',
                    }}
                  >
                    <div>
                      <div
                        style={{
                          height: '140px',
                          backgroundColor: '#faf5ff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          position: 'relative',
                        }}
                      >
                        {prod.imageUrl ? (
                          <img
                            src={prod.imageUrl}
                            alt={prod.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          <Package size={36} color="var(--primary)" strokeWidth={1.5} />
                        )}

                        {/* Category Tag */}
                        <span
                          style={{
                            position: 'absolute',
                            top: '8px',
                            left: '8px',
                            fontSize: '11px',
                            fontWeight: 600,
                            padding: '2px 8px',
                            borderRadius: '9999px',
                            backgroundColor: 'rgba(255,255,255,0.95)',
                          }}
                        >
                          {cat?.name || 'Stationery'}
                        </span>

                        {/* Visibility Badge */}
                        <span
                          style={{
                            position: 'absolute',
                            top: '8px',
                            right: '8px',
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: '9999px',
                            backgroundColor: isPublished ? '#dcfce7' : '#f3e8ff',
                            color: isPublished ? '#15803d' : '#6b21a8',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.06)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          {isPublished ? <Globe size={11} /> : <Lock size={11} />}
                          {isPublished ? 'Published' : 'Private'}
                        </span>
                      </div>

                      <div style={{ padding: '16px' }}>
                        <h4 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '4px' }}>
                          {prod.name}
                        </h4>
                        {prod.description && (
                          <p
                            style={{
                              fontSize: '12px',
                              color: 'var(--text-muted)',
                              lineHeight: 1.4,
                              marginBottom: '8px',
                            }}
                          >
                            {prod.description}
                          </p>
                        )}
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                          <span style={{ fontSize: '17px', fontWeight: 700 }}>₹{prod.price}</span>
                          {prod.salePrice && prod.salePrice < prod.price && (
                            <span
                              style={{
                                fontSize: '12px',
                                textDecoration: 'line-through',
                                color: 'var(--text-faint)',
                              }}
                            >
                              ₹{prod.salePrice}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        padding: '12px 16px',
                        borderTop: '1px solid var(--border-subtle)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '6px',
                        flexWrap: 'wrap',
                      }}
                    >
                      {/* One-click publish toggle */}
                      <button
                        onClick={() => handleTogglePublishProduct(prod.id)}
                        className="btn btn-outline-soft"
                        style={{
                          fontSize: '11px',
                          padding: '5px 10px',
                          color: isPublished ? '#b45309' : '#15803d',
                          borderColor: isPublished ? '#fde68a' : '#bbf7d0',
                          backgroundColor: isPublished ? '#fffbeb' : '#f0fdf4',
                        }}
                        title={
                          isPublished
                            ? 'Unpublish and hide from customer website'
                            : 'Publish and make visible on customer website'
                        }
                      >
                        {isPublished ? <EyeOff size={12} /> : <Eye size={12} />}
                        <span>{isPublished ? 'Unpublish' : 'Publish'}</span>
                      </button>

                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          onClick={() => setEditingProduct(prod)}
                          className="btn btn-outline-soft"
                          style={{ padding: '5px 8px', fontSize: '12px' }}
                          title="Edit product"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => setProductToDelete(prod)}
                          className="btn btn-outline-soft"
                          style={{ padding: '5px 8px', fontSize: '12px', color: '#b91c1c' }}
                          title="Delete product"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: GUIDES & TASKS MANAGEMENT (OPTIONAL DESCRIPTIONS) */}
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
              <h2 style={{ fontSize: '18px', fontWeight: 600 }}>Printing Tasks ({guides.length})</h2>
              <button
                onClick={() => {
                  setNewGuideTitle('');
                  setNewGuideDesc('');
                  setNewGuideCat('WhatsApp');
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

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {guides.map((guide, idx) => {
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
                        title="Edit Guide"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => setGuideToDelete(guide)}
                        className="btn btn-outline-soft"
                        style={{ padding: '4px 6px', color: '#b91c1c' }}
                        title="Delete Guide"
                        disabled={guides.length <= 1}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Steps for Selected Guide */}
          <div>
            {selectedGuide && (
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
                    <Edit2 size={12} />
                    <span>Edit</span>
                  </button>
                </div>

                {/* Add Step Form */}
                <form onSubmit={handleAddStep} style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <input
                      type="text"
                      required
                      value={newStepText}
                      onChange={(e) => setNewStepText(e.target.value)}
                      placeholder="Step instruction (Required)..."
                      className="form-input"
                    />
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="text"
                        value={newStepDesc}
                        onChange={(e) => setNewStepDesc(e.target.value)}
                        placeholder="Description / tip (Optional)..."
                        className="form-input"
                      />
                      <button type="submit" className="btn btn-primary" style={{ flexShrink: 0 }}>
                        <Plus size={14} />
                        <span>Add Step</span>
                      </button>
                    </div>
                  </div>
                </form>

                {/* Numbered Steps */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {selectedGuide.steps.map((step, idx) => (
                    <div
                      key={step.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '12px 14px',
                        borderRadius: '12px',
                        backgroundColor: '#faf7fd',
                        border: '1px solid var(--border-subtle)',
                      }}
                    >
                      <span
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--primary-light)',
                          color: 'var(--primary)',
                          fontSize: '12px',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {idx + 1}
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-main)' }}>
                          {step.instruction}
                        </div>
                        {(step.description || step.note) && (
                          <div
                            style={{
                              fontSize: '12px',
                              color: 'var(--text-muted)',
                              marginTop: '2px',
                              lineHeight: 1.35,
                            }}
                          >
                            {step.description || step.note}
                          </div>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button
                          onClick={() => handleMoveStep(idx, 'up')}
                          disabled={idx === 0}
                          className="btn btn-outline-soft"
                          style={{ padding: '4px 6px' }}
                        >
                          <ArrowUp size={12} />
                        </button>
                        <button
                          onClick={() => handleMoveStep(idx, 'down')}
                          disabled={idx === selectedGuide.steps.length - 1}
                          className="btn btn-outline-soft"
                          style={{ padding: '4px 6px' }}
                        >
                          <ArrowDown size={12} />
                        </button>
                        <button
                          onClick={() => setEditingStep(step)}
                          className="btn btn-outline-soft"
                          style={{ padding: '4px 6px' }}
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
                          style={{ padding: '4px 6px', color: '#b91c1c' }}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================================================= */}
      {/* MODALS */}
      {/* ================================================= */}

      {/* ADD CATEGORY MODAL */}
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
                <h3>Add New Category</h3>
                <button
                  onClick={() => setIsAddingCategory(false)}
                  className="modal-close-btn"
                >
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

                <div className="form-group">
                  <label className="form-label">Pastel Card Accent</label>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {PASTEL_COLORS.map((col) => (
                      <button
                        type="button"
                        key={col.value}
                        onClick={() => setNewCatColor(col.value)}
                        style={{
                          backgroundColor: col.bg,
                          border:
                            newCatColor === col.value
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
                  <button
                    type="button"
                    onClick={() => setIsAddingCategory(false)}
                    className="btn btn-outline-soft"
                  >
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

      {/* EDIT CATEGORY MODAL */}
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
                <h3>Edit Category</h3>
                <button
                  onClick={() => setEditingCategory(null)}
                  className="modal-close-btn"
                >
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
                    onChange={(e) =>
                      setEditingCategory({ ...editingCategory, name: e.target.value })
                    }
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description (Optional)</label>
                  <textarea
                    rows={2}
                    value={editingCategory.description || ''}
                    onChange={(e) =>
                      setEditingCategory({ ...editingCategory, description: e.target.value })
                    }
                    className="form-textarea"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Icon / Emoji</label>
                  <input
                    type="text"
                    value={editingCategory.icon || ''}
                    onChange={(e) =>
                      setEditingCategory({ ...editingCategory, icon: e.target.value })
                    }
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Pastel Color</label>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {PASTEL_COLORS.map((col) => (
                      <button
                        type="button"
                        key={col.value}
                        onClick={() =>
                          setEditingCategory({ ...editingCategory, color: col.value })
                        }
                        style={{
                          backgroundColor: col.bg,
                          border:
                            editingCategory.color === col.value
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
                  <button
                    type="button"
                    onClick={() => setEditingCategory(null)}
                    className="btn btn-outline-soft"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    <Save size={14} />
                    <span>Save Category</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE CATEGORY CONFIRM MODAL */}
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
                Are you sure you want to delete <strong>&ldquo;{categoryToDelete.name}&rdquo;</strong>?
                <br />
                <span style={{ color: '#b91c1c', fontWeight: 600, display: 'inline-block', marginTop: '6px' }}>
                  Warning: All {products.filter((p) => p.categoryId === categoryToDelete.id).length} products in this category will also be deleted.
                </span>
              </p>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  onClick={() => setCategoryToDelete(null)}
                  className="btn btn-outline-soft"
                >
                  Cancel
                </button>
                <button onClick={handleConfirmDeleteCategory} className="btn btn-danger">
                  Delete Category &amp; Products
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ADD PRODUCT MODAL (PRIVATE BY DEFAULT) */}
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
                <h3>Add New Product</h3>
                <button
                  onClick={() => setIsAddingProduct(false)}
                  className="modal-close-btn"
                >
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
                    placeholder="e.g. 500 Sheet A4 Copier Paper Bundle"
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

                {/* Visibility Selection: Private by default */}
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
                  <span style={{ fontSize: '11px', color: 'var(--text-faint)' }}>
                    Private products are only visible inside this admin dashboard.
                  </span>
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
                      onChange={(e) =>
                        setNewProdPrice(e.target.value === '' ? '' : Number(e.target.value))
                      }
                      placeholder="e.g. 150"
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
                      onChange={(e) =>
                        setNewProdSalePrice(
                          e.target.value === '' ? '' : Number(e.target.value)
                        )
                      }
                      placeholder="e.g. 130"
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Availability Status</label>
                  <select
                    value={newProdStatus}
                    onChange={(e) => setNewProdStatus(e.target.value as ProductStatus)}
                    className="form-select"
                  >
                    <option value="in_stock">In Stock</option>
                    <option value="low_stock">Low Stock</option>
                    <option value="out_of_stock">Out of Stock</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Description (Optional)</label>
                  <textarea
                    rows={2}
                    value={newProdDesc}
                    onChange={(e) => setNewProdDesc(e.target.value)}
                    placeholder="Product details, brand, gsm, specifications"
                    className="form-textarea"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Product Image (Optional upload)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageFileChange(e.target.files?.[0] || null, 'new')}
                    className="form-input"
                  />
                  {isUploadingImage && (
                    <span style={{ fontSize: '12px', color: 'var(--primary)' }}>
                      Compressing image for browser storage...
                    </span>
                  )}
                  {imageUploadError && (
                    <span style={{ fontSize: '12px', color: '#b91c1c' }}>
                      {imageUploadError}
                    </span>
                  )}
                  {newProdImage && (
                    <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <img
                        src={newProdImage}
                        alt="Preview"
                        style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }}
                      />
                      <button
                        type="button"
                        onClick={() => setNewProdImage('')}
                        className="btn btn-outline-soft"
                        style={{ padding: '4px 8px', fontSize: '11px' }}
                      >
                        Remove image
                      </button>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setIsAddingProduct(false)}
                    className="btn btn-outline-soft"
                  >
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
                <button
                  onClick={() => setEditingProduct(null)}
                  className="modal-close-btn"
                >
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
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, name: e.target.value })
                    }
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select
                    value={editingProduct.categoryId}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, categoryId: e.target.value })
                    }
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

                {/* Visibility Status */}
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
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          price: Number(e.target.value),
                        })
                      }
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
                  <label className="form-label">Availability Status</label>
                  <select
                    value={editingProduct.status}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        status: e.target.value as ProductStatus,
                      })
                    }
                    className="form-select"
                  >
                    <option value="in_stock">In Stock</option>
                    <option value="low_stock">Low Stock</option>
                    <option value="out_of_stock">Out of Stock</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Description (Optional)</label>
                  <textarea
                    rows={2}
                    value={editingProduct.description || ''}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        description: e.target.value,
                      })
                    }
                    className="form-textarea"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Product Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageFileChange(e.target.files?.[0] || null, 'edit')}
                    className="form-input"
                  />
                  {editingProduct.imageUrl && (
                    <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <img
                        src={editingProduct.imageUrl}
                        alt="Current"
                        style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setEditingProduct({ ...editingProduct, imageUrl: undefined })
                        }
                        className="btn btn-outline-soft"
                        style={{ padding: '4px 8px', fontSize: '11px' }}
                      >
                        Remove image
                      </button>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setEditingProduct(null)}
                    className="btn btn-outline-soft"
                  >
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

      {/* DELETE PRODUCT CONFIRM MODAL */}
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
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  onClick={() => setProductToDelete(null)}
                  className="btn btn-outline-soft"
                >
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

      {/* ADD GUIDE / TASK MODAL (OPTIONAL DESCRIPTION) */}
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
                <h3>Add New Task / Guide</h3>
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
                    placeholder="e.g. Passport Size Photo 8-in-1 Sheet"
                    className="form-input"
                  />
                </div>

                {/* Description is completely optional: no HTML required attribute */}
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
                  <label className="form-label">Category</label>
                  <select
                    value={newGuideCat}
                    onChange={(e) => setNewGuideCat(e.target.value as GuideCategory)}
                    className="form-select"
                  >
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Cards & IDs">Cards &amp; IDs</option>
                    <option value="Xerox">Xerox</option>
                    <option value="Colour Print">Colour Print</option>
                    <option value="Email & PDF">Email &amp; PDF</option>
                  </select>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setIsAddingGuide(false)}
                    className="btn btn-outline-soft"
                  >
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

      {/* EDIT GUIDE / TASK MODAL (OPTIONAL DESCRIPTION) */}
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
                <h3>Edit Task Details</h3>
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
                    onChange={(e) =>
                      setEditingGuide({ ...editingGuide, title: e.target.value })
                    }
                    className="form-input"
                  />
                </div>

                {/* Description is completely optional: can be cleared or added */}
                <div className="form-group">
                  <label className="form-label">Description (Optional)</label>
                  <textarea
                    rows={2}
                    value={editingGuide.description || ''}
                    onChange={(e) =>
                      setEditingGuide({ ...editingGuide, description: e.target.value })
                    }
                    placeholder="Leave empty or enter description"
                    className="form-textarea"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    value={editingGuide.category}
                    onChange={(e) =>
                      setEditingGuide({
                        ...editingGuide,
                        category: e.target.value as GuideCategory,
                      })
                    }
                    className="form-select"
                  >
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Cards & IDs">Cards &amp; IDs</option>
                    <option value="Xerox">Xerox</option>
                    <option value="Colour Print">Colour Print</option>
                    <option value="Email & PDF">Email &amp; PDF</option>
                  </select>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setEditingGuide(null)}
                    className="btn btn-outline-soft"
                  >
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
                Are you sure you want to delete <strong>&ldquo;{guideToDelete.title}&rdquo;</strong>?
              </p>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
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
                    onChange={(e) =>
                      setEditingStep({ ...editingStep, instruction: e.target.value })
                    }
                    className="form-textarea"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description (Optional)</label>
                  <textarea
                    rows={2}
                    value={editingStep.description || editingStep.note || ''}
                    onChange={(e) =>
                      setEditingStep({ ...editingStep, description: e.target.value })
                    }
                    placeholder="Optional tips, notes, or printer tray details"
                    className="form-textarea"
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setEditingStep(null)}
                    className="btn btn-outline-soft"
                  >
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
                Are you sure you want to remove this step from the printing guide?
              </p>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
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
    </div>
  );
};
