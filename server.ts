import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, 'data');
const DB_FILE = path.resolve(DATA_DIR, 'printmate_db.json');

// Initial seed data if db has never been created
const DEFAULT_PRINTING_CATEGORIES = [
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

const DEFAULT_GUIDES = [
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

const DEFAULT_CATEGORIES = [
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

const DEFAULT_PRODUCTS = [
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

interface DatabaseData {
  initialized: boolean;
  guides: any[];
  printingCategories: any[];
  categories: any[];
  products: any[];
  lastUpdated: number;
}

// Ensure database directory and file exist
function getDatabase(): DatabaseData {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      const initial: DatabaseData = {
        initialized: true,
        guides: DEFAULT_GUIDES,
        printingCategories: DEFAULT_PRINTING_CATEGORIES,
        categories: DEFAULT_CATEGORIES,
        products: DEFAULT_PRODUCTS,
        lastUpdated: Date.now(),
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return {
      initialized: true,
      guides: Array.isArray(parsed.guides) ? parsed.guides : [],
      printingCategories: Array.isArray(parsed.printingCategories) ? parsed.printingCategories : DEFAULT_PRINTING_CATEGORIES,
      categories: Array.isArray(parsed.categories) ? parsed.categories : [],
      products: Array.isArray(parsed.products) ? parsed.products : [],
      lastUpdated: parsed.lastUpdated || Date.now(),
    };
  } catch (err) {
    console.error('Error reading database file:', err);
    return {
      initialized: true,
      guides: DEFAULT_GUIDES,
      printingCategories: DEFAULT_PRINTING_CATEGORIES,
      categories: DEFAULT_CATEGORIES,
      products: DEFAULT_PRODUCTS,
      lastUpdated: Date.now(),
    };
  }
}

function saveDatabase(data: DatabaseData) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    data.lastUpdated = Date.now();
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing database file:', err);
  }
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json({ limit: '15mb' }));

  // Ensure DB exists on boot
  getDatabase();

  // ----------------------------------------------------
  // API ROUTES
  // ----------------------------------------------------

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: Date.now() });
  });

  // Full shared data fetch
  app.get('/api/data', (req, res) => {
    const db = getDatabase();
    res.json({
      success: true,
      guides: db.guides,
      printingCategories: db.printingCategories,
      categories: db.categories,
      products: db.products,
      lastUpdated: db.lastUpdated,
    });
  });

  // Full shared data update (Bulk save from admin)
  app.post('/api/data', (req, res) => {
    const { guides, printingCategories, categories, products } = req.body;
    const db = getDatabase();

    if (Array.isArray(guides)) db.guides = guides;
    if (Array.isArray(printingCategories)) db.printingCategories = printingCategories;
    if (Array.isArray(categories)) db.categories = categories;
    if (Array.isArray(products)) db.products = products;

    saveDatabase(db);
    res.json({
      success: true,
      message: 'Central database updated successfully',
      lastUpdated: db.lastUpdated,
    });
  });

  // ---------------- GUIDES ----------------
  app.get('/api/guides', (req, res) => {
    const db = getDatabase();
    res.json(db.guides);
  });

  app.post('/api/guides', (req, res) => {
    const guide = req.body;
    if (!guide || !guide.title) {
      return res.status(400).json({ error: 'Guide title is required' });
    }
    const db = getDatabase();
    const existingIndex = db.guides.findIndex((g) => g.id === guide.id);
    if (existingIndex >= 0) {
      db.guides[existingIndex] = { ...guide, updatedAt: Date.now() };
    } else {
      db.guides.push({ ...guide, updatedAt: Date.now() });
    }
    saveDatabase(db);
    res.json({ success: true, guide, lastUpdated: db.lastUpdated });
  });

  app.delete('/api/guides/:id', (req, res) => {
    const { id } = req.params;
    const db = getDatabase();
    db.guides = db.guides.filter((g) => g.id !== id);
    saveDatabase(db);
    res.json({ success: true, message: `Guide ${id} deleted`, lastUpdated: db.lastUpdated });
  });

  // ------------ PRINTING CATEGORIES ------------
  app.get('/api/printing-categories', (req, res) => {
    const db = getDatabase();
    res.json(db.printingCategories);
  });

  app.post('/api/printing-categories', (req, res) => {
    const category = req.body;
    if (!category || !category.name) {
      return res.status(400).json({ error: 'Category name is required' });
    }
    const db = getDatabase();
    const existingIndex = db.printingCategories.findIndex((c) => c.id === category.id);
    if (existingIndex >= 0) {
      db.printingCategories[existingIndex] = { ...category, updatedAt: Date.now() };
    } else {
      db.printingCategories.push({ ...category, updatedAt: Date.now() });
    }
    saveDatabase(db);
    res.json({ success: true, category, lastUpdated: db.lastUpdated });
  });

  app.delete('/api/printing-categories/:id', (req, res) => {
    const { id } = req.params;
    const db = getDatabase();
    db.printingCategories = db.printingCategories.filter((c) => c.id !== id);
    saveDatabase(db);
    res.json({ success: true, message: `Printing category ${id} deleted`, lastUpdated: db.lastUpdated });
  });

  // ------------ PRODUCT CATEGORIES (Stationery) ------------
  app.get('/api/categories', (req, res) => {
    const db = getDatabase();
    res.json(db.categories);
  });

  app.post('/api/categories', (req, res) => {
    const category = req.body;
    if (!category || !category.name) {
      return res.status(400).json({ error: 'Category name is required' });
    }
    const db = getDatabase();
    const existingIndex = db.categories.findIndex((c) => c.id === category.id);
    if (existingIndex >= 0) {
      db.categories[existingIndex] = { ...category, updatedAt: Date.now() };
    } else {
      db.categories.push({ ...category, updatedAt: Date.now() });
    }
    saveDatabase(db);
    res.json({ success: true, category, lastUpdated: db.lastUpdated });
  });

  app.delete('/api/categories/:id', (req, res) => {
    const { id } = req.params;
    const db = getDatabase();
    db.categories = db.categories.filter((c) => c.id !== id);
    // Also remove associated products to prevent orphaned items
    db.products = db.products.filter((p) => p.categoryId !== id);
    saveDatabase(db);
    res.json({ success: true, message: `Stationery category ${id} and items deleted`, lastUpdated: db.lastUpdated });
  });

  // ------------ PRODUCTS (Stationery) ------------
  app.get('/api/products', (req, res) => {
    const db = getDatabase();
    res.json(db.products);
  });

  app.post('/api/products', (req, res) => {
    const product = req.body;
    if (!product || !product.name) {
      return res.status(400).json({ error: 'Product name is required' });
    }
    const db = getDatabase();
    const existingIndex = db.products.findIndex((p) => p.id === product.id);
    if (existingIndex >= 0) {
      db.products[existingIndex] = { ...product, updatedAt: Date.now() };
    } else {
      db.products.push({ ...product, updatedAt: Date.now() });
    }
    saveDatabase(db);
    res.json({ success: true, product, lastUpdated: db.lastUpdated });
  });

  app.delete('/api/products/:id', (req, res) => {
    const { id } = req.params;
    const db = getDatabase();
    db.products = db.products.filter((p) => p.id !== id);
    saveDatabase(db);
    res.json({ success: true, message: `Product ${id} deleted`, lastUpdated: db.lastUpdated });
  });

  // ----------------------------------------------------
  // VITE DEV SERVER OR STATIC PRODUCTION SERVE
  // ----------------------------------------------------
  const isProduction = process.env.NODE_ENV === 'production';
  const distPath = path.resolve(__dirname, 'dist');

  if (isProduction && fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  } else {
    // Mount Vite middleware in development mode
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PrintMate server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server boot error:', err);
  process.exit(1);
});
