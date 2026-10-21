import { Guide, ProgressMap, ProductCategory, Product, PrintingCategory } from '../types';

export const STORAGE_KEYS = {
  GUIDES: 'printmate_guides_v2',
  PRINTING_CATEGORIES: 'printmate_printing_categories_v2',
  PROGRESS: 'printmate_progress_v2',
  ADMIN_AUTH: 'printmate_admin_auth_v2',
  CATEGORIES: 'printmate_categories_v2',
  PRODUCTS: 'printmate_products_v2',
  DATA_INITIALIZED: 'printmate_data_initialized_v2',
};

export const INITIAL_PRINTING_CATEGORIES: PrintingCategory[] = [
  {
    id: 'pcat-wa',
    name: 'WhatsApp',
    description: 'Customer documents, PDFs, tickets, and photos received via WhatsApp.',
    icon: 'MessageSquareText',
    color: 'lavender',
    createdAt: 1700000001,
  },
  {
    id: 'pcat-cards',
    name: 'Cards & IDs',
    description: 'Aadhaar cards, PAN cards, voter IDs, and driving licenses.',
    icon: 'CreditCard',
    color: 'pink',
    createdAt: 1700000002,
  },
  {
    id: 'pcat-xerox',
    name: 'Xerox',
    description: 'Single-sided, duplex, legal paper, and book photocopies.',
    icon: 'Copy',
    color: 'pink',
    createdAt: 1700000003,
  },
  {
    id: 'pcat-color',
    name: 'Colour Print',
    description: 'College project reports, presentation slides, photos, and certificates.',
    icon: 'Printer',
    color: 'cream',
    createdAt: 1700000004,
  },
  {
    id: 'pcat-email',
    name: 'Email & PDF',
    description: 'Documents, resume CVs, job applications, and hall tickets from emails.',
    icon: 'Mail',
    color: 'sky',
    createdAt: 1700000005,
  },
];

