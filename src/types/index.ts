export type DefaultGuideCategory = 
  | 'WhatsApp'
  | 'Cards & IDs'
  | 'Xerox'
  | 'Colour Print'
  | 'Email & PDF';

export type GuideCategory = string;

export interface GuideStep {
  id: string;
  instruction: string;
  description?: string; // Optional step description/tip
  note?: string;
}

export interface Guide {
  id: string;
  title: string;
  description?: string; // Optional description for printing guides/tasks
  category: string; // Dynamic printing category
  iconName: string;
  steps: GuideStep[];
  updatedAt?: number;
}

export interface PrintingCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: PastelColor;
  createdAt?: number;
  updatedAt?: number;
}

export type ProgressMap = Record<string, string[]>; // guideId -> array of completed stepIds

export interface AdminUser {
  username: string;
  isAuthenticated: boolean;
}

export type PastelColor =
  | 'lavender'
  | 'pink'
  | 'cream'
  | 'mint'
  | 'sky'
  | 'peach';

export interface ProductCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string; // emoji or icon label
  color: PastelColor;
  isPublished?: boolean;
  createdAt: number;
  updatedAt?: number;
}

export type ProductStatus = 'in_stock' | 'low_stock' | 'out_of_stock';
export type ProductVisibility = 'private' | 'published';

export interface Product {
  id: string;
  name: string;
  categoryId: string;
  description?: string;
  price: number;
  salePrice?: number;
  imageUrl?: string;
  status: ProductStatus;
  visibility: ProductVisibility; // 'private' (default) or 'published'
  createdAt: number;
  updatedAt?: number;
}

export interface SharedDataPayload {
  guides: Guide[];
  printingCategories: PrintingCategory[];
  categories: ProductCategory[];
  products: Product[];
  lastUpdated: number;
}
