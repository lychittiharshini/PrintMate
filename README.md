# PrintMate – Printing Steps Guide

A clean, modern printing-shop task and guide application designed for a Xerox and printing shop with private inventory management.

---

## 🖨️ Customer Interface: Printing Shop Tasks & Guides

- **Primary Focus**: The public customer-facing interface is centered completely on printing instructions and checklists for daily shop jobs.
- **Service Cards**:
  - **WhatsApp Printing** (Pale lavender)
  - **Xerox** (Pale pink)
  - **PDF & Photos** (Pale cream / soft yellow)
- **Checklists**:
  - Interactive numbered steps for customer documents, photo sizing, duplex Xerox, and ID card laminating.
  - Auto-saved progress with green checkmarks.
  - **DONE** and **CLEAR ALL** reset workflows.
- **Private Stationery by Default**: Stationery products remain private to the admin and do not appear on the public homepage unless explicitly published.

---

## 🔒 Admin Dashboard & Private Management

- **Admin Login**:
  - **Username**: `harshini`
  - **Password**: `harshini8019`
- **Private Product Inventory**:
  - Products are **Private by default** (`visibility: 'private'`).
  - Preview private inventory within the dashboard with `🔒 Private` and `🌐 Published` indicators.
  - One-click **Publish** and **Unpublish** controls. Unpublishing hides products from the customer view immediately without deleting saved data.
- **Flexible Task & Guide Management**:
  - **Task Title**: Required.
  - **Task Description**: Optional. Tasks can be created and saved with completely empty descriptions without validation errors.
  - Displays no placeholder text or "undefined" when descriptions are empty.
  - Numbered steps can be added, edited, deleted, and reordered.
- **Persistence**:
  - All category, product, visibility, and guide edits persist across page reloads in browser `localStorage`.