export const INITIAL_GUIDES: Guide[] = [
  {
    id: 'guide-wa-doc',
    title: 'WhatsApp Document Printing',
    description: 'Print documents, tickets, and agreements received through WhatsApp.',
    category: 'WhatsApp',
    iconName: 'MessageSquareText',
    steps: [
      { id: 'wa-doc-s1', instruction: 'Open WhatsApp on the shop computer.' },
      { id: 'wa-doc-s2', instruction: "Open the customer's chat." },
      { id: 'wa-doc-s3', instruction: 'Find the document (PDF, Word, or text file).' },
      { id: 'wa-doc-s4', instruction: 'Download the document to the computer.' },
      { id: 'wa-doc-s5', instruction: 'Open the Downloads folder.' },
      { id: 'wa-doc-s6', instruction: 'Right-click the downloaded file and select Print (or open in PDF viewer).' },
      { id: 'wa-doc-s7', instruction: 'Check the printer selection, page orientation, and paper size (A4 / Legal).' },
      { id: 'wa-doc-s8', instruction: 'Select 1-sided or 2-sided (duplex) as requested and click Print.' },
      { id: 'wa-doc-s9', instruction: 'Collect the printed document and inspect print quality.' },
    ],
  },
  {
    id: 'guide-wa-img',
    title: 'WhatsApp Image Printing',
    description: 'Print photos, receipts, and screenshots received through WhatsApp.',
    category: 'WhatsApp',
    iconName: 'Image',
    steps: [
      { id: 'wa-img-s1', instruction: "Open WhatsApp and navigate to the customer's conversation." },
      { id: 'wa-img-s2', instruction: 'Click and open the photo or screenshot sent by the customer.' },
      { id: 'wa-img-s3', instruction: 'Click the Download button at top right to save it in full resolution.' },
      { id: 'wa-img-s4', instruction: 'Open the downloaded image file from the Downloads folder.' },
      { id: 'wa-img-s5', instruction: 'Press Ctrl + P to open the Print picture dialog.' },
      { id: 'wa-img-s6', instruction: 'Choose the correct paper tray (Glossy Photo Paper or Plain A4).' },
      { id: 'wa-img-s7', instruction: 'Select layout: Full page, 4x6 photo, or 2 images per page.' },
      { id: 'wa-img-s8', instruction: 'Set print quality to Best / High for photographs.' },
      { id: 'wa-img-s9', instruction: 'Click Print and inspect the finished image.' },
    ],
  },
  {
    id: 'guide-aadhaar',
    title: 'Aadhaar Card Printing',
    description: "Print Aadhaar card sides according to the customer's requested layout.",
    category: 'Cards & IDs',
    iconName: 'CreditCard',
    steps: [
      { id: 'aadhaar-s1', instruction: 'Open the customer e-Aadhaar PDF file.' },
      { id: 'aadhaar-s2', instruction: 'Enter the password (first 4 letters of name in CAPITAL + year of birth YYYY).' },
      { id: 'aadhaar-s3', instruction: 'Locate the front side and back side sections of the ID.' },
      { id: 'aadhaar-s4', instruction: 'Use Snipping Tool or Adobe Snapshot tool to capture front and back cleanly.' },
      { id: 'aadhaar-s5', instruction: 'Arrange both front and back on a blank A4 sheet (side-by-side or stacked).' },
      { id: 'aadhaar-s6', instruction: 'Confirm card dimensions (standard 8.6cm x 5.4cm or enlarged if requested).' },
      { id: 'aadhaar-s7', instruction: 'Select thick cardstock or photo matte paper in printer tray.' },
      { id: 'aadhaar-s8', instruction: 'Choose High Quality color print settings and print.' },
      { id: 'aadhaar-s9', instruction: 'Cut the card carefully along borders and laminate if requested.' },
    ],
  },
  {
    id: 'guide-bw-xerox',
    title: 'Black & White Xerox',
    description: 'Make single-sided or double-sided black-and-white photocopies.',
    category: 'Xerox',
    iconName: 'Copy',
    steps: [
      { id: 'bw-x-s1', instruction: 'Lift the Xerox machine scanner platen glass lid or use auto document feeder.' },
      { id: 'bw-x-s2', instruction: 'Align original document face-down against the top-left alignment mark.' },
      { id: 'bw-x-s3', instruction: 'Close scanner lid gently without shifting the paper.' },
      { id: 'bw-x-s4', instruction: 'Select Mono / Black & White on the Xerox control console.' },
      { id: 'bw-x-s5', instruction: 'Select duplex option: 1-sided to 1-sided OR 1-sided to 2-sided.' },
      { id: 'bw-x-s6', instruction: 'Verify paper tray selection (Tray 1: Standard A4 75gsm).' },
      { id: 'bw-x-s7', instruction: 'Adjust density (darker/lighter) if the original text is faint.' },
      { id: 'bw-x-s8', instruction: 'Enter the number of copies needed on the numeric keypad.' },
      { id: 'bw-x-s9', instruction: 'Press the green Start button and examine the output copy.' },
    ],
  },
  {
    id: 'guide-colour-print',
    title: 'Colour Printing',
    description: 'Print colour documents, project charts, posters, and certificates.',
    category: 'Colour Print',
    iconName: 'Printer',
    steps: [
      { id: 'colour-s1', instruction: 'Open the customer document (PDF, Word, PowerPoint, or graphic file).' },
      { id: 'colour-s2', instruction: 'Review margins, page orientation, and slide fit on screen.' },
      { id: 'colour-s3', instruction: 'Press Ctrl + P and select the Colour Laser or Ink Tank printer.' },
      { id: 'colour-s4', instruction: 'Click Printer Properties / Preferences.' },
      { id: 'colour-s5', instruction: 'Set Output Color to Color (ensure Grayscale is disabled).' },
      { id: 'colour-s6', instruction: 'Select media type: Plain 80-100gsm paper, Glossy, or Matte brochure.' },
      { id: 'colour-s7', instruction: 'Set print quality to High / Presentation mode.' },
      { id: 'colour-s8', instruction: 'Check page range so only required colour pages are printed.' },
      { id: 'colour-s9', instruction: 'Click Print and wait for printout to fully dry.' },
    ],
  },
  {
    id: 'guide-email-pdf',
    title: 'Email PDF Printing',
    description: 'Download PDF attachments from customer emails and print them.',
    category: 'Email & PDF',
    iconName: 'Mail',
    steps: [
      { id: 'email-s1', instruction: 'Open the shop email account (Gmail / Webmail).' },
      { id: 'email-s2', instruction: 'Locate the customer email and check for attached PDF files.' },
      { id: 'email-s3', instruction: 'Click the Download icon to save the PDF to the shop PC.' },
      { id: 'email-s4', instruction: 'Open the downloaded file in Adobe Acrobat Reader or Chrome.' },
      { id: 'email-s5', instruction: 'Press Ctrl + P to open the Print dialogue box.' },
      { id: 'email-s6', instruction: 'Ensure the correct printer is selected and paper tray has ample paper.' },
      { id: 'email-s7', instruction: "Select 'Fit' or 'Shrink oversized pages' so text is never cropped." },
      { id: 'email-s8', instruction: 'Confirm single-sided vs double-sided (duplex) with customer.' },
      { id: 'email-s9', instruction: 'Click Print, staple if multi-page, and hand to customer.' },
    ],
  },
];

