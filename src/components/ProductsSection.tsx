import React, { useState, useMemo } from 'react';
import { Search, X, Package } from 'lucide-react';
import { Product, ProductCategory } from '../types';

interface ProductsSectionProps {
  categories: ProductCategory[];
  products: Product[];
}

export const ProductsSection: React.FC<ProductsSectionProps> = ({
  categories,
  products,
}) => {
  // Only display products that have been explicitly PUBLISHED by the admin
  const publishedProducts = useMemo(() => {
    return products.filter((p) => p.visibility === 'published');
  }, [products]);

  // If no products are published, do not render this section on the public homepage
  if (publishedProducts.length === 0) {
    return null;
  }

  // Only include categories that contain at least one published product
  const publishedCategories = useMemo(() => {
    const publishedCatIds = new Set(publishedProducts.map((p) => p.categoryId));
    return categories.filter((c) => publishedCatIds.has(c.id));
  }, [categories, publishedProducts]);

  const [selectedCatId, setSelectedCatId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredProducts = useMemo(() => {
    return publishedProducts.filter((prod) => {
      const matchesCategory =
        selectedCatId === 'all' || prod.categoryId === selectedCatId;
      if (!matchesCategory) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const inName = prod.name.toLowerCase().includes(q);
      const inDesc = prod.description?.toLowerCase().includes(q) || false;
      return inName || inDesc;
    });
  }, [publishedProducts, selectedCatId, searchQuery]);

  const categoryMap = useMemo(() => {
    const map = new Map<string, ProductCategory>();
    categories.forEach((c) => map.set(c.id, c));
    return map;
  }, [categories]);

  const renderStockBadge = (status: Product['status']) => {
    switch (status) {
      case 'in_stock':
        return <span className="stock-badge stock-in">In Stock</span>;
      case 'low_stock':
        return <span className="stock-badge stock-low">Low Stock</span>;
      case 'out_of_stock':
        return <span className="stock-badge stock-out">Out of Stock</span>;
      default:
        return null;
    }
  };

  return (
    <section id="products-section" className="products-section" aria-label="Published Shop Stationery Items">
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
            Shop Stationery
          </span>
          <h2>Available In Shop</h2>
          <p>Stationery items and accessories available for customer purchase.</p>
        </div>

        {/* Search */}
        <div className="search-box">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products..."
            aria-label="Search published stationery products"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="search-clear"
              aria-label="Clear product search"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Category Filter Pills (Only categories with published products) */}
      <div className="category-filter-bar" role="tablist">
        <button
          role="tab"
          aria-selected={selectedCatId === 'all'}
          onClick={() => setSelectedCatId('all')}
          className={`btn btn-pill ${selectedCatId === 'all' ? 'active' : ''}`}
        >
          All Items ({publishedProducts.length})
        </button>
        {publishedCategories.map((cat) => {
          const isActive = selectedCatId === cat.id;
          const count = publishedProducts.filter((p) => p.categoryId === cat.id).length;
          return (
            <button
              key={cat.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => setSelectedCatId(cat.id)}
              className={`btn btn-pill ${isActive ? 'active' : ''}`}
            >
              {cat.icon && <span style={{ marginRight: '4px' }}>{cat.icon}</span>}
              <span>{cat.name}</span>
              <span style={{ opacity: 0.65, fontSize: '11px', marginLeft: '4px' }}>
                ({count})
              </span>
            </button>
          );
        })}
      </div>

      {/* Published Products Grid */}
      <div className="products-grid">
        {filteredProducts.map((prod) => {
          const cat = categoryMap.get(prod.categoryId);
          return (
            <div key={prod.id} className="product-card">
              <div>
                <div className="product-img-wrap">
                  {prod.imageUrl ? (
                    <img src={prod.imageUrl} alt={prod.name} loading="lazy" />
                  ) : (
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '6px',
                        color: '#a855f7',
                      }}
                    >
                      <Package size={36} strokeWidth={1.5} />
                      <span style={{ fontSize: '11px', fontWeight: 500 }}>
                        {cat?.name || 'Stationery'}
                      </span>
                    </div>
                  )}
                  {cat && (
                    <span className="product-cat-tag">
                      {cat.icon ? `${cat.icon} ` : ''}
                      {cat.name}
                    </span>
                  )}
                </div>

                <div className="product-body">
                  <h3 className="product-title">{prod.name}</h3>
                  {prod.description && (
                    <p className="product-desc">{prod.description}</p>
                  )}
                </div>
              </div>

              <div className="product-footer">
                <div className="price-wrap">
                  <span className="product-price">₹{prod.price}</span>
                  {prod.salePrice && prod.salePrice < prod.price && (
                    <span className="product-sale-price">₹{prod.salePrice}</span>
                  )}
                </div>
                {renderStockBadge(prod.status)}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