export const INITIAL_CATEGORIES: ProductCategory[] = [
  {
    id: 'cat-combo',
    name: 'Combo Packs',
    description: 'Special student exam kits, stationery gift sets, and art bundles.',
    icon: '🎁',
    color: 'lavender',
    isPublished: false,
    createdAt: 1700000001,
  },
  {
    id: 'cat-pencil-boxes',
    name: 'Pencil Boxes',
    description: 'Double-decker metal cases, cartoon pouches, and magnetic organizers.',
    icon: '✏️',
    color: 'pink',
    isPublished: false,
    createdAt: 1700000002,
  },
  {
    id: 'cat-pens',
    name: 'Pens and Pencils',
    description: 'Gel pens, ballpoints, micro-tip markers, 2B drawing pencils, and highlighters.',
    icon: '✒️',
    color: 'mint',
    isPublished: false,
    createdAt: 1700000003,
  },
  {
    id: 'cat-notebooks',
    name: 'Notebooks',
    description: 'Long books, spiral register notebooks, graph pads, and project sheets.',
    icon: '📓',
    color: 'cream',
    isPublished: false,
    createdAt: 1700000004,
  },
  {
    id: 'cat-school',
    name: 'School Supplies',
    description: 'Geometry boxes, compass sets, rulers, sharpeners, erasers, and glue sticks.',
    icon: '🎒',
    color: 'sky',
    isPublished: false,
    createdAt: 1700000005,
  },
  {
    id: 'cat-art',
    name: 'Art Supplies',
    description: 'Watercolors, oil pastels, acrylic paints, sketchbooks, and brushes.',
    icon: '🎨',
    color: 'peach',
    isPublished: false,
    createdAt: 1700000006,
  },
];

// All initial products are private by default
export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Student Exam Stationery Combo Pack',
    categoryId: 'cat-combo',
    description: 'Complete exam kit with 4 blue gel pens, 2 black pens, 2 pencils, eraser, scale, and clear pouch.',
    price: 199,
    salePrice: 169,
    status: 'in_stock',
    visibility: 'private',
    createdAt: 1700000010,
  },
  {
    id: 'prod-2',
    name: 'Multi-Compartment Metal Pencil Box',
    categoryId: 'cat-pencil-boxes',
    description: 'Durable double-sided magnetic pencil case with built-in sharpener and timetable slot.',
    price: 149,
    salePrice: 129,
    status: 'in_stock',
    visibility: 'private',
    createdAt: 1700000011,
  },
  {
    id: 'prod-3',
    name: 'Smooth Flow Blue Gel Pens (Pack of 5)',
    categoryId: 'cat-pens',
    description: 'Waterproof quick-dry 0.5mm gel ink pens ideal for clean exam handwriting.',
    price: 100,
    salePrice: 85,
    status: 'in_stock',
    visibility: 'private',
    createdAt: 1700000012,
  },
  {
    id: 'prod-4',
    name: 'Deluxe A4 Spiral Ruled Register (200 Pgs)',
    categoryId: 'cat-notebooks',
    description: '70 GSM bleed-resistant white paper with durable frosted polypropylene cover.',
    price: 120,
    salePrice: 99,
    status: 'in_stock',
    visibility: 'private',
    createdAt: 1700000013,
  },
  {
    id: 'prod-5',
    name: 'Precision Metal Geometry Box Set',
    categoryId: 'cat-school',
    description: 'Includes stainless steel compass, divider, 15cm ruler, 2 set squares, and protractor.',
    price: 160,
    salePrice: 135,
    status: 'in_stock',
    visibility: 'private',
    createdAt: 1700000014,
  },
  {
    id: 'prod-6',
    name: 'Artist Acrylic Colour Tubes (12 Shades)',
    categoryId: 'cat-art',
    description: 'Rich vibrant pigments suitable for canvas, paper, wood, and school chart projects.',
    price: 240,
    salePrice: 210,
    status: 'in_stock',
    visibility: 'private',
    createdAt: 1700000015,
  },
];

/**
 * Ensure storage is seeded once on first installation.
 * Never restores deleted items if already initialized!
 */
export function ensureInitialStorage(): void {
  try {
    const isInitialized = localStorage.getItem(STORAGE_KEYS.DATA_INITIALIZED);
    if (!isInitialized) {
      localStorage.setItem(STORAGE_KEYS.GUIDES, JSON.stringify(INITIAL_GUIDES));
      localStorage.setItem(STORAGE_KEYS.PRINTING_CATEGORIES, JSON.stringify(INITIAL_PRINTING_CATEGORIES));
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
      localStorage.setItem(STORAGE_KEYS.DATA_INITIALIZED, 'true');
    }
  } catch (err) {
    console.error('Failed to initialize storage', err);
  }
}

/**
 * Loads printing categories from localStorage.
 */
export function getSavedPrintingCategories(): PrintingCategory[] {
  try {
    ensureInitialStorage();
    const raw = localStorage.getItem(STORAGE_KEYS.PRINTING_CATEGORIES);
    if (!raw) return INITIAL_PRINTING_CATEGORIES;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_PRINTING_CATEGORIES;
  } catch (err) {
    console.error('Failed to load printing categories', err);
    return INITIAL_PRINTING_CATEGORIES;
  }
}

export function savePrintingCategories(categories: PrintingCategory[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PRINTING_CATEGORIES, JSON.stringify(categories));
    localStorage.setItem(STORAGE_KEYS.DATA_INITIALIZED, 'true');
  } catch (err) {
    console.error('Failed to save printing categories', err);
  }
}

/**
 * Loads guides from localStorage. Never restores deleted guides if already initialized!
 */
export function getSavedGuides(): Guide[] {
  try {
    ensureInitialStorage();
    const raw = localStorage.getItem(STORAGE_KEYS.GUIDES);
    if (!raw) return INITIAL_GUIDES;
    const parsed = JSON.parse(raw);
    // Respect user deletions: even if empty array, return empty array!
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return INITIAL_GUIDES;
  } catch (err) {
    console.error('Failed to load guides from storage', err);
    return INITIAL_GUIDES;
  }
}

export function saveGuides(guides: Guide[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.GUIDES, JSON.stringify(guides));
    localStorage.setItem(STORAGE_KEYS.DATA_INITIALIZED, 'true');
  } catch (err) {
    console.error('Failed to save guides to storage', err);
  }
}

/**
 * Progress helpers
 */
export function getProgressMap(): ProgressMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROGRESS);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch (err) {
    console.error('Failed to load progress from storage', err);
    return {};
  }
}

export function saveProgressMap(map: ProgressMap): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(map));
  } catch (err) {
    console.error('Failed to save progress map', err);
  }
}

export function toggleStepCompletion(guideId: string, stepId: string): ProgressMap {
  const currentMap = getProgressMap();
  const currentList = currentMap[guideId] || [];
  
  let updatedList: string[];
  if (currentList.includes(stepId)) {
    updatedList = currentList.filter(id => id !== stepId);
  } else {
    updatedList = [...currentList, stepId];
  }

  const updatedMap = {
    ...currentMap,
    [guideId]: updatedList,
  };

  saveProgressMap(updatedMap);
  return updatedMap;
}

export function resetSingleGuideProgress(guideId: string): ProgressMap {
  const currentMap = getProgressMap();
  const updatedMap = {
    ...currentMap,
    [guideId]: [],
  };
  saveProgressMap(updatedMap);
  return updatedMap;
}

export function resetAllGuidesProgress(): ProgressMap {
  const emptyMap: ProgressMap = {};
  saveProgressMap(emptyMap);
  return emptyMap;
}

/**
 * Categories helpers
 */
export function getSavedCategories(): ProductCategory[] {
  try {
    ensureInitialStorage();
    const raw = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    if (!raw) return INITIAL_CATEGORIES;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_CATEGORIES;
  } catch (err) {
    console.error('Failed to load categories', err);
    return INITIAL_CATEGORIES;
  }
}

export function saveCategories(categories: ProductCategory[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    localStorage.setItem(STORAGE_KEYS.DATA_INITIALIZED, 'true');
  } catch (err) {
    console.error('Failed to save categories', err);
  }
}

/**
 * Products helpers
 */
export function getSavedProducts(): Product[] {
  try {
    ensureInitialStorage();
    const raw = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (!raw) return INITIAL_PRODUCTS;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      // Ensure visibility is always set (defaulting to 'private' if undefined)
      return parsed.map((p) => ({
        ...p,
        visibility: p.visibility === 'published' ? 'published' : 'private',
      }));
    }
    return INITIAL_PRODUCTS;
  } catch (err) {
    console.error('Failed to load products', err);
    return INITIAL_PRODUCTS;
  }
}

export function saveProducts(products: Product[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    localStorage.setItem(STORAGE_KEYS.DATA_INITIALIZED, 'true');
  } catch (err) {
    console.error('Failed to save products', err);
  }
}

/**
 * Helper to compress user-uploaded image via canvas to prevent localStorage quota overflow.
 */
export function compressImageFile(file: File, maxWidth = 360, quality = 0.75): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Please select an image file.'));
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context.'));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('Failed to process image file.'));
      img.src = event.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.readAsDataURL(file);
  });
}

/**
 * Helper to generate unique stable IDs.
 */
export function generateUniqueId(prefix = 'item'): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Admin authentication session helpers
 */
export function isAdminAuthenticated(): boolean {
  try {
    return sessionStorage.getItem(STORAGE_KEYS.ADMIN_AUTH) === 'true';
  } catch {
    return false;
  }
}

export function setAdminAuthenticated(authenticated: boolean): void {
  try {
    if (authenticated) {
      sessionStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, 'true');
    } else {
      sessionStorage.removeItem(STORAGE_KEYS.ADMIN_AUTH);
    }
  } catch (err) {
    console.error('Failed to set admin auth', err);
  }
}
